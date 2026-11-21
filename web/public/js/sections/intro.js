import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";
import { itemPath, sectionPath } from "../lib/edit-path.js";
import { createList, createPageBreak, createSplitText, PAGE_BREAK, renderHeading } from "../common/section-parts.js";

// 소개 섹션을 그린다. 본문이 없으면 아무것도 그리지 않는다.
// data.text는 문자열 하나이거나 블록 배열이다.
// 블록 배열에서 문자열은 단락(p)이고, 배열은 글머리 목록(ul)이다. 단락 안의 줄바꿈 글자(\n)는 CSS가 줄바꿈으로 보여 준다.
// 이름표: 문자열 하나는 <섹션>-text, 블록은 <섹션>-text-b<번호>, 목록 항목은 블록 이름표 뒤에 -i<번호>이다.
export function renderIntro(root, data) {
  const text = data.text;
  const blocks = Array.isArray(text) ? text : text ? [text] : [];
  if (blocks.length === 0) return;
  renderHeading(root, data);
  const base = `${sectionPath(data.id)}.text`;
  blocks.forEach((block, index) => {
    const id = Array.isArray(text) ? partId(data.id, `text-b${index + 1}`) : partId(data.id, "text");
    // 블록 배열이면 블록이 배열의 한 항목이다. 문자열 하나면 항목이 아니다.
    const path = Array.isArray(text) ? itemPath(base, index) : base;
    if (Array.isArray(text) && block === PAGE_BREAK) {
      // 단락 사이의 인쇄 쪽 나눔 표식 (글자 "===")
      root.append(createPageBreak(partId(id, "break"), path));
    } else if (Array.isArray(block)) {
      const list = createList(block, id, "intro-list", path, path);
      if (list) root.append(list);
    } else if (block) {
      // 단락은 두 칸(소제목 | 줄글)으로 보여 준다. 첫 줄의 굵은 글자 줄(**[직무상 소개]**)이나 제목 줄이 왼쪽 칸이다. (common/section-parts.js createSplitText)
      const split = createSplitText({ text: String(block), id, editPath: path, editItem: Array.isArray(text) ? path : undefined, rawClass: "intro-text" });
      if (split) root.append(split);
    }
  });
}
