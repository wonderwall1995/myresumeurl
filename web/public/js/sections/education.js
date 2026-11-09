// 학력 섹션. 학력 하나가 카드 하나이다. 카드 항목: no, title, period, body (common/plain-cards.js).
import { renderPlainCards } from "../common/plain-cards.js";

export function renderEducation(root, data) {
  renderPlainCards(root, data);
}
