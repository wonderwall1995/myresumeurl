// 프로젝트 섹션. 격자 갤러리로 표시한다.
// 항목(타일)에는 사진, 제목, 요약이 있다. 타일 전체가 눌린다.
// 타일을 누르면 모달 창에 상세 내용이 나타난다.
// 인쇄할 때는 CSS가 격자를 풀고 모든 상세를 펼쳐서 출력한다. (print.css)
// 카드 항목: no, title, link, linkText, demo, summary, body, image. title만 필수이다.
// 링크는 두 개이다. 저장소(link, linkText)는 글자가 항상 "GitHub Repo"이고, 배포(demo)는 글자가 항상 "배포 링크"이다. 둘 다 새 탭으로 열린다.
// linkText에 주소를 쓰면 그 주소로 연결한다. demo는 배포된 프로젝트에만 쓴다. 없으면 나타나지 않는다.
// 인쇄할 때는 프로젝트마다 맨 위에 섹션 제목("프로젝트"와 선)이 다시 나온다.
// 인쇄할 때는 카드 틀 없이 글자만 나오고 주소는 찍지 않는다. PDF에서는 글자가 하이퍼링크이다. (print.css)
// 타일 순서: 사진, 제목, 링크, 요약. 링크는 제목 아래에 항상 보인다.
// 모달 안에도 같은 링크가 있다. 인쇄할 때는 모달 내용이 펼쳐져 출력된다.
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

const isHttp = (value) => /^https?:\/\//.test(value ?? "");

// 링크 하나를 만든다. 보이는 글자는 쓴 내용과 상관없이 고정 글자이다. (md 모드. lib/markdown.js)
// 편집 중에는 쓴 글자(주소)가 그대로 보인다. 주소가 http로 시작하지 않으면 연결하지 않는다.
// 편집 모드에서는 값이 없어도 칸을 만들어 안내 글자를 보인다. 거기에 쓰면 데이터에 새로 만들어진다.
// 배포 화면에서는 연결할 주소(http)가 없으면 만들지 않는다.
function makeLink({ href, text, id, editPath, mode, placeholder, className }) {
  if (!href && !isEditing()) return null;
  return el("a", {
    text,
    className,
    attrs: { ...(href ? { href, target: "_blank" } : {}), ...testAttr(id) },
    edit: editPath,
    md: mode,
    placeholder,
  });
}

// 개발 서버의 편집 모드인지. (lib/dom.js와 같은 기준)
const isEditing = () => document.documentElement.hasAttribute("data-dev-edit");

// 카드의 링크 두 개(저장소, 배포)를 한 줄로 묶어 만든다. 둘 다 없으면 null을 반환한다.
//   저장소  글자는 "GitHub Repo". linkText가 주소이면 그 주소로, 아니면 link로 연결한다. (card.link, card.linkText)
//   배포    글자는 "배포 링크". 주소는 card.demo이다. 배포된 프로젝트에만 쓴다.
// prefix는 이름표의 접두어이다. 타일은 "", 모달은 "dialog-"이다.
function createLinks(card, id, p, prefix) {
  const repoHref = isHttp(card.linkText) ? card.linkText : card.link;
  const repo = makeLink({
    href: repoHref,
    // 편집 중에는 linkText 칸의 값만 보인다. (link가 보이면 저장할 때 원래 값이 맞지 않는다.) 배포 화면은 linkText가 비면 link로 연결한다.
    text: isEditing() ? (card.linkText ?? "") : card.linkText || card.link,
    id: partId(id, `${prefix}link`),
    editPath: `${p}.linkText`,
    mode: "label",
    placeholder: "GitHub 주소",
    className: "gallery-link",
  });
  const demo = makeLink({
    href: isHttp(card.demo) ? card.demo : "",
    text: card.demo,
    id: partId(id, `${prefix}demo`),
    editPath: `${p}.demo`,
    mode: "demo",
    placeholder: "배포 주소",
    className: "gallery-link gallery-demo",
  });
  const links = [repo, demo].filter(Boolean);
  if (links.length === 0) return null;
  return el("div", { className: "gallery-links" }, links);
}

// 격자의 항목 하나를 만든다. 타일과 모달 창을 함께 담는다.
// 인쇄할 때 프로젝트마다 맨 위에 다시 나오는 섹션 제목("프로젝트"와 아래 선). 화면에서는 숨겨져 있다. (CSS print-heading)
// 편집 경로가 없다. 제목은 섹션 제목(h2)에서 고친다.
function createPrintHeading(heading, id) {
  return heading ? el("div", { text: heading, className: "print-heading", attrs: { "aria-hidden": "true", ...testAttr(partId(id, "print-heading")) } }) : null;
}

function createItem(card, id, p, heading) {
  const detail = createBody(card.body, partId(id, "body-text"), `${p}.body`);
  const modalImage = createImage(card.image, partId(id, "dialog-image"), "modal-image");
  const hasModal = Boolean(detail || modalImage);
  const modal = hasModal
    ? createModal({ id, title: card.title, titlePath: `${p}.title`, bodyNodes: [modalImage, createLinks(card, id, p, "dialog-"), detail].filter(Boolean) })
    : null;

  const title = createTitle(card, id, modal, p);
  const summary = card.summary
    ? el("p", { text: card.summary, className: "gallery-summary", attrs: testAttr(partId(id, "summary")), edit: `${p}.summary`, md: "inline" })
    : null;
  const link = createLinks(card, id, p, "");
  const image = createImage(card.image, partId(id, "image"), "gallery-image");

  const tile = el("div", { className: "gallery-tile" }, [image, title, link, summary].filter(Boolean));

  // 모달이 없는 항목은 눌러도 열리지 않는다. 인쇄할 때는 타일을 그대로 출력한다. 클래스로 구분한다.
  const className = hasModal ? "gallery-item" : "gallery-item gallery-item-plain";
  const printHeading = createPrintHeading(heading, id);
  const children = modal ? [tile, modal.dialog] : [tile];
  return el("li", { className, attrs: { id, ...testAttr(id) }, editItem: p }, printHeading ? [printHeading, ...children] : children);
}

export function renderProjects(root, data) {
  if (!data.cards?.length) return;
  const items = [];
  eachCard(data, (card, id) => {
    if (card.title) items.push(createItem(card, id, cardPath(sectionPath(data.id), card.no), data.heading));
  });
  if (items.length === 0) return;
  renderHeading(root, data);
  // 갤러리를 본문 영역(div)으로 한 번 더 감싼다. 이 영역이 섹션 기준 좌우 여백을 가진다. (CSS gallery-body)
  const gallery = el("ul", { className: "gallery", attrs: testAttr(partId(data.id, "gallery")) }, items);
  root.append(el("div", { className: "gallery-body", attrs: testAttr(partId(data.id, "body")) }, [gallery]));
}
