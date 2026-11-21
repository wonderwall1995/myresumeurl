// 이력서 PDF 두 개(A4 세로, A4 가로)를 만든다. 실행: pnpm pdf (항상 새로 만듦), pnpm build (내용이 바뀌었을 때만 자동으로 만듦)
// 순서: 1) dist를 새로 만든다. 2) dist를 임시 서버로 열고 Edge나 Chrome(헤드리스)으로 인쇄용 PDF를 만든다.
//       3) web/preview/pdf/ 에 PDF와 manifest.txt(재료의 해시)을 쓴다. 4) PDF가 dist에 들어가도록 dist를 다시 만든다.
// 이력서 내용이나 인쇄 스타일을 고치면 PDF가 바뀐다. 바뀐 PDF를 커밋한다. 잊으면 pnpm check가 실패한다.
// 배포 환경(Cloudflare 빌드)에는 브라우저가 없으므로 PDF는 저장소에 미리 만들어 둔다. 그곳의 pnpm build는 PDF 만들기를 건너뛴다. (--auto)
// 외부 패키지를 사용하지 않는다. 브라우저 경로가 다르면 환경 변수 PDF_BROWSER에 실행 파일 경로를 넣는다.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build, distDir } from "./build.mjs";
import { countPdfPages, hashPdfInputs, MIN_PDF_PAGES, PDF_FILES, PDF_MANIFEST } from "./pdf-hash.mjs";

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
  // 없으면 null이다.
  return candidates.find((path) => existsSync(path)) ?? null;
}

// Chrome과 Edge가 보안상 열지 않는 포트(Chromium의 제한 포트 목록). 이 포트로 연 페이지는 ERR_UNSAFE_PORT 오류 화면이 된다.
// 임시 서버가 운영체제에서 받은 포트가 이 목록에 있으면 다시 받는다. (1719번을 받아 오류 화면이 PDF로 저장된 일이 있었다.)
const UNSAFE_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115,
  117, 119, 123, 135, 137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587,
  601, 636, 989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669,
  6679, 6697, 10080,
]);

// dist를 읽기 전용으로 여는 임시 서버. 127.0.0.1에만 열고, dist 밖의 파일은 주지 않는다.
// 브라우저가 막는 포트를 받으면 닫고 다시 연다. (최대 20번)
async function serveDist() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const opened = await openServer();
    if (!UNSAFE_PORTS.has(opened.port)) return opened;
    opened.server.close();
  }
  throw new Error("브라우저가 허용하는 포트로 임시 서버를 열지 못함");
}

function openServer() {
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
  const browserPath = findBrowser();
  if (!browserPath) throw new Error("Edge 또는 Chrome을 찾지 못함. 환경 변수 PDF_BROWSER에 실행 파일 경로를 넣는다.");
  const child = spawn(browserPath, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
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
// 준비가 끝나지 않거나 페이지를 열지 못하면 오류로 멈춘다. (오류 화면을 PDF로 저장하지 않기 위해서이다.)
const READY_EXPRESSION = `Boolean(document.querySelector('[data-testid="s00-header"]')) && Boolean(document.querySelector('[data-testid="s02-career"]')) && document.fonts.status === "loaded"`;

async function printPdf(browser, url, landscape) {
  const navigation = await browser.send("Page.navigate", { url });
  if (navigation.errorText) throw new Error(`페이지를 열지 못함: ${url} (${navigation.errorText})`);
  let ready = false;
  for (let i = 0; i < 40 && !ready; i += 1) {
    const { result } = await browser.send("Runtime.evaluate", { expression: READY_EXPRESSION, returnByValue: true });
    ready = result.value === true;
    if (!ready) await sleep(250);
  }
  if (!ready) throw new Error(`이력서가 10초 안에 그려지지 않음: ${url}`);
  // 글꼴 조각(unicode-range)을 더 내려받을 시간을 준다.
  await sleep(1500);
  await browser.send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });
  // 인쇄 직전에 이력서의 필수 요소가 그대로 있는지 다시 확인한다.
  const recheck = await browser.send("Runtime.evaluate", { expression: READY_EXPRESSION, returnByValue: true });
  if (recheck.result.value !== true) throw new Error(`인쇄 직전에 이력서 요소를 찾지 못함: ${url}`);
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
  return { pages: countPdfPages(buffer), width: Number(media?.[1]), height: Number(media?.[2]) };
}

