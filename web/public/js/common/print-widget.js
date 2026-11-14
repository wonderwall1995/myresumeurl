// 화면 오른쪽 아래의 위젯 묶음. 위쪽은 인쇄 버튼, 아래쪽은 글자 크기 버튼(+ / −)이다.
// 인쇄 버튼을 누르면 브라우저의 인쇄 창이 열린다. 인쇄 창에서 "PDF로 저장"을 고르면 PDF 파일이 된다.
// 인쇄 창이 열리지 않는 브라우저(예: 앱 안의 브라우저)에서는 안내 문구를 잠시 보여 준다.
// 글자 크기 버튼은 화면에서만 글자를 키우거나 줄인다. 값은 저장하지 않는다. 페이지를 새로 열면 처음 크기로 돌아간다.
// 글자 크기 버튼은 좁은 화면(휴대폰)에서만 보인다. (CSS)
// 위젯 묶음은 인쇄되지 않는다. (print.css)
// 모든 페이지가 같은 모듈을 사용한다. 서버 요청과 외부 자원은 없다.
import { el } from "../lib/dom.js";
import { testAttr } from "../lib/ids.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// 인쇄 창이 열렸는지 기다리는 시간(밀리초). 이 시간 안에 인쇄 신호가 없으면 안내 문구를 보여 준다.
const PRINT_WAIT_MS = 800;
// 안내 문구를 보여 주는 시간(밀리초)
const NOTICE_MS = 7000;
const NOTICE_TEXT = "이 브라우저에서는 인쇄 창이 열리지 않았습니다. 브라우저 메뉴(점 세 개 또는 공유)에서 인쇄를 선택해 주세요.";

// 글자 크기 단계. 0이 기본이다. 단계마다 CSS가 기준 글자 크기(html)를 바꾼다. (components.css의 data-text-size)
const TEXT_SIZE_MIN = -2;
const TEXT_SIZE_MAX = 3;

// 프린터 아이콘. 선 그림이고 색은 글자 색(currentColor)을 따른다.
function createPrintIcon() {
  const svg = document.createElementNS(SVG_NS, "svg");
  const attrs = {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    focusable: "false",
  };
  for (const [name, value] of Object.entries(attrs)) svg.setAttribute(name, value);
  for (const d of ["M6 9V3h12v6", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"]) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

// 인쇄 창을 연다. 인쇄 신호(beforeprint 또는 print 미디어 전환)가 오지 않으면 안내 문구를 보여 준다.
function printPage(showNotice) {
  let started = false;
  const mark = () => {
    started = true;
  };
  const printQuery = window.matchMedia("print");
  window.addEventListener("beforeprint", mark, { once: true });
  printQuery.addEventListener("change", mark, { once: true });
  window.print();
  window.setTimeout(() => {
    window.removeEventListener("beforeprint", mark);
    printQuery.removeEventListener("change", mark);
    if (!started) showNotice();
  }, PRINT_WAIT_MS);
}

// 글자 크기 버튼 묶음. [+] [−] 순서이다. 단계 끝에서는 해당 버튼이 꺼진다.
function createFontWidget() {
  const root = document.documentElement;
  let level = 0;
  const plus = el("button", { text: "+", attrs: { type: "button", "aria-label": "글자 크게", ...testAttr("font-widget-plus") } });
  const minus = el("button", { text: "−", attrs: { type: "button", "aria-label": "글자 작게", ...testAttr("font-widget-minus") } });
  const apply = (next) => {
    level = Math.max(TEXT_SIZE_MIN, Math.min(TEXT_SIZE_MAX, next));
    if (level === 0) root.removeAttribute("data-text-size");
    else root.setAttribute("data-text-size", String(level));
    plus.disabled = level >= TEXT_SIZE_MAX;
    minus.disabled = level <= TEXT_SIZE_MIN;
  };
  plus.addEventListener("click", () => apply(level + 1));
  minus.addEventListener("click", () => apply(level - 1));
  apply(0);
  return el("div", { className: "font-widget", attrs: { role: "group", "aria-label": "글자 크기", ...testAttr("font-widget") } }, [plus, minus]);
}

export function renderPrintWidget(parent) {
  const notice = el("p", { className: "widget-notice", attrs: { role: "status", ...testAttr("widget-notice") } });
  notice.hidden = true;
  let noticeTimer = 0;
  const showNotice = () => {
    notice.textContent = NOTICE_TEXT;
    notice.hidden = false;
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.hidden = true;
    }, NOTICE_MS);
  };
  const button = el(
    "button",
    {
      className: "print-widget",
      attrs: { type: "button", "aria-label": "인쇄 또는 PDF로 저장", ...testAttr("print-widget") },
    },
    [createPrintIcon(), el("span", { text: "PDF", attrs: testAttr("print-widget-label") })],
  );
  button.addEventListener("click", () => printPage(showNotice));
  parent.append(el("div", { className: "widget-stack", attrs: testAttr("widget-stack") }, [notice, button, createFontWidget()]));
}
