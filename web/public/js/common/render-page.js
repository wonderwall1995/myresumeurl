// 페이지 그리기 함수. 모든 페이지가 공통으로 사용한다.
// 입력: 페이지 데이터 { header, sections, footer }.
// 내용이 없는 영역은 문서에 추가하지 않는다.
// 머리말과 바닥글의 이름표는 고정이다. 번호 규칙: 00은 머리말, 99는 바닥글.
import { el } from "../lib/dom.js";
import { testAttr } from "../lib/ids.js";
import { renderers } from "../sections/index.js";
import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";
import { createToc } from "./toc.js";

const HEADER_ID = "s00-header";
const FOOTER_ID = "s99-footer";

function renderSections(main, sections) {
  const seen = new Set();
  for (const data of sections) {
    const render = renderers[data.type];
    if (!render) {
      // 데이터 오류 하나가 페이지 전체를 멈추지 않게 한다.
      console.error(`알 수 없는 섹션 종류: ${data.type}`);
      continue;
    }
    if (!data.id || seen.has(data.id)) {
      console.error(`섹션 id가 없거나 중복됨: ${data.id}`);
      continue;
    }
    seen.add(data.id);
    const section = el("section", { attrs: { id: data.id, ...testAttr(data.id) } });
    render(section, data);
    if (section.childNodes.length > 0) main.append(section);
  }
}

// 섹션을 다른 섹션 안의 한 요소 바로 앞으로 옮긴다. (섹션 데이터의 placeBefore: 요소 id)
// 예: 학력(s07-education)을 경력 섹션 안의 이력 제목(s02-career-worklist-heading) 앞에 놓는다. (사용자 요청)
// 방법: 대상 요소가 든 섹션을 대상 요소 앞에서 둘로 나눈다. 대상 요소와 그 뒤의 요소는 새 섹션(이어지는 부분)으로 옮긴다.
// 그 다음 두 섹션 사이에 옮길 섹션을 놓는다. 그래서 모든 섹션은 계속 본문(main)의 바로 아래에 있고, 섹션 CSS가 그대로 적용된다.
// 편집 경로(data-edit)는 데이터 위치를 가리키므로 바뀌지 않는다.
// 대상이 없거나 섹션의 바로 아래 요소가 아니면 옮기지 않는다. 섹션은 데이터 순서의 자리에 그대로 남는다.
function placeSections(main, sections) {
  for (const data of sections) {
    if (!data?.placeBefore || !data.id) continue;
    const moving = [...main.children].find((node) => node.id === data.id);
    const target = [...main.querySelectorAll("[id]")].find((node) => node.id === data.placeBefore);
    const host = target?.parentElement;
    if (!moving || !host || host === moving || host.tagName !== "SECTION" || host.parentElement !== main) {
      console.error(`섹션을 옮길 대상이 없음: ${data.id} -> ${data.placeBefore}`);
      continue;
    }
    // 이어지는 부분에는 id를 붙이지 않는다. 목차와 편집은 안의 요소 id와 경로를 쓴다.
    const rest = el("section", { className: "section-continued", attrs: testAttr(`${host.id}-continued`) });
    let node = target;
    while (node) {
      const next = node.nextSibling;
      rest.append(node);
      node = next;
    }
    // 인쇄에서는 옮긴 섹션이 대상 요소의 쪽 맨 앞에 붙는다. (printStartOf)
    moving.classList.add("section-placed");
    main.insertBefore(moving, host.nextSibling);
    main.insertBefore(rest, moving.nextSibling);
  }
}

export function renderPage(app, page) {
  if (!app) return;
  // 빌드가 미리 채운 내용을 지우고 다시 그린다. 그래야 버튼 동작(모달 열기)이 붙는다.
  app.replaceChildren();

  const header = el("header", {
    className: "site-header",
    attrs: { id: HEADER_ID, ...testAttr(HEADER_ID) },
  });
  renderHeader(header, page.header ?? {}, HEADER_ID);

  const main = el("main", { className: "site-main", attrs: testAttr("page-content") });
  renderSections(main, page.sections ?? []);
  placeSections(main, page.sections ?? []);

  const footer = el("footer", {
    className: "site-footer",
    attrs: { id: FOOTER_ID, ...testAttr(FOOTER_ID) },
  });
  renderFooter(footer, page.footer ?? {}, FOOTER_ID);

  for (const part of [header, main, footer]) {
    if (part.childNodes.length > 0) app.append(part);
  }

  // 목차는 모든 영역을 그린 뒤에 만든다. 실제로 그려진 id만 가리키게 하기 위해서이다.
  // 화면에서는 CSS가 위치를 정하므로 문서 순서는 맨 앞에 둔다. (키보드 이동 순서가 목차부터 시작한다.)
  const existingIds = new Set([...app.querySelectorAll("[id]")].map((node) => node.id));
  const toc = createToc(page.toc, existingIds, { name: page.sidebar?.name, contact: page.header?.contact });
  if (toc) app.prepend(toc);
  markPrintPageStarts(app, page.toc);
  markPrintPageNames(app, page.toc);
}

