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
    byId.get(item?.target)?.classList.add("print-page-start");
  }
}
