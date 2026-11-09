// 개발 전용 Inspector. 개발 서버가 HTML에 넣어 준다.
// 이 파일은 public 폴더 밖에 있다. 배포물에는 포함되지 않는다.
//
// 기능
// - 화면 왼쪽 아래의 토글 버튼으로 켜고 끈다. 꺼져 있으면 아무 동작도 하지 않는다.
// - 켜면 마우스로 가리킨 요소의 이름표(data-testid)를 툴팁으로 보여준다.
//   내용: 이름표, 대화에서 쓰는 표기, 현재 폭과 높이, 태그와 클래스, 상위 이름표.
// - 가리킨 요소에는 점선 윤곽선이 생긴다. 윤곽선은 배치와 크기를 바꾸지 않는다.
// - 주소 끝에 ?inspect를 붙이면 켜진 상태로 시작한다. 켜짐 상태는 저장하지 않는다.
// - 모달 창이 열려 있으면 모달이 우선이다. 토글 버튼은 모달 뒤에 가려진다.
//   툴팁은 모달 안의 요소를 확인할 수 있도록 맨 위 층(popover)에 뜬다.
// - 인쇄할 때는 버튼, 툴팁, 윤곽선이 모두 숨겨진다. (dev-inspector.css)
(() => {
  const GAP = 14;
  const UI_CLASS = "dev-inspector-ui";
  let enabled = false;
  let hit = null;
  let pointer = { x: 0, y: 0 };
  let toggle = null;
  let tip = null;

  // 이름표를 대화 표기로 바꾼다. 예: s02-career-c1-period -> [02-career.1:period]
  // 섹션 이름표는 페이지에 있는 section, header, footer의 id에서 찾는다.
  function toNotation(testid) {
    if (testid.startsWith("page-")) return "(페이지 공통)";
    const ids = [...document.querySelectorAll("section[id], header[id], footer[id]")]
      .map((node) => node.id)
      .sort((a, b) => b.length - a.length);
    const sectionId = ids.find((id) => testid === id || testid.startsWith(`${id}-`));
    if (!sectionId) return "(규칙 밖 이름표)";

    const base = sectionId.slice(1);
    const rest = testid.slice(sectionId.length);
    if (!rest) return `[${base}]`;
    // 번호가 붙은 하위 영역. 예: s00-header-1 -> [00-header.1] (머리말의 header1)
    const part = rest.match(/^-(\d+)$/);
    if (part) return `[${base}.${part[1]}]`;
    const card = rest.match(/^-c(\d+)(?:-(.+))?$/);
    if (card) return card[2] ? `[${base}.${card[1]}:${card[2]}]` : `[${base}.${card[1]}]`;
    return `[${base}:${rest.slice(1)}]`;
  }

  // 마우스 위치에서 가장 위에 있는 이름표 요소를 찾는다. 검사 도구 자신은 제외한다.
  // 겹친 요소 목록을 위에서부터 보면서, 마우스가 자기 상자 안에 없는 요소는 건너뛴다.
  // 갤러리 타일의 열기 버튼처럼 ::after로 눌림 영역을 넓힌 요소는 자기 상자 밖에서도 잡히기 때문이다.
  // 건너뛰어야 타일 안의 사진과 요약을 따로 가리킬 수 있다.
  function findTarget(x, y) {
    for (const node of document.elementsFromPoint(x, y)) {
      if (node.closest(`.${UI_CLASS}`)) return null;
      const box = node.getBoundingClientRect();
      if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
      const target = node.closest("[data-testid]");
      if (target) return target;
    }
    return null;
  }

  // 상위 이름표를 가까운 순서로 최대 3개 모은다.
  function ancestorIds(node) {
    const list = [];
    let current = node.parentElement?.closest("[data-testid]");
    while (current && list.length < 3) {
      list.push(current.dataset.testid);
      current = current.parentElement?.closest("[data-testid]");
    }
    return list;
  }

  function addLine(text, className) {
    const line = document.createElement("div");
    line.textContent = text;
    if (className) line.className = className;
    tip.append(line);
  }

  function fillTip(node) {
    const rect = node.getBoundingClientRect();
    // Inspector 자신의 클래스(dev-inspector로 시작)는 보여주지 않는다.
    const names = typeof node.className === "string"
      ? node.className.trim().split(/\s+/).filter((name) => name && !name.startsWith("dev-inspector"))
      : [];
    const classes = names.length > 0 ? `.${names.join(".")}` : "";
    tip.replaceChildren();
    addLine(node.dataset.testid, "dev-inspector-id");
    addLine(toNotation(node.dataset.testid), "dev-inspector-notation");
    addLine(`폭 ${Math.round(rect.width)} x 높이 ${Math.round(rect.height)} px`);
    addLine(`<${node.tagName.toLowerCase()}${classes}>`, "dev-inspector-dim");
    const parents = ancestorIds(node);
    if (parents.length > 0) addLine(`상위: ${parents.join(" > ")}`, "dev-inspector-dim");
  }

  // 툴팁을 마우스 옆에 놓는다. 화면 밖으로 나가면 반대쪽에 놓는다.
  function placeTip() {
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let x = pointer.x + GAP;
    let y = pointer.y + GAP;
    if (x + width > window.innerWidth - 4) x = pointer.x - width - GAP;
    if (y + height > window.innerHeight - 4) y = pointer.y - height - GAP;
    tip.style.left = `${Math.max(4, x)}px`;
    tip.style.top = `${Math.max(4, y)}px`;
  }

  function showTip(node) {
    fillTip(node);
    // 이미 열려 있으면 닫았다가 다시 연다. 맨 위 층의 맨 앞으로 와서 모달 창 위에 보인다.
    if (tip.matches(":popover-open")) tip.hidePopover();
    tip.showPopover();
    placeTip();
  }

  function clearHit() {
    hit?.classList.remove("dev-inspector-hit");
    hit = null;
    if (tip.matches(":popover-open")) tip.hidePopover();
  }

  // 마우스가 움직일 때마다 대상을 다시 찾는다. 같은 대상이면 툴팁 위치만 옮긴다.
  function onMove(event) {
    if (!enabled) return;
    pointer = { x: event.clientX, y: event.clientY };
    const target = findTarget(pointer.x, pointer.y);
    if (!target) {
      clearHit();
      return;
    }
    if (target === hit) {
      if (tip.matches(":popover-open")) placeTip();
      return;
    }
    hit?.classList.remove("dev-inspector-hit");
    hit = target;
    hit.classList.add("dev-inspector-hit");
    showTip(hit);
  }

  function setEnabled(value) {
    enabled = value;
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.textContent = enabled ? "Inspector 켜짐" : "Inspector 꺼짐";
    document.documentElement.classList.toggle("dev-inspector-on", enabled);
    if (!enabled) clearHit();
  }

  function init() {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = `dev-inspector-toggle ${UI_CLASS}`;
    toggle.addEventListener("click", () => setEnabled(!enabled));

    tip = document.createElement("div");
    tip.className = `dev-inspector-tip ${UI_CLASS}`;
    tip.setAttribute("popover", "manual");

    document.body.append(toggle, tip);
    document.addEventListener("mousemove", onMove, true);
    document.documentElement.addEventListener("mouseleave", clearHit);

    setEnabled(new URLSearchParams(location.search).has("inspect"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
