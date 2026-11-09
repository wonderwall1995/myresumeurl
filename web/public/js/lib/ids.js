// 이름표 함수. 섹션, 카드, 항목의 id와 data-testid 값을 만든다.
// 규칙은 저장소 루트의 design.listup.md 11절에 있다.
// 대화 이름 [02-career.1:period]는 s02-career-c1-period가 된다.

// 카드의 이름표. 예: s02-career-c1
export const cardId = (sectionId, no) => `${sectionId}-c${no}`;

// 부모 이름표 아래의 부분 이름표. 예: s02-career-c1-period
export const partId = (parentId, name) => `${parentId}-${name}`;

// 목록 항목의 이름표. 번호는 1부터 센다. 예: s04-skills-i1
export const itemId = (parentId, index) => `${parentId}-i${index + 1}`;

// 테스트용 속성 객체. el()의 attrs에 펼쳐서 사용한다.
export const testAttr = (id) => ({ "data-testid": id });
