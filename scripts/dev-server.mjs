// 개발 서버. 외부 패키지를 사용하지 않는다.
// 실행: pnpm dev (실제 내용) 또는 pnpm preview (샘플 내용)
//
// 기능
// - web/public 폴더를 서비스한다. 배포 환경과 같은 규칙을 적용한다.
//   - web/public/_headers의 보안 헤더. 단, 개발용으로 connect-src만 'self'로 완화한다.
//   - web/public/_redirects의 이동 규칙. 정확히 일치하는 경로만 처리한다.
//   - 확장자 없는 경로는 .html 파일로 연결한다. (예: /main은 main.html)
//   - GET과 HEAD만 허용한다. 다른 방식은 405로 답한다.
// - 파일이 바뀌면 브라우저에 알린다. CSS만 바뀌면 새로고침 없이 CSS를 교체한다.
// - 브라우저의 오류와 CSP 위반을 이 터미널에 출력한다.
// - Inspector(개발 전용 이름표 확인 도구)를 HTML에 넣는다. 켜면 가리킨 요소의 이름표가 툴팁으로 보인다.
// - --sample 옵션을 쓰면 web/preview 폴더의 파일이 같은 경로의 web/public 파일을 대신한다.
// - 편집 모드(dev-edit.js)가 화면에서 고친 글자와 구조 변경을 데이터 파일에 저장하는 요청(POST /__dev/edit)을 받는다.
//   배포 환경은 읽기 전용이므로 이 예외는 개발 서버에만 있다. 보안 장치는 아래 "편집 저장" 절에 있다.
import http from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync, renameSync, existsSync, statSync, watch, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { applyOps } from "./dev-edit-core.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "web", "public");
const previewDir = join(root, "web", "preview");
const clientFile = join(root, "scripts", "dev-client.js");
const inspectorScript = join(root, "scripts", "dev-inspector.js");
const inspectorStyle = join(root, "scripts", "dev-inspector.css");
const editScript = join(root, "scripts", "dev-edit.js");
const editStyle = join(root, "scripts", "dev-edit.css");

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 4200;
const useSample = args.includes("--sample");
// 편집 모드가 저장하는 데이터 파일. 샘플 모드(pnpm preview)는 web/preview, 아니면 web/public의 파일이다.
const editFile = join(useSample ? previewDir : publicDir, "data", "ko", "main.js");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

const log = (tag, message) => console.log(`[${tag}] ${message}`);

