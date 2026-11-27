// 샘플 내용. 화면과 인쇄를 확인하는 용도이다. 이름과 대부분의 내용은 가상이다.
// 경력 1번 카드(s02-career-c1)의 기업명(벳칭)과 직책별 내용은 사용자가 준 실제 이력서 정보이다.
// pnpm preview로 실행하면 public/data/ko/main.js 대신 이 파일이 사용된다.
// 이 폴더는 배포되지 않는다. 사진은 preview/images의 가상 이미지를 쓴다. 형식 규칙은 public/data/ko/main.js의 주석과 같다.
export const mainPage = {
  // 목차. 왼쪽 메뉴(좁은 화면에서는 위쪽 줄). target은 머리말(s00-header) 또는 섹션의 id이다. 문서에 없는 id는 그려지지 않는다.
  // 사이드바 아래쪽에 나오는 이름. 연락처는 header.contact를 그대로 쓴다.
  sidebar: { name: "홍웅기" },
  toc: [
    { label: "인적사항", target: "s00-header" },
    { label: "이력", target: "s02-career-worklist-heading" },
    { label: "경력 기술", target: "s09-career-demo" },
    // { label: "자기소개", target: "s01-intro" }, // 자기소개 숨김 (2026-11-26)
    { label: "프로젝트", target: "s03-projects" },
  ],
  header: {
    name: "홍웅기 | QA",
    photo: { src: "/images/profile.jpg", alt: "홍웅기 프로필 사진" },
    // 연락처 Body. 사진 오른쪽에 한 줄씩 나열된다.
    contact: ["ltwayne0@gmail.com", "010-5163-3024", "https://github.com/wonderwall1995", "www.linkedin.com/in/hwk5070252b6"],
    // 웹 이력서 링크. 사진 오른쪽 칸의 맨 위(이메일 위)에 한 줄로 나온다. 글자가 링크이고 주소는 보이지 않는다. (PDF로 제출할 때 웹 이력서를 열 수 있게)
    resumeLink: { label: "이력서 Web 링크", url: "https://resume-hwk.ltwayne0.workers.dev/main" },
    // About me. 사진과 연락처 줄 아래에 나오는 별도 영역. 단락은 문자열(줄바꿈은 \n)이다.
    about: {
      heading: "About me…",
      text: [
        "**저는…**\n동물병원 의료 차트(EMR) 기반 스타트업, 벳칭에서 2년 6개월을 근무한 홍웅기입니다.\n입사 초기 VOC, 이슈, 테스트 범주 대비 72%로 측정된 품질 지표를 사내 협업을 통해 92%로 향상시켰습니다.\n개발 6개월이 소요된 스레드(타임라인) 프로젝트 릴리즈 이후, 사전 탐지 이슈 대비 98%의 이슈 탐지율을 달성한 성과.\n경쟁사 제품 마이그레이션 데이터 대상으로 무결성 수치를 최초 67%로 정의, 협업하여 82%까지 향상시킨 성과.\nLead 임명 후 2인 팀을 구성, 팀과 개인이 필요한 자동화 프로젝트 및 Agent의 구축 경험이 있습니다.",
        "**업무 개요**\n- QA가 없던 40인 미만 스타트업에서 QA 0 to 1 프로세스 확립을 완료했습니다.\n- 의료 전문직 B2B 대상 EMR, CRM, ERP 솔루션에서 전체 제품에 대한 품질을 총괄했습니다.\n- Shift-left 기반의 QA 업무를 구축, Agile 방식의 프로젝트에서 PR을 묶은 Iteration 단위로 QA를 진행했습니다.\n- Lead로 발탁된 이후 1년 동안 2인 팀을 조직하여 팀 리딩을 해봤습니다.\n- 복약 지도 및 마약류 관리 프로세스와 같이 비즈니스 리스크가 있을 기능의 품질 보증 경험이 있습니다.\n- Agent 도입 시 LLM이 참조할 업무 맥락의 기록, 프로젝트 간 오케스트레이션에 비중을 둡니다.\n- 정성적 QA 업무를 UI/UX 기반 정량적 평가로 치환하여 공유하는 일에 관심이 높습니다.\n- 극단적 시한의 프로젝트에서 비즈니스 리스크 및 기능별 Known Issue 허용 범위 정의를 내리며 릴리즈한 적이 있습니다.\n- 자율적인 업무에서 자동화 프로세스 빌드업을 위한 인프라 업무(TestID 부여 등)를 진행해보았습니다.\n- LLM의 문서 생성 자동화에 앞서, 작성될 문서 품질의 고도화를 위한 사이드 프로젝트 작업을 해봤습니다.",
      ],
    },
  },
  sections: [
    {
      id: "s02-career",
      type: "career",
      heading: "Skills",
      // 관심 분야는 경력 제목과 카드 사이에 나온다. 왼쪽 칸은 소제목, 오른쪽 칸은 묶음(소제목과 항목 목록)이다.
      interests: {
        heading: "실행 분야",
        groups: [
          { label: "Skill", text: "Playwright, Appium" },
          { label: "Tooling", text: "Jenkins, Docker, Github, Linear, Hermes Agent" },
          { label: "Environment", text: "AWS EC2, Github Projects, Slack, Notion, Google Workspace, PostgreSQL" },
          { label: "Etc", text: "DaVinci (동영상 편집)" },
        ],
      },
      // 관심 분야 글은 실행 분야 바로 아래에 나온다. text의 문자열은 단락, 배열은 글머리 목록이다. 편집 모드에서 단락을 누르고 + 버튼을 누르면 그 아래에 단락이 추가된다.
      focus: {
        heading: "관심 분야",
        text: [
          "Grafana, Jmeter, Postman",
        ],
      },
      // Worklist 제목은 관심 분야 아래, 카드(경력 목록) 위에 나온다. 섹션 제목(경력)과 같은 모양이다. 비워 두면 나오지 않는다.
      worklistHeading: "이력",
      cards: [
        {
          no: 1,
          company: "벳칭 (Vetching)",
          // 기업명 아래에 한 번 나오는 설명 (제품)
          description: "**B2B 동물병원 EMR - CRM - ERP Web/App 차트**\n**(PlusVet & PlusVetM)**",
          // 직책이 바뀐 경력. 직책마다 묶음(소제목과 항목 목록)이 나온다.
          roles: [
            {
              role: "QA Lead",
              period: "2025.09 - 2026.08\n(1년)",
              groups: [
                {
                  label: "프로세스",
                  items: [
                    "2인 QA 팀 구성 및 일일 스크럼 운영",
                    "사내 타운홀 미팅 QA 자료 발표 및 부서 KPI OKR 제시",
                    "팀 내 사이드 프로젝트 명세, Gluework 요구 정의",
                  ],
                },
                {
                  label: "프로젝트",
                  items: [
                    "고객 병원 세무, 회계 편의 목적 통계 산출 프로젝트",
                    "대형 병원 분점 그룹화 기획, UI - DB 간 데이터 정합성 검증",
                    "스레드 - 원내 업무 기록 및 알림 타임라인 프로젝트 품질 책임",
                    "Mobile 펜 차트 프로젝트 사용성 및 기기 호환 검증",
                    "AI 레코드 - 진료 발화 STT 기록 & 차트 내 LLM 요약 기입 프로젝트",
                  ],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "AST 자동화 코드 기반 testId 색인 서비스 배포",
                    "Hermes Agent 기반 팀 업무 보고 자동화, 프로젝트 오케스트레이션 초기 구축",
                    "DBViewer Tagger - DB 컬럼 CSV Parser, LLM 맥락 문서 작성 프로젝트 기획",
                    "Context docs & PR Diff 기반 테스트 결과 평가 서비스 TestGate 기획",
                  ],
                },
              ],
            },
            "===",
            {
              role: "QA Manager",
              period: "2024.03 - 2025.09\n(1년 6개월)",
              groups: [
                {
                  label: "프로세스",
                  items: ["Context Driven - Shift-Left QA 업무 프로세스 확립", "비즈니스 리스크 기반 기획 검수", "제품 품질 지표 정의 및 계측 문서 C레벨 보고", "제품별 테스트 케이스 & 시나리오 작성", "App/Web 제품 릴리즈 책임", "제품 본부 입사자 대상 제품 OJT 책임"],
                },
                {
                  label: "프로젝트",
                  items: [
                    "수의사 및 환자 스케줄링 관리 시스템",
                    "Naver 예약 & LG AICC 콜센터 스케줄링 연동 검증",
                    "통원 입원 의무 차트 사용성 검증",
                    "원내 약물 조제 및 처방 약제 프로세스",
                    "고객 및 환자 연락 관리(CRM) 프로세스",
                    "원내 그룹 채팅 & DM 메신저 시스템",
                    "리셉션 수납 및 결제 시스템 개선",
                    "약물 재고 및 처방 관리(ERP) 시스템",
                    "NIMS 연동 마약류 구매, 투약, 폐기 프로세스 검수",
                    "서드파티 영상 및 검진 장비 연동 검증",
                    "예약자 대기 현황 표기 웹 프로젝트, 태블릿 자동 접수 앱 시스템 검증",
                  ],
                },
                {
                  label: "사업 영역",
                  items: ["거래처 및 대학 병원 대상 경쟁 제품 마이그레이션 데이터(CSV) 무결성 검증 책임"],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "TypeScript UI/UX 코드 내 testId 색인 작업",
                    "Web - App 양방향 자동화 시나리오 구축 (Prisma & PostgreSQL)",
                    "Jenkins 트리거 & GitHub Webhook 기반 Slack Bot 업무 - 이슈 알림 일원화",
                    "EC2 라우팅 기반 Test Checklist 생성 자동화 서비스 기획 및 배포",
                  ],
                },
                {
                  label: "문서",
                  items: ["TIPS 연구 일지 작성"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s07-education",
      type: "education",
      heading: "학력",
      // 경력 섹션의 Skills 아래, 이력 제목 바로 위에 놓인다. 목차의 인적사항 구간에 속한다. (사용자 요청)
      placeBefore: "s02-career-worklist-heading",
      cards: [
        { no: 1, title: "강원대학교 컴퓨터공학과", body: "2014.03 - 2020.08 | 학사 졸업" },
      ],
    },
    // 경력(Demo). 경력(s02-career)의 벳칭 카드를 복사한 구역이다. 새 구조의 경력을 작성하는 용도이다. 관심 분야는 복사하지 않았다.
    // [작성 예시] 직책별 행 + 역할 / 성과 / 주요 프로젝트 순서. 성과 줄은 자리 표시용 샘플이다. (사실이 아님)
    {
      id: "s09-career-demo",
      type: "career",
      heading: "경력 기술",
      cards: [
        {
          no: 1,
          company: "벳칭 (Vetching)",
          description: "**B2B 동물병원 EMR - CRM - ERP Web/App 차트**\n**(PlusVet & PlusVetM)**",
          roles: [
            {
              role: "제품 프로젝트",
              period: "2026.06 - 2026.07\nQA Lead",
              groups: [
                {
                  label: "AI 레코드 - 진료 발화 STT 기록 & 차트 내 LLM 요약 기입 프로젝트",
                  items: [
                    {
                      text: "진료실 내 발화 음성 녹음 품질 검증",
                      sub: ["▸ 3인 이상 발화 상황 중 STT 식별상 녹음 품질, 인물 구분 여부 확인", "▸ 발화자 거리, 마이크 볼륨별 거리감 테스트, 마이크 증폭 여부 및 볼륨 수치상 사용감 품질 보증"],
                    },
                    {
                      text: "LLM 요약 내 필터링 프롬프트 검증",
                      sub: ["▸ 맥락 외 발언 및 진료 외 내용의 차트 수록 중 필터링 프롬프트 정상 작동 여부 확인"],
                    },
                    {
                      text: "기능 대상 기획 명세 기반 새너티 테스트 진행",
                      sub: ["▸ 녹음 및 요약 기능 전반 작동 여부 테스트"],
                    },
                  ],
                },
              ],
            },
            {
              role: "제품 프로젝트",
              period: "2026.03 - 2026.05\nQA Lead",
              groups: [
                {
                  label: "스레드 - 원내 업무 기록 및 알림 타임라인 프로젝트",
                  items: [
                    {
                      text: "6개월간의 개발 기간 종료, 10일 QA 기간 중 팀 내 업무 조율 및 계획",
                      sub: ["▸ 원내 발생할 수 있는 User Event 시나리오상 Notification의 코드 반영 여부 정합성 우선 검증", "▸ UI/UX상 Subscription 및 정규화 구조 DB 대상 QA 검증 시나리오 작성", "⇒ **개발팀과의 Pair 테스트**를 위한 테스트 시나리오 작성, API 코드 검증 요청 및 탐색적 테스팅 방법 교육"],
                    },
                    {
                      text: "병원 환자 대상 발생하는 스레드(타임라인) 내 CRUD 동작에 따른 회귀 테스트",
                      sub: ["▸ Event Listener 코드의 전체 리스트업 이후 개별 동작에 따른 회귀 테스트 진행", "⇒ 129개 이슈 산출 및 리포트에 따른 **릴리즈 전** Fix", "⇒ **릴리즈 후** 사전 이슈 탐지 대비 98% 품질 무결성 달성, 업무 성과에 따른 6일 포상 휴가 수상"],
                    },
                    {
                      text: "메신저 기능의 스레드 프로젝트 내부 병합에 따른 원내 메시지 전송에 대한 통합 테스트",
                      sub: ["▸ 스레드 UI 내 메신저 기능의 통합, 리팩토링에 따른 회귀 테스트 진행"],
                    },
                  ],
                },
              ],
            },
            {
              role: "제품 프로젝트",
              period: "2025.09 - 2026.02\nQA Lead",
              groups: [
                {
                  label: "EMR - Subscription API 기반 진료 및 조제 업무 통일 프로젝트",
                  items: [
                    {
                      text: "실시간 조제 프로젝트 진행 전 기획 리뷰를 위한 현장 답사",
                      sub: ["▸ 역곡역 협력 동물병원 협조, **진료실 조제실 공간 분리에 따른 병원 업무 맥락이 끊기는 케이스 현장 답사**", "⇒ 1인 병원 및 대형 병원 대상 개별 케이스 사용성 분석 및 편의성 측면 시나리오 작성"],
                    },
                    {
                      text: "실시간 조제 상태에 따른 원내 차트 사용자별 시나리오 테스트",
                      sub: ["▸ App - PC 간 정보 Subscription 여부 확인, Push 알림, 실시간 Notification 검증", "▸ 수술 & 시술 중 마약류 처방 관련 비즈니스 리스크 여부 검증"],
                    },
                    {
                      text: "처방전(Rx) 내 제형 산술식 대상 비즈니스 리스크 여부 검증",
                      sub: ["▸ 진료 차트 Datagrid 내 환자 대상 약제 제형별 계산 회귀 테스트 진행"],
                    },
                  ],
                },
              ],
            },
            "===",
            {
              role: "제품 프로젝트",
              period: "2025.01 - 2025.06\nQA Manager",
              groups: [
                {
                  label: "EMR - 동물병원 원내 DM & 그룹 채팅방 메신저 기능 프로젝트",
                  items: [
                    {
                      text: "Discord & Kakaotalk 대상 레퍼런스 대비 기획상 기능 편의 리뷰",
                      sub: ["▸ Floating 기능, 서버 내 메시지 관리 정책, 유저 및 차트 멘션 기능 대상 타임스탬프별 표기 정책 리뷰"],
                    },
                    {
                      text: "결정 테이블 & 경계값 분석 기반 기획 정책의 개발 내용 대상 검증",
                      sub: ["▸ 결정 테이블 테스트 시행에서 미디어 저장 및 재생 기능, 메시지 수정 및 삭제 정책에서 에지 케이스 검증", "▸ 채팅 내 스크롤링 편의상 한계점, 입력된 채팅 길이에 따른 경계값 기준 결함 이슈 리포트", "⇒ **릴리즈 전** 51개의 버그성 이슈 탐지, 약 240 TestCase 작성"],
                    },
                    {
                      text: "신설 메시지 서버 측(MongoDB) 관련 이슈 탐지",
                      sub: ["▸ 데이터 정합성 결함 및 실시간 메시지 Subscription 서버 결함 **릴리즈 전** 탐지", "▸ 메시지 검색의 중복 혹은 편의상 비표준 동작, 같은 유저가 복수로 메신저에 나타날 수 있는 문제 리포트"],
                    },
                  ],
                },
              ],
            },
            {
              role: "제품 프로젝트",
              period: "2024.03 - 2024.10\nQA Manager",
              groups: [
                {
                  label: "CRM - 스케줄링 기능 일원화 · 고도화 프로젝트 (Naver 예약 & LG AICC 콜센터 연동)",
                  items: [{ text: "① 스케줄링 일원화 - Naver 예약 & LG AICC 콜센터 연동 검증", sub: ["▸ Naver 예약 & LG AICC 외부 스케줄 등록 프로세스 구축 협업 중 자사 품질 책임", "▸ 약 320 TestCase 작성, 스케줄링 호환을 위한 자사 제품 전체 E2E UI/UX 테스트 진행", "▸ **릴리즈 전** 코드 품질에 따른 비기능적 이슈 다수 발생", "⇒ **비즈니스 리스크로 판단될 결함 포함**, 이슈별 심각도 판단 보고서 작성", "⇒ Major로 판단되는 비기능 이슈 대상 영상 편집 방식으로 제품 본부 내 이슈 리스트업"] }, { text: "② 보호자 FollowUp - 진료 후 스케줄러 내 환자 가예약 서비스", sub: ["▸ 디자인 부재 속 개발 의도 및 FollowUp 기능의 가예약 특징을 일반 스케줄링 대비 맥락적으로 파악", "▸ TestCase 또는 TestScenario 부재 상황 Boolean 위주의 DB 컬럼 값들에 대한 UI 정합성 검증 필요", "▸ 개발자 및 QA 2인이 동시에 병행하는 페어 프로젝트 개념의 개발 & 테스트 진행", "⇒ **릴리즈 전** 스케줄링 테이블 경계값 분석, DB 내 마이그레이션된 Date 경계값 오차 범위 리포트"] }, { text: "릴리즈 조건 개념 사내 확립", sub: ["✓ 기능 자체 문제에선 대체 가능한 기능이 있는지? UI Path 문제에선 대체 가능한 경로가 있는지?", "✓ 자사 제품 개별 이슈 중요도를 측정할 때, 그 기준으로써 비즈니스 리스크를 야기하는 경우는 무엇인지?", "✓ 상정하지 않은 프로젝트에서 필요한 테스트 기법, 개발자와 페어로 커뮤니케이션은 어떻게 진행하는지?"] }],
                },
              ],
            },
            "===",
            "---",
            {
              role: "QA 프로젝트",
              period: "2026.06 - 2026.08\nQA Lead",
              groups: [
                {
                  label: "Context docs & PR Diff 기반 테스트 결과 평가 서비스 TestGate 기획",
                  items: [
                    {
                      text: "Test Checklist 자동 생성 프로젝트의 품질 개선",
                      sub: ["▸ 도메인 Context Enrichment docs(Json)를 참조 데이터로 투입"],
                    },
                    {
                      text: "QA가 작성한 테스트 결과에 대한 LLM 평가 프로세스 기획 문서화",
                      sub: ["▸ 재직 중 퇴사 결정으로 인한 문서화 이후 QA 부서 내 문서화 및 인수인계 진행"],
                    },
                    {
                      text: "Github PR Comment 기반 이벤트 연동 계획",
                      sub: ["① PR Comment 수신 - Cloudflare Worker > github-app > Hermes Webhook 전송", "② 분석 실행 - Hermes Webhook 필터 > Hermes 세션 내 Claude 조작 > Claude Code 내부 분석", "③ Bot Comment(Github, Slack, etc.)의 결과 내용 게시"],
                    },
                  ],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2026.05 - 2026.08\nQA Lead",
              groups: [
                {
                  label: "Hermes Agent 기반 팀 업무 보고 자동화, 프로젝트 오케스트레이션 초기 구축",
                  items: [
                    {
                      text: "① Slack bot 연동, Team 업무 보고 & 스크럼 공유 자동화 구현",
                      sub: ["▸ Jenkins가 생성하는 개별 스크럼 공유 채널 내 작성된 내용에 대한 요약 및 작성 자동화", "⇒ 작성 공수 감소 / 월간, 주간 품질 보고서 및 부서 내 업무 보고서 생성 효율 증가"],
                    },
                    {
                      text: "② Test Checklist 생성 자동화 프로세스의 Hermes Agent Hook 연동",
                      sub: ["▸ 개별 PR의 Diff 전체 & Commit Diff 대상 Test Checklist 생성 자동화의 Hermes Agent 연동", "▸ PR 대상 Test Checklist 생성 프로세스의 CLI 수동 호출 방식에서의 번거로움 확인", "⇒ Slack Bot 알 발 Agent 분석 세션 생성 요청 및 해석 진행으로의 전환"],
                    },
                  ],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2026.04 - 2026.06\nQA Lead",
              groups: [
                {
                  label: "DBViewer Tagger - DB 컬럼 CSV Parser, LLM 맥락 문서 작성 프로젝트 기획",
                  items: [
                    {
                      text: "제품 본부 내 RAG 구축의 기반 문서 생성 필요성 확인",
                      sub: ["▸ 도메인 단어에 대한 제품 및 개발 본부 구성원 간 지식 공유 및 LLM 참조 자료 필요 상황 확인", "▸ 부서 차원 **자동화 업무에서 '맥락 문서'의 부재로 인한 결과물 품질 저조** 지속 발견"],
                    },
                    {
                      text: "DB Viewer Interface 레퍼런스 기능 - 테이블별 DB View & 스냅샷 기능 구현",
                      sub: ["▸ SSH 터널 방식 연결, DB 대상 스냅샷 문서(CSV)를 Datagrid 기반으로 표기하도록 설계"],
                    },
                    {
                      text: "DB Column Tagging 기능 - DB Column Key 대상 Json 기반 문서 작성 기능 구현",
                      sub: ["▸ 제품 간 동일 의미 컬럼 관계 그룹 관리"],
                    },
                    {
                      text: "LLM 대상 Context Enrichment Docs의 작성 환경 구성 & Index 기능 구현",
                      sub: ["▸ Key 단위 Json 산출물은 Key 이름으로 통칭, Obsidian Vault 내 저장 구조 설계", "▸ Hermes Agent 세션이 작업 시점에 Vault 문서를 검색 - 참조하는 외부 지식 저장소 구성", "⇒ DBViewer Tagger 내 기록된 문서의 **Hermes - Obsidian 환경 내 맥락 문서 전송 및 업데이트 기능** 구현"],
                    },
                  ],
                },
              ],
            },
            "===",
            {
              role: "QA 프로젝트",
              period: "2025.02 - 2025.05\nQA Manager",
              groups: [
                {
                  label: "EC2 라우팅 기반 Test Checklist 생성 자동화 서비스 기획 및 배포",
                  items: [
                    {
                      text: "Input 문서 토큰 핸들링 목적, Parser & Chunking 자동화 코드 작성",
                      sub: ["▸ PR 정보 기반 문서 산출 자동화, Input 토큰 Parsing 목적 자동화 코드 구현", "▸ 고용량 토큰 PR 대비, LLM Input의 Chunk 분할 및 병합을 위한 자동화 코드 구현"],
                    },
                    {
                      text: "다중 LLM API 요청, Prompt 지시에 따른 Test Checklist 생성",
                      sub: ["① PR Diff 문서 추출 후 테스트 영역에 대한 체크리스트 추출", "② PR Description 추출 후 고성능 파라미터 LLM 분석 요청", "③ 분석 내용 Stack된 문서의 한글 번역 요청 & MD 양식 변환"],
                    },
                    {
                      text: "◆ Problem",
                      sub: ["▸ PR Diff 문서의 Chunk화 이후 병합된 문서의 품질 저하 확인", "▸ 도메인 Context Enrichment Docs의 필요성 확인 - **자동 생성 문서의 맥락 손실 발견**", "⇒ 자동화 문서 결과 시험상 가치 하향 평가 / 향후 발전된 신규 프로젝트의 인사이트 발견 **(TestGate)**"],
                    },
                  ],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.12 - 2025.02\n후속 작업 26.01\nQA Manager",
              groups: [
                {
                  label: "TypeScript UI/UX 코드 내 testId 색인 작업",
                  items: [{ text: "Tailwind CSS 기반 사내 디자인 Repo (React VUI) 내 개별 UI 대상 data-testid 색인 작업", sub: ["▸ React & Flutter 기반 제품의 렌더링 구조상 테스트 대상 UI의 고정적 식별자 부재 원인 식별", "⇒ Tailwind 구조로 사내 배포 중인 사내 디자인 Repo 대상 data-testid 색인 작업 시작"] }, { text: "약제 처방 및 조제에 필요한 산술 테스트 코드 시험 도입", sub: ["▸ 기능 추가에 따른 xPath 사용에서 testid 사용 전환", "⇒ UI/UX 기반 **Playwright 테스트 코드의 유지보수 공수 감소**"] }, { text: "◆ Problem", sub: ["▸ 사내 디자인 Repo 내 data-testid 색인 작업 완료 후 **버저닝 꼬임 우려로 제품 본부 내 작업 중단 요청 발생**", "⇒ data-testid 색인 AST 자동화 코드 기반, 제품 자체 색인 자동화 후 LLM 보정 하네스 구현 (26.01)"] }],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.11 - 2025.01\nQA Manager",
              groups: [
                {
                  label: "Web - App 양방향 자동화 시나리오 구축 (Prisma · PostgreSQL)",
                  items: [{ text: "DB 내 테이블 대상 가변적 데이터 / 고정적 데이터 컬럼별 성격 정의", sub: ["▸ 자동화 테스트 계획 중 User (수의사) 또는 병원 설정에 종속되는 **상대적 독립 데이터** 리스트업", "▸ 환자 관련 데이터상 date, name, number 와 같은 **수시 작성 데이터**의 여타 테이블 종속성 리스트업"] }, { text: "환자 처방 조제에 필요한 방정식 산술 및 CRUD 관련 기능 자동화 코드 작성", sub: ["▸ 12자리 난수 생성 로직 도입, 개별 약제 계산 UI인 Datagrid Cell 자동화 테스트 계획", "⇒ Playwright 병렬 실행 테스트 코드 사용, **약제 관련 비즈니스 리스크 유발 로직에서의 품질 안정성 확보**"] }, { text: "AWS EC2 인스턴스 내 QA Test DB 구축 - Prisma · PostgreSQL 연동", sub: ["▸ Web App 간 동일 Fixtures를 QA 부서 측 PostgreSQL DB - Prisma 사용", "⇒ 축종 (개, 고양이) x 18 종류 제형 x 6 종류 측정 기준, **216개 약제 산술 케이스 자동화 검증 구현**"] }, { text: "◆ Problem", sub: ["▸ 다수 UI가 Tailwind로 렌더링된 상태, xPath 의존성이 높아 **Path 정합성을 잃는 문제 확인**", "▸ 개별 생성된 **난수의 저장 및 저장 기록에 종속된 테스트 성공 여부 기록** 공유가 모호한 상황 확인", "⇒ Datagrid Cell 약제 산술식 성공 조건, 성공 여부 DB상 업로드 및 공유 구현", "⇒ 자사 제품 내 PC & MO 환경 대상 testId 및 ValueKey 색인 작업 계획"] }],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.11 - 2024.12\nQA Manager",
              groups: [
                {
                  label: "Jenkins - Github Webhook 기반 Slack Bot 연동 이슈 리포팅",
                  items: [{ text: "사내 Github 도구 일원화 요청 - Github Project의 BTS 채택", sub: ["▸ Google 스프레드 시트 기반, 이슈 리포트 도구의 개발 본부 내 사용 어려움 확인", "⇒ **Github Project 대상 BTS 구축** - 기능 대상 이슈 그룹 정의 / **주차별 Slack Bot 알림 Cronjob 구축**"] }, { text: "이슈 그룹화 노티 - 주차별 이슈 & Major 이슈 리스트업 Cronjob", sub: ["▸ BTS상 이슈를 기능별로 엮어 수요일마다 Slack 채널 내 Jenkins 파이프라인 연동을 통해 공유", "⇒ 기획 확인이 필요하거나 결함 기준을 충족하는 UI상, **입사 전 존재하던 17건 Major 이슈 감소.**"] }, { text: "Github Webhook 연동 (1) - 경쟁사 제품 마이그레이션 팀 대상 이슈 알림", sub: ["▸ 사업부의 이슈 리포트 측 Github Issues 문서 접근 불가, 비즈니스 리스크 파악 불가한 점 확인", "⇒ Github **Issue의 Json 문서화, 전사 대상 Slack Bot 정보 공유 파이프라인** 구현"] }, { text: "Github Webhook 연동 (2) - QA 부서 측 테스트 업무 티켓 알림", sub: ["▸ PR 혹은 Iteration PR 대상, Reviewer의 QA 등록 시 QA 측 업무 요청 알림 구현"] }, { text: "중복 알림 및 에지 케이스 처리", sub: ["⇒ 개별 알림 대상 Jenkins Json 저장 후 덮어쓰기, 신규 생성 대상 추적 파이프라인 구현", "⇒ Slack Bot의 특정 채널 메시지, 쓰레드 ID, 개별 TimeStamp 추적 파이프라인 구현"] }],
                },
              ],
            },
          ],
        },
      ],
    },
    // 자기소개 섹션은 잠시 숨김. (사용자 요청 2026-11-26) 다시 쓰려면 아래 주석과 목차(toc)의 자기소개 줄 주석을 푼다.
    // {
    //   id: "s01-intro",
    //   type: "intro",
    //   heading: "소개",
    //   // 소개 본문. 경력 기술처럼 두 칸 행이다. head는 왼쪽 칸 소제목, body는 오른쪽 칸의 줄글 단락 목록이다. (단락 안 줄바꿈 가능, # 제목과 **굵게** 가능)
    //   rows: [
    //     {
    //       head: "직무상 소개",
    //       body: [
    //         "부채로 누적될 수 있는 품질 이슈를 개발 초기에 식별하는 QA 업무를 진행했습니다.\n1인 QA로서 Context Driven Testing 접근법을 적용하여, Notion을 차터 작성에 사용.\n경계값 분석, 동치 분할 테스팅 등, 테스트에 필요한 방식을 적용하며 탐색적 테스팅을 수행했습니다.\n검증은 DB 값과 Figma 명세상의 기획 의도를 기준으로 하되, True/False에 그치지 않고\n**재직 중 속도전을 중시하는 제품 전략에 알맞게 비즈니스 리스크와 Known Issue로 취급할 수 있을지 여부를 검증하는 방식**을 택하여 테스트 전략을 짜는 편이었습니다. 이러한 양상의 품질 확보가 필요하다는 점을 C레벨, 기획 및 개발 본부 측에 납득시켜 QA 부서가 없던 회사에서 QA 프로세스를 구축한 상태입니다.",
    //         "**2년 6개월 중에서 리드로서의 경력은 1년으로, 2인 팀을 리드**했습니다.\n채용 계획을 세우고, 과제를 준비하거나 인성 및 직무 면접에 임한 경험이 있습니다.\n개인 역량이나 리더의 매니징에 의존하기보다 팀원과 합의한 업무 기준을\n프로젝트 혹은 프로세스로 구현하는 방식의 리딩을 지향했습니다.\n그에 따라 자신도 팀원도 각자 업무상에서 니즈가 발생한 사이드 업무에 대한 명세를 상호 조율하고\n적절한 부서 내부 프로젝트를 진행하고 서로의 업무에 도입하는 방식으로 팀을 조율했습니다.\n뒤에 소개될 DBViewer-Tagger, Hermes-TestGate가 그러한 프로젝트의 예시가 될 것 같습니다.",
    //         "성과로는 **익명 수의사 카페에서 자사 제품이 '신뢰받지 못하는 결함이 많은' 제품의 이미지**를 가질 때.\n입사 초기부터 정상 동작이 확인된 UI 시나리오, 동작 가능한 전체 UI 시나리오의 산출을 통한 평균 지수,\n최초 진행된 테스트로 확인된 이슈들의 합산과 기능 요청상의 VOC 수치 합산인 감산 지수를 활용.\n(정상 동작 확인 시나리오 - 확인 이슈 & VOC 수)  / 전체 시나리오 = **초기 지표를 평균 72%로 추산.**\n개발 팀 협업으로 **2년 동안 92%로 향상시킨** 성과가 있습니다.\n시장에 **WOW 포인트**를 선보이는 **속도전 전략**에서 QA를 했기에 단순히 지표 수치를 높이는 것보단\n릴리즈 전 **기능 결함에 따른 비즈니스 리스크 여부, 기능별 안전 배포 기준**을 세웠습니다.",
    //       ],
    //     },
    //     {
    //       head: "직무상 특징",
    //       body: [
    //         "프로젝트 안팎으로 사업부 - 기획 본부 - 개발 본부의 세 의견을 조율하는 **결절점**을 맡았습니다.\nAPI가 갓 달린 프로젝트 대상으로 조기 테스트를 해보며 기획과 개발에서의 의도를 파악하는 등\nShift-Left 방식의 업무를 선호하여 기획 및 개발 중 리스크의 조기 식별 업무에 능숙합니다.\nDB 내 테이블별로 UI/UX상에서의 기대 결과 값을 검증하는 방식으로 임하거나\n테스트 기법을 활용함에 경계값 분석을 할지, 창의성에 기반하여 계획을 고려하고 빠르게 실행합니다.\nQA 업무에서 가장 중요한 의의는 지식의 저주를 해결하면서, 문제를 객관적 관점으로 볼 수 있게끔\n이슈를 레이즈하고 제품 외, 사내 차원에서의 프로세스 결함에 대해 논하는 것임을 인지하고 있습니다.",
    //         "상대적 경험 공백이 발생한 부분은 **재직 중 API 테스트, 비기능적 테스트를 담당하지 않은 점입니다.**\n전 직장에선 BE 팀의 R&R에 속한 업무였으며, 재직 중 주된 테스트 흐름은 UI/UX에서의 확인 및\n그에 대응되는 DB에서의 Row 값 변화 정합성 검증이었습니다.\n적어도 **API 테스트의 경우**엔 퇴사 후 직접 웹 데모를 포크하여, 일부 기능을 개선해둔 프로젝트에서\nUI/UX & API 자동화 테스트를 혼용한 구조를 설계 및 시험을 진행했습니다.",
    //       ],
    //     },
    //     {
    //       head: "향후 목표",
    //       body: [
    //         "QA의 업무에서 테스트란 목적이 아닌 수단으로 존재해야 한다고 생각합니다.\n테스트를 통해 제품의 정보를 수집하고, 품질 개선에 필요한 인사이트를 도출하되, 명확한 기대 결과를 정의할 수 있는 반복적인 검증은 자동화하고자 하는 갈망이 있습니다. 다만 이러한 갈망은 단순히 자동화를 도입하고 싶다는 희망에 그치지 않고, 직무적 야망으로 발전하게 되었습니다.",
    //         "QA 스스로 수행하던 '테스트가 목적이 되는 업무'를 시스템으로 대체하고, 궁극적으로 기존의 R&R을 제품의 품질 향상과 인사이트 도출이라는 관점에서 재정의하는 것. 이것이 앞으로 QA가 추구해야 할 직무적 가치 중 하나가 아닐까 생각하게 되었습니다.",
    //         "이를 실현하기 위해 현재 **세 가지 목표**를 상정하고 있습니다.",
    //         "**첫째, 기존 품질 보증의 성과를 유지하면서 검증 업무를 시스템에 위임합니다.** 반복적인 검증과 정합성 확인은 시스템에 위임, 기존 품질 수준을 유지하고 개선하면서도 QA가 직접 투입하는 공수를 줄이고자 합니다.",
    //         "**둘째, QA의 공수를 제품 가치의 향상으로 집중합니다.** QA가 단순히 결함을 발견하는 데 머무르지 않고, 고객의 잠재적 요구와 제품의 구조적 문제를 발견하여 개선 방향을 제시하고, 제품 가치의 향상에 크게 기여하는 선순환을 꾀합니다.",
    //         "**셋째, QA 개인이나 부서에 종속되지 않는 품질 관리 시스템을 구축합니다.** 자동화 시스템을 만들며, 특정 QA 개인이나 부서의 업무를 보조하는 도구로만 남는 것이 아니라, 제품 및 기업 차원에서 관리하고 지속적으로 운영할 수 있는 체계로 정착하는 것을 목표로 합니다.",
    //         "QA 스스로 기존 업무의 변화를 주도하고, 기존 업무의 종식까지 설계할 수 있어야 한다고 생각합니다.\n자동화 테스트를 도입해야 한다는 주장처럼 들릴 수도 있으나, 제가 지향하는 목표는\n본질적으로 회사에서 수여하는 '테스터, 균질한 품질 보증' R&R에서의 성과는 유지하되\n그 공수와 역할을 줄이고 제품 품질 자체에 몰두하는 것을 목적하고 있음을 말씀드리고 싶습니다.",
    //         "궁극적으로는 QA가 자신의 업무를 시스템으로 대체하고\n기존의 역할을 스스로 해체함으로써 근본적인 품질 문제를 다룰 수 있도록 조성함을 목적합니다.",
    //       ],
    //     },
    //     "===",
    //   ],
    // },
    // 기타 섹션은 잠시 숨김. 다시 쓰려면 아래 주석을 푼다. (번호 s05는 다시 쓰지 않는 규칙이라 지우지 않는다.)
    // {
    //   id: "s05-etc",
    //   type: "etc",
    //   heading: "기타",
    //   items: [""],
    // },
    {
      id: "s03-projects",
      type: "projects",
      heading: "프로젝트",
      // 갤러리 위의 작은 안내 문구. 넓은 화면에서만 보이고 인쇄와 모바일에서는 나오지 않는다.
      notice: "*인쇄에선 갤러리 UI 형태 대신, 일반적인 평문 문서로 출력됩니다.",
      cards: [
        {
          no: 1,
          title: "Web - App 자동화 테스트 예제 프로젝트",
          summary: "Cypress.io 팀 웹데모 대상\n자동화 테스트 구현 시연",
          blocks: [
            {
              type: "image",
              src: "/images/project-1-hd-1.png",
              alt: "Cypress 웹 데모를 대상으로 github-app, hermes-test-gate, DBViewer-tagger가 이어지는 테스트 흐름 구성도",
            },
            {
              type: "image",
              src: "/images/project-1-hd-2.png",
              alt: "React 웹과 Flutter 앱의 UI·API 병행 테스트 코드, PostgreSQL(Prisma), 테스트 계층을 나타낸 구성도",
            },
            {
              type: "head",
              title: "Web - App 자동화 테스트 예제 프로젝트",
              links: [
                {
                  label: "Web Repo",
                  url: "https://github.com/wonderwall1995/cypress-realworld-for-portfolio",
                },
                {
                  label: "App Repo",
                  url: "https://github.com/wonderwall1995/cypress-realworld-for-portfolio-mobile",
                },
                {
                  label: "Web 배포 링크",
                  url: "https://demo.hwk-resume.web.chickenkiller.com/",
                },
                {
                  label: "App 릴리즈 링크",
                  url: "https://github.com/wonderwall1995/cypress-realworld-for-portfolio-mobile/releases",
                },
              ],
            },
            {
              type: "text",
              rows: [
                {
                  head: "문제 프레임",
                  body: [
                    "실질적인 목표는 **자동화 테스트 코드의 구조**를 자신이 어떻게 다루는지 보이고 싶었습니다.\n원래 존재하던 **Cypress.io 측에서 MIT 라이선스로 배포 중인 웹 데모를 개량.**\n기능 개선을 Web Repo에서 마치고, Web에서의 기능을 따와 Flutter Native 앱으로도 구현했습니다.",
                  ],
                },
                {
                  head: "설계",
                  body: [
                    "테스트 코드는 배포된 Web에서 실제 어떻게 실행되는지 **Playwright 실행을 모방**하여 진행합니다.\n배포된 웹에서 개별 테스트 코드에 대한 조회와 테스트 진행에 대한 시연을 보는 것이 가능합니다.\n시연은 data-testid 색인된 UI 대상으로 자동화 테스트가 진행되며, 동시에 API 테스트 코드를 통한 검증을 혼합합니다. UI/UX 자동화 코드가 변경에 취약한 점이나, API 테스트 코드가 렌더링되는 UI 대상으로는 검증이 미비할 수 있는 점을 **UI/UX 및 API 자동화 테스트 방식이 혼합된 테스트 코드를 하나로 작성**함으로써 보완하는 시도입니다.",
                    "App에서의 자동화 테스트는 Appium + Wdio 방식으로 구현되었으며,\nWeb 측의 데모 제품과 기능이 대부분 일치합니다.\n테스트에 사용되는 값(Fixture)을 사용하는 면에서는 Prisma + PostgreSQL 측에 **자동화 테스트를 위한 DB 내, Fixture를 생성할 때 이를 기록**하고 테스트 코드에 특정되는 Row 값을 Fixture로서 삽입하는 방식으로 Web과 App에서의 자동화 테스트 시나리오가 깨지지 않게끔 시도했습니다.",
                    "Web에서의 Playwright 사용으로 크게 세 개의 테스트 코드를 나눠둔 상태입니다.\n하나는 .ts 확장자를 가지는 '공용 테스트', 같은 .ts 확장자를 가지는 'API 테스트' 그리고 실제 Playwright CLI 명령어로 실행시키는 .spec.ts 테스트 코드로 나뉩니다.\n개별 .spec.ts 코드는 **Playwright가 가지는 병렬적 실행이 가능하다는 장점을 활용**, .spec.ts **테스트 코드 간 병목이나 종속성을 가급적 배제한 상태**로 테스트를 실행합니다.",
                  ],
                },
                {
                  head: "아쉬운 점",
                  body: [
                    "앞서 거론된 **공용 테스트** 코드, **API 테스트** 코드의 경우에도\n실패와 성공에 대해서 따로 세심하게 기록을 하면 좋겠다는 생각도 있습니다.\n조금 더 해볼 수 있다면 Grafana와 Test Record가 든 스키마 혹은 테이블 측면을 연결.\n**개별 .spec 테스트 코드 이외의 코드들도 실제 성공 및 실패 여부를 그려내는 것**도 해보면 좋지 않을까,\n그런 아쉬움이 있습니다. - **현재 과다 스펙이라 여겨진 구상**입니다.",
                  ],
                },
                {
                  head: "Keep",
                  body: [
                    "- 재직 중에 경험하지 못한 API 테스트 코드의 구현 방식을 본 프로젝트에서 학습할 수 있었습니다.\n- UI/UX 및 API 자동화 테스트가 가지는 단점을 상호 보완하는 시도가 좋았다고 판단됩니다.",
                  ],
                },
                {
                  head: "Problem",
                  body: [
                    "1. Mocking이나 데이터 흐름 테스트에 대한 요소도 익혀 나가야 할 것 같습니다.\n2. Jmeter와 같은 테스트 도구로 비기능적인 부분을 테스트하면 좋겠다는 생각이 있습니다.",
                  ],
                },
                {
                  head: "Try",
                  body: [
                    "- App에는 Web과 동일 기능을 가지는 것 이외, 독자적인 기능을 추후에 넣는 것도 필요할 것 같습니다.\n- 복잡한 테스트를 적용하기엔 아직 웹 앱 데모의 개발 내용이 많지 않아 추후에 시도해보고자 합니다.",
                  ],
                },
              ],
            },
          ],
        },
        {
          no: 2,
          title: "GitHub App",
          summary: "GitHub 이벤트를 Hermes Agent와 개별 프로젝트에 전달하는 통로\nPR 코멘트 명령어(/qa) 감지 및 결과 게시",
          blocks: [
            {
              type: "image",
              src: "/images/project-2-hd-1.png",
              alt: "GitHub 웹훅이 Cloudflare Worker와 노트북 Node 서버를 거쳐 Hermes로 전달되는 GitHub App 구조도",
            },
            {
              type: "head",
              title: "GitHub App",
              links: [
                {
                  label: "GitHub Repo",
                  url: "https://github.com/wonderwall1995/github-app",
                },
              ],
            },
            {
              type: "text",
              rows: [
                {
                  head: "문제 프레임",
                  body: [
                    "재직 중이던 회사에선 대부분의 자동화 서비스를 GitHub 또는 Slack으로 집중시켰습니다.\nJenkins를 Hermes Agent 휘하의 자동화 파이프라인으로 사용하기도 했었으며,\n그러한 프로젝트들이 퇴사 후 회사의 재산이 됨에 따라 일종의 프로젝트 유기성을 위한 보드, 메시지 창구 혹은 그것을 날라다 주는 우편함 같은 개념으로 GitHub App 프로젝트가 하나 필요했습니다.\n**Github 측 이벤트 및 정보를 개별 프로젝트에 전달하는 역할의 소형 프로젝트입니다.**",
                  ],
                },
                {
                  head: "설계",
                  body: [
                    "/qa 혹은 /qa free: 이와 같은 명령어를 Pull Request 측에서의 코멘트로 감지합니다.\n그에 따라 /qa의 경우엔 테스트 커버리지를 충족시킬 생성 문서를 출력하는 **'창구'**\n/qa free: 는 Hermes 내부 하위 에이전트인 Claude Code와 대화를 할 수 있는 기능을 가집니다.\n**주로 GitHub Webhook을 받기 위한,** 그리고 **여타 프로젝트 구현에 따른 작동을 위한** 프로젝트입니다.",
                  ],
                },
                {
                  head: "기타",
                  body: [
                    "**현 프로젝트 기능은 Slack Bot, Linear, Notion으로도 연계**가 가능합니다.\n그러한 제품군이 공개적으로 쓰기에는 적절치는 않아 GitHub App을 단독 사용한 상태입니다.",
                  ],
                },
              ],
            },
          ],
        },
        {
          no: 3,
          title: "헤르메스 - 테스트 게이트",
          summary: "Hermes Agent - Claude Code 연동,\n테스트 문서 생성 자동화 & 테스트 문서 평가 자동화",
          blocks: [
            {
              type: "image",
              src: "/images/project-3-hd-1.png",
              alt: "github-app, DBViewer-tagger, Cypress 웹·모바일과 Hermes Agent, QA를 잇는 맥락 문서 수용과 분석 흐름 구성도",
            },
            {
              type: "image",
              src: "/images/project-3-hd-2.png",
              alt: "hermes-ced-taker, hermes-controller, hermes-test-gate 세 프로젝트의 처리 단계 구성도",
            },
            {
              type: "head",
              title: "헤르메스 - 테스트 게이트",
              links: [
                {
                  label: "hermes-ced-taker Repo",
                  url: "https://github.com/wonderwall1995/hermes-ced-taker",
                },
                {
                  label: "hermes-controller Repo",
                  url: "https://github.com/wonderwall1995/hermes-controller",
                },
                {
                  label: "hermes-test-gate Repo",
                  url: "https://github.com/wonderwall1995/hermes-test-gate",
                },
              ],
            },
            {
              type: "text",
              rows: [
                {
                  head: "문제 프레임",
                  body: [
                    "QA 리드로 발탁된 직후 세운 첫 목표는 **팀원의 성과를 상향 평준화하는 것**이었습니다.\n배포된 Test Checklist 생성 프로세스가 Legacy가 된 상황이었고, 로컬 LLM 사용에 따른 실효성이 떨어졌기에, **사람이 진행한 테스트를 고성능 LLM이 평가할 수 있도록 해보는 것**이 목표가 되어 진행했던 프로젝트였습니다.\n큰 원동력은 Hermes가 실제 '오케스트레이터 및 웹훅' 역할이 가능하다는 점.\nHermes 내부의 Claude Code 활용이 API 종량제 호출 외 사용이 가능하다는 점이 있었습니다.",
                  ],
                },
                {
                  head: "설계",
                  body: [
                    "- ced-taker는…\n후에 소개될 **프로젝트④**에서 User 개인이 작성한 **Context Enrichment Docs(이하 CED)**를\nHermes - Obsidian Vault 측에 구축하고, 이것을 분석 전 **'참조 문서'**로 제공합니다.\n재직 중 Legacy가 된 Test Checklist 생성 자동화는 '테스트의 경중을 모른다.', '맥락을 모른다.'\n두 개의 큰 이슈가 있었고, **큰 프로젝트에서 자동 생성된 문서는 신뢰가 불가능한 단순 참조 문서였습니다.**\nced taker로 **이런 이슈를 해결**합니다.\nTest에 필요한 맥락 문서를 LLM에게 줄 수 있는 캐시 저장, 전송 역할로 설계되었습니다.",
                    "- controller는…\nHermes 내부의 **프로젝트들이 서로를 몰라야 한다는 의도로 만들어진 중간 허브(hub)**입니다.\n에이전트 내부의 프로젝트들을 잇고, **프로젝트가 서로 독립성을 갖게끔 만드는 의도**입니다.\n향후 API 테스트 코드를 자동으로 생성하게끔 맡겨 본다든가 하는 구상이 있습니다.\nced-taker와 test-gate가 다른 프로젝트에서 인용될 수 있게 미리 만들어둔 중간 다리 프로젝트입니다.",
                    "- test-gate는…\ngithub-app이 가져온 Diff를 분석합니다. Claude Code를 호출하는 기능이 있습니다.\nGitHub의 Pull Request 측 코멘트를 기억하고, 작성하고, 수정하는 역할을 겸하고 있습니다.\n테스트에 대한 보고서 / 테스트 커버리지 충족 여부에 대한 조언, 그와 같은 내용을 HTML로도 제공하고 있습니다.",
                  ],
                },
                {
                  head: "아쉬운 점",
                  body: [
                    "이전 재직 중이던 회사에서 기획하고 구현을 앞두고 있었으나, 퇴사를 결정하면서 생긴 문제는\n실제로 본 프로젝트가 얼마나 효용 가치를 지녔는지 정성적인 성과, 정량적인 평가가 없다는 점입니다.\n**다수의 User 대상으로 라이브 서비스 중인 제품 대상으로 적용해본 적이 없다는 점**이 가장 아쉽습니다.",
                  ],
                },
                {
                  head: "Keep",
                  body: [
                    "- Hermes를 오케스트레이터, 파이프라인으로 사용하는 점에서 넓은 활용성을 기대하게 되었습니다.\n- 복잡도가 높은 제품 대상으로 바로 시험을 해볼 수 있을 프로젝트를 완결한 점이 흡족스럽습니다.",
                  ],
                },
                {
                  head: "Problem",
                  body: [
                    "1. 퇴사 이슈 외적으로, 반증과 ROI 같은 성과 계측이 있었다면 좋았겠다는 생각을 하게 됩니다.\n2. 일반적인 Test Checklist 자동화 생성과 크게 거리를 둘 수 있는 프로젝트인지는 스스로 의문입니다.",
                  ],
                },
                {
                  head: "Try",
                  body: [
                    "- 테스트 코드 생성의 공장화 같은 추가적인 프로젝트를 만들 수도 있겠단 기대가 듭니다.\n- 개인의 니즈 기반 서비스 구현을 Hermes 환경하에 진행해보는 시도를 꾸준히 해보고자 합니다.",
                  ],
                },
              ],
            },
          ],
        },
        {
          no: 4,
          title: "DBViewer-tagger - DB 기반 LLM 맥락 문서 작성",
          summary: "DB 테이블 스냅샷 기반 DB 컬럼 대상 정보 색인\nDB Key 정보 작성, 문서화 및 LLM 맥락 문서 작성\nHermes Agent - Obsidian 환경 전송",
          blocks: [
            {
              type: "image",
              src: "/images/project-4-hd-1.png",
              alt: "PostgreSQL 스냅샷에서 DBViewer-tagger와 Obsidian 볼트를 거쳐 hermes-ced-taker, hermes-test-gate로 맥락 문서가 전달되는 흐름도",
            },
            {
              type: "image",
              src: "/images/project-4-hd-2.png",
              alt: "DB·CSV 수집부터 볼트 전송까지 DBViewer-tagger의 8단계 작업 흐름도",
            },
            {
              type: "head",
              title: "DBViewer-tagger, DB 기반 LLM 맥락 문서 작성 도구",
              links: [
                {
                  label: "GitHub Repo",
                  url: "https://github.com/wonderwall1995/dbviewer-tagger",
                },
                {
                  label: "배포 주소",
                  url: "https://dbtagger.hwk-resume.web.chickenkiller.com/",
                },
              ],
            },
            {
              type: "text",
              rows: [
                {
                  head: "문제 프레임",
                  body: [
                    "재직 중 사내 서비스 중에서 디자인을 공통으로 사용하는 시스템 자체는 있었으나,\n**동물병원 및 의료 차트 도메인** 측면에서 사용되는 **도메인 용어**에 대한 시스템은 없다는 점을 확인.\n이런 니즈가 OJT 문서 그리고 기획 명세를 이해하는 데 필요하다고 판단되어 구축하는 중, 사내 DB에서 개별 Table이 가진 값이 도메인 용어나 다름없다는 점에서 개별 값에 대한 의미, 의도, 작동 방식 그와 같은 **정보를 문서 중앙화하는 작업**을 할 수 있게끔 본 프로젝트를 시작하게 되었습니다.",
                  ],
                },
                {
                  head: "설계",
                  body: [
                    "DB 컬럼 자체가 일종의 도메인 용어라는 점에 착안하여 DB 스냅샷을 CSV로 불러오는 방식을 채택했습니다. **개별 컬럼에 대한 설명을 User가 직접 작성하여 .JSON으로 파싱하고, 파일을 모아 일종의 백과를 만듭니다.** 어떤 스키마 - 테이블에 쓰였는지, 따로 기획 명세 키워드, 값 의미에 대해서 작성하는 구조로 작성 구조가 단순합니다.",
                    "User는 이를 통해 DB에서 발췌한 용어들로 OJT 문서를 만드는 것부터 LLM에게 작업 전 참조시킬 수 있는 제품 도메인 용어에 대한 참조 문서를 좀 더 쉽게 만들 수 있는 환경을 갖습니다.",
                    "시연된 내용은 이러한 CED(Context Enrichment Docs)를 Local로 다운로드 받는 기능만 있지만,\n**의도로는 CED를 Hermes와 연동된 Obsidian Vault로 보내는 것을 상정**합니다.\n*시연에 따른 몇 가지 기능들은 일부러 비활성화시킨 상태입니다.",
                  ],
                },
                {
                  head: "아쉬운 점",
                  body: [
                    "아쉬운 점은 본 프로젝트가 완성되기 직전 퇴사하여 다른 인원의 평가나 피드백을 받지 못한 점입니다.\n추가로 UI 설계에서 Datagrid 이외, 기능 확장성의 여지를 남겨 두었으면 하는 아쉬운 점이 있습니다.",
                  ],
                },
                {
                  head: "Keep",
                  body: [
                    "- 본 프로젝트로 하여금 Glue Work를 쉽게 할 수 있다는 자신이 생겼습니다.\n- 업무에 있어 자신에게 발생하는 니즈가 인사이트가 될 수 있음을 자각했습니다.",
                  ],
                },
                {
                  head: "Problem",
                  body: [
                    "- Electron App 실행을 최초 의도하여, 일부 기능에서의 Disabled가 필요했습니다.",
                  ],
                },
                {
                  head: "Try",
                  body: [
                    "- 본 프로젝트 기준으로 '프레임워크 단위'의 QA 프레임워크 발전 가능성을 모색해야겠습니다.\n- Grafana, Hermes 보드, Pull Request의 Clone 형태 read-only 보드, etc를 상정해봅니다.",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  footer: { text: "" },
};
