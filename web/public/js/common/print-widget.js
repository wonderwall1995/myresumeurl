// 인쇄 위젯. 화면 오른쪽 아래에 고정된 버튼이다. 누르면 브라우저의 인쇄 창이 열린다.
// 인쇄 창에서 "PDF로 저장"을 고르면 PDF 파일이 된다. 위젯 자체는 인쇄되지 않는다. (print.css)
// 모든 페이지가 같은 모듈을 사용한다. 서버 요청과 외부 자원은 없다.
import { el } from "../lib/dom.js";
import { testAttr } from "../lib/ids.js";

const SVG_NS = "http://www.w3.org/2000/svg";

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

export function renderPrintWidget(parent) {
  const button = el(
    "button",
    {
      className: "print-widget",
      attrs: { type: "button", "aria-label": "인쇄 또는 PDF로 저장", ...testAttr("print-widget") },
    },
    [createPrintIcon(), el("span", { text: "PDF", attrs: testAttr("print-widget-label") })],
  );
  button.addEventListener("click", () => window.print());
  parent.append(button);
}
