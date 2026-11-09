import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";

// 바닥글을 그린다. 글자가 없으면 아무것도 그리지 않는다.
export function renderFooter(root, data, id) {
  if (!data.text) return;
  root.append(el("p", { text: data.text, attrs: testAttr(partId(id, "text")), edit: "footer.text", md: "inline" }));
}
