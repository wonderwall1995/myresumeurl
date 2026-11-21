// 프로젝트 섹션. 격자 갤러리로 표시한다.
// 항목(타일)에는 사진, 제목, 요약이 있다. 타일 전체가 눌린다.
// 타일을 누르면 모달 창에 상세 내용이 나타난다.
// 인쇄할 때는 CSS가 격자를 풀고 모든 상세를 펼쳐서 출력한다. (print.css)
// 카드 항목: no, title, summary, blocks. title만 필수이다.
//   blocks: 제목줄(head), 사진(image), 줄글(text) 블록을 원하는 순서로 쌓는다. (createBlock) 있으면 이 방식을 쓴다.
//   예전 방식(blocks가 없을 때): links(또는 link, linkText, demo), images(또는 image), body.
// 링크는 두 방식이 있다.
//   links 배열: [{ label: "Frontend Repo", url: "저장소 주소" }, ...] 링크마다 이름을 붙인다. 최대 3개를 권한다. 있으면 이 방식을 쓴다.
//   예전 방식: 저장소(link, linkText)는 글자가 항상 "GitHub Repo"이고, 배포(demo)는 글자가 항상 "배포 링크"이다. 둘 다 새 탭으로 열린다.
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
import { createBody, createPageBreak, PAGE_BREAK, renderHeading } from "../common/section-parts.js";

// 사진 요소를 만든다. 사진이 없으면 null을 반환한다.
// editItem은 사진 목록(images)의 한 항목일 때 그 경로이다. 편집 모드에서 사진을 누르면 그 사진이 선택된다.
function createImage(image, id, className, editItem) {
  if (!image?.src) return null;
  return el("img", {
    className,
    attrs: { src: image.src, alt: image.alt ?? "", ...testAttr(id) },
    editItem,
  });
}

// 사진 아래 줄글. images[n].text는 줄글(문자열) 목록이다. 줄글마다 문단 하나이다.
// 줄글 안에서 # 제목, ## 소제목, ### 작은 제목과 **굵게**를 쓸 수 있다. (md 블록 모드. lib/markdown.js)
// 편집 모드에서는 줄글을 누르고 + 버튼을 누르면 그 아래에 줄글이 하나 더해진다. 빈 줄글("")은 편집 모드에서만 안내 글자로 보인다.
// 이름표: 묶음 <id>, 줄글 <id>-t1, <id>-t2 ...
function createImageText(text, id, editBase) {
  const list = Array.isArray(text) ? text : typeof text === "string" ? [text] : [];
  const editing = isEditing();
  const nodes = list.map((value, index) => {
    const raw = String(value ?? "");
    if (!raw && !editing) return null;
    const path = Array.isArray(text) ? `${editBase}[${index}]` : editBase;
    // 줄글 문단 사이의 인쇄 쪽 나눔 표식 (글자 "===")
    if (Array.isArray(text) && raw === PAGE_BREAK) return createPageBreak(partId(id, `break${index + 1}`), path);
    return el("p", {
      text: raw,
      className: "gallery-text",
      attrs: testAttr(partId(id, `t${index + 1}`)),
      edit: path,
      editItem: Array.isArray(text) ? path : undefined,
      md: "block",
      placeholder: raw ? undefined : "줄글 (# 제목, ## 소제목, ### 작은 제목 가능)",
    });
  }).filter(Boolean);
  return nodes.length > 0 ? el("div", { className: "gallery-text-block", attrs: testAttr(id) }, nodes) : null;
}