// ---------- 규칙 파일 읽기 (요청마다 읽어서 수정이 바로 반영된다) ----------
// _headers는 경로 규칙의 목록이다. 들여쓰지 않은 줄이 경로(예: /*, /pdf/*)이고, 그 아래 들여쓴 줄이 그 경로의 헤더이다.
// 요청 경로에 맞는 규칙의 헤더를 위에서 아래로 합친다. 별표(*)는 어떤 글자 열과도 맞는다. (Cloudflare의 방식)
function readHeaders(urlPath) {
  const headers = {};
  const text = readFileSync(join(publicDir, "_headers"), "utf8");
  let applies = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\S/.test(line) && !line.startsWith("#")) {
      const pattern = new RegExp(`^${line.trim().split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
      applies = pattern.test(urlPath);
      continue;
    }
    const match = line.match(/^\s+([A-Za-z-]+):\s*(.*)$/);
    if (applies && match) headers[match[1]] = match[2];
  }
  // 개발용 완화: 갱신 알림 연결과 오류 보고를 위해 connect-src를 'self'로 바꾼다.
  const csp = Object.keys(headers).find((name) => name.toLowerCase() === "content-security-policy");
  if (csp) headers[csp] = headers[csp].replace("connect-src 'none'", "connect-src 'self'");
  return headers;
}

function readRedirects() {
  const rules = new Map();
  const text = readFileSync(join(publicDir, "_redirects"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [source, destination, code = "301"] = trimmed.split(/\s+/);
    rules.set(source, { destination, code: Number(code) });
  }
  return rules;
}

// ---------- 파일 찾기 ----------
// 요청 경로에 대응하는 파일 경로를 반환한다. 없으면 null.
function findFile(urlPath) {
  let path = decodeURIComponent(urlPath);
  if (path.endsWith("/")) path += "index.html";
  const bases = useSample ? [previewDir, publicDir] : [publicDir];
  for (const base of bases) {
    const full = resolve(join(base, path));
    // 폴더 밖으로 나가는 경로를 거부한다.
    if (full !== base && !full.startsWith(base + sep)) continue;
    for (const candidate of [full, `${full}.html`]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

// ---------- 갱신 알림 ----------
const clients = new Set();
let pendingFiles = new Set();
let timer = null;

function notify() {
  const files = [...pendingFiles];
  pendingFiles = new Set();
  const onlyCss = files.every((file) => file.endsWith(".css"));
  const message = onlyCss ? "css" : "reload";
  for (const response of clients) response.write(`data: ${message}\n\n`);
  log("변경", `${files.join(", ")} -> 브라우저 ${onlyCss ? "CSS 교체" : "새로고침"} (${clients.size}개 연결)`);
}

function onFileChange(base, filename) {
  if (!filename || filename.endsWith(".edit-tmp")) return;
  const full = join(base, filename);
  // 폴더 자체의 변경은 무시한다. 삭제된 파일은 확인할 수 없으므로 파일로 취급한다.
  try {
    if (statSync(full).isDirectory()) return;
  } catch {
    // 삭제된 파일이다.
  }
  pendingFiles.add(relative(root, full).replaceAll("\\", "/"));
  clearTimeout(timer);
  timer = setTimeout(notify, 60);
}

// ---------- 서버 ----------
function send(response, status, headers, body) {
  response.writeHead(status, headers);
  response.end(body);
}

// ---------- 편집 저장 ----------
// 쓰기 요청을 받는 유일한 경로이다. 아래 장치를 모두 통과해야 데이터 파일이 바뀐다.
// 1. 서버가 이 컴퓨터(127.0.0.1)에서만 열린다. (server.listen)
// 2. Host가 localhost 또는 127.0.0.1이다. (다른 이름으로 접속한 요청을 거부해 DNS 재바인딩을 막는다.)
// 3. 요청의 Origin이 이 서버의 주소와 같다. (다른 웹사이트가 보낸 요청을 거부한다.)
// 4. 서버를 켤 때마다 새로 만드는 임시 암호(X-Dev-Token)가 같다. 암호는 같은 출처의 페이지만 받아 간다.
// 5. 바꿀 수 있는 파일은 데이터 파일(main.js) 하나뿐이다. 경로는 요청이 정하지 않는다.
// 6. 작업은 set, insert, insertChild, move, delete만 허용한다. 번호나 이름표가 있는 항목(카드, 섹션)은 지우지 않는다. 요청 크기는 200KB까지이다.
// 7. 저장할 때마다 파일의 이전 상태를 보관한다. "되돌리기"는 가장 최근 저장을 취소한다. (서버를 끄면 기록이 사라진다.)
const editToken = randomBytes(24).toString("hex");
const allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function isLocalHost(request) {
  return allowedHosts.has(request.headers.host ?? "");
}

function isSameOrigin(request) {
  const origin = request.headers.origin;
  if (origin) return origin === `http://${request.headers.host}`;
  return request.headers["sec-fetch-site"] === "same-origin";
}

function tokenMatches(request) {
  const given = Buffer.from(String(request.headers["x-dev-token"] ?? ""));
  const expected = Buffer.from(editToken);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// 저장할 때마다 { before, after }를 쌓는다. before는 저장 전 파일 내용, after는 저장 후 파일 내용이다.
const undoStack = [];
const UNDO_MAX = 50;

// 임시 파일에 쓴 뒤 바꿔 끼운다. 쓰다가 멈춰도 원본이 깨지지 않는다.
function writeData(text) {
  const temp = `${editFile}.edit-tmp`;
  writeFileSync(temp, text);
  renameSync(temp, editFile);
}

async function handleEdit(request, response) {
  const chunks = [];
  let size = 0;
  let tooLarge = false;
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > 200000) tooLarge = true;
    else chunks.push(chunk);
  });
  await new Promise((done) => request.on("end", done));
  const body = Buffer.concat(chunks).toString("utf8");
  const reply = (status, payload) => send(response, status, jsonHeaders, JSON.stringify(payload));
  if (tooLarge) return reply(413, { ok: false, error: "요청이 너무 큼" });
  try {
    const { ops } = JSON.parse(body);
    const source = readFileSync(editFile, "utf8");
    const result = applyOps(source, ops);
    if (result.source !== source) {
      writeData(result.source);
      undoStack.push({ before: source, after: result.source });
      if (undoStack.length > UNDO_MAX) undoStack.shift();
    }
    log("편집", `${ops.length}건 저장 (${ops.map((op) => op.type).join(", ")}) -> ${relative(root, editFile).replaceAll("\\", "/")}`);
    return reply(200, { ok: true, results: result.results, undo: undoStack.length });
  } catch (error) {
    log("편집", `거절: ${error.message}`);
    return reply(400, { ok: false, error: error.message });
  }
}

