// main 페이지의 한국어 내용. 이 페이지의 내용은 이 파일만 수정한다.
//
// 이 파일은 글자 내용을 쓰는 곳이다. 개발 서버의 편집 모드(화면에서 글자를 눌러 고치기)로도 고칠 수 있다. (크기와 여백은 CSS에서 정한다.)
//
// 화면의 글자가 이 파일의 어디에 있는지(Inspector 이름표 -> 이 파일의 위치)
//   [00-header:name]           header.name (이름)
//   [00-header:body-list-i1]   header.contact의 첫 번째 줄
//   [00-header:photo-img]      header.photo
//   [01-intro:text]            sections의 id가 s01-intro인 항목의 text (문자열 하나)
//   [01-intro:text-b3]         text가 배열일 때 세 번째 블록 (글머리 목록이면 text-b8-i2처럼 항목 번호를 붙인다)
//   [02-career:interests-heading]        s02-career의 interests.heading (관심 분야 소제목)
//   [02-career:interests-g1-label]       s02-career의 interests.groups 첫 번째 묶음의 label
//   [02-career:interests-g1-text]        s02-career의 interests.groups 첫 번째 묶음의 text
//   [02-career:focus-heading]            s02-career의 focus.heading (관심 분야 글의 소제목)
//   [02-career:focus-text-b1]            s02-career의 focus.text 첫 번째 블록 (글머리 목록이면 focus-text-b2-i1처럼 항목 번호를 붙인다)
//   [02-career:worklist-heading]         s02-career의 worklistHeading (Worklist 제목)
//   [02-career.1:r1-head]      s02-career의 cards 중 no가 1인 카드, roles의 첫 번째 role
//   [03-projects.2:title]      s03-projects의 cards 중 no가 2인 카드의 title (링크는 link, 링크 글자는 linkText)
//   [07-education.1:title]     s07-education의 cards 중 no가 1인 카드의 title
//   [05-etc:list-i1]           s05-etc의 items 첫 번째
//   [99-footer:text]           footer.text
//
// 규칙
// - sections의 순서가 화면의 순서이다.
// - id는 고정 이름표이다. 형식은 s두자리번호-영문이름 (예: s02-career).
//   번호는 순서가 아니다. 한 번 붙인 번호는 바꾸지 않고, 삭제한 번호는 다시 쓰지 않는다.
//   00은 머리말, 99는 바닥글에 예약되어 있다. 자세한 규칙은 design.listup.md 11절.
// - type은 js/sections/index.js의 키와 같아야 한다.
// - 값이 비어 있는 섹션은 화면에 나타나지 않는다.
// - 카드의 no도 고정 이름표이다. 한 섹션 안에서 유일해야 한다.
// - 04번(기술 섹션), 06번(연락처 섹션), 08번(이력 섹션)은 삭제되었다. 연락처는 머리말의 header.contact로 옮겼다. 삭제한 번호는 다시 쓰지 않는다.
//
// 경력 섹션의 관심 분야 (type: "career"). 섹션 제목과 카드 사이에 한 번 나온다. 왼쪽 칸은 소제목, 오른쪽 칸은 묶음이다.
//   interests: { heading: "관심 분야", groups: [{ label: "Tooling", text: "Playwright, Appium, Jenkins" }] }
//   묶음마다 굵은 소제목(label)과 한 줄 글자(text)가 나온다. 항목은 text 안에 쉼표로 직접 쓴다. 넘치면 줄이 바뀐다.
//   편집 모드에서 묶음(행) 단위로 추가, 이동, 삭제한다. 새 묶음은 label과 text를 견본 글자로 채운다.
//   (interests의 heading 이름은 마음대로 정한다. 현재 이력서는 "실행 분야"로 쓴다.)
//
// 경력 섹션의 관심 분야 글 (type: "career"). 위의 interests 행 바로 아래에 한 번 나온다. 같은 두 칸 행이다.
//   focus: { heading: "관심 분야", text: ["단락", ["글머리1", "글머리2"], "다음 단락"] }
//   text는 소개 본문과 같은 블록 배열이다. 문자열은 단락(**굵게**, # 제목 등 글자 속 서식 가능, 줄바꿈은 \n), 배열은 글머리 목록이다.
//   편집 모드에서 블록(단락과 목록)과 목록 항목을 추가, 이동, 삭제한다. 비워 두면 화면에 나타나지 않는다.
//
// 경력 섹션의 Worklist 제목 (type: "career"). 관심 분야 글(focus) 바로 아래, 카드 위에 한 번 나온다.
//   worklistHeading: "Worklist"
//   섹션 제목(heading)과 같은 모양의 제목이다. 경력 섹션 안에 속한다. 비워 두면 나오지 않는다.
//
// 글자 목록(경력 묶음의 items, 소개의 글머리 목록, 기타의 items)의 항목은 세 가지 모양이 있다.
//   "글자"                          한 줄 항목. 앞에 기호와 공백("▸ 글자", "✓ 글자")을 쓰면 점 대신 그 기호가 마커이다.
//   { text: "글자", sub: ["하위 줄"] }  아래에 한 단계 들여쓴 작은 글자(1pt 작음)가 붙는다. 하위 줄은 한 단계뿐이고 마커는 없다.
//   "---"                           구분선. 글자는 보이지 않고 가는 선만 나온다.
//   편집 모드에서는 도구 막대의 "+ 하위", "구분선" 버튼으로 만든다.
//
// 경력 카드 (type: "career"). 두 가지 형태가 있다.
//   직책이 하나일 때. 화면 순서: company, role, period, skills, body
//   { no: 1, company: "기업명", role: "직책명", period: "2021.03 - 현재",
//     skills: ["스킬1", "스킬2"], body: "문장" 또는 ["항목1", "항목2"] }
//   직책이 바뀐 때(같은 기업). 화면 순서: skills가 맨 위, 직책마다 role, period, body가 차례로
//   { no: 1, company: "기업명", skills: ["스킬1", "스킬2"],
//     roles: [ { role: "직책명", period: "2025.09 - 현재", body: ["항목1"] },
//              { role: "이전 직책명", period: "2024.03 -", body: ["항목1"] } ] }
//   roles는 화면에 나오는 순서대로 쓴다. 기업명, description(설명), 스킬은 카드 하나에 한 번만 쓴다.
//   roles 안에 글자 "---"를 넣으면 그 자리에 직책 행 전체 폭의 구분선이 나온다. 예: roles: [{ ...QA Lead }, "---", { ...QA Manager }]
//   편집 모드에서는 직책 행의 머리 칸(직책명, 기간)을 누르고 "구분선" 버튼을 누르면 그 행 아래에 들어간다. 구분선은 직책 번호(r1, r2)를 바꾸지 않는다.
//   직책의 내용은 body 대신 groups로 쓸 수 있다. groups: [{ label: "소제목", items: ["항목1", "항목2"] }]
//
// 학력 (type: "education"). 카드 하나가 항목 하나이다.
//   { no: 1, title: "OO대학교 컴퓨터공학과", body: "2013.03 - 2019.02 | 학사 졸업" }
//     기간은 별도 항목(period) 없이 내용(body) 글자에 함께 쓴다.
//   모두 선택이다. 화면 순서: title, body. 테두리와 구분선은 없다.
//   sections 배열의 순서는 경력, 소개, 학력, 기타, 프로젝트이다.
//
// 프로젝트 (type: "projects"). 격자 갤러리로 표시된다. 각 항목은 타일과 모달 창으로 이루어진다.
//   { no: 1, title: "제목", link: "https://...", linkText: "Github Repo", summary: "타일에 보이는 한두 줄",
//     body: "상세 문장" 또는 ["상세1", "상세2"], image: { src: "/images/파일.webp", alt: "설명" } }
//   linkText는 링크에 보이는 글자이다. 없으면 주소가 그대로 보인다. 인쇄할 때는 글자 뒤에 주소가 덧붙는다.
//   title만 필수이다. body나 image가 있으면 타일을 눌러 모달 창을 열 수 있다.
//   링크 글자는 무엇을 써도 "GitHub Repo"로 줄여 보인다. linkText에 주소(http로 시작)를 쓰면 그 주소로 연결한다.
//   사진은 편집 모드에서 타일을 선택하고 "사진" 버튼으로 올린다. (자동으로 줄여 images 폴더에 저장하고 image.src를 고친다.)
//   인쇄할 때는 모든 프로젝트의 상세가 순서대로 출력된다.
//
// 목차 (toc). 왼쪽 메뉴이다. [{ label: "경력", target: "s02-career" }] 형태이고, 비면 나타나지 않는다.
//   target은 머리말(s00-header)이나 섹션의 id이다. 순서가 메뉴의 순서이다.
//
// 사이드바 (sidebar). 넓은 화면의 왼쪽 사이드바 아래쪽에 이름이 나온다. 연락처는 header.contact를 그대로 쓴다.
//
// About me (header.about). 머리말의 사진과 연락처 줄 아래에 나오는 별도 영역이다. { heading: "제목", text: ["단락1", "단락2"] }
//   단락 안의 줄바꿈은 \n이다. 비어 있으면 나타나지 않는다.
//
// 머리말 (header). 위에서 아래로: 이름(name, 최상단 전체 폭), 그 아래 한 줄에 | 사진 | 연락처 |.
// 이름 예: "홍웅기 | QA".
// 연락처 Body: header.contact = ["sample@example.com", "010-0000-0000"]. 한 줄씩 나열된다. 비어 있으면 나타나지 않는다.
// 프로필 사진: header.photo.src에 같은 도메인의 파일 경로를 쓴다 (예: "/images/profile.webp").
//   사진이 없어도 사진 자리는 만들어진다.
export const mainPage = {
  sidebar: { name: "" },
  toc: [],
  header: { name: "", photo: { src: "", alt: "" }, contact: [], about: { heading: "", text: [] } },
  sections: [
    { id: "s02-career", type: "career", heading: "", interests: { heading: "", groups: [] }, focus: { heading: "", text: [] }, worklistHeading: "", cards: [] },
    { id: "s01-intro", type: "intro", heading: "", text: "" },
    { id: "s07-education", type: "education", heading: "", cards: [] },
    { id: "s05-etc", type: "etc", heading: "", items: [] },
    { id: "s03-projects", type: "projects", heading: "", cards: [] },
  ],
  footer: { text: "" },
};
