// 이력 섹션. 스킬 성격의 이력(예: GitHub Projects v2로 이슈 관리)이다. 이력 하나가 항목 하나이다.
// 카드 항목: no, title, period, body (common/plain-cards.js).
import { renderPlainCards } from "../common/plain-cards.js";

export function renderHistory(root, data) {
  renderPlainCards(root, data);
}