function handleUndo(response) {
  const reply = (status, payload) => send(response, status, jsonHeaders, JSON.stringify(payload));
  const entry = undoStack[undoStack.length - 1];
  if (!entry) return reply(400, { ok: false, error: "되돌릴 저장이 없음" });
  try {
    // 저장한 뒤에 IDE에서 파일을 고쳤다면 되돌리면서 그 수정을 지우게 된다. 그럴 때는 거절하고 기록을 비운다.
    if (readFileSync(editFile, "utf8") !== entry.after) {
      undoStack.length = 0;
      log("편집", "되돌리기 거절: 저장 이후 파일이 바뀜");
      return reply(409, { ok: false, error: "저장한 뒤에 파일이 바뀌어 되돌릴 수 없음 (IDE에서 고쳤을 수 있음)", undo: 0 });
    }
    writeData(entry.before);
    undoStack.pop();
    log("편집", `되돌리기 (남은 기록 ${undoStack.length}건)`);
    return reply(200, { ok: true, undo: undoStack.length });
  } catch (error) {
    return reply(500, { ok: false, error: error.message });
  }
}

// 되돌리기 기록을 모두 비운다. 편집 모드를 켜고 끌 때 클라이언트가 부른다. 파일은 바꾸지 않는다.
function handleUndoClear(response) {
  const count = undoStack.length;
  undoStack.length = 0;
  if (count > 0) log("편집", `되돌리기 기록 비움 (${count}건)`);
  return send(response, 200, jsonHeaders, JSON.stringify({ ok: true, undo: 0 }));
}

