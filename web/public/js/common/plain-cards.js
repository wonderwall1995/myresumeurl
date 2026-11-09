// 단순 카드 그리기. 학력 섹션과 이력 섹션이 함께 쓴다.
// 기본(학력)은 테두리도 구분선도 없는 평문 항목이다. 항목 사이는 간격만 둔다. (CSS card-flat)
// 카드 항목: no, title(제목), period(기간), body(내용). 모두 선택이다. 순서: 제목, 기간, 내용.
import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";
import { cardPath, sectionPath } from "../lib/edit-path.js";
import { box, renderCards } from "./card.js";
import { createBody, renderHeading } from "./section-parts.js";

export function renderPlainCards(root, data) {
  if (!data.cards?.length) return;
  const before = root.childNodes.length;
  renderHeading(root, data);
  const base = sectionPath(data.id);
  renderCards(root, data, "card-flat", (card, id) => {
    const p = cardPath(base, card.no);
    return [
      box(id, "head", [card.title ? el("h3", { text: card.title, attrs: testAttr(partId(id, "title")), edit: `${p}.title` }) : null]),
      box(id, "period", card.period ? [el("p", { text: card.period, edit: `${p}.period` })] : []),
      box(id, "text", [createBody(card.body, partId(id, "body-text"), `${p}.body`)]),
    ];
  });
  // 카드가 하나도 그려지지 않았으면 제목도 지운다.
  if (!root.querySelector(".card-flat")) while (root.childNodes.length > before) root.lastChild.remove();
}
