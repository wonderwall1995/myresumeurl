// 편집 경로 만드는 함수. 개발 서버의 편집 모드가 화면 요소와 데이터 파일의 위치를 잇는 데 쓴다.
// 요소의 data-edit 속성이 데이터 경로이다. 형식은 scripts/dev-edit-core.mjs의 머리 주석에 있다.
// 배포물과 미리 그린 HTML에는 이 속성이 붙지 않는다. (lib/dom.js)

// 섹션의 경로. 예: sections[id=s02-career]
export const sectionPath = (sectionId) => `sections[id=${sectionId}]`;

// 섹션 안 카드의 경로. 예: sections[id=s02-career].cards[no=1]
export const cardPath = (sectionBase, no) => `${sectionBase}.cards[no=${no}]`;

// 배열의 n번째 요소 경로 (0부터). 예: header.contact[0]
export const itemPath = (listBase, index) => `${listBase}[${index}]`;
