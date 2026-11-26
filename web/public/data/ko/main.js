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
//   이 제목은 목차 "이력" 항목의 대상이다. 목차는 { label: "이력", target: "s02-career-worklist-heading" }로 쓴다. 인쇄에서는 이 제목부터 새 쪽이 시작된다.
//   그 위(섹션 제목, 실행 분야, 관심 분야)는 목차 "인적사항" 구간이라 인적사항(About me)과 같은 쪽에 인쇄된다.
//   섹션 제목(heading)과 같은 모양의 제목이다. 경력 섹션 안에 속한다. 비워 두면 나오지 않는다.
//
// 글자 목록(경력 묶음의 items, 소개의 글머리 목록, 기타의 items)의 항목은 세 가지 모양이 있다.
//   "글자"                          한 줄 항목. 앞에 기호와 공백("▸ 글자", "✓ 글자")을 쓰면 점 대신 그 기호가 마커이다.
//   { text: "글자", sub: ["하위 줄"] }  아래에 한 단계 들여쓴 작은 글자(1pt 작음)가 붙는다. 하위 줄은 한 단계뿐이고 마커는 없다.
//   "---"                           구분선. 글자는 보이지 않고 가는 선만 나온다.
//   "==="                           인쇄 쪽 나눔 표식. 화면에는 보이지 않고, 인쇄에서 이 자리부터 새 쪽이 시작된다.
//                                   경력의 직책(roles)과 묶음(groups) 사이, 글머리 목록, 소개와 About me 단락, 관심 분야 글,
//                                   프로젝트 블록(blocks)과 줄글(text) 사이에 넣을 수 있다. 편집 모드에서 항목을 고르고 "끊기"로 넣는다.
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
//   placeBefore: "요소 id"를 쓰면 섹션이 그 요소 바로 앞에 놓인다. 예: placeBefore: "s02-career-worklist-heading"
//     (경력 섹션의 Skills 아래, 이력 제목 위. 경력 섹션이 그 자리에서 둘로 나뉜다. 목차는 대상 위치를 따른다.)
//
// 프로젝트 (type: "projects"). 지금은 화면과 인쇄 모두 문서 모양이다. (갤러리 타일과 모달은 꺼 둠. 되돌리는 방법은 css/gallery-mobile.css 머리 주석)
//   블록 방식(권장): 카드마다 blocks에 블록을 원하는 순서로 쌓는다. 블록은 세 종류이다.
//   (text 블록은 경력 기술처럼 두 칸 행이다. { type: "text", rows: [{ head: "소제목", body: ["줄글 단락", ...] }] })
//   { no: 1, title: "제목", summary: "요약", blocks: [
//       { type: "image", src: "/images/a.webp", alt: "설명" },
//       { type: "head", title: "제목", links: [{ label: "GitHub Repo", url: "https://..." }, { label: "배포 링크", url: "https://..." }] },
//       { type: "text", text: ["## 소제목", "줄글"] },
//   ] }
//   보통의 순서는 사진1, 사진2, 제목줄, 줄글이다. (사용자 결정) head는 제목 한 줄, 그 아래 링크 한 줄이고 둘 다 가운데 정렬이다. (링크 최대 4개, 링크 사이는 세로선) image는 사진, text는 줄글(문단마다 # 제목, **굵게** 가능)이다.
//   인쇄에서는 프로젝트마다 새 쪽에서 시작하고, 블록은 이어서 흐른다. 카드의 title과 summary는 갤러리 모양(타일, 모달 제목)에서만 쓴다.
//   편집 모드에서 블록을 누르면 ▲▼, 삭제, "+ 제목줄", "+ 줄글", "사진 추가"(그 뒤에 넣음), 사진 블록이면 "사진 교체"가 나온다.
//   새 프로젝트는 프로젝트 번호("PROJECT 04 / 04")를 눌러 카드를 고르고 + 버튼으로 만든다. 새 카드는 제목줄과 빈 줄글로 시작한다.
//   카드를 고르고 "사진 추가"를 누르면 사진은 마지막 사진 뒤(사진이 없으면 맨 앞), 즉 제목줄 위에 들어간다.
//   프로젝트 번호와 인쇄 쪽 머리("프로젝트 01")는 화면 순서로 자동으로 매겨진다. 프로젝트 수에 제한이 없다.
// 아래는 블록이 없을 때 쓰는 예전 방식이다. 격자 갤러리로 표시된다. 각 항목은 타일과 모달 창으로 이루어진다.
//   { no: 1, title: "제목", link: "https://...", linkText: "Github Repo", summary: "타일에 보이는 한두 줄",
//     body: "상세 문장" 또는 ["상세1", "상세2"], image: { src: "/images/파일.webp", alt: "설명" } }
//   linkText는 링크에 보이는 글자이다. 없으면 주소가 그대로 보인다. 인쇄할 때는 글자 뒤에 주소가 덧붙는다.
//   title만 필수이다. body나 image가 있으면 타일을 눌러 모달 창을 열 수 있다.
//   섹션의 notice는 갤러리 위에 작은 글자로 나오는 안내 문구이다. 넓은 화면에서만 보이고 인쇄와 모바일에서는 숨긴다.
//   예: { id: "s03-projects", type: "projects", heading: "프로젝트", notice: "*인쇄에선 갤러리 UI 형태 대신, 일반적인 평문 문서로 출력됩니다.", cards: [...] }
//   링크는 타일에 한 줄로 나온다. 저장소 링크의 글자는 무엇을 써도 "GitHub Repo"로 줄여 보인다. linkText에 주소(http로 시작)를 쓰면 그 주소로 연결한다.
//   배포된 프로젝트는 demo에 배포 주소를 쓴다. 글자는 "배포 링크"로 보이고, 저장소 링크 오른쪽에 구분선과 함께 나온다. 없으면 나타나지 않는다.
//   편집 모드에서는 카드마다 빈 칸("GitHub 주소", "배포 주소")이 보이고, 눌러서 주소를 쓰면 데이터에 만들어진다.
//   { no: 1, title: "제목", link: "https://github.com/아이디", linkText: "https://github.com/아이디/저장소", demo: "https://배포주소", ... }
//   링크가 여러 개이면(최대 4개) links 목록을 쓴다. 링크마다 보이는 이름(label)과 주소(url)를 쓴다. links가 있으면 link, linkText, demo는 쓰지 않는다.
//   { no: 1, title: "제목", links: [{ label: "Frontend Repo", url: "https://..." }, { label: "Backend Repo", url: "https://..." }, { label: "배포 링크", url: "https://..." }] }
//   편집 모드에서 카드를 누르고 "링크 목록" 버튼을 누르면 지금의 저장소, 배포 링크가 목록으로 바뀐다. 링크를 누르면 이름을 고치고, 옆의 작은 칸에서 주소를 고친다. + 버튼은 3개에서 멈춘다.
//   사진은 편집 모드에서 타일을 선택하고 "사진 교체" 버튼으로 올린다. (자동으로 줄여 images 폴더에 저장하고 데이터를 고친다.)
//   사진이 여러 장이면 images 목록을 쓴다. 사진마다 그 아래에 줄글(text) 목록이 붙는다. images가 있으면 image는 쓰지 않는다.
//   { no: 1, title: "제목", images: [{ src: "/images/a.webp", alt: "설명", text: ["## 소제목", "줄글"] }, { src: "/images/b.webp", alt: "설명", text: ["줄글"] }] }
//   첫 사진은 타일의 섬네일이고, 모달과 인쇄에서는 사진 -> 이름 -> 링크 -> 첫 사진의 줄글 순서이다. 둘째 사진부터는 인쇄에서 새 쪽에서 시작한다.
//   줄글 하나가 문단 하나이다. # 제목, ## 소제목, ### 작은 제목, **굵게**를 쓸 수 있다.
//   편집 모드에서 "사진 추가" 버튼을 누르면 사진이 하나 더해진다. 예전 방식(image와 body)이면 image는 첫 사진, body는 첫 사진의 줄글로 옮겨진다.
//   (body에 하위 줄이나 구분선이 있으면 옮기지 않고 그대로 둔다. body는 첫 사진의 줄글 뒤에 나온다.)
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
// 웹 이력서 링크: header.resumeLink = { label: "웹 호스팅 중인 이력서 링크", url: "웹 주소" }. 사진 오른쪽 칸의 맨 위(연락처 위)에 한 줄로 나온다.
//   글자가 하이퍼링크이고 주소는 보이지 않는다. 글자는 연락처보다 2pt 크다. PDF로 제출할 때도 눌러서 웹 이력서를 열 수 있다.
// 프로필 사진: header.photo.src에 같은 도메인의 파일 경로를 쓴다 (예: "/images/profile.webp").
//   사진이 없어도 사진 자리는 만들어진다.
export const mainPage = {
  sidebar: { name: "" },
  toc: [],
  header: { name: "", photo: { src: "", alt: "" }, contact: [], resumeLink: { label: "", url: "" }, about: { heading: "", text: [] } },
  sections: [
    { id: "s02-career", type: "career", heading: "", interests: { heading: "", groups: [] }, focus: { heading: "", text: [] }, worklistHeading: "", cards: [] },
    { id: "s01-intro", type: "intro", heading: "", text: "" },
    { id: "s07-education", type: "education", heading: "", cards: [] },
    { id: "s05-etc", type: "etc", heading: "", items: [] },
    { id: "s03-projects", type: "projects", heading: "", cards: [] },
  ],
  footer: { text: "" },
};
