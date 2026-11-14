// 이력서 PDF 두 개(A4 세로, A4 가로)를 만든다. 실행: pnpm pdf
// 순서: 1) dist를 새로 만든다. 2) dist를 임시 서버로 열고 Edge나 Chrome(헤드리스)으로 인쇄용 PDF를 만든다.
//       3) web/preview/pdf/ 에 PDF와 manifest.txt(재료의 해시)을 쓴다. 4) PDF가 dist에 들어가도록 dist를 다시 만든다.
// 이력서 내용이나 인쇄 스타일을 고친 뒤에는 이 명령을 다시 실행해서 PDF를 커밋한다. 잊으면 pnpm check가 실패한다.
// 배포 환경(Cloudflare 빌드)에는 브라우저가 없으므로 PDF는 저장소에 미리 만들어 둔다.
// 외부 패키지를 사용하지 않는다. 브라우저 경로가 다르면 환경 변수 PDF_BROWSER에 실행 파일 경로를 넣는다.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build, distDir } from "./build.mjs";
import { hashPdfInputs, PDF_FILES, PDF_MANIFEST } from "./pdf-hash.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "web", "preview", "pdf");

// A4 크기(인치). 방향은 landscape 값으로 정한다. 인쇄 스타일(print.css)은 용지 크기를 정하지 않는다.
const A4_WIDTH_IN = 8.27;
const A4_HEIGHT_IN = 11.69;

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
  ".txt": "text/plain; charset=utf-8",
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function findBrowser() {
  const candidates = [
    process.env.PDF_BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/microsoft-edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error("Edge 또는 Chrome을 찾지 못함. 환경 변수 PDF_BROWSER에 실행 파일 경로를 넣는다.");
  return found;
}

// dist를 읽기 전용으로 여는 임시 서버. 127.0.0.1에만 열고, dist 밖의 파일은 주지 않는다.
function serveDist() {
  const base = resolve(distDir);
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const path = resolve(join(base, decodeURIComponent(url.pathname)));
    if ((path !== base && !path.startsWith(base + sep)) || !existsSync(path) || !statSync(path).isFile()) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream" });
    response.end(readFileSync(path));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done({ server, port: server.address().port })));
}

// 브라우저를 띄우고 DevTools 연결을 만든다.
async function openBrowser() {
  const port = 9300 + Math.floor(Math.random() * 400);
  const profile = join(tmpdir(), `resume-pdf-${Date.now()}`);
  const child = spawn(findBrowser(), ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  let page;
  for (let i = 0; i < 60 && !page; i += 1) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((target) => target.type === "page");
    } catch {
      // 브라우저가 아직 준비되지 않았다.
    }
    if (!page) await sleep(250);
  }
  if (!page) {
    child.kill();
    throw new Error("브라우저에 연결하지 못함");
  }
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((done) => (socket.onopen = done));
  let id = 0;
  const waiting = new Map();
  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id && waiting.has(data.id)) {
      waiting.get(data.id)(data);
      waiting.delete(data.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((done, fail) => {
      id += 1;
      waiting.set(id, (data) => (data.error ? fail(new Error(`${method}: ${data.error.message}`)) : done(data.result)));
      socket.send(JSON.stringify({ id, method, params }));
    });
  return { send, close: () => { socket.close(); child.kill(); } };
}

// 페이지를 열고 이력서가 다 그려질 때까지 기다린 뒤 PDF 데이터를 반환한다.
async function printPdf(browser, url, landscape) {
  await browser.send("Page.navigate", { url });
  for (let i = 0; i < 40; i += 1) {
    const { result } = await browser.send("Runtime.evaluate", {
      expression: `Boolean(document.querySelector('[data-testid="s02-career"]')) && document.fonts.status === "loaded"`,
      returnByValue: true,
    });
    if (result.value) break;
    await sleep(250);
  }
  // 글꼴 조각(unicode-range)을 더 내려받을 시간을 준다.
  await sleep(1500);
  await browser.send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });
  const { data } = await browser.send("Page.printToPDF", {
    landscape,
    printBackground: true,
    preferCSSPageSize: false,
    paperWidth: A4_WIDTH_IN,
    paperHeight: A4_HEIGHT_IN,
  });
  return Buffer.from(data, "base64");
}

// 쪽 수와 첫 쪽의 크기를 읽는다. (확인용)
function describe(buffer) {
  const text = buffer.toString("latin1");
  const media = text.match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/);
  return { pages: (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length, width: Number(media?.[1]), height: Number(media?.[2]) };
}

await build();
const hash = hashPdfInputs(distDir);
mkdirSync(outDir, { recursive: true });

const { server, port } = await serveDist();
const browser = await openBrowser();
try {
  for (const [direction, name] of Object.entries(PDF_FILES)) {
    const buffer = await printPdf(browser, `http://127.0.0.1:${port}/main.html`, direction === "landscape");
    const info = describe(buffer);
    const isLandscape = info.width > info.height;
    if (isLandscape !== (direction === "landscape")) throw new Error(`${name}: 방향이 맞지 않음 (${info.width} x ${info.height})`);
    writeFileSync(join(outDir, name), buffer);
    console.log(`[PDF] ${name}: ${info.pages}쪽, ${Math.round(buffer.length / 1024)}KB, ${direction === "landscape" ? "가로" : "세로"}`);
  }
} finally {
  browser.close();
  server.close();
}

writeFileSync(join(outDir, PDF_MANIFEST), `${hash}\n`);
// PDF가 dist에 들어가도록 다시 만든다. 재료의 해시는 PDF를 뺀 파일로 계산하므로 달라지지 않는다.
await build();
if (hashPdfInputs(distDir) !== hash) throw new Error("다시 만든 dist의 해시가 달라짐");
console.log("[PDF] web/preview/pdf/ 에 저장했다. 변경된 PDF와 manifest.txt를 커밋한다.");
process.exit(0);
