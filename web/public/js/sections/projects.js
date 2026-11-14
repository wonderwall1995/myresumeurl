// 프로젝트 섹션. 격자 갤러리로 표시한다.
// 항목(타일)에는 사진, 제목, 요약이 있다. 타일 전체가 눌린다.
// 타일을 누르면 모달 창에 상세 내용이 나타난다.
// 인쇄할 때는 CSS가 격자를 풀고 모든 상세를 펼쳐서 출력한다. (print.css)
// 카드 항목: no, title, link, summary, body, image. title만 필수이다.
// link는 하이퍼링크(새 탭)이다. 보이는 글자는 항상 "GitHub Repo"이다. linkText에 주소를 쓰면 그 주소로 연결한다.
// 인쇄할 때는 CSS가 글자 뒤에 주소를 덧붙인다. (print.css)
// 타일 순서: 사진, 제목, 링크, 요약. 링크는 제목 아래에 항상 보인다.
// 모달 안에도 같은 링크가 있다. 인쇄할 때는 모달 내용이 펼쳐지므로 주소가 출력된다.
//
// 타일 전체를 누르는 방법:
// 제목(h3) 안에 열기 버튼을 두고, CSS가 그 버튼의 눌림 영역을 타일 전체로 넓힌다.
// 버튼 태그 안에는 제목과 문단을 넣을 수 없어서 타일 전체를 버튼으로 감싸지 않는다.
// 이 방법은 키보드(Tab, Enter)와 화면 낭독기에서도 제목이 열기 버튼으로 동작한다.
import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";
import { cardPath, sectionPath } from "../lib/edit-path.js";
import { eachCard } from "../common/card.js";
import { createModal } from "../common/modal.js";
import { createBody, renderHeading } from "../common/section-parts.js";

// 사진 요소를 만든다. 사진이 없으면 null을 반환한다.
function createImage(image, id, className) {
  if (!image?.src) return null;
  return el("img", {
    className,
    attrs: { src: image.src, alt: image.alt ?? "", ...testAttr(id) },
  });
}

// 타일의 제목(h3)을 만든다.
// 모달이 있으면 제목 글자가 열기 버튼이고, 없으면 일반 글자이다.
function createTitle(card, id, modal, p) {
  const attrs = testAttr(partId(id, "title"));
  if (!modal) return el("h3", { text: card.title, attrs, edit: `${p}.title` });

  const openButton = el("button", {
    text: card.title,
    className: "gallery-open",
    attrs: {
      type: "button",
      "aria-haspopup": "dialog",
      ...testAttr(partId(id, "open")),
    },
  });
  openButton.addEventListener("click", modal.open);
  return el("h3", { attrs }, [openButton]);
}

// 링크를 만든다. 주소가 없으면 null을 반환한다.
// 링크 글자는 무엇을 써도 "GitHub Repo"로 줄여 보인다. (md: "label", lib/markdown.js) 편집 중에는 쓴 글자가 그대로 보인다.
// 링크 글자(linkText)가 주소(http로 시작)이면 그 주소로 연결한다. 아니면 link로 연결한다.
// editPath는 링크 글자(linkText)의 편집 경로이다. linkText가 비어 있으면 편집하지 않는다.
function createLink(url, text, id, editPath) {
  if (!url && !text) return null;
  const href = /^https?:\/\//.test(text ?? "") ? text : url;
  if (!href) return null;
  return el("a", {
    text: text || url,
    className: "gallery-link",
    attrs: { href, target: "_blank", ...testAttr(id) },
    edit: text ? editPath : undefined,
    md: "label",
  });
}

// 격자의 항목 하나를 만든다. 타일과 모달 창을 함께 담는다.
function createItem(card, id, p) {
  const detail = createBody(card.body, partId(id, "body-text"), `${p}.body`);
  const modalImage = createImage(card.image, partId(id, "dialog-image"), "modal-image");
  const hasModal = Boolean(detail || modalImage);
  const modal = hasModal
    ? createModal({ id, title: card.title, titlePath: `${p}.title`, bodyNodes: [modalImage, createLink(card.link, card.linkText, partId(id, "dialog-link"), `${p}.linkText`), detail].filter(Boolean) })
    : null;

  const title = createTitle(card, id, modal, p);
  const summary = card.summary
    ? el("p", { text: card.summary, className: "gallery-summary", attrs: testAttr(partId(id, "summary")), edit: `${p}.summary`, md: "inline" })
    : null;
  const link = createLink(card.link, card.linkText, partId(id, "link"), `${p}.linkText`);
  const image = createImage(card.image, partId(id, "image"), "gallery-image");

  const tile = el("div", { className: "gallery-tile" }, [image, title, link, summary].filter(Boolean));

  // 모달이 없는 항목은 눌러도 열리지 않는다. 인쇄할 때는 타일을 그대로 출력한다. 클래스로 구분한다.
  const className = hasModal ? "gallery-item" : "gallery-item gallery-item-plain";
  return el("li", { className, attrs: { id, ...testAttr(id) }, editItem: p }, modal ? [tile, modal.dialog] : [tile]);
}

export function renderProjects(root, data) {
  if (!data.cards?.length) return;
  const items = [];
  eachCard(data, (card, id) => {
    if (card.title) items.push(createItem(card, id, cardPath(sectionPath(data.id), card.no)));
  });
  if (items.length === 0) return;
  renderHeading(root, data);
  // 갤러리를 본문 영역(div)으로 한 번 더 감싼다. 이 영역이 섹션 기준 좌우 여백을 가진다. (CSS gallery-body)
  const gallery = el("ul", { className: "gallery", attrs: testAttr(partId(data.id, "gallery")) }, items);
  root.append(el("div", { className: "gallery-body", attrs: testAttr(partId(data.id, "body")) }, [gallery]));
}