// 둘째 사진부터의 묶음(사진 + 줄글). 인쇄에서는 묶음마다 새 쪽에서 시작한다. (print.css .gallery-page)
// 이름표: 묶음 <카드>-photo2, 사진 <카드>-photo2-image, 줄글 <카드>-photo2-text-t1
function createImagePage(image, index, id, p) {
  const pageId = partId(id, `photo${index + 1}`);
  const path = `${p}.images[${index}]`;
  const img = createImage(image, partId(pageId, "image"), "gallery-page-image");
  const text = createImageText(image?.text, partId(pageId, "text"), `${path}.text`);
  if (!img && !text) return null;
  return el("div", { className: "gallery-page", attrs: testAttr(pageId), editItem: path }, [img, text].filter(Boolean));
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

// 예전 방식: 카드의 링크 두 개(저장소, 배포)를 한 줄로 묶어 만든다. 둘 다 없으면 null을 반환한다.
//   저장소  글자는 "GitHub Repo". linkText가 주소이면 그 주소로, 아니면 link로 연결한다. (card.link, card.linkText)
//   배포    글자는 "배포 링크". 주소는 card.demo이다. 배포된 프로젝트에만 쓴다.
// 링크 목록(card.links)의 링크 하나. { label: "보이는 글자", url: "주소" }
// 보이는 글자는 label 그대로이다. (고정 글자가 아니다. 링크가 여러 개면 이름으로 구별해야 하기 때문이다.)
// 항목(span.gallery-link-item)이 편집 단위이다. 편집 모드에서는 글자 옆에 주소 칸(span.gallery-link-url)이 함께 나와 주소도 고친다.
// 배포 화면에서는 주소가 http로 시작하지 않으면 연결하지 않고 글자만 보인다. 글자도 비면 그리지 않는다.
// 이름표: 링크 글자 <카드>-<prefix>link-l1, 주소 칸 <카드>-<prefix>link-l1-url
function createLinkItem(link, index, id, p, prefix) {
  const editing = isEditing();
  const label = String(link?.label ?? "");
  const url = String(link?.url ?? "");
  if (!label && !editing) return null;
  const itemPath = `${p}.links[${index}]`;
  const linkId = partId(id, `${prefix}link-l${index + 1}`);
  const anchor = el("a", {
    text: label,
    className: "gallery-link",
    attrs: { ...(isHttp(url) ? { href: url, target: "_blank" } : {}), ...testAttr(linkId) },
    edit: `${itemPath}.label`,
    placeholder: "링크 이름",
  });
  const urlBox = editing
    ? el("span", { text: url, className: "gallery-link-url", attrs: testAttr(`${linkId}-url`), edit: `${itemPath}.url`, placeholder: "주소 (http로 시작)" })
    : null;
  return el("span", { className: "gallery-link-item", editItem: itemPath }, [anchor, urlBox].filter(Boolean));
}

// 링크 목록을 한 줄로 묶어 만든다. 링크 사이는 가는 세로선으로 나눈다. (CSS .gallery-links > * + *)
// 최대 3개를 권한다. 편집 모드의 + 버튼은 3개에서 멈춘다. (scripts/dev-edit.js)
function createLinkList(card, id, p, prefix) {
  const items = card.links.map((link, index) => createLinkItem(link, index, id, p, prefix)).filter(Boolean);
  if (items.length === 0) return null;
  return el("div", { className: "gallery-links gallery-links-list" }, items);
}

// 카드의 링크를 만든다. links 배열이 있으면 그 목록을 쓰고(createLinkList), 없으면 예전 방식의 두 링크(저장소, 배포)를 쓴다.
// prefix는 이름표의 접두어이다. 타일은 "", 모달은 "dialog-"이다.
function createLinks(card, id, p, prefix) {
  if (Array.isArray(card.links) && card.links.length > 0) return createLinkList(card, id, p, prefix);
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
// 인쇄의 쪽 머리에는 프로젝트 번호를 붙인다. 예: "프로젝트 01" (order.index는 1부터)
function createPrintHeading(heading, id, order) {
  if (!heading) return null;
  const text = order ? `${heading} ${pad2(order.index)}` : heading;
  return el("div", { text, className: "print-heading", attrs: { "aria-hidden": "true", ...testAttr(partId(id, "print-heading")) } });
}

const pad2 = (value) => String(value).padStart(2, "0");

// 프로젝트 번호 표시. 예: "PROJECT 01 / 04". 화면(문서 모양)에서 프로젝트 맨 위, 사진 위에 작은 글자로 나온다.
// 면접관이 "두 번째 프로젝트"처럼 가리키기 쉽게 한다. 인쇄에서는 숨기고 쪽 머리(createPrintHeading)가 번호를 보인다. (CSS gallery-number)
// 편집하지 않는다. 번호는 화면에 나오는 순서이다.
function createNumber(order, id) {
  if (!order) return null;
  return el("p", { text: `PROJECT ${pad2(order.index)} / ${pad2(order.total)}`, className: "gallery-number", attrs: testAttr(partId(id, "number")) });
}

// 블록 하나. 블록은 세 종류이다.
//   head   제목줄. { type: "head", title: "제목", links: [{ label, url }] } 제목 한 줄, 그 아래 링크 한 줄이다. 둘 다 가운데 정렬이다.
//   image  사진. { type: "image", src: "/images/...", alt: "설명" }
//   text   줄글. { type: "text", text: ["줄글", ...] } 줄글 하나가 문단 하나이다. # 제목과 **굵게**를 쓸 수 있다.
// 블록(div.gallery-block)이 편집 단위이다. 편집 모드에서 블록을 누르면 순서 바꾸기, 삭제, 다른 블록 추가를 할 수 있다.
// 이름표: 블록 <카드>-b1, 제목 <카드>-b1-title, 링크 <카드>-b1-link-l1, 사진 <카드>-b2-image, 줄글 <카드>-b3-text-t1
function createBlock(block, index, id, p) {
  const path = `${p}.blocks[${index}]`;
  const blockId = partId(id, `b${index + 1}`);
  // 블록 사이의 인쇄 쪽 나눔 표식 (글자 "===")
  if (block === PAGE_BREAK) return createPageBreak(partId(blockId, "break"), path);
  let children = [];
  if (block?.type === "head") {
    const title = block.title || isEditing()
      ? el("h3", { text: String(block.title ?? ""), className: "gallery-block-title", attrs: testAttr(partId(blockId, "title")), edit: `${path}.title`, placeholder: "제목" })
      : null;
    const links = Array.isArray(block.links) && block.links.length > 0 ? createLinkList(block, id, path, `b${index + 1}-`) : null;
    children = [title, links];
  } else if (block?.type === "image") {
    children = [createImage(block, partId(blockId, "image"), "gallery-page-image")];
  } else if (block?.type === "text") {
    children = [createImageText(block.text, partId(blockId, "text"), `${path}.text`)];
  }
  children = children.filter(Boolean);
  if (children.length === 0) return null;
  return el("div", { className: `gallery-block gallery-block-${block.type}`, attrs: testAttr(blockId), editItem: path }, children);
}

// 블록으로 짠 프로젝트(card.blocks)의 항목. 화면(문서 모양)과 인쇄에서는 블록이 쓴 순서대로 나온다.
// 카드의 title은 타일과 모달 제목에 쓴다. 문서 모양에서는 모달 제목을 숨기고 제목줄 블록이 제목이 된다. (CSS .gallery-item-blocks)
// 타일(갤러리 모양으로 되돌렸을 때)의 사진은 첫 사진 블록, 링크는 첫 제목줄 블록의 링크이다.
function createBlocksItem(card, id, p, heading, order) {
  const blockNodes = card.blocks.map((block, index) => createBlock(block, index, id, p)).filter(Boolean);
  const modal = createModal({ id, title: card.title, titlePath: `${p}.title`, bodyNodes: blockNodes });
  const firstImage = card.blocks.find((block) => block?.type === "image" && block.src);
  const headIndex = card.blocks.findIndex((block) => block?.type === "head" && Array.isArray(block.links) && block.links.length > 0);
  const tileLinks = headIndex >= 0 ? createLinkList(card.blocks[headIndex], id, `${p}.blocks[${headIndex}]`, "") : null;
  const summary = card.summary
    ? el("p", { text: card.summary, className: "gallery-summary", attrs: testAttr(partId(id, "summary")), edit: `${p}.summary`, md: "inline" })
    : null;
  const tile = el("div", { className: "gallery-tile" }, [
    createImage(firstImage, partId(id, "image"), "gallery-image"),
    createTitle(card, id, modal, p),
    tileLinks,
    summary,
  ].filter(Boolean));
  const printHeading = createPrintHeading(heading, id, order);
  const number = createNumber(order, id);
  return el("li", { className: "gallery-item gallery-item-blocks", attrs: { id, ...testAttr(id) }, editItem: p }, [printHeading, number, tile, modal.dialog].filter(Boolean));
}

// 사진은 두 방식이 있다.
//   images 목록: [{ src, alt, text: ["줄글", ...] }, ...] 사진마다 그 아래 줄글이 붙는다. 있으면 이 방식을 쓴다.
//     첫 사진은 타일의 섬네일이고, 모달과 인쇄에서는 사진 -> 이름 -> 링크 -> 첫 사진의 줄글 순서이다.
//     둘째 사진부터는 사진과 줄글의 묶음이 차례로 이어지고, 인쇄에서는 묶음마다 새 쪽에서 시작한다. 사진 수에는 제한이 없다.
//   예전 방식: image 한 장과 본문(body).
// 두 방식 모두 body가 있으면 첫 사진의 줄글 뒤에 나온다.
// order는 { index, total }이다. 화면에 나오는 프로젝트 중 몇 번째인지(1부터)와 전체 개수이다.
function createItem(card, id, p, heading, order) {
  if (Array.isArray(card.blocks) && card.blocks.length > 0) return createBlocksItem(card, id, p, heading, order);
  const images = Array.isArray(card.images) ? card.images : null;
  const first = images ? images[0] : card.image;
  const detail = createBody(card.body, partId(id, "body-text"), `${p}.body`);
  const modalImage = createImage(first, partId(id, "dialog-image"), "modal-image", images ? `${p}.images[0]` : undefined);
  const firstText = images ? createImageText(images[0]?.text, partId(id, "photo1-text"), `${p}.images[0].text`) : null;
  const pages = images ? images.slice(1).map((image, index) => createImagePage(image, index + 1, id, p)).filter(Boolean) : [];
  const hasModal = Boolean(detail || modalImage || firstText || pages.length > 0);
  const modal = hasModal
    ? createModal({ id, title: card.title, titlePath: `${p}.title`, bodyNodes: [modalImage, createLinks(card, id, p, "dialog-"), firstText, detail, ...pages].filter(Boolean) })
    : null;

  const title = createTitle(card, id, modal, p);
  const summary = card.summary
    ? el("p", { text: card.summary, className: "gallery-summary", attrs: testAttr(partId(id, "summary")), edit: `${p}.summary`, md: "inline" })
    : null;
  const link = createLinks(card, id, p, "");
  const image = createImage(first, partId(id, "image"), "gallery-image");

  const tile = el("div", { className: "gallery-tile" }, [image, title, link, summary].filter(Boolean));

  // 모달이 없는 항목은 눌러도 열리지 않는다. 인쇄할 때는 타일을 그대로 출력한다. 클래스로 구분한다.
  const className = hasModal ? "gallery-item" : "gallery-item gallery-item-plain";
  const printHeading = createPrintHeading(heading, id, order);
  const number = createNumber(order, id);
  const children = modal ? [tile, modal.dialog] : [tile];
  return el("li", { className, attrs: { id, ...testAttr(id) }, editItem: p }, [printHeading, number, ...children].filter(Boolean));
}

export function renderProjects(root, data) {
  if (!data.cards?.length) return;
  const items = [];
  const total = data.cards.filter((card) => card?.title).length;
  eachCard(data, (card, id) => {
    if (card.title) items.push(createItem(card, id, cardPath(sectionPath(data.id), card.no), data.heading, { index: items.length + 1, total }));
  });
  if (items.length === 0) return;
  renderHeading(root, data);
  // 갤러리를 본문 영역(div)으로 한 번 더 감싼다. 이 영역이 섹션 기준 좌우 여백을 가진다. (CSS gallery-body)
  const gallery = el("ul", { className: "gallery", attrs: testAttr(partId(data.id, "gallery")) }, items);
  // 안내 문구(data.notice). 갤러리 위에 작은 글자로 한 줄 나온다. 넓은 화면에서만 보이고 인쇄와 모바일에서는 숨긴다. (CSS gallery-notice)
  // 인쇄와 모바일은 갤러리가 아니라 펼친 문서 모양이라 안내가 필요 없다.
  const notice = data.notice
    ? el("p", { text: data.notice, className: "gallery-notice", attrs: testAttr(partId(data.id, "notice")), edit: `${sectionPath(data.id)}.notice` })
    : null;
  root.append(el("div", { className: "gallery-body", attrs: testAttr(partId(data.id, "body")) }, [notice, gallery].filter(Boolean)));
}
