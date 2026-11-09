// 개발 전용 브라우저 스크립트. 개발 서버가 HTML에 넣어 준다.
// 이 파일은 public 폴더 밖에 있다. 배포물에는 포함되지 않는다.
(() => {
  // 편집 모드 표시. 렌더러(web/public/js/lib/dom.js)가 이 표시를 보고 요소에 편집 경로를 붙인다.
  // 이 스크립트는 동기 스크립트라서 모듈 스크립트(그리기 코드)보다 먼저 실행된다. 배포물에는 없다.
  document.documentElement.setAttribute("data-dev-edit", "");

  // 파일 변경 알림을 받는다.
  // 주소에 ?nolive가 있으면 알림 연결을 만들지 않는다.
  // 자동 캡처 도구는 열려 있는 연결이 있으면 페이지가 끝나기를 기다리기 때문이다.
  if (!new URLSearchParams(location.search).has("nolive")) {
    const events = new EventSource("/__dev/events");
    events.onmessage = (event) => {
      if (event.data !== "css") {
        location.reload();
        return;
      }
      // CSS만 바뀌면 새로고침 없이 스타일시트를 다시 읽는다.
      for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
        const url = new URL(link.href);
        url.searchParams.set("t", Date.now());
        link.href = url.href;
      }
    };
  }

  // 오류를 서버 터미널로 보낸다.
  const report = (text) => navigator.sendBeacon("/__dev/log", text);

  window.addEventListener("error", (event) => {
    report(`JS 오류: ${event.message} (${event.filename}:${event.lineno})`);
  });
  window.addEventListener("unhandledrejection", (event) => {
    report(`처리되지 않은 Promise 오류: ${event.reason}`);
  });
  document.addEventListener("securitypolicyviolation", (event) => {
    report(`CSP 위반: ${event.violatedDirective} 차단 대상=${event.blockedURI || "(인라인)"}`);
  });

  const original = console.error;
  console.error = (...values) => {
    report(`console.error: ${values.map(String).join(" ")}`);
    original(...values);
  };
})();
