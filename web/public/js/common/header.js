import { el } from "../lib/dom.js";
import { itemId, partId, testAttr } from "../lib/ids.js";
import { itemPath } from "../lib/edit-path.js";

// 사진 자리. 사진 파일이 없어도 자리를 만든다.
// 자리는 머리말 줄의 왼쪽에 놓인다. 모양은 CSS가 정한다.
function createPhotoSlot(photo, id) {
  const slot = el("figure", { className: "photo-slot", attrs: testAttr(partId(id, "photo")) });
  if (photo?.src) {
    slot.append(el("img", {
      attrs: { src: photo.src, alt: photo.alt ?? "", ...testAttr(partId(id, "photo-img")) },
    }));
  }
  return slot;
}

// 웹 주소의 스킴. 주소 글자를 코드에 직접 쓰지 않기 위해 따로 둔다. (pnpm check의 외부 URL 검사)
const WEB_SCHEME = "https:";

// 연락처 글자를 링크 주소로 바꾼다. 링크로 볼 수 없는 글자는 null을 반환한다.
// 이메일은 mailto:, https:// 또는 www.로 시작하는 주소는 https 주소이다. 전화번호는 링크로 만들지 않는다.
function toHref(text) {
  const value = text.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^https:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `${WEB_SCHEME}//${value}`;
  return null;
}

// 연락처 줄 하나를 만든다. 링크로 볼 수 있으면 하이퍼링크이고, 글자는 데이터 그대로이다.
// 웹 주소는 새 탭에서 열린다.
// editPath는 줄의 편집 경로이다. withItem이 거짓이면 항목(이동, 추가) 표시를 붙이지 않는다. (사이드바의 복사본)
export function createContactItem(text, id, editPath, withItem = true) {
  const href = toHref(String(text));
  const content = href
    ? el("a", {
        text: String(text),
        attrs: { href, ...(href.startsWith(WEB_SCHEME) ? { target: "_blank" } : {}), ...testAttr(partId(id, "link")) },
      })
    : document.createTextNode(String(text));
  return el("li", { attrs: testAttr(id), edit: editPath, editItem: withItem ? editPath : undefined }, [content]);
}

// 연락처 Body. 머리말 줄에서 사진 오른쪽에 놓인다.
// 데이터: 글자 배열 (예: ["sample@example.com", "010-0000-0000"]). 한 줄씩 나열된다.
// 이메일과 웹 주소는 하이퍼링크가 된다. 그 밖의 글자는 그대로 나온다.
// 내용이 없으면 만들지 않는다. 이름표는 <머리말>-body, 줄은 <머리말>-body-list-i<번호>, 링크는 줄 이름표 뒤에 -link이다.
function createContactBody(contact, id) {
  if (!Array.isArray(contact) || contact.length === 0) return null;
  const listId = partId(id, "body-list");
  const items = contact.map((text, index) => createContactItem(text, itemId(listId, index), itemPath("header.contact", index)));
  const list = el("ul", { className: "contact-list", attrs: testAttr(listId) }, items);
  return el("div", { className: "header-body", attrs: testAttr(partId(id, "body")) }, [list]);
}

// About me 영역. 사진과 연락처 줄 아래에 놓인다.
// 데이터: { heading: "제목", text: ["단락1", "단락2"] }. 단락 안의 줄바꿈 글자는 CSS가 줄바꿈으로 보여 준다.
// 내용이 없으면 만들지 않는다. 이름표는 <머리말>-about, 제목 <머리말>-about-heading, 단락 <머리말>-about-text-b<번호>이다.
function createAbout(about, id) {
  const blocks = (Array.isArray(about?.text) ? about.text : about?.text ? [about.text] : []).filter(Boolean);
  if (blocks.length === 0) return null;
  const aboutId = partId(id, "about");
  const nodes = [];
  if (about.heading) nodes.push(el("h2", { text: about.heading, attrs: testAttr(partId(aboutId, "heading")), edit: "header.about.heading" }));
  blocks.forEach((block, index) => {
    const path = itemPath("header.about.text", index);
    nodes.push(el("p", { text: String(block), className: "about-text", attrs: testAttr(partId(aboutId, `text-b${index + 1}`)), edit: path, editItem: path, md: "block" }));
  });
  return el("div", { className: "header-about", attrs: testAttr(aboutId) }, nodes);
}

// 머리말을 그린다. 이름이 없으면 아무것도 그리지 않는다.
// 위에서 아래로: 이름(h1, 최상단, 전체 폭), 그 아래 한 줄에 | 사진 | 연락처 |, 그 아래 About me 영역.
// 이름표: <머리말>-name, 줄 <머리말>-row, 사진 <머리말>-photo, 연락처 <머리말>-body.
export function renderHeader(root, data, id) {
  if (!data.name) return;

  const row = el("div", { className: "header-row", attrs: testAttr(partId(id, "row")) }, [
    createPhotoSlot(data.photo, id),
    createContactBody(data.contact, id),
  ].filter(Boolean));

  root.append(el("h1", { text: data.name, attrs: testAttr(partId(id, "name")), edit: "header.name" }), row);
  const about = createAbout(data.about, id);
  if (about) root.append(about);
}
