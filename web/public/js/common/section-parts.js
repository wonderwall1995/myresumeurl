// 섹션 렌더러가 함께 쓰는 부품.
import { el, isEditMode } from "../lib/dom.js";
import { itemId, partId, testAttr } from "../lib/ids.js";
import { itemPath, sectionPath } from "../lib/edit-path.js";
import { renderMarkdown } from "../lib/markdown.js";

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

// ---------- 두 칸 줄글 (소제목 | 줄글) ----------
// 자기소개 단락과 프로젝트 줄글을 경력 칸처럼 두 칸으로 보여 준다. (사용자 요청, 실험)
// 데이터는 바꾸지 않는다. 단락의 줄 중에서 제목 줄(# 제목, ## 제목, ### 제목) 또는 대괄호를 감싼 굵은 글자 한 줄(**[직무상 소개]**)을
// 소제목으로 보고 왼쪽 칸에 놓는다. 그다음 줄부터 다음 소제목 전까지가 오른쪽 칸의 줄글이다.
// 대괄호가 없는 굵은 글자 한 줄은 강조 문장이므로 줄글에 남는다. (긴 강조 문장이 좁은 왼쪽 칸에 들어가던 문제를 막는다.)
// 소제목이 여러 개면(Keep, Problem, Try) 소제목마다 행을 나눈다. 첫 소제목 앞의 줄은 왼쪽 칸이 빈 행이 된다.
const LABEL_LINE = /^(?:#{1,3} (.+)|\*\*(\[[^*]*\])\*\*)$/;

export function splitRows(text) {
  const rows = [];
  let current = null;
  for (const line of String(text).split("\n")) {
    const match = LABEL_LINE.exec(line.trim());
    if (match) {
      current = { label: (match[1] ?? match[2]).trim(), body: [] };
      rows.push(current);
      continue;
    }
    if (!current) {
      current = { label: "", body: [] };
      rows.push(current);
    }
    current.body.push(line);
  }
  // 행 앞뒤의 빈 줄은 지운다. (단락 사이 간격은 CSS가 정한다.)
  for (const row of rows) {
    while (row.body.length > 0 && !row.body[0].trim()) row.body.shift();
    while (row.body.length > 0 && !row.body[row.body.length - 1].trim()) row.body.pop();
  }
  return rows.filter((row) => row.label || row.body.length > 0);
}

// 두 칸 줄글 하나(단락 하나)를 만든다.
//   text: 원본 글자. id: 이름표. editPath: 글자의 편집 경로. editItem: 배열 항목이면 그 경로(이동, 삭제, 끊기 단위).
//   rawClass: 편집 칸(p)의 클래스. 편집 모드에서 원본 글자를 고치는 칸의 모양이다.
// 화면과 인쇄에는 두 칸 모양(div.split-view)만 나온다.
// 개발 서버에서는 원본 글자 칸(p.split-raw)도 함께 만든다. 편집을 켜면 두 칸 모양을 숨기고 이 칸을 보여 준다. (scripts/dev-edit.css)
// 이름표: 단락 <id>, 행 <id>-row1, 소제목 <id>-row1-head, 줄글 <id>-row1-body, 편집 칸 <id>-raw
export function createSplitText({ text, id, editPath, editItem, rawClass, placeholder }) {
  const raw = String(text ?? "");
  const rows = splitRows(raw).map((row, index) => {
    const rowId = partId(id, `row${index + 1}`);
    const body = el("div", { className: "text-row-body md-block", attrs: testAttr(partId(rowId, "body")) });
    // 화면 모양은 편집 모드와 상관없이 굵게와 제목을 해석해서 보여 준다.
    if (row.body.length > 0) body.append(...renderMarkdown(row.body.join("\n"), "block"));
    return el("div", { className: "text-row", attrs: testAttr(rowId) }, [
      el("div", { text: row.label, className: "text-row-head", attrs: testAttr(partId(rowId, "head")) }),
      body,
    ]);
  });
  const view = rows.length > 0 ? el("div", { className: "split-view" }, rows) : null;
  const rawBox = isEditMode()
    ? el("p", { text: raw, className: `${rawClass} split-raw`, attrs: testAttr(partId(id, "raw")), edit: editPath, md: "block", placeholder })
    : null;
  if (!view && !rawBox) return null;
  return el("div", { className: "split-text", attrs: testAttr(id), editItem }, [view, rawBox].filter(Boolean));
}
