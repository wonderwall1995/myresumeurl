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
    { label: "경력", target: "s02-career" },
    { label: "경력(Demo)", target: "s09-career-demo" },
    { label: "자기소개", target: "s01-intro" },
    { label: "프로젝트", target: "s03-projects" },
  ],
  header: {
    name: "홍웅기 | QA",
    photo: { src: "/images/profile-sample.svg", alt: "프로필 사진 (샘플)" },
    // 연락처 Body. 사진 오른쪽에 한 줄씩 나열된다.
    contact: ["ltwayne0@gmail.com", "010-5163-3024", "https://github.com/wonderwall1995", "www.linkedin.com/in/hwk5070252b6"],
    // About me. 사진과 연락처 줄 아래에 나오는 별도 영역. 단락은 문자열(줄바꿈은 \n)이다.
    about: {
      heading: "About me…",
      text: [
        "**저는…**\n동물병원 의료 차트(EMR) 기반 스타트업, 벳칭에서 2년 6개월을 근무한 홍웅기입니다.\n입사 초기 VOC, 이슈, 테스트 범주 대비 72%의 제품 품질 지표 정의 후 협업을 통해 92%로 향상시킨 재직 중 경험.\n개발 6개월이 소요된 메신저 프로젝트 릴리즈 이후, 이슈 및 VOC 대비 98%의 무결성을 달성한 성과.\n경쟁사 제품 마이그레이션 데이터 대상, 무결성 수치를 최초 67% 정의, 82%까지 협업하여 향상시킨 성과.\nQA Lead로 임명되어 2인 팀을 구성, 팀과 개인이 필요한 자동화 프로젝트 및 Agent의 구축 경험이 있습니다.",
        "**업무 개요**\n- QA가 없던 40인 미만 스타트업에서 QA 0 to 1 프로세스 확립을 해본 경험이 있습니다.\n- 전문직 대상 EMR, CRM, ERP 의료 Web/App SaaS 제품에 대한 총괄 품질 책임을 담당했습니다.\n- Shift-left 기반의 QA 업무를 선호하여, PR 단위를 묶은 Iteration 개별로 제품 QA를 진행했습니다.\n- Lead로 발탁된 이후 1년 동안 2인 팀을 조직하여 운영한 경험이 있습니다.\n- 복약 지도 & 마약류 관리 프로세스와 같은 비즈니스 리스크를 야기할 기능의 품질 보증 경험이 있습니다.\n- Agent 도입 시 LLM이 참조할 업무 맥락의 기록, 프로젝트 간 오케스트레이션에 비중을 둡니다.\n- 정성적 QA 업무를 UI/UX 기반 정량적 평가로 치환하여 공유하는 일에 관심이 높습니다.\n- 극단적 시한의 프로젝트에서 비즈니스 리스크 및 기능별 Failsafe 범주에 대한 정의 후 릴리즈 경험이 있습니다.\n- 자율적인 업무에서 자동화 프로세스 빌드업을 위한 인프라 업무(TestID 색인 등)를 선호합니다.\n- LLM의 문서 생성 자동화에 앞서, 작성된 문서 평가의 자동화(TestGate)를 선호합니다.",
      ],
    },
  },
  sections: [
    {
      id: "s02-career",
      type: "career",
      heading: "경력",
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
      // 관심 분야 글은 실행 분야 바로 아래에 나온다. text의 문자열은 단락, 배열은 글머리 목록이다. (아래 내용은 자리 표시용 샘플이다. 실제 글로 바꾼다.)
      focus: {
        heading: "관심 분야",
        text: [
          "Grafana, Jmemter, ",
          ["(샘플) 글머리 항목 1", "(샘플) 글머리 항목 2"],
        ],
      },
      cards: [
        {
          no: 1,
          company: "벳칭 (Vetching)",
          // 기업명 아래에 한 번 나오는 설명 (제품)
          description: "**B2B 동물병원 EMR - CRM - ERP Web/App 차트**\n**(PlusVet · PlusVetM)**",
          // 직책이 바뀐 경력. 직책마다 묶음(소제목과 항목 목록)이 나온다.
          roles: [
            {
              role: "QA Lead",
              period: "2025.09 - 2026.08\n(1년)",
              groups: [
                {
                  label: "프로세스",
                  items: [
                    "QA 팀 일일 업무 스크럼 운영",
                    "사내 타운홀 미팅 QA 자료 제작 및 발표",
                    "팀 내 사이드 프로젝트 명세 정의",
                    "인력 관리 및 평가",
                  ],
                },
                {
                  label: "프로젝트",
                  items: [
                    "고객 병원 세무 · 회계 편의 목적 통계 산출 프로젝트",
                    "대형 병원 분점 그룹화 기획, UI - DB 간 데이터 정합성 검증",
                    "메신저 · 알림 스레드 UI 통합 건 - 환축 · 차트 · 수의사 멘션 연동 및 알림 타임라인 정합성 검증",
                    "Mobile 펜 차트 프로젝트 사용성 및 기기 호환 검증",
                    "AI 레코드 - 녹음 · 차트 작성 · LLM 요약 자동화 프로젝트",
                  ],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "AST 자동화 코드 기반 testId 색인 서비스 배포",
                    "Hermes Agent 기반 팀 업무 보고 자동화 · 프로젝트 오케스트레이션 초기 구축",
                    "DB Key Tagger - DB 컬럼 CSV Parser, LLM 맥락 문서화 프로젝트 기획",
                    "Context docs & PR Diff 기반 테스트 결과 평가 서비스 TestGate 기획 및 배포",
                  ],
                },
              ],
            },
            {
              role: "QA Manager",
              period: "2024.03 - 2025.09\n(1년 6개월)",
              groups: [
                {
                  label: "프로세스",
                  items: ["Context Driven - Shift-Left QA 업무 프로세스 확립", "비즈니스 리스크 기반 기획 검수", "제품 품질 지표 정의 및 계측 문서화 C 레벨 보고", "제품 별 테스트 케이스 · 시나리오 작성", "App/Web 제품 릴리즈 책임", "제품 본부 입사자 대상 제품 OJT 책임"],
                },
                {
                  label: "프로젝트",
                  items: [
                    "수의사 및 환자 스케줄링 관리 시스템",
                    "Naver 예약 · LG AICC 콜센터 스케줄링 연동 검증",
                    "통원 · 입원 의무 차트 사용성 검증",
                    "원내 약물 조제 및 처방 산술 프로세스",
                    "고객 및 환자 연락 관리(CRM) 프로세스",
                    "원내 그룹 채팅 · DM 메신저 시스템",
                    "리셉션 수납 및 결제 시스템 개선",
                    "약물 재고 및 처방 관리(ERP) 시스템",
                    "NIMS 연동 마약류 구매 · 투약 · 폐기 프로세스 유지보수",
                    "서드파티 영상 및 검진 장비 연동 검증",
                    "예약자 대기 현황 표기 웹 프로젝트 · 태블릿 자동 접수 앱 시스템 검증",
                  ],
                },
                {
                  label: "사업 영역",
                  items: ["거래처 · 대학 병원 대상 경쟁 제품 마이그레이션 데이터(CSV) 무결성 검증 책임"],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "TypeScript UI/UX 코드 내 testId 색인 작업",
                    "Web - App 양방향 자동화 시나리오 구축 (Prisma · PostgreSQL)",
                    "Jenkins 트리거 & GitHub Webhook 기반 Slack Bot 업무 · 이슈 알림 일원화",
                    "서버 라우트 기반 테스트 체크리스트 리뷰 서비스 배포",
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
    // 경력(Demo). 경력(s02-career)의 벳칭 카드를 복사한 구역이다. 새 구조의 경력을 작성하는 용도이다. 관심 분야는 복사하지 않았다.
    // [작성 예시] 직책별 행 + 역할 / 성과 / 주요 프로젝트 순서. 성과 줄은 자리 표시용 샘플이다. (사실이 아님)
    {
      id: "s09-career-demo",
      type: "career",
      heading: "경력(Demo)",
      cards: [
        {
          no: 1,
          company: "벳칭 (Vetching)",
          description: "**B2B 동물병원 EMR - CRM - ERP Web/App 차트**\n**(PlusVet · PlusVetM)**",
          roles: [
            {
              role: "QA Lead",
              period: "2025.09 - 2026.08\n(1년)",
              groups: [
                {
                  label: "역할",
                  items: [
                    "2인 QA 팀 구성 및 운영 (일일 스크럼, 인력 관리 및 평가)",
                    "사내 타운홀 미팅 QA 자료 제작 및 발표",
                    "팀 내 사이드 프로젝트 명세 정의",
                  ],
                },
                {
                  label: "성과",
                  items: ["샘플 성과 - 샘플 원인(배경)에서 샘플 행동으로 샘플 수치 개선"],
                },
                {
                  label: "주요 프로젝트",
                  items: [
                    "대형 병원 분점 그룹화 기획, UI - DB 간 데이터 정합성 검증",
                    "메신저 · 알림 스레드 UI 통합 건 - 환축 · 차트 · 수의사 멘션 연동 및 알림 타임라인 정합성 검증",
                    "AI 레코드 - 녹음 · 차트 작성 · LLM 요약 자동화 프로젝트",
                    "그 외: 고객 병원 세무 · 회계 통계 산출, Mobile 펜 차트 사용성 및 기기 호환 검증",
                  ],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "AST 자동화 코드 기반 testId 색인 서비스 배포",
                    "Hermes Agent 기반 팀 업무 보고 자동화 · 프로젝트 오케스트레이션 초기 구축",
                    "DB Key Tagger - DB 컬럼 CSV Parser, LLM 맥락 문서화 프로젝트 기획",
                    "Context docs & PR Diff 기반 테스트 결과 평가 서비스 TestGate 기획 및 배포",
                  ],
                },
              ],
            },
            {
              role: "QA Manager",
              period: "2024.03 - 2025.09\n(1년 6개월)",
              groups: [
                {
                  label: "역할",
                  items: [
                    "Context Driven - Shift-Left QA 업무 프로세스 확립",
                    "비즈니스 리스크 기반 기획 검수, 제품별 테스트 케이스 · 시나리오 작성",
                    "제품 품질 지표 정의 및 계측 문서화 C 레벨 보고",
                    "App/Web 제품 릴리즈 책임, 제품 본부 입사자 대상 OJT 책임",
                  ],
                },
                {
                  label: "성과",
                  items: ["샘플 성과 - 샘플 원인(배경)에서 샘플 행동으로 샘플 수치 개선"],
                },
                {
                  label: "주요 프로젝트",
                  items: [
                    "수의사 및 환자 스케줄링 관리 시스템",
                    "Naver 예약 · LG AICC 콜센터 스케줄링 연동 검증",
                    "NIMS 연동 마약류 구매 · 투약 · 폐기 프로세스 유지보수",
                    "그 외: 통원 · 입원 의무 차트, 약물 조제 · 처방, CRM, 그룹 채팅 · DM 메신저, 리셉션 수납 · 결제, 약물 재고 · 처방(ERP), 서드파티 장비 연동, 예약 대기 현황 웹 · 태블릿 접수 앱 검증",
                  ],
                },
                {
                  label: "사업 영역",
                  items: ["거래처 · 대학 병원 대상 경쟁사 제품 마이그레이션 데이터(CSV) 무결성 검증"],
                },
                {
                  label: "부서 내부 프로젝트",
                  items: [
                    "TypeScript UI/UX 코드 내 testId 색인 작업",
                    "Web - App 양방향 자동화 시나리오 구축 (Prisma · PostgreSQL)",
                    "Jenkins 트리거 & GitHub Webhook 기반 Slack Bot 업무 · 이슈 알림 일원화",
                    "서버 라우트 기반 테스트 체크리스트 리뷰 서비스 배포",
                  ],
                },
                {
                  label: "문서",
                  items: ["TIPS 연구 일지 작성"],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2025.02 - 2025.05\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "AWS EC2 라우팅 기반 TestCheklist 생성 자동화 프로젝트 기획 및 배포",
                  items: [
                    {
                      text: "Input 문서 토큰 핸들링 목적, Parser & Chunking 자동화 코드 작성",
                      sub: ["⇒ PR Diff, PR Description 정보로 하여금 LLM 모델 별 Input 가용 토큰 Parsing 하는 자동화 코드 기획", "⇒ 12k 토큰 이상 PR Diff 문서 대비, LLM Input의 Chunk 분할 및 병합을 위한 자동화 코드 기획"],
                    },
                    {
                      text: "다중 LLM API 요청, Prompt 지시에 따른 Test Checklist 생성",
                      sub: ["▸ EC2 환경 Node.js (PM2) 서버 동작 & CLI 사용 서버 호출 스크립트 구축", "① PR Diff 문서 추출 후 테스트 영역에 대한 체크리스트 추출", "② PR Description 추출 후 고성능 파라미터 LLM 분석 요청", "③ 제품 Context Enrichment Docs (Json Index Wiki) 분석 요청", "④ 분석 내용 Stack 된 문서의 한글 번역 요청 & MD 양식 변환"],
                    },
                    {
                      text: "한계점",
                      sub: ["◆ **Problem**", "▸ LLM 모델 간 성능 편차에서 **Local LLM이 가진 기능상 한계 확인**", "▸ PR Diff 문서의 Parsing"],
                    },
                  ],
                },
              ],
            },
            {
              role: "제품 프로젝트",
              period: "2025.01 - 2025.06\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "EMR - 동물병원 원내 DM & 그룹 채팅방 메신저 기능 프로젝트",
                  items: [
                    {
                      text: "Discord & Kakaotalk 대상 레퍼런스 대비 기획상 기능 편의 리뷰",
                      sub: ["▸ Floating 기능, 서버 내 메시지 관리 정책, 유저 및 차트 멘션 기능 대상 타임 스탬프 별 표기 정책 리뷰\n"],
                    },
                    {
                      text: "결정 테이블 & 경계값 분석 기반 기획 정책의 개발 내용 대상 검증",
                      sub: ["▸ 결정 테이블 테스트 시행에서 미디어 저장 및 재생 기능, 메시지 수정 및 삭제 정책에서 에지 케이스 검증", "▸ 채팅 내 스크롤링 편의 상 한계점, 입력된 채팅 길이에 따른 경계값 기준 결함 이슈 리포트", "⇒ **릴리즈 전** 51개의 버그성 이슈 탐지, 약 240 TestCase 작성"],
                    },
                    {
                      text: "신설 메시지 서버 측(MongoDB) 관련 이슈 탐지",
                      sub: ["▸ 데이터 정합성 결함 및 실시간 메시지 서버 결함 **릴리즈 전** 탐지", "▸ DM 채팅이 디바운스 타이밍 사이에 그룹 채팅으로 바뀌는 방어 로직 부재 탐지", "⇒ 메시지 서버 대상 실시간 Subscription 관련 이슈의 탐지 및 리포트", "⇒ 메시지 검색의 중복 혹은 편의상 비표준 동작, 같은 유저가 복수로 메신저에 나타날 수 있는 문제 리포트"],
                    },
                  ],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.12 - 2025.01\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "TypeScript UI/UX 코드 내 testId 색인 작업",
                  items: [{ text: "Tailwind CSS 기반 React VUI (Repo) 내 개별 UI 대상 data-testid 색인 작업", sub: ["▸ 자동화 테스트에서 Path를 일종의 정착지로 정의 / 해당 Path의 고정적 주소의 필요성 제기", "▸ 외부 라이브러리로 구축된 UI 대상 (react-datagrid) 선별 작업", "⇒ Tailwind 구조로 사내 배포중인 React VUI (Repo) 대상 data-testid 색인 작업 시작"] }, { text: "약제 처방 및 제조에 필요한 산술 테스트 코드 시험 도입", sub: ["▸ 기능 추가에 따른 xPath 사용에서 testid 사용 전환", "⇒ UI/UX 기반 **테스트 코드의 유지보수 필요성 감소**"] }, { text: "◆ Problem", sub: ["▸ React VUI 내 data-testid 색인 작업에 대한 버저닝 꼬임 우려로 제품 본부 내에서 작업 중단 요청 발생", "✓ **자사 제품 Repo 내 data-testid 색인 자동화 코드 (AST) 필요성 확인**"] }],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.11 - 2025.01\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "Web - App 양방향 자동화 시나리오 구축 (Prisma · PostgreSQL)",
                  items: [{ text: "DB 내 테이블 대상 가변적 데이터 / 고정적 데이터 컬럼 별 성격 정의", sub: ["▸ 약제 관련 데이터 대부분은 작성 수정 삭제가 빈번하게 일어나지 않음을 실제 DB 조회에서 관측", "▸ 보호자 / 환자 관련 데이터 대부분은 항시 생성 수정과 같은 CRUD 동작 전반이 발생하는 점 확인", "⇒ 자동화 테스트 계획 과정에서 **User (수의사) 또는 병원 설정에 종속되는 상대적 독립 데이터 리스트업**", "⇒ 환자 관련 데이터 상 **id, name, number 와 같은 수시 변경 데이터의 여타 테이블 강한 종속성 기록**"] }, { text: "환자 처방 제조에 필요한 방정식 산술 및 CRUD 관련 기능 자동화 코드 작성", sub: ["▸ 선형 산술식 12자리 난수 생성 로직 도입, 개별 약제 계산 UI인 Datagrid Cell 자동화 테스트 계획", "✓ 개별 생성된 **난수의 저장 및 저장 기록에 종속된 테스트 성공 여부 기록** 공유가 모호한 상황 확인\n", "✓  다수 UI가 Tailwind로 렌더링 된 상태, xPath 의존성이 높아 **기능이 추가되는 것으로 Path 정합성이 어그러질 수 있는 문제의 확인**", "⇒ Playwright 병렬 실행 테스트 코드 사용, **약제 관련 비지니스 리스크 유발 로직에서의 품질 안정성 확보**"] }, { text: "AWS EC2 인스턴스 내 QA Test DB 구축 - Prisma · PostgreSQL 연동", sub: ["▸ Web App 간 동일 Fixtures를 QA 부서 측 PostgreSQL DB - Prisma로 기용 가능한 사실 확인", "⇒ 테스트 기록에 따른 난수의 Datagrid Cell 약제 산술식 성공 조건, 성공 여부 DB 상 업로드 및 공유 성공"] }, { text: "◆ Problem", sub: ["▸ **xPath 의존성**에 따른 테스트 코드 작동 불안정 확인", "▸ 주 2회 배포에 따른 사이클 내에서 자동화 코드 Path의 잦은 유지보수 필요", "✓  **자사 제품 내 PC & MO 환경 대상 testId 및 ValueKey 색인 작업 필요 확인**", "✓  **Tailwind CSS 객체 (React VUI Repo) 대상 data-testid 색인 계획**"] }],
                },
              ],
            },
            {
              role: "QA 프로젝트",
              period: "2024.11 - 2024.12\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "Jenkins - Github Webhook 기반 Slack Bot 연동 이슈 리포팅",
                  items: [{ text: "Github 도구 일원화 요청에 따른 Github Project의 BTS 채택", sub: ["▸ Google 스프레드 시트 기반, 이슈 리포트 도구의 개발 본부 내 사용 어려움 확인.", "▸ C 레벨 임원 측 도구 혹은 업무 플랫폼 통일화 (Notion & Github) 요구 확인.", "⇒ **Github Project 대상 BTS 구축** - 기능 대상 이슈 그룹 정의 / **주차별 Slackbot 알림 Cronjob 구축**"] }, { text: "이슈 그룹화 노티 - 주차별 이슈 & Major 이슈 리스트업 Cronjob", sub: ["▸ QA 측 AWS EC2 인스턴스 확보 - Jenkins 파이프라인 작성 및 인스턴스 내 배포", "▸ 품질 이슈 대상 기능 별 그룹으로 엮어 주 수요일마다 비즈니스 리스크 여부에 따른 중요도 조정 / Slack 채널 내 Jenkins cronjob 파이프라인 연동을 통해 공시.\n", "⇒  기획 확인이 필요하거나 Failsafe 기준을 충족하는 UI 상, **17건의 Major 이슈 감소.**"] }, { text: "Github Webhook 연동 (1) - 경쟁사 제품 마이그레이션 팀 대상 이슈 노티 알림", sub: ["▸ **기술 지원 · 세일즈 팀 협업** 중, 마이그레이션 데이터 검증 작업에서 **사전 비즈니스 리스크 파악, 데이터 무결성 이슈 리포트에 대한 Github Issues 접근 불가한 점 고려**", "⇒ Github **Issue의 Json 문서화, Slack Bot 메시지와 스레드로 전송**하는 파이프라인 작성"] }, { text: "Github Webhook 연동 (2) - QA 부서 측 테스트 업무 티켓 알림", sub: ["▸ PR 혹은 Iteration PR 대상, Reviewer의 QA 등록시 QA 측 업무 요청 알림 구현"] }, { text: "중복 알림 및 에지 케이스 처리", sub: ["⇒ 개별 노티 대상 Jenkins Json 저장 후 덮어쓰기, 신규 생성 대상 추적 파이프라인 구현", "⇒ Slack Bot의 특정 채널 메시지, 쓰레드 ID, 개별 TimeStamp 추적 파이프라인 구현"] }],
                },
              ],
            },
            {
              role: "제품 프로젝트",
              period: "2024.03 - 2024.10\n벳칭 (주)\nQA Manager",
              groups: [
                {
                  label: "CRM - PlusVet 스케줄링 기능 일원화 · 고도화 프로젝트 (네이버 예약 & LG AICC 콜센터 연동)",
                  items: [{ text: "① 스케줄링 일원화 - 네이버 예약 & LG AICC 콜센터 연동 검증", sub: ["▸ Mobile App, PC 제품 간 호환성을 위해 존재하는 Cross 플랫폼 제품 기능 확대 - QA 범주 확장\n", "▸ 약 320 TestCase 작성, 스케줄링 기능에 대한 E2E UI/UX 테스트 진행", "※  **릴리즈 전** API 서버 코드 품질 자체 저하로 성능적 이슈 다수 발생", "⇒ 환자 보호자 인입 유발될 **비즈니스 리스크 이슈 우선**하여, 이슈 별 중요도 판단 보고서 작성", "⇒ Major 이슈 대상 **영상 자막 삽입 및 배속 편집 이용**하여 제품 본부 내 이슈 리스트업"] }, { text: "② 보호자 FollowUp - 진료 후 스케줄러 내 환자 가예약 서비스", sub: ["▸ 디자인 부재 속 개발 의도 및 FollowUp 기능의 가예약 특징을 일반 스케줄링 대비 맥락적으로 파악", "▸ TestCase 또는 TestScenario 부재 상황 Boolean 위주의 DB 칼럼 값들에 대한 UI 정합성 검증 필요", "⇒  탐색적 테스팅, 개발 / QA 동시에 병행하는 페어 프로젝트 진행", "※ **리스크 발생 하루 전** 스케줄링 테이블 경계값 분석, DB 내 마이그레이션된 Date 경계값 오차 범위 리포트"] }, { text: "릴리즈 조건 개념 사내 확립", sub: ["✓ 기능 자체 문제에선 대체 가능한 기능이 있는지? UI Path 문제에선 대체 가능한 경로가 있는지?", "✓  자사 제품 개별 이슈 중요도를 측정할 때, 그 기준으로써 비즈니스 리스크를 야기하는 경우는 무엇인지?", "✓  상정하지 않은 프로젝트에서 필요한 테스트 기법, 개발자와 페어로 커뮤니케이션은 어떻게 진행하는지?"] }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s01-intro",
      type: "intro",
      heading: "소개",
      // 소개 본문. 단락은 문자열(줄바꿈은 \n), 글머리 목록은 배열이다. 위에서 아래 순서대로 나온다.
      text: [
        "업무 방식으론 Shiftleft 업무 방식으로 테스트에서 정보를 얻어내어 맥락적인 QA 업무를 진행합니다.\n주로 PR에 대한 직접 빌드를 통하여 기능 / 통합 테스트를 수행했습니다.\nIteration 진행 프로젝트 속에서 이러한 개발 산출물을 조기에 테스트하여 정보를 얻고,\n이것을 통해 개발 및 기획 부채를 줄이면서 개별 Iteration 취지에 맞는 품질 기준을 준수합니다.",
      ],
    },
    {
      id: "s07-education",
      type: "education",
      heading: "학력",
      cards: [
        { no: 1, title: "강원대학교 컴퓨터공학과", body: "2014.03 - 2026.08 | 학사 졸업" },
      ],
    },
    {
      id: "s05-etc",
      type: "etc",
      heading: "기타",
      items: ["ISTQB Foundation Level (샘플)", "정보처리기사 (샘플)"],
    },
    {
      id: "s03-projects",
      type: "projects",
      heading: "프로젝트",
      cards: [
        {
          no: 1,
          title: "결함 관리 프로세스 개선",
          summary: "결함 등록 양식과 우선순위 기준을 표준화해 재현 정보 누락을 줄임.",
          link: "https://github.com/wonderwall1995",
          linkText: "Github Repo",
          image: { src: "/images/project-1.svg", alt: "결함 건수 추이를 나타낸 샘플 막대 그림" },
          body: [
            "결함 등록 양식을 표준화하고 필수 항목(재현 절차, 기대 결과, 실제 결과, 환경)을 정함",
            "심각도와 우선순위 기준을 문서로 정리해 개발팀과 합의함",
            "주간 결함 리뷰 회의를 도입해 장기 미해결 건을 정리함",
            "결과: 재현 정보 누락으로 되돌아오는 결함이 눈에 띄게 줄었다. (샘플 문구)",
          ],
        },
        {
          no: 2,
          title: "회귀 테스트 자동화 도입",
          summary: "핵심 시나리오 120건을 자동화해 릴리스 전 검증 시간을 크게 단축함.",
          link: "https://github.com/wonderwall1995",
          linkText: "Github Repo",
          image: { src: "/images/project-2.svg", alt: "자동화 파이프라인을 나타낸 샘플 흐름 그림" },
          body: [
            "핵심 시나리오 120건을 자동화 대상으로 선정함",
            "야간 실행과 결과 알림 흐름을 구성함",
            "실패 원인 분류 기준을 만들어 불안정한 시험을 따로 관리함",
            "이 항목은 모달 안에서 스크롤이 필요한 긴 내용을 확인하기 위한 샘플이다.",
            "여섯 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "일곱 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "여덟 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "아홉 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "열 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "열한 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "열두 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
            "열세 번째 항목 샘플 문장이다. 한국어 줄바꿈과 행간을 확인한다.",
          ],
        },
        {
          no: 3,
          title: "릴리스 품질 지표 대시보드",
          summary: "배포 전 점검 결과를 한 화면에 모아 의사결정 시간을 줄임.",
          link: "https://github.com/wonderwall1995",
          linkText: "Github Repo",
          image: { src: "/images/project-3.svg", alt: "품질 추이를 나타낸 샘플 선 그림" },
          body: "릴리스마다 흩어져 있던 점검 결과를 한곳에 모아 배포 여부를 판단하기 쉽게 만들었다. 샘플 내용이다.",
        },
        {
          no: 4,
          title: "모바일 앱 호환성 점검 체계",
          summary: "기기와 운영체제 조합별 점검 범위를 정리해 누락을 줄임.",
          link: "https://github.com/wonderwall1995",
          linkText: "Github Repo",
          image: { src: "/images/project-1.svg", alt: "샘플 막대 그림" },
          body: ["지원 기기와 운영체제 조합을 표로 정리함", "조합별 필수 점검 시나리오를 정함"],
        },
      ],
    },
  ],
  footer: { text: "" },
};
