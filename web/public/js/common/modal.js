// 모달 창 부품. <dialog> 요소를 사용한다.
// 초점을 창 안에 가두기, Esc 키로 닫기, 뒤쪽 화면 가리기는 브라우저가 처리한다.
// 크기와 모양은 CSS(.modal)가 정한다.
import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";

// 모달 창 하나를 만든다.
// id: 이름표 (예: s03-projects-c1). 하위 이름표는 -dialog, -dialog-title, -close, -body.
// title: 창 제목. bodyNodes: 본문 노드 배열.
// 반환값: { dialog, open }. open()은 모달을 연다.
// titlePath는 제목의 편집 경로이다.
export function createModal({ id, title, bodyNodes, titlePath }) {
  const titleId = partId(id, "dialog-title");
  const closeButton = el("button", {
    text: "닫기",
    className: "modal-close",
    attrs: { type: "button", ...testAttr(partId(id, "close")) },
  });
  const head = el("div", { className: "modal-head" }, [
    el("h3", { text: title, attrs: { id: titleId, ...testAttr(titleId) }, edit: titlePath }),
    closeButton,
  ]);
  const body = el("div", { className: "modal-body", attrs: testAttr(partId(id, "body")) }, bodyNodes);
  const dialog = el("dialog", {
    className: "modal",
    attrs: {
      id: partId(id, "dialog"),
      "aria-labelledby": titleId,
      ...testAttr(partId(id, "dialog")),
    },
  }, [head, body]);

  closeButton.addEventListener("click", () => dialog.close());
  // 창 바깥(어두운 배경)을 누르면 닫는다. 창 안을 누르면 target이 안쪽 요소이다.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  return { dialog, open: () => dialog.showModal() };
}