async function handleEditRoute(path, request, response) {
  if (!isLocalHost(request)) {
    log("편집", `Host 거부: ${request.headers.host}`);
    return send(response, 403, jsonHeaders, JSON.stringify({ ok: false, error: "허용되지 않은 Host" }));
  }
  if (path === "/__dev/edit/token" && request.method === "GET") {
    if (request.headers["sec-fetch-site"] !== "same-origin") return send(response, 403, jsonHeaders, JSON.stringify({ ok: false }));
    return send(response, 200, jsonHeaders, JSON.stringify({ ok: true, token: editToken, undo: undoStack.length, file: relative(root, editFile).replaceAll("\\", "/") }));
  }
  if ((path === "/__dev/edit" || path === "/__dev/edit/undo" || path === "/__dev/edit/undo-clear") && request.method === "POST") {
    if (!isSameOrigin(request) || !tokenMatches(request) || !String(request.headers["content-type"]).startsWith("application/json")) {
      log("편집", "거부: 출처 또는 암호가 맞지 않음");
      return send(response, 403, jsonHeaders, JSON.stringify({ ok: false, error: "허용되지 않은 요청" }));
    }
    if (path === "/__dev/edit") return handleEdit(request, response);
    return path === "/__dev/edit/undo" ? handleUndo(response) : handleUndoClear(response);
  }
  return send(response, 404, jsonHeaders, JSON.stringify({ ok: false }));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  const path = url.pathname;

  // 개발 전용 경로
  if (path === "/__dev/reload.js") {
    return send(response, 200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" }, readFileSync(clientFile));
  }
  if (path === "/__dev/inspector.js") {
    return send(response, 200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" }, readFileSync(inspectorScript));
  }
  if (path === "/__dev/inspector.css") {
    return send(response, 200, { "Content-Type": TYPES[".css"], "Cache-Control": "no-store" }, readFileSync(inspectorStyle));
  }
  if (path === "/__dev/edit.js") {
    return send(response, 200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" }, readFileSync(editScript));
  }
  if (path === "/__dev/edit.css") {
    return send(response, 200, { "Content-Type": TYPES[".css"], "Cache-Control": "no-store" }, readFileSync(editStyle));
  }
  if (path.startsWith("/__dev/edit")) {
    return handleEditRoute(path, request, response);
  }
  if (path === "/__dev/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    response.write(": 연결됨\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }
  if (path === "/__dev/log" && request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => { if (body.length < 4000) body += chunk; });
    request.on("end", () => {
      log("브라우저", body.replace(/\s+/g, " ").trim());
      send(response, 204, {}, "");
    });
    return;
  }

  const headers = readHeaders(path);
  if (request.method !== "GET" && request.method !== "HEAD") {
    log("405", `${request.method} ${path}`);
    return send(response, 405, headers, "");
  }

  // 이동 규칙
  const redirect = readRedirects().get(path);
  if (redirect) {
    return send(response, redirect.code, { ...headers, Location: redirect.destination }, "");
  }

  // 규칙 파일은 배포 환경에서 파일로 노출되지 않는다.
  const name = path.split("/").pop();
  if (name === "_headers" || name === "_redirects") {
    log("404", `${path} (규칙 파일은 공개되지 않는다)`);
    return send(response, 404, headers, "");
  }

  // 배포 환경은 .html 주소를 확장자 없는 주소로 이동시킨다.
  if (path.endsWith(".html")) {
    const clean = path === "/index.html" ? "/" : path.slice(0, -".html".length);
    return send(response, 307, { ...headers, Location: clean }, "");
  }

  const file = findFile(path);
  if (!file) {
    log("404", path);
    return send(response, 404, headers, "");
  }

  const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  let body = readFileSync(file);
  if (type.startsWith("text/html")) {
    // 개발용 스크립트와 스타일을 넣는다. 같은 도메인의 외부 파일이라 CSP를 통과한다.
    // inspector.js는 body가 생긴 뒤에 실행되어야 해서 defer를 붙인다.
    const injected = '<link rel="stylesheet" href="/__dev/inspector.css">'
      + '<link rel="stylesheet" href="/__dev/edit.css">'
      + '<script src="/__dev/reload.js"></script>'
      + '<script src="/__dev/inspector.js" defer></script>'
      + '<script src="/__dev/edit.js" defer></script>';
    body = Buffer.from(body.toString("utf8").replace("</head>", `${injected}</head>`));
  }
  send(response, 200, { ...headers, "Content-Type": type, "Cache-Control": "no-store" },
    request.method === "HEAD" ? "" : body);
});

server.on("error", (error) => {
  log("오류", error.code === "EADDRINUSE"
    ? `포트 ${port}를 이미 사용 중이다. 실행 중인 서버를 먼저 종료한다.`
    : error.message);
  process.exit(1);
});

for (const base of [publicDir, ...(useSample && existsSync(previewDir) ? [previewDir] : [])]) {
  watch(base, { recursive: true }, (_event, filename) => onFileChange(base, filename));
}
setInterval(() => { for (const response of clients) response.write(": 연결 유지\n\n"); }, 20000).unref();

// 이 컴퓨터에서만 접속할 수 있게 127.0.0.1에 묶는다. 같은 네트워크의 다른 컴퓨터는 접속하지 못한다.
server.listen(port, "127.0.0.1", () => {
  log("서버", `http://localhost:${port}  (${useSample ? "샘플 내용 모드" : "실제 내용 모드"})`);
  log("서버", `편집 모드 저장 대상: ${relative(root, editFile).replaceAll("\\", "/")}`);
  if (useSample) log("서버", "web/preview 폴더의 파일이 같은 경로의 web/public 파일을 대신한다.");
  log("서버", "파일을 저장하면 브라우저가 자동으로 갱신된다. 종료: Ctrl+C");
});
