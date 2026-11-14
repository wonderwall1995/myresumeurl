// 목차. 넓은 화면에서는 왼쪽 사이드바이고, 좁은 화면에서는 위쪽 줄이 된다.
// 항목은 페이지 데이터의 toc 배열이다. 예: { label: "경력", target: "s02-career" }
// 각 항목은 같은 문서 안의 위치(#id)로 가는 링크이다. JavaScript가 없어도 눌러서 이동한다.
// 인쇄에는 나오지 않는다. (print.css)
import { el } from "../lib/dom.js";
import { itemId, testAttr } from "../lib/ids.js";
import { createContactItem } from "./header.js";

const TOC_ID = "toc";

// 사이드바 아래쪽의 연락처(profile.contact). 사이드바 맨 아래에 붙는다.
// 연락처는 머리말과 같은 데이터(header.contact)이고, 머리말과 같은 방식으로 링크가 된다.
function createProfile(profile) {
  if (!Array.isArray(profile?.contact) || profile.contact.length === 0) return null;
  const listId = `${TOC_ID}-contact`;
  // 머리말 연락처의 복사본이다. 사이드바는 편집하지 않는 영역이라 편집 경로를 붙이지 않는다.
  const items = profile.contact.map((text, index) => createContactItem(text, itemId(listId, index)));
  const list = el("ul", { className: "toc-contact", attrs: testAttr(listId) }, items);
  return el("div", { className: "toc-profile", attrs: testAttr(`${TOC_ID}-profile`) }, [list]);
}

// 인쇄 안내와 목차 제목 사이의 이름(profile.name). 없으면 null이다.
function createName(profile) {
  if (!profile?.name) return null;
  return el("p", { text: profile.name, className: "toc-name", attrs: testAttr(`${TOC_ID}-name`) });
}

// 목차를 만든다. 문서에 없는 id를 가리키는 항목은 뺀다. 항목이 없으면 null을 반환한다.
// existingIds는 페이지에 실제로 그려진 요소의 id 집합이다. profile은 { name, contact }이다.
// 위에서 아래로: Made by Claude, 인쇄 안내, 이름, 제목, 링크 목록, (남는 공간) 연락처. 구분선은 없다.
// 표시, 안내, 제목, 인적 정보는 넓은 화면(사이드바)에서만 보인다.
export function createToc(items, existingIds, profile) {
  const links = [];
  (items ?? []).forEach((item, index) => {
    if (!item?.label || !item.target) return;
    if (!existingIds.has(item.target)) {
      console.error(`목차가 가리키는 id가 없음: ${item.target}`);
      return;
    }
    links.push(
      el("a", {
        text: item.label,
        className: "toc-link",
        attrs: { href: `#${item.target}`, ...testAttr(`${TOC_ID}-i${index + 1}`) },
      }),
    );
  });
  if (links.length === 0) return null;
  const parts = [
    el("p", { text: "Made by Claude", className: "toc-brand", attrs: testAttr(`${TOC_ID}-brand`) }),
    el("p", { text: "※ 목차 UI는 인쇄되지 않습니다.", className: "toc-notice", attrs: testAttr(`${TOC_ID}-notice`) }),
    createName(profile),
    el("p", { text: "목차", className: "toc-title", attrs: testAttr(`${TOC_ID}-title`) }),
    el("div", { className: "toc-list", attrs: testAttr(`${TOC_ID}-list`) }, links),
    createProfile(profile),
  ].filter(Boolean);
  return el("nav", { className: "toc", attrs: { "aria-label": "목차", ...testAttr(TOC_ID) } }, parts);
}

// 스크롤 위치에 맞춰 현재 항목을 표시한다. (aria-current="true")
// 항목마다 담당 구간이 있다. 구간은 그 항목의 대상 요소가 시작하는 곳에서, 다음 항목의 대상 요소가 시작하기 전까지이다.
// 첫 항목의 구간은 문서 맨 위부터이다. 구간은 문서에 놓인 순서를 따른다. 예: 인적사항은 경력 제목이 나타나기 전의 전체(머리말과 About me)이고,
// 경력은 경력 제목부터 자기소개 제목 전까지, 자기소개는 소개 제목부터 프로젝트 제목 전까지(소개, 학력, 기타 포함),
// 프로젝트는 프로젝트 제목부터 문서 끝까지이다.
// 다음 구간은 그 대상 요소의 윗부분이 화면 높이의 절반(SWITCH_RATIO) 위치에 닿으면 시작한 것으로 본다.
// 문서 맨 아래까지 내리면 마지막 항목이 켜진다. 미리 그리기 같은 브라우저 밖 환경에서는 아무것도 하지 않는다.
const SWITCH_RATIO = 0.5;

export function watchToc(doc) {
  const view = doc.defaultView;
  if (!view || typeof view.requestAnimationFrame !== "function") return;
  const pairs = [...doc.querySelectorAll(".toc-link")]
    .map((link) => ({ link, target: doc.getElementById(link.getAttribute("href").slice(1)) }))
    .filter((pair) => pair.target);
  if (pairs.length === 0) return;

  const update = () => {
    const line = view.innerHeight * SWITCH_RATIO;
    const atEnd = view.scrollY + view.innerHeight >= doc.documentElement.scrollHeight - 2;
    // 윗부분이 기준선 위에 있는 대상 중 마지막 것이 현재 구간이다. 없으면 첫 항목이다.
    let current = pairs[0];
    for (const pair of pairs) {
      if (pair.target.getBoundingClientRect().top <= line) current = pair;
    }
    if (atEnd) current = pairs[pairs.length - 1];
    for (const pair of pairs) {
      if (pair === current) pair.link.setAttribute("aria-current", "true");
      else pair.link.removeAttribute("aria-current");
    }
    revealLink(current.link);
  };

  // 좁은 화면에서 목록이 좌우로 밀리는 경우, 현재 링크가 목록 가운데에 오도록 목록만 민다. (페이지는 움직이지 않는다.)
  // 목록이 밀리지 않는 넓은 화면에서는 아무것도 하지 않는다.
  const revealLink = (link) => {
    const list = link.parentElement;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const linkBox = link.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    const target = list.scrollLeft + (linkBox.left - listBox.left) - (list.clientWidth - linkBox.width) / 2;
    list.scrollLeft = Math.max(0, Math.min(target, list.scrollWidth - list.clientWidth));
  };

  // 스크롤마다 계산하지 않고 화면 갱신에 한 번만 계산한다.
  let waiting = false;
  const schedule = () => {
    if (waiting) return;
    waiting = true;
    view.requestAnimationFrame(() => {
      waiting = false;
      update();
    });
  };
  view.addEventListener("scroll", schedule, { passive: true });
  view.addEventListener("resize", schedule);
  update();
}
