// 글자 속 마크다운 일부를 요소로 바꾼다. 지원하는 문법은 아래 셋뿐이다.
//   **굵게**    같은 줄 안의 ** 쌍. 안쪽 공백도 굵게 된다. 안쪽에 글자가 한 자 이상 있어야 한다.
//   # 제목, ## 제목, ### 제목    줄 맨 앞의 # 한 개에서 세 개, 그 뒤에 공백. 블록 모드에서만 제목이 된다.
//   - 항목    줄 맨 앞의 하이픈 한 개와 공백. 블록 모드에서만 점 글머리 항목이 된다. (슬랙 메시지의 글머리 기호와 같다.)
//   기호 항목 줄 맨 앞의 기호 한 개와 공백 (예: "▸ 항목", "✓ 항목"). 점 대신 그 기호가 글머리 기호가 된다.
//             블록 모드에서는 줄 전체가 글머리 항목이 되고, 한 줄 모드(목록 항목)에서는 글자 앞의 기호가 마커가 된다.
//             기호는 SYMBOL 정규식의 목록과 이모지이다. 컬러 이모지는 흑백 인쇄에서 회색으로 나오므로 흑백 기호를 권한다.
// 그 밖의 기호(*, #, 링크 문법 등)는 글자 그대로 나온다. 예: "C# 환경", "Shift-Left".
// 모든 출력은 요소를 직접 만들고 글자는 textContent로 넣는다. innerHTML은 쓰지 않는다. (보안 규칙)
//
// 모드
//   inline  굵게만 해석한다. 목록 항목, 요약, 바닥글 같은 한 줄 글자에 쓴다.
//   block   굵게와 제목을 해석한다. 줄바꿈(\n)으로 여러 줄인 글자(소개, About, 본문)에 쓴다.
//
// 이 파일은 세 곳에서 쓴다.
//   1. 화면 그리기 (lib/dom.js의 md 옵션). 빌드의 미리 그리기(JavaScript가 꺼진 화면)에도 같은 코드가 쓰인다.
//   2. 개발 서버의 편집 모드 (scripts/dev-edit.js). 편집 중에도 굵게와 제목을 보여 주는 highlight를 쓴다.
//   3. 시험.

// label 모드가 보여 주는 고정 글자.
export const LINK_LABEL = "GitHub Repo";

