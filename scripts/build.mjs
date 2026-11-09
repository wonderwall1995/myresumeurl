// 배포 폴더(dist)를 만든다. 실행: pnpm build
// 재료: web/public(코드와 에셋)을 복사한 뒤, web/preview의 파일을 같은 경로로 덮어 쓴다.
// 그 뒤 dist/main.html의 #app 안에 내용을 미리 그려 넣는다. (JavaScript가 꺼진 컴퓨터에서도 이력서가 보이게 하기 위해서이다.)
//       브라우저의 코드와 같은 그리기 코드를 가상 DOM(linkedom)에서 실행한다. 브라우저에서는 JavaScript가 이 내용을 지우고 다시 그린다.
// 결과: dist/. Cloudflare는 이 폴더만 배포한다. (wrangler.jsonc의 assets.directory)
// 원본(web/public, web/preview)은 바꾸지 않는다. dist는 실행할 때마다 지우고 새로 만든다. git에는 올리지 않는다.
// 외부 패키지를 사용하지 않는다.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseHTML } from "linkedom";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "web", "public");
const previewDir = join(root, "web", "preview");
export const distDir = join(root, "dist");

// 폴더 안의 모든 파일 수를 센다.
function countFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).reduce(
    (sum, entry) => sum + (entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1),
    0,
  );
}

// dist/main.html의 #app에 내용을 미리 그린다. 반환: 그려 넣은 글자 수(문자 수가 아니라 요소 수).
async function prerender() {
  const htmlPath = join(distDir, "main.html");
  const { document, window } = parseHTML(readFileSync(htmlPath, "utf8"));
  // 그리기 코드는 전역 document를 쓴다. 그리는 동안만 가상 DOM을 전역에 둔다.
  globalThis.document = document;
  globalThis.window = window;
  try {
    const stamp = Date.now();
    const load = (path) => import(`${pathToFileURL(join(distDir, path)).href}?t=${stamp}`);
    const { renderPage } = await load("js/common/render-page.js");
    const { mainPage } = await load("data/ko/main.js");
    const app = document.getElementById("app");
    renderPage(app, mainPage);
    writeFileSync(htmlPath, document.toString());
    return app.querySelectorAll("*").length;
  } finally {
    delete globalThis.document;
    delete globalThis.window;
  }
}

export async function build() {
  // 지우기 전에 대상이 저장소 바로 아래의 dist인지 확인한다.
  if (basename(distDir) !== "dist" || dirname(distDir) !== root) {
    throw new Error(`지울 폴더가 dist가 아님: ${distDir}`);
  }
  rmSync(distDir, { recursive: true, force: true });
  cpSync(publicDir, distDir, { recursive: true });

  const overlaid = [];
  if (existsSync(previewDir) && statSync(previewDir).isDirectory()) {
    cpSync(previewDir, distDir, { recursive: true, force: true });
    for (const name of readdirSync(previewDir, { recursive: true })) {
      if (statSync(join(previewDir, name)).isFile()) overlaid.push(relative(previewDir, join(previewDir, name)).replaceAll("\\", "/"));
    }
  }
  const rendered = await prerender();
  return { files: countFiles(distDir), overlaid, rendered };
}

// 직접 실행했을 때만 결과를 출력한다. (check.mjs가 불러다 쓸 때는 출력하지 않는다.)
if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const { files, overlaid, rendered } = await build();
  console.log(`[빌드] dist/에 파일 ${files}개를 만들었다.`);
  console.log(`[빌드] main.html에 요소 ${rendered}개를 미리 그려 넣었다.`);
  console.log(`[빌드] web/preview에서 덮어쓴 파일 ${overlaid.length}개:`);
  for (const path of overlaid) console.log(`        ${path}`);
}
