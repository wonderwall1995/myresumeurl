// PDF의 재료가 바뀌었는지 확인하는 해시 계산. pnpm pdf(build-pdf.mjs)와 pnpm check(check.mjs)가 함께 쓴다.
// 재료는 dist 안의 파일 중 PDF 내용에 영향을 주는 것이다. 목록은 아래 규칙으로 정한다.
//   - dist/pdf/ 는 제외한다. (PDF와 manifest.json 자체이다.)
//   - js/common/print-widget.js 는 제외한다. 위젯은 인쇄되지 않는다.
// 같은 재료이면 같은 해시가 나온다. 파일 경로와 내용만 쓰고 시간은 쓰지 않는다.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const EXCLUDED = [/^pdf\//, /^js\/common\/print-widget\.js$/];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export function hashPdfInputs(distDir) {
  const hash = createHash("sha256");
  const files = walk(distDir)
    .map((path) => ({ path, name: relative(distDir, path).replaceAll("\\", "/") }))
    .filter((file) => !EXCLUDED.some((pattern) => pattern.test(file.name)))
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const file of files) {
    hash.update(file.name);
    hash.update("\0");
    hash.update(readFileSync(file.path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

// 사이트가 내려 주는 PDF 파일 이름. 모달의 방향 선택과 이어진다. (js/common/print-widget.js)
export const PDF_FILES = {
  portrait: "resume-portrait.pdf",
  landscape: "resume-landscape.pdf",
};
// PDF를 만들 때의 재료 해시를 한 줄로 적은 파일. (배포 폴더에 허용된 형식이라 txt로 쓴다.)
export const PDF_MANIFEST = "manifest.txt";
