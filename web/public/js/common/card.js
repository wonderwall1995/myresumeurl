// 카드 그리기 함수. 경력 카드와 프로젝트 카드가 함께 쓴다.
// 카드는 섹션에 종속한다. 카드 번호(no)는 섹션 안에서 유일한 고정 이름표이다.
import { el } from "../lib/dom.js";
import { cardId, testAttr } from "../lib/ids.js";
import { cardPath, sectionPath } from "../lib/edit-path.js";

// 카드 안의 박스 하나. 박스는 세로로 쌓인다.
// 내용이 없으면 null을 반환한다. 이름표는 <카드 이름표>-<이름>이다.
// 클래스는 card-box와 card-box-<종류>이다. CSS가 종류별로 모양을 다르게 한다.
// 종류를 주지 않으면 이름을 종류로 쓴다. 이름에 번호가 들어가는 박스(r1-head)는 종류를 따로 준다(head).
// editItem은 이 박스가 배열의 한 항목(예: 직책)일 때의 편집 경로이다.
export function box(id, name, children, kind = name, editItem) {
  const nodes = children.filter(Boolean);
  if (nodes.length === 0) return null;
  return el("div", { className: `card-box card-box-${kind}`, attrs: testAttr(`${id}-${name}`), editItem }, nodes);
}

// 섹션의 카드를 하나씩 처리한다. 카드 번호를 검사한다.
// 잘못된 번호나 중복된 번호의 카드는 건너뛰고 콘솔에 오류를 남긴다.
// 데이터 오류 하나가 페이지 전체를 멈추지 않게 하기 위해서이다.
export function eachCard(section, handle) {
  const seen = new Set();
  for (const card of section.cards ?? []) {
    if (!Number.isInteger(card.no) || card.no < 1 || seen.has(card.no)) {
      console.error(`잘못된 카드 번호: ${section.id} no=${card.no}`);
      continue;
    }
    seen.add(card.no);
    handle(card, cardId(section.id, card.no));
  }
}

// 섹션의 카드를 모두 그린다.
// className은 카드 요소의 클래스이다. 생략하면 "card"이다.
// buildBoxes(card, id)는 카드 안의 박스 배열을 반환하는 함수이다.
export function renderCards(root, section, classOrBuild, maybeBuild) {
  const className = typeof classOrBuild === "string" ? classOrBuild : "card";
  const buildBoxes = typeof classOrBuild === "string" ? maybeBuild : classOrBuild;
  eachCard(section, (card, id) => {
    const boxes = buildBoxes(card, id).filter(Boolean);
    if (boxes.length === 0) return;
    root.append(el("article", { className, attrs: { id, ...testAttr(id) }, editItem: cardPath(sectionPath(section.id), card.no) }, boxes));
  });
}