// 저장소의 PDF가 현재 재료(hash)로 만든 것인지 확인한다.
function isFresh(hash) {
  const manifest = join(outDir, PDF_MANIFEST);
  return Object.values(PDF_FILES).every((name) => existsSync(join(outDir, name))) && existsSync(manifest) && readFileSync(manifest, "utf8").trim() === hash;
}

// PDF 두 개를 만들어 저장한다. 두 개가 모두 만들어진 뒤에 저장하므로, 중간에 실패해도 저장소의 PDF는 그대로이다.
async function generate(hash) {
  const made = [];
  const { server, port } = await serveDist();
  const browser = await openBrowser();
  try {
    for (const [direction, name] of Object.entries(PDF_FILES)) {
      const buffer = await printPdf(browser, `http://127.0.0.1:${port}/main.html`, direction === "landscape");
      const info = describe(buffer);
      const isLandscape = info.width > info.height;
      if (isLandscape !== (direction === "landscape")) throw new Error(`${name}: 방향이 맞지 않음 (${info.width} x ${info.height})`);
      // 이력서는 여러 쪽이다. 1쪽이면 오류 화면이나 빈 페이지를 저장한 것으로 본다. (MIN_PDF_PAGES, pdf-hash.mjs)
      if (info.pages < MIN_PDF_PAGES) throw new Error(`${name}: ${info.pages}쪽뿐이라 이력서가 아닌 화면을 저장한 것으로 보임`);
      made.push({ name, buffer });
      console.log(`[PDF] ${name}: ${info.pages}쪽, ${Math.round(buffer.length / 1024)}KB, ${direction === "landscape" ? "가로" : "세로"}`);
    }
  } finally {
    browser.close();
    server.close();
  }
  mkdirSync(outDir, { recursive: true });
  for (const { name, buffer } of made) writeFileSync(join(outDir, name), buffer);
  writeFileSync(join(outDir, PDF_MANIFEST), `${hash}\n`);
  // PDF가 dist에 들어가도록 다시 만든다. 재료의 해시는 PDF를 뺀 파일로 계산하므로 달라지지 않는다.
  await build();
  if (hashPdfInputs(distDir) !== hash) throw new Error("다시 만든 dist의 해시가 달라짐");
  console.log("[PDF] web/preview/pdf/ 에 저장했다. 변경된 PDF와 manifest.txt를 커밋한다.");
}

// --auto: pnpm build가 이어서 실행하는 방식. 실패해도 빌드를 멈추지 않는다.
//   PDF가 최신이면 건너뛴다. 최신이 아니고 브라우저가 있으면 새로 만든다.
//   브라우저가 없으면(예: Cloudflare 빌드) 저장소의 PDF를 그대로 쓰고 경고만 남긴다. 오래된 PDF는 pnpm check가 잡는다.
// 옵션이 없으면(pnpm pdf) 항상 새로 만들고, 실패하면 오류로 끝난다.
const auto = process.argv.includes("--auto");

await build();
const hash = hashPdfInputs(distDir);
if (auto) {
  if (isFresh(hash)) {
    console.log("[PDF] 저장소의 PDF가 최신이라 건너뛴다.");
    process.exit(0);
  }
  if (!findBrowser()) {
    console.log("[PDF] 경고: Edge 또는 Chrome이 없어 PDF를 새로 만들지 못했다. 저장소의 PDF를 그대로 쓴다. 내용을 고쳤다면 내 컴퓨터에서 pnpm pdf를 실행해 커밋한다.");
    process.exit(0);
  }
  console.log("[PDF] 내용이 바뀌어 PDF를 새로 만든다.");
}
try {
  await generate(hash);
} catch (error) {
  if (!auto) throw error;
  console.log(`[PDF] 경고: PDF를 만들지 못했다 (${error.message}). 저장소의 PDF를 그대로 쓴다.`);
}
process.exit(0);
