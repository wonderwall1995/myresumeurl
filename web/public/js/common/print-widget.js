// 화면 오른쪽 아래의 위젯 묶음. 위쪽은 PDF 버튼, 아래쪽은 글자 크기 버튼(+ / −)이다.
// PDF 버튼은 화면 폭에 따라 다르게 동작한다.
//   PC(넓은 화면): 프린터 아이콘과 "PDF" 글자. 누르면 브라우저의 인쇄 창이 열린다. 인쇄 창에서 "PDF로 저장"을 고르면 PDF 파일이 된다.
//       인쇄 창이 열리지 않는 브라우저(예: 앱 안의 브라우저)에서는 안내 문구를 잠시 보여 준다.
//   모바일(좁은 화면): 저장 아이콘과 그 위의 "SAVE" 글자. 누르면 모달이 열리고, 용지 방향(세로/가로)을 고른 뒤 Save를 누르면
//       미리 만들어 둔 PDF 파일(/pdf/)을 내려받는다. 인쇄 창은 열지 않는다. (PDF 파일은 pnpm pdf가 만든다. scripts/build-pdf.mjs)
// 글자 크기 버튼은 모바일에서만 보이고, 화면의 글자만 키우거나 줄인다. 값은 저장하지 않는다. 페이지를 새로 열면 기본 크기로 돌아간다.
// 위젯 묶음은 인쇄되지 않는다. (print.css)
// 모든 페이지가 같은 모듈을 사용한다. 서버 요청과 외부 자원은 없다. (파일 내려받기는 같은 사이트의 링크를 누르는 동작이다.)
import { el } from "../lib/dom.js";
import { testAttr } from "../lib/ids.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// 모바일 화면 폭. CSS(components.css)의 max-width와 같은 값이다.
const MOBILE_QUERY = "(max-width: 768px)";

// 인쇄 창이 열렸는지 기다리는 시간(밀리초). 이 시간 안에 인쇄 신호가 없으면 안내 문구를 보여 준다.
const PRINT_WAIT_MS = 800;
// 안내 문구를 보여 주는 시간(밀리초)
const NOTICE_MS = 7000;
const NOTICE_TEXT = "이 브라우저에서는 인쇄 창이 열리지 않았습니다. 브라우저 메뉴(점 세 개 또는 공유)에서 인쇄를 선택해 주세요.";

// 내려받는 PDF. 파일 이름은 scripts/pdf-hash.mjs의 PDF_FILES와 같아야 한다. name은 저장될 때의 파일 이름이다.
const PDF_CHOICES = [
  { key: "portrait", label: "세로", file: "/pdf/resume-portrait.pdf", name: "홍웅기_QA_이력서_세로.pdf" },
  { key: "landscape", label: "가로", file: "/pdf/resume-landscape.pdf", name: "홍웅기_QA_이력서_가로.pdf" },
];

// 글자 크기 단계. 0이 기본이고(모바일 11px), 단계마다 CSS가 기준 글자 크기(html)를 바꾼다. (components.css의 data-text-size)
// 줄이는 쪽과 키우는 쪽이 각각 6단계이다.
const TEXT_SIZE_MIN = -6;
const TEXT_SIZE_MAX = 6;

// 선 그림 아이콘. 색은 글자 색(currentColor)을 따른다. paths는 path 요소의 d 값 목록이다.
function createIcon(paths, className) {
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
    class: className,
  };
  for (const [name, value] of Object.entries(attrs)) svg.setAttribute(name, value);
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

// 프린터 아이콘 (PC)
const createPrintIcon = () =>
  createIcon(["M6 9V3h12v6", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"], "widget-icon-print");

// 저장 아이콘 (모바일). 아래쪽 화살표와 받침이다.
const createSaveIcon = () => createIcon(["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"], "widget-icon-save");

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

// PDF 파일을 내려받는다. 같은 사이트의 파일을 가리키는 링크를 눌러 주는 동작이다. (서버가 첨부 파일로 보낸다. _headers)
function downloadPdf(choice) {
  const link = el("a", { attrs: { href: choice.file, download: choice.name, rel: "noopener" } });
  document.body.append(link);
  link.click();
  link.remove();
}

// 저장 모달. 용지 방향(세로/가로)을 고르고 Save를 누르면 PDF를 내려받는다. 기본은 세로이다.
function createSaveDialog() {
  let selected = PDF_CHOICES[0];
  const dialog = el("dialog", { className: "save-dialog", attrs: { "aria-labelledby": "save-dialog-title", ...testAttr("save-dialog") } });

  const choiceButtons = PDF_CHOICES.map((choice) => {
    const button = el("button", { text: choice.label, className: "save-choice", attrs: { type: "button", ...testAttr(`save-choice-${choice.key}`) } });
    button.addEventListener("click", () => {
      selected = choice;
      refresh();
    });
    return { choice, button };
  });
  const refresh = () => {
    for (const { choice, button } of choiceButtons) button.setAttribute("aria-pressed", String(choice === selected));
  };

  const close = el("button", { text: "닫기", className: "save-close", attrs: { type: "button", ...testAttr("save-dialog-close") } });
  const save = el("button", { text: "Save", className: "save-submit", attrs: { type: "button", ...testAttr("save-dialog-submit") } });
  close.addEventListener("click", () => dialog.close());
  save.addEventListener("click", () => {
    downloadPdf(selected);
    dialog.close();
  });
  // 모달 바깥(어두운 바탕)을 누르면 닫는다. 안쪽 내용을 누른 것은 닫지 않는다.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.append(
    el("div", { className: "save-dialog-body" }, [
      el("h2", { text: "PDF 저장", attrs: { id: "save-dialog-title" } }),
      el("p", { text: "A4 용지 방향을 고른 뒤 Save를 누르세요." }),
      el("div", { className: "save-choices", attrs: { role: "group", "aria-label": "용지 방향" } }, choiceButtons.map((item) => item.button)),
      el("div", { className: "save-actions" }, [close, save]),
    ]),
  );
  refresh();
  return dialog;
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

  const dialog = createSaveDialog();
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  // 글자와 아이콘을 모두 넣고 CSS가 화면 폭에 따라 한쪽만 보여 준다.
  // 모바일은 "SAVE"가 아이콘 위, PC는 "PDF"가 아이콘 아래이다. 순서: SAVE, 프린터, 저장, PDF
  const button = el(
    "button",
    { className: "print-widget", attrs: { type: "button", ...testAttr("print-widget") } },
    [
      el("span", { text: "SAVE", className: "widget-label-save", attrs: testAttr("print-widget-label-save") }),
      createPrintIcon(),
      createSaveIcon(),
      el("span", { text: "PDF", className: "widget-label-print", attrs: testAttr("print-widget-label") }),
    ],
  );
  const syncLabel = () => button.setAttribute("aria-label", mobileQuery.matches ? "PDF로 저장" : "인쇄 또는 PDF로 저장");
  syncLabel();
  mobileQuery.addEventListener("change", syncLabel);
  // 누르는 순간의 화면 폭으로 동작을 정한다.
  button.addEventListener("click", () => {
    if (mobileQuery.matches) dialog.showModal();
    else printPage(showNotice);
  });

  parent.append(el("div", { className: "widget-stack", attrs: testAttr("widget-stack") }, [notice, button, createFontWidget(), dialog]));
}
