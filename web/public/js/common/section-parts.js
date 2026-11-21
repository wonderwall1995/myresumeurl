// 섹션 렌더러가 함께 쓰는 부품.
import { el, isEditMode } from "../lib/dom.js";
import { itemId, partId, testAttr } from "../lib/ids.js";
import { itemPath, sectionPath } from "../lib/edit-path.js";

// 섹션 제목 (h2). 제목이 없으면 아무것도 그리지 않는다.
export function renderHeading(root, data) {
  if (!data.heading) return;
  root.append(el("h2", { text: data.heading, attrs: testAttr(partId(data.id, "heading")), edit: `${sectionPath(data.id)}.heading` }));
}

// 구분선 항목의 글자. 항목 글자가 정확히 이것이면 글자 대신 가는 선으로 보인다. (태그 목록 제외)
export const DIVIDER = "---";

// 인쇄 쪽 나눔 표식의 글자. 목록에서 항목 글자가 정확히 이것이면 그 자리에서 인쇄가 다음 쪽으로 넘어간다.
// 화면에는 보이지 않고, 개발 서버의 편집 모드에서만 점선으로 보인다. (CSS .print-break, scripts/dev-edit.css)
// 경력의 직책 사이와 묶음 사이, 글머리 목록, 소개와 About me의 단락, 관심 분야 글, 프로젝트의 블록과 줄글에 넣을 수 있다.
export const PAGE_BREAK = "===";

// 쪽 나눔 표식 요소를 만든다. 목록(ul) 안이면 tag를 "li"로 준다. path는 표식의 편집 경로(배열 항목)이다.
export function createPageBreak(id, path, tag = "div") {
  return el(tag, { className: "print-break", attrs: { "aria-hidden": "true", ...testAttr(id) }, editItem: path });
}

// 하위 줄이 있는 항목 하나. 항목은 { text, sub: ["글자", ...] } 객체이다. 하위 줄은 한 단계만 있다.
// li는 항목 전체이고(editItem), 글자는 안쪽 span(edit)이다. 편집기가 글자 요소의 내용을 통째로 바꾸므로 하위 목록(ul)과 섞이면 안 된다.
// 이름표: 항목 <id>-i3, 글자 <id>-i3-text, 하위 목록 <id>-i3-sub, 하위 줄 <id>-i3-s1
function createItemWithSub(item, liId, path) {
  const subPath = path ? `${path}.sub` : undefined;
  const subs = (Array.isArray(item.sub) ? item.sub : []).map((text, index) => {
    const subItemPath = subPath ? itemPath(subPath, index) : undefined;
    return el("li", { text: String(text), attrs: testAttr(partId(liId, `s${index + 1}`)), edit: subItemPath, editItem: subItemPath, md: "inline" });
  });
  const parts = [el("span", { text: String(item.text ?? ""), className: "item-text", attrs: testAttr(partId(liId, "text")), edit: path ? `${path}.text` : undefined, md: "inline" })];
  if (subs.length > 0) parts.push(el("ul", { className: "sub-list", attrs: testAttr(partId(liId, "sub")) }, subs));
  return el("li", { attrs: testAttr(liId), editItem: path }, parts);
}

// 글자 목록 (ul). 항목이 없으면 null을 반환한다.
// 항목은 글자이거나 { text, sub } 객체이다. 객체는 아래에 한 단계 들여쓴 하위 줄을 가진다. 글자 "---"는 구분선이다.
// 태그 목록(className이 tag-list)에는 하위 줄과 구분선이 없다.
// 각 항목에 이름표를 붙인다. 예: <부모 이름표>-i1
// className을 주면 ul에 클래스를 붙인다. 예: 스킬 목록은 tag-list. 태그 목록이 아니면 클래스 row-list가 함께 붙는다. (편집기가 하위 줄과 구분선을 넣을 수 있는 목록을 알아보는 표시)
// editBase는 목록의 편집 경로이다. 각 항목이 편집 경로 <editBase>[번호]를 가진다. listItem은 ul 자체가 배열의 한 항목일 때의 경로이다.
// 빈 글자 항목("")은 배포 화면에서 빈 글머리 점으로 보이므로 그리지 않는다.
// 편집 모드에서는 그려 두고 안내 글자("빈 항목")를 보인다. 눌러서 글자를 쓰거나 삭제할 수 있어야 하기 때문이다.
// 항목 번호(이름표 i1, i2와 편집 경로의 [n])는 빈 항목을 건너뛰어도 원래 배열의 위치를 따른다.
export function createList(items, id, className, editBase, listItem) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const isTag = className === "tag-list";
  const editing = isEditMode();
  const children = items.map((item, index) => {
    if (item === "" && !editing) return null;
    const path = editBase ? itemPath(editBase, index) : undefined;
    const liId = itemId(id, index);
    if (!isTag && item !== null && typeof item === "object") return createItemWithSub(item, liId, path);
    const text = String(item);
    if (!isTag && text === PAGE_BREAK) return createPageBreak(partId(liId, "break"), path, "li");
    if (!isTag && text === DIVIDER) {
      return el("li", { text, className: "item-divider", attrs: { ...testAttr(liId), role: "separator" }, edit: path, editItem: path });
    }
    return el("li", { text, attrs: testAttr(liId), edit: path, editItem: path, md: isTag ? undefined : "inline", placeholder: text ? undefined : "빈 항목 (글자를 쓰거나 삭제)" });
  }).filter(Boolean);
  if (children.length === 0) return null;
  const listClass = isTag ? className : [className, "row-list"].filter(Boolean).join(" ");
  return el("ul", { className: listClass, attrs: testAttr(id), editItem: listItem }, children);
}

// 목록만 가진 섹션을 그린다. 항목이 없으면 아무것도 그리지 않는다.
// options.className은 목록의 클래스이다.
export function renderListSection(root, data, options = {}) {
  const list = createList(data.items, partId(data.id, "list"), options.className, `${sectionPath(data.id)}.items`);
  if (!list) return;
  renderHeading(root, data);
  root.append(list);
}

// 본문을 그린다. 문자열이면 문단 하나, 배열이면 목록으로 그린다. 값이 없으면 null.
// editPath는 본문의 편집 경로이다.
export function createBody(body, id, editPath) {
  if (Array.isArray(body)) return createList(body, id, undefined, editPath);
  if (typeof body === "string" && body) return el("p", { text: body, attrs: testAttr(id), edit: editPath, md: "block" });
  return null;
}
