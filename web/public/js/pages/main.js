// main.html 진입점. 데이터를 불러와 공통 그리기 함수에 넘긴다.
import { mainPage } from "../../data/ko/main.js";
import { renderPage } from "../common/render-page.js";
import { renderPrintWidget } from "../common/print-widget.js";
import { watchToc } from "../common/toc.js";

renderPage(document.getElementById("app"), mainPage);
// 인쇄 위젯은 페이지 내용 밖(body)에 붙인다. 빌드의 미리 그리기에는 포함되지 않는다.
renderPrintWidget(document.body);
// 목차의 현재 항목 표시. 보이는 위치에 따라 바뀐다.
watchToc(document);
