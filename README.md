# myresumeurl

웹으로 열람하고 A4로 인쇄할 수 있는 이력서 페이지. Cloudflare Workers 정적 에셋으로 호스팅하며 읽기 전용이다.

## 열람

| 항목 | 내용 |
|---|---|
| 주소 | https://resume-hwk.ltwayne0.workers.dev/main |
| 구성 | 경력, 소개, 학력, 기타, 프로젝트 |
| 화면 | 반응형. 넓은 화면은 왼쪽 목차, 좁은 화면은 위쪽 목차 |
| 프로젝트 | 타일을 누르면 상세 창이 열림 |
| 인쇄 | 브라우저 인쇄(Ctrl+P) 또는 화면 오른쪽 아래 인쇄 버튼. A4 세로. 외부 링크는 주소가 글자로 함께 인쇄됨. 목차와 버튼은 인쇄되지 않음 |
| JavaScript | 꺼진 환경에서도 내용이 보임 (빌드 때 미리 그림) |

## 기술

| 항목 | 내용 |
|---|---|
| 구현 | 순수 HTML, CSS, JavaScript. 프레임워크 없음 |
| 글꼴 | Pretendard (SIL OFL 1.1). 파일을 함께 배포하며 외부 요청 없음 |
| 호스팅 | Cloudflare Workers 정적 에셋. 배포 대상은 `dist/` 폴더 |
| 보안 | GET과 HEAD만 허용. 엄격한 CSP와 보안 헤더 적용. 비밀 값과 서버 코드 없음 |

## 저작권

이력서 코드와 내용은 wonderwall1995에게 저작권이 있습니다.

---

## 개발

### 요구 환경

| 항목 | 요구 사항 |
|---|---|
| Node.js | 22 |
| 패키지 관리자 | pnpm |

### 명령

| 명령 | 동작 |
|---|---|
| `pnpm install` | 개발용 의존성 설치 |
| `pnpm dev` | 개발 서버 실행 (http://localhost:4200). 저장하면 브라우저가 자동 갱신됨 |
| `pnpm preview` | 개발 서버를 샘플 내용 모드로 실행 (http://localhost:4200) |
| `pnpm build` | `web/public`과 `web/preview`를 합쳐 `dist/`를 만들고 이력서 내용을 미리 그림. 이어서 모바일 저장용 PDF가 최신인지 보고, 내용이 바뀌었고 Edge 또는 Chrome이 있으면 PDF도 다시 만듦 |
| `pnpm pdf` | 모바일 저장용 PDF(A4 세로, 가로)를 항상 새로 만들어 `web/preview/pdf/`에 둠. Edge 또는 Chrome이 필요함 |
| `pnpm check` | 저장소 점검. 위반이 있으면 종료 코드 1 |

### 모바일 PDF 저장

- 모바일(화면 폭 768px 이하)에서 오른쪽 아래 SAVE 버튼을 누르면 모달이 열리고, 용지 방향(세로 또는 가로)을 고른 뒤 Save를 누르면 PDF 파일을 내려받음. PC에서는 같은 버튼이 인쇄 창(PDF로 저장)을 엶.
- 내려받는 PDF는 미리 만들어 저장소에 둠(`web/preview/pdf/`). 배포 환경에는 브라우저가 없기 때문임.
- 이력서 내용이나 인쇄 스타일(CSS)을 고친 뒤 내 컴퓨터에서 `pnpm build`를 실행하면 PDF가 자동으로 다시 만들어짐(내용이 그대로면 건너뜀). 바뀐 PDF와 `manifest.txt`를 커밋함. 잊으면 `pnpm check`의 "저장용 PDF" 항목이 실패함.
- Cloudflare 빌드에는 Edge나 Chrome이 없으므로 그곳의 `pnpm build`는 PDF를 새로 만들지 않고 저장소의 PDF를 그대로 씀(경고 한 줄만 남기고 빌드는 계속됨). 그래서 PDF를 커밋하지 않으면 배포본의 PDF가 옛 내용이 됨.
- 서버는 `/pdf/*`를 첨부 파일로 보냄(`Content-Disposition: attachment`, `web/public/_headers`). 그래서 앱 안 브라우저에서도 보기 화면이 아니라 내려받기로 처리됨.

### 폴더

```
web/
  public/     코드와 에셋 (HTML, CSS, JS, 글꼴, 보안 헤더 설정)
  preview/    이력서 내용(data/ko/main.js)과 이미지. 같은 경로의 public 파일을 덮어씀
scripts/      빌드, 점검, 개발 서버
dist/         배포 폴더 (git에 올리지 않음)
```

### 내용 수정

이력서 내용은 `web/preview/data/ko/main.js` 한 파일에서 고친다. 파일 머리의 주석에 항목별 작성 형식이 있다.

### 개발 서버 부가 기능

| 기능 | 설명 |
|---|---|
| 편집 모드 | 화면 왼쪽 아래 `편집` 버튼. 화면에서 글자를 눌러 고치면 `main.js`에 저장됨. 항목 추가, 이동, 삭제와 되돌리기 지원. 직책 행의 머리 칸을 누르고 `구분선`을 누르면 직책 사이에 구분선이 들어감. 프로젝트 타일을 누르고 `사진`을 누르면 사진 파일을 올릴 수 있음(가로 1200px 이하 webp로 줄여 `web/preview/images/`에 저장하고 `main.js`를 고침) |
| Inspector | 화면 왼쪽 아래 토글. 가리킨 요소의 이름표(`data-testid`)와 크기를 툴팁으로 보여 줌 |
| 배포와의 관계 | 두 기능 모두 개발 서버에서만 동작하며 배포물에는 포함되지 않음 (`pnpm check`가 확인) |
