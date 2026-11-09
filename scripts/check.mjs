// 저장소 점검 스크립트. 규칙 위반이 있으면 종료 코드 1로 끝난다.
// 실행: pnpm check
// 외부 패키지를 사용하지 않는다.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, distDir } from "./build.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 점검 대상은 배포 폴더(dist)이다. 점검을 시작할 때 pnpm build와 같은 방식으로 새로 만든다.
await build();
const publicDir = distDir;

const failures = [];
const rel = (path) => relative(root, path).replaceAll("\\", "/");
const read = (path) => readFileSync(path, "utf8");

// 폴더 안의 모든 파일 경로를 반환한다.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

// 주석을 제거한다. 주석 속 설명 때문에 규칙 위반으로 오판하는 것을 막는다.
function stripComments(text, ext) {
  if (ext === ".html") return text.replace(/<!--[\s\S]*?-->/g, "");
  const withoutBlock = text.replace(/\/\*[\s\S]*?\*\//g, "");
  // 줄 주석은 줄 처음이나 공백 뒤의 //만 제거한다. URL의 //는 남긴다.
  return ext === ".css" ? withoutBlock : withoutBlock.replace(/(^|\s)\/\/.*$/gm, "$1");
}

// ---------- 점검 목록 ----------
const checks = [];
const check = (name, run) => checks.push({ name, run });

// 1. 배포 폴더(dist)에는 허용된 파일만 둔다.
const ALLOWED_EXT = new Set([
  ".html", ".js", ".css", ".svg", ".webp", ".png", ".jpg", ".jpeg", ".ico", ".woff2", ".pdf", ".txt",
]);
const ALLOWED_NAMES = new Set(["_headers", "_redirects"]);
const FORBIDDEN_NAME = /^(\.env.*|package\.json|wrangler\.jsonc|serve\.json|.*\.(md|pem|key))$/i;

check("배포 폴더(dist) 경계", () => {
  const problems = [];
  for (const path of walk(publicDir)) {
    const name = path.split(/[\\/]/).pop();
    if (FORBIDDEN_NAME.test(name)) problems.push(`공개 금지 파일: ${rel(path)}`);
    else if (!ALLOWED_NAMES.has(name) && !ALLOWED_EXT.has(extname(name).toLowerCase())) {
      problems.push(`허용되지 않은 형식: ${rel(path)}`);
    }
  }
  return problems;
});

// 1-2. 빌드가 main.html에 내용을 미리 그렸는지 확인한다. (JavaScript가 꺼진 컴퓨터를 위해서이다.)
check("미리 그린 HTML (dist/main.html)", () => {
  const html = read(join(publicDir, "main.html"));
  const problems = [];
  // 바닥글(s99-footer)은 글자가 있을 때만 그려진다. 비워 두는 것도 정상이므로 필수 목록에 넣지 않는다.
  for (const id of ["s00-header", "s02-career"]) {
    if (!html.includes(`data-testid="${id}"`)) problems.push(`main.html에 ${id}가 미리 그려지지 않음`);
  }
  return problems;
});

// 1-3. 편집 모드의 흔적이 배포물에 없어야 한다. (scripts/dev-edit.js는 개발 서버에서만 쓰인다.)
// 편집 경로 속성(data-edit)은 개발 서버가 켠 표시(data-dev-edit)가 있을 때만 붙는다. 미리 그린 HTML에는 없어야 한다.
check("편집 모드 흔적 (dist)", () => {
  const problems = [];
  for (const path of walk(publicDir)) {
    const name = path.split(/[\\/]/).pop();
    if (/^dev-/.test(name)) problems.push(`개발 전용 파일이 배포물에 있음: ${rel(path)}`);
    if (extname(path).toLowerCase() === ".html" && /data-edit|data-dev-edit/.test(read(path))) {
      problems.push(`편집 표시가 HTML에 들어 있음: ${rel(path)}`);
    }
  }
  return problems;
});

// 1-4. 편집 모드가 새 항목에 넣는 견본 글자("새 글자")가 남아 있으면 안 된다.
// 항목을 추가한 뒤 실제 글자로 바꾸지 않은 채 배포하는 것을 막는다.
check("견본 글자 (dist/data)", () => {
  const problems = [];
  const dataDir = join(publicDir, "data");
  if (!existsSync(dataDir)) return problems;
  for (const path of walk(dataDir).filter((file) => file.endsWith(".js"))) {
    const text = read(path);
    for (const placeholder of ["새 글자"]) {
      const count = text.split(`"${placeholder}"`).length - 1;
      if (count > 0) problems.push(`${rel(path)}: 견본 글자 "${placeholder}" ${count}곳을 실제 글자로 바꾼다 (편집 모드에서 추가한 항목)`);
    }
  }
  return problems;
});

// 2. 금지된 코드 패턴. 읽기 전용 원칙과 CSP를 지킨다.
const FORBIDDEN = {
  ".js": [
    /innerHTML|outerHTML|insertAdjacentHTML/,
    /document\.write/,
    /\beval\s*\(|new\s+Function/,
    /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/,
    /localStorage|sessionStorage|document\.cookie/,
    /setAttribute\s*\(\s*["']style/,
    // 개발 전용 도구(Inspector 등)가 배포물에 들어가면 안 된다.
    /__dev\//,
  ],
  ".html": [
    /<form|<input|<iframe|<object|<embed|<base[\s>]/i,
    /<style/i,
    /\sstyle\s*=/i,
    /\son[a-z]+\s*=/i,
    /<script(?![^>]*\bsrc\s*=)[^>]*>/i,
    /__dev\//,
  ],
  ".css": [/@import/],
};
const ALLOWED_URLS = ["http://www.w3.org/2000/svg"];

check("금지된 코드 패턴", () => {
  const problems = [];
  for (const path of walk(publicDir)) {
    const ext = extname(path).toLowerCase();
    if (![".js", ".html", ".css", ".svg"].includes(ext)) continue;
    let text = stripComments(read(path), ext);
    // 빌드가 미리 그린 main.html의 하이퍼링크(<a href="https://...">)는 눌러야 열리는 링크이다. 요청을 만들지 않는다.
    if (ext === ".html") text = text.replace(/<a\s[^>]*href="https:[^"]*"[^>]*>[^<]*<\/a>/g, "");
    for (const pattern of FORBIDDEN[ext] ?? []) {
      if (pattern.test(text)) problems.push(`${rel(path)}: 금지 패턴 ${pattern}`);
    }
    // 데이터 파일(data/)의 https 주소는 화면에 보이는 하이퍼링크 내용이다. 요청을 만들지 않는다. (dom.js가 https만 허용한다.)
    const isData = rel(path).startsWith("dist/data/");
    for (const url of text.match(/https?:\/\/[^\s"'<>)]+/g) ?? []) {
      if (isData && url.startsWith("https://")) continue;
      if (!ALLOWED_URLS.includes(url)) problems.push(`${rel(path)}: 외부 URL ${url}`);
    }
  }
  return problems;
});

// 3. 상대 경로로 참조한 파일이 실제로 있는지 확인한다.
function resolveRef(fromFile, ref) {
  const clean = ref.split(/[?#]/)[0];
  const base = clean.startsWith("/") ? join(publicDir, clean) : resolve(dirname(fromFile), clean);
  return [base, `${base}.html`].find((path) => existsSync(path) && !readdirIsDir(path));
}
function readdirIsDir(path) {
  try { readdirSync(path); return true; } catch { return false; }
}

check("파일 참조", () => {
  const problems = [];
  for (const path of walk(publicDir)) {
    const ext = extname(path).toLowerCase();
    const text = [".html", ".js", ".css"].includes(ext) ? stripComments(read(path), ext) : "";
    const refs = [];
    if (ext === ".css") {
      // url() 안의 상대 경로를 검사한다. data URL과 외부 URL은 제외한다.
      for (const m of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
        if (!/^(https?:|data:|#)/.test(m[1])) refs.push(m[1]);
      }
    }
    if (ext === ".js") {
      for (const m of text.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) refs.push(m[1]);
    }
    if (ext === ".html") {
      for (const m of text.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) {
        if (!/^(https?:|mailto:|tel:|#|data:)/.test(m[1])) refs.push(m[1]);
      }
    }
    for (const ref of refs) {
      if (!resolveRef(path, ref)) problems.push(`${rel(path)}: 없는 파일 ${ref}`);
    }
  }
  return problems;
});

// 4. 배포 설정이 public 폴더만 가리키는지 확인한다.
check("배포 설정 (wrangler.jsonc)", () => {
  const text = read(join(root, "wrangler.jsonc")).replace(/^\s*\/\/.*$/gm, "");
  const config = JSON.parse(text);
  return config.assets?.directory === "./dist"
    ? []
    : [`assets.directory가 ./dist가 아님: ${config.assets?.directory}`];
});

// 5. 이동 규칙 문법: _redirects의 각 줄을 검사한다. 개발 서버도 이 파일을 그대로 읽는다.
check("이동 규칙 (_redirects)", () => {
  const problems = [];
  const lines = read(join(publicDir, "_redirects")).split(/\r?\n/);
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const [source, destination, code = "301", ...rest] = line.split(/\s+/);
    const where = `_redirects ${index + 1}번째 줄`;
    if (rest.length > 0) problems.push(`${where}: 항목이 너무 많음`);
    if (!source?.startsWith("/")) problems.push(`${where}: 원본이 /로 시작하지 않음`);
    if (!destination?.startsWith("/")) problems.push(`${where}: 대상이 /로 시작하지 않음`);
    if (!["200", "301", "302", "303", "307", "308"].includes(code)) problems.push(`${where}: 상태 코드 오류 ${code}`);
    if (/[*:]/.test(source)) problems.push(`${where}: 개발 서버는 와일드카드와 자리표시자를 지원하지 않음`);
  });
  return problems;
});

// 6. 보안 헤더 존재와 CSP 내용을 확인한다.
check("보안 헤더 (_headers)", () => {
  const text = read(join(publicDir, "_headers"));
  const problems = [];
  const required = [
    "content-security-policy", "x-content-type-options", "x-frame-options",
    "referrer-policy", "permissions-policy", "strict-transport-security",
  ];
  for (const name of required) {
    if (!new RegExp(`^\\s*${name}\\s*:`, "im").test(text)) problems.push(`헤더 없음: ${name}`);
  }
  const csp = text.match(/^\s*content-security-policy\s*:(.*)$/im)?.[1] ?? "";
  if (!/default-src\s+'none'/.test(csp)) problems.push("CSP에 default-src 'none'이 없음");
  if (/unsafe-inline|unsafe-eval/.test(csp)) problems.push("CSP에 unsafe-inline 또는 unsafe-eval이 있음");
  if (/(^|\s)\*(\s|;|$)/.test(csp)) problems.push("CSP에 와일드카드(*)가 있음");
  return problems;
});

// 7. 비밀 값 패턴. git이 추적하거나 추적할 수 있는 파일만 검사한다.
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /gh[pousr]_[A-Za-z0-9]{36,}/,
  /sk-[A-Za-z0-9]{32,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(api[_-]?key|secret|passwd|password|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i,
];
const BINARY_EXT = new Set([".webp", ".png", ".jpg", ".jpeg", ".ico", ".woff2", ".pdf"]);

check("비밀 값 패턴", () => {
  let files;
  try {
    files = execSync("git ls-files -co --exclude-standard", { cwd: root, encoding: "utf8" })
      .split("\n").filter(Boolean);
  } catch {
    return ["git 목록을 읽지 못함. 점검 불가"];
  }
  const problems = [];
  for (const file of files) {
    if (file === "pnpm-lock.yaml" || file === "scripts/check.mjs") continue;
    if (BINARY_EXT.has(extname(file).toLowerCase())) continue;
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const text = read(path);
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(text)) problems.push(`${file}: 비밀 값 의심 패턴 ${pattern}`);
    }
  }
  return problems;
});

// 8. 문서와 설정의 값 일치: 포트와 개발 서버.
check("문서와 설정 일치", () => {
  const pkg = JSON.parse(read(join(root, "package.json")));
  const readme = read(join(root, "README.md"));
  const problems = [];
  for (const name of ["dev", "preview"]) {
    const script = pkg.scripts?.[name] ?? "";
    const port = script.match(/--port\s+(\d+)/)?.[1];
    if (!script.includes("scripts/dev-server.mjs")) problems.push(`${name} 스크립트가 개발 서버를 실행하지 않음`);
    if (!port) problems.push(`${name} 스크립트에 --port가 없음`);
    else if (!readme.includes(`localhost:${port}`)) problems.push(`README에 localhost:${port}가 없음`);
  }
  if (pkg.scripts?.dev?.match(/--port\s+(\d+)/)?.[1] !== pkg.scripts?.preview?.match(/--port\s+(\d+)/)?.[1]) {
    problems.push("dev와 preview의 포트가 다름");
  }
  if (!pkg.scripts?.preview?.includes("--sample")) problems.push("preview 스크립트에 --sample이 없음");
  return problems;
});

// 9. 섹션 번호 규칙 (design.listup.md 11절). 데이터 파일을 불러와 검사한다.
const SECTION_ID = /^s(0[1-9]|[1-8][0-9])-[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

check("섹션 번호 규칙", async () => {
  const problems = [];
  const { renderers } = await import(pathToFileURL(join(publicDir, "js/sections/index.js")).href);
  // 실제 데이터와 샘플 데이터(preview)가 같은 규칙을 따라야 한다.
  const dataRoots = [join(root, "web", "public", "data"), join(root, "web", "preview", "data")].filter(existsSync);
  const dataFiles = dataRoots.flatMap(walk).filter((path) => path.endsWith(".js"));
  for (const file of dataFiles) {
    const module = await import(pathToFileURL(file).href);
    for (const [exportName, page] of Object.entries(module)) {
      const where = `${rel(file)} (${exportName})`;
      if (!Array.isArray(page.sections)) {
        problems.push(`${where}: sections 배열이 없음`);
        continue;
      }
      const ids = new Set();
      const numbers = new Set();
      for (const section of page.sections) {
        if (!SECTION_ID.test(section.id ?? "")) {
          problems.push(`${where}: 섹션 id 형식 오류 "${section.id}" (예: s02-career)`);
          continue;
        }
        if (ids.has(section.id)) problems.push(`${where}: 섹션 id 중복 ${section.id}`);
        ids.add(section.id);
        const number = section.id.slice(1, 3);
        if (numbers.has(number)) problems.push(`${where}: 섹션 번호 중복 ${number}`);
        numbers.add(number);
        if (!(section.type in renderers)) problems.push(`${where}: ${section.id}의 type "${section.type}"에 렌더러가 없음`);
        const cardNumbers = new Set();
        for (const card of section.cards ?? []) {
          if (!Number.isInteger(card.no) || card.no < 1) problems.push(`${where}: ${section.id}의 카드 번호 오류 "${card.no}"`);
          else if (cardNumbers.has(card.no)) problems.push(`${where}: ${section.id}의 카드 번호 중복 ${card.no}`);
          cardNumbers.add(card.no);
        }
      }
    }
  }
  return problems;
});

// ---------- 실행 ----------
for (const { name, run } of checks) {
  let problems;
  try {
    problems = await run();
  } catch (error) {
    problems = [`점검 중 오류: ${error.message}`];
  }
  console.log(`${problems.length === 0 ? "통과" : "실패"}  ${name}`);
  for (const problem of problems) {
    console.log(`        ${problem}`);
    failures.push(problem);
  }
}
console.log(failures.length === 0 ? "\n모든 점검을 통과함." : `\n실패 ${failures.length}건.`);
process.exit(failures.length === 0 ? 0 : 1);
