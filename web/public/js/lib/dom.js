// DOM 보조 함수. 문자열은 textContent로만 넣는다.
// 속성은 허용 목록에 있는 것만 설정한다. 허용되지 않는 값은 오류로 처리한다.
import { renderMarkdown } from "./markdown.js";

const ALLOWED_ATTRS = /^(aria-[a-z-]+|data-[a-z-]+|id|role|lang|title|alt|href|src|rel|target|download|type|datetime|width|height)$/;
const SAFE_SCHEMES = ["https", "mailto", "tel"];

// URL 값을 검사한다. 위험한 스키마와 프로토콜 상대 주소를 거부한다.
function assertSafeUrl(value) {
  // 브라우저는 스키마 안의 공백과 제어 문자를 무시한다. 먼저 제거한다.
  const compact = value.replace(/[\u0000- ]/g, "");
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !SAFE_SCHEMES.includes(scheme[1].toLowerCase())) {
    throw new Error(`허용되지 않은 URL 스키마: ${scheme[1]}`);
  }
  if (compact.startsWith("//")) {
    throw new Error("프로토콜 상대 URL은 허용되지 않는다.");
  }
}

function setAttr(node, name, value) {
  if (!ALLOWED_ATTRS.test(name)) {
    throw new Error(`허용되지 않은 속성: ${name}`);
  }
  if (name === "href" || name === "src") assertSafeUrl(value);
  node.setAttribute(name, value);
}

// 개발 서버가 HTML의 html 요소에 data-dev-edit를 붙인다. (scripts/dev-client.js) 그때만 편집 모드이다.
const isEditMode = () => typeof document !== "undefined" && Boolean(document.documentElement?.hasAttribute("data-dev-edit"));

// 요소를 만든다.
// options.text: 글자. options.className: 클래스. options.attrs: 속성 객체.
// children: 자식 노드 배열.
export function el(tag, options = {}, children = []) {
  const { text, className, attrs, edit, editItem, md } = options;
  const node = document.createElement(tag);
  if (text) {
    // md: 글자 속 굵게(**)와 제목(#)을 요소로 바꾼다. "inline"은 굵게만, "block"은 굵게와 제목이다. (lib/markdown.js)
    // 편집 모드에서는 원본 글자를 그대로 둔다. 편집기가 직접 굵게와 제목 모양을 입힌다. (scripts/dev-edit.js)
    if (md && !isEditMode()) node.append(...renderMarkdown(text, md));
    else node.textContent = text;
  }
  if (className) node.className = className;
  // 블록 모드는 줄바꿈(\n)을 줄바꿈으로 보여 준다. (CSS md-block)
  if (md === "block") node.classList.add("md-block");
  for (const [name, value] of Object.entries(attrs ?? {})) {
    setAttr(node, name, String(value));
  }
  // 개발 서버의 편집 모드에서만 편집 경로를 붙인다. 빌드(미리 그리기)와 배포에는 붙지 않는다.
  // edit: 이 요소의 글자가 있는 데이터 경로. editItem: 이 요소가 배열의 한 항목일 때 그 항목의 경로. (lib/edit-path.js)
  if (isEditMode()) {
    if (edit) setAttr(node, "data-edit", edit);
    if (md) setAttr(node, "data-md", md);
    if (editItem) setAttr(node, "data-edit-item", editItem);
  }
  // 새 창으로 여는 링크는 opener 연결을 끊는다.
  if (attrs?.target === "_blank") node.setAttribute("rel", "noopener noreferrer");
  node.append(...children);
  return node;
}