// 목차 대상이 인쇄에서 쪽을 시작하는 요소. 보통은 대상 자체이다.
// 대상 바로 앞에 옮겨 놓은 섹션(placeSections, section-placed)이 있으면 그 섹션이다.
// 예: 학력은 이력 제목 바로 앞에 있으므로, 인쇄에서는 학력부터 새 쪽이 시작되고 이력이 같은 쪽에 이어진다. (사용자 요청)
// 이유: 대상 앞의 쪽 나눔(print-page-start)과, 쪽 이름이 바뀌는 곳(toc-1 -> toc-2)에서 브라우저가 쪽을 나눈다.
// 두 곳을 모두 옮긴 섹션 앞으로 옮겨야 두 내용이 붙는다. 그 쪽의 오른쪽 위 목차 이름은 대상의 이름(예: "이력")이다.
// 화면의 목차(현재 위치 표시와 이동)는 이 함수를 쓰지 않는다.
function printStartOf(target) {
  const section = target.parentElement;
  const before = section?.classList.contains("section-continued") && section.firstElementChild === target ? section.previousElementSibling : null;
  return before?.classList.contains("section-placed") ? before : target;
}

// 인쇄한 쪽마다 오른쪽 위 여백에 그 쪽이 속한 목차 이름(예: "자기소개")을 찍는다. (사용자 요청)
// 쪽 여백 상자(@page의 @top-right)에 찍으므로 본문은 움직이지 않는다. 화면에는 나오지 않는다. 쪽 번호는 붙이지 않는다.
// 방법: 목차 구간마다 이름 붙인 쪽(page: toc-1, toc-2 ...)을 정하고, 구간에 속한 요소에 그 쪽 이름을 준다.
//   구간은 목차 항목의 대상 요소부터 다음 항목의 대상 요소 전까지이다. (print-page-start와 같은 기준)
//   대상 요소가 섹션 안에 있으면(예: 경력 섹션 안의 이력 제목) 그 섹션은 자식 요소 단위로 나눠서 정한다.
// 쪽 규칙은 CSSOM(CSSStyleSheet, adoptedStyleSheets)으로 넣는다. <style> 요소와 style 속성을 쓰지 않는다. (CSP 규칙)
// 이 기능을 지원하지 않는 환경(빌드의 미리 그리기, 오래된 브라우저)에서는 아무것도 하지 않는다. 그때는 이름이 찍히지 않을 뿐이다.
function markPrintPageNames(app, tocItems) {
  if (typeof CSSStyleSheet === "undefined" || !("adoptedStyleSheets" in document)) return;
  const byId = new Map([...app.querySelectorAll("[id]")].map((node) => [node.id, node]));
  const segments = (tocItems ?? [])
    .map((item) => ({ label: item?.label, target: byId.get(item?.target) }))
    .filter((segment) => segment.label && segment.target)
    .map((segment) => ({ ...segment, target: printStartOf(segment.target) }))
    .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  if (segments.length === 0) return;
  const targets = segments.map((segment) => segment.target);

  // 쪽 이름을 줄 단위: 머리말, 섹션, 바닥글. 목차 대상이 안에 든 섹션은 자식 요소로 나눈다.
  const units = [];
  for (const part of app.children) {
    const blocks = part.classList.contains("site-main") ? [...part.children] : [part];
    for (const block of blocks) {
      const holdsTarget = targets.some((target) => target !== block && block.contains(target));
      units.push(...(holdsTarget ? [...block.children] : [block]));
    }
  }
  // 요소가 속한 구간: 그 요소이거나 그 요소보다 앞에 있는 대상 중 마지막 것.
  const segmentOf = (unit) => {
    let index = -1;
    targets.forEach((target, i) => {
      if (target === unit || target.contains(unit) || target.compareDocumentPosition(unit) & Node.DOCUMENT_POSITION_FOLLOWING) index = i;
    });
    return index;
  };
  for (const unit of units) {
    if (unit.classList.contains("toc")) continue;
    const index = segmentOf(unit);
    if (index >= 0) unit.style.page = `toc-${index + 1}`;
  }

  const sheet = new CSSStyleSheet();
  segments.forEach((segment, index) => {
    const label = JSON.stringify(String(segment.label));
    try {
      sheet.insertRule(`@page toc-${index + 1} { @top-right { content: ${label}; font-family: "Pretendard Variable", Pretendard, sans-serif; font-size: 8pt; font-weight: 700; color: #000; vertical-align: bottom; padding-bottom: 3mm; } }`, sheet.cssRules.length);
    } catch {
      // 쪽 여백 상자를 모르는 브라우저. 이름만 빠지고 인쇄는 그대로이다.
    }
  });
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

// 목차 항목의 대상 요소마다 인쇄에서 새 쪽을 시작하도록 표시한다. (print.css의 .print-page-start)
// 목차의 구간(영역)이 종이에서 따로 인쇄되게 하기 위해서이다. 구간 안의 다른 섹션은 같은 쪽에 이어진다.
// 문서에 없는 id는 건너뛴다. 목차가 없으면 아무것도 표시하지 않는다.
function markPrintPageStarts(app, tocItems) {
  const byId = new Map([...app.querySelectorAll("[id]")].map((node) => [node.id, node]));
  for (const item of tocItems ?? []) {
    const target = byId.get(item?.target);
    if (target) printStartOf(target).classList.add("print-page-start");
  }
}