const HEADING = /^(#{1,3}) (.*)$/;
const BULLET = /^- (.*)$/;
// 글머리 기호가 되는 기호. 이모지와 흑백 기호 목록이다. 저작권 기호(©, ®, ™)는 글자 앞에 흔히 와서 뺀다.
const SYMBOL = /^(?![©®™‼⁉])(\p{Extended_Pictographic}\uFE0F?|[▸▹▶►◆◇●○■□★☆✓✔✗✘→⇒※•◦–—]) +(.*)$/u;

// 제목 줄이면 { level, marker, rest }를, 아니면 null을 반환한다. marker는 "## "처럼 # 뒤의 공백까지이다.
export function parseHeading(line) {
  const match = HEADING.exec(line);
  return match ? { level: match[1].length, marker: `${match[1]} `, rest: match[2] } : null;
}

// 글머리 항목 줄이면 { marker, rest }를, 아니면 null을 반환한다. marker는 "- " 이다.
export function parseBullet(line) {
  const match = BULLET.exec(line);
  return match ? { marker: "- ", rest: match[1] } : null;
}

// 기호 항목 줄이면 { symbol, marker, rest }를, 아니면 null을 반환한다. marker는 "▸ "처럼 기호 뒤의 공백까지이다.
// 공백이 여러 개여도 마커는 첫 공백까지만 이고, 나머지 공백은 항목 글자에 남는다. (글자를 이어 붙이면 원본과 같아야 하기 때문이다.)
export function parseSymbol(line) {
  const match = SYMBOL.exec(line);
  if (!match) return null;
  const spaces = /^ +/.exec(line.slice(match[1].length))[0];
  return { symbol: match[1], marker: `${match[1]} `, rest: `${spaces.slice(1)}${match[2]}` };
}

// 한 줄을 { bold, text } 조각 배열로 나눈다. bold 조각의 text에는 ** 기호가 없다.
export function splitBold(line) {
  const parts = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  while ((match = re.exec(line))) {
    if (match.index > last) parts.push({ bold: false, text: line.slice(last, match.index) });
    parts.push({ bold: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ bold: false, text: line.slice(last) });
  return parts;
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// ---------- 화면 그리기 ----------
function inlineNodes(line) {
  return splitBold(line).map((part) => (part.bold ? make("strong", "", part.text) : document.createTextNode(part.text)));
}

// 기호 마커 요소. 모양은 CSS가 정한다. (.md-symbol)
function symbolNode(symbol) {
  const node = make("span", "md-symbol", symbol);
  node.setAttribute("aria-hidden", "true");
  return node;
}

// 글자를 노드 배열로 바꾼다. 제목 줄과 글머리 항목 줄은 블록 요소라서 앞뒤에 줄바꿈 글자를 넣지 않는다.
export function renderMarkdown(text, mode) {
  if (mode === "label") return [document.createTextNode(LINK_LABEL)];
  const lines = String(text).split("\n");
  const headings = lines.map((line) => (mode === "block" ? parseHeading(line) : null));
  const bullets = lines.map((line) => (mode === "block" ? parseBullet(line) : null));
  const symbols = lines.map((line) => parseSymbol(line));
  const isBlock = (index) => Boolean(headings[index] || bullets[index] || (mode === "block" && symbols[index]));
  const nodes = [];
  lines.forEach((line, index) => {
    const heading = headings[index];
    const bullet = bullets[index];
    const symbol = symbols[index];
    if (index > 0 && !isBlock(index) && !isBlock(index - 1)) nodes.push(document.createTextNode("\n"));
    if (bullet) {
      const node = make("span", "md-bullet");
      node.append(...inlineNodes(bullet.rest));
      nodes.push(node);
    } else if (heading) {
      const node = make("span", `md-heading md-h${heading.level}`);
      // 제목 줄은 글자 모양만 제목이다. 문서 구조에서는 문단 안의 제목으로 알린다.
      node.setAttribute("role", "heading");
      node.setAttribute("aria-level", String(3 + heading.level));
      node.append(...inlineNodes(heading.rest));
      nodes.push(node);
    } else if (symbol && mode === "block") {
      // 기호 글머리 항목. 기호 요소가 점의 자리에 놓인다.
      const node = make("span", "md-bullet md-bullet-symbol");
      node.append(symbolNode(symbol.symbol), ...inlineNodes(symbol.rest));
      nodes.push(node);
    } else if (symbol) {
      // 한 줄 글자(목록 항목)에서는 글자 앞의 기호가 마커이다.
      nodes.push(symbolNode(symbol.symbol), ...inlineNodes(symbol.rest));
    } else {
      nodes.push(...inlineNodes(line));
    }
  });
  return nodes;
}

// ---------- 편집 중 표시 ----------
// 편집 모드에서 원본 글자를 보여 주되 굵게와 제목 모양을 입힌 노드 배열을 만든다.
// 기호(**, ##)는 흐리게 남긴다. 반환한 노드들의 글자를 이어 붙이면 입력한 text와 정확히 같다.
// 그래서 편집기가 글자를 읽는 방식(textContent)을 바꾸지 않아도 된다. 제목은 줄바꿈 없이 이어지는 글자 모양(display:inline)이다.
function markNode(text) {
  return make("span", "md-mark", text);
}

function inlineEditNodes(line) {
  return splitBold(line).map((part) => {
    if (!part.bold) return document.createTextNode(part.text);
    const node = make("span", "md-edit-b");
    node.append(markNode("**"), document.createTextNode(part.text), markNode("**"));
    return node;
  });
}

export function highlightMarkdown(text, mode) {
  if (mode === "label") return [document.createTextNode(text)];
  const lines = String(text).split("\n");
  const nodes = [];
  lines.forEach((line, index) => {
    if (index > 0) nodes.push(document.createTextNode("\n"));
    const heading = mode === "block" ? parseHeading(line) : null;
    const bullet = mode === "block" ? parseBullet(line) : null;
    if (bullet) {
      // 글머리 기호(- )는 흐리게 남기고 항목 글자는 그대로 둔다. 줄 모양은 바꾸지 않는다.
      const node = make("span", "md-edit-li");
      node.append(markNode(bullet.marker), ...inlineEditNodes(bullet.rest));
      nodes.push(node);
    } else if (mode === "block" && parseSymbol(line)) {
      // 기호 글머리 항목. 기호는 흐리게 남기고 줄 모양은 바꾸지 않는다.
      const symbol = parseSymbol(line);
      const node = make("span", "md-edit-li");
      node.append(markNode(symbol.marker), ...inlineEditNodes(symbol.rest));
      nodes.push(node);
    } else if (heading) {
      const node = make("span", `md-edit-h md-edit-h${heading.level}`);
      node.append(markNode(heading.marker), ...inlineEditNodes(heading.rest));
      nodes.push(node);
    } else {
      nodes.push(...inlineEditNodes(line));
    }
  });
  return nodes;
}
