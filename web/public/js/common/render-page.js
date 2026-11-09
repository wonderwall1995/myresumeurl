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
