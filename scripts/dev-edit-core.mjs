// 편집 모드의 핵심 로직. 개발 서버(dev-server.mjs)가 사용한다. 배포물에는 포함되지 않는다.
// 데이터 파일(main.js)의 구문 트리(acorn)에서 경로가 가리키는 위치를 찾아, 그 부분의 글자만 바꾼다.
// 그래서 주석과 줄 모양이 유지된다. 섹션 종류를 알 필요가 없다. (렌더러가 요소마다 경로를 적어 둔다.)
//
// 경로 형식 (화면 요소의 data-edit, data-edit-item 속성과 같다)
//   header.name
//   header.contact[0]
//   sections[id=s02-career].cards[no=1].roles[0].groups[1].items[3]
//   - .이름     객체의 속성
//   - [번호]    배열의 n번째 (0부터)
//   - [키=값]   배열에서 키가 값과 같은 객체 (예: id=s02-career, no=1)
//
// 작업 종류
//   set     글자 하나를 바꾼다. 원래 값(old)이 파일의 현재 값과 다르면 거절한다. (IDE에서 먼저 고친 경우)
//   insert  항목 뒤에 같은 모양의 새 항목을 넣는다. 형제 항목의 모양을 따르고 글자는 견본 글자로 채운다.
//           value가 "---"이면 견본 글자 대신 구분선 항목을 넣는다. (글자 목록에서만. 하위 줄에는 넣지 않는다.)
//   insertChild  항목 아래에 하위 줄(sub 배열의 글자)을 하나 더한다. 하위 줄은 한 단계만 있다.
//           글자 항목은 { text, sub: [...] } 객체로 바뀐다. 하위 줄을 모두 지우면 다시 글자 항목으로 돌아간다. (delete)
//   move    항목을 한 칸 위(-1) 또는 아래(+1)로 옮긴다.
//   setImage  카드의 사진(image.src)을 바꾼다. 카드에 image가 없으면 만든다. path는 카드 경로이고 src는 /images/ 아래 webp 파일이다.
//           (사진 파일 자체는 개발 서버가 올려 받아 저장한다. dev-server.mjs의 /__dev/edit/image)
//   insertBlock  블록 목록(blocks)에 제목줄(kind: head) 또는 줄글(kind: text) 블록을 넣는다. path는 블록(그 뒤에) 또는 카드(맨 끝에)이다.
//           사진 블록은 addImage로 넣는다. (path가 블록이거나 블록 목록이 있는 카드이면 사진 블록을 넣는다.)
//   addImage  카드에 사진을 하나 더한다. path는 카드(맨 끝에) 또는 사진 목록의 한 사진(그 뒤에)이다. src는 /images/ 아래 webp 파일이다.
//           예전 방식(image 한 장과 body)이면 먼저 사진 목록(images: [{ src, alt, text }])으로 바꾼다. setImage는 path에 사진 목록의 한 사진도 받는다.
//   initLinks  예전 방식의 카드 링크(link, linkText, demo)를 링크 목록(links)으로 바꾼다. path는 카드 경로이다.
//           저장소 주소는 { label: "GitHub Repo", url }, 배포 주소는 { label: "배포 링크", url }이 된다. 옮긴 속성(link, linkText, demo)은 지운다.
//           옮길 주소가 없으면 빈 링크 하나({ label: "GitHub Repo", url: "" })로 시작한다. 이미 links가 있으면 거절한다.
//   delete  항목을 지운다. 번호(no)나 이름표(id)가 있는 항목(카드, 섹션)과 배열의 마지막 항목은 지우지 않는다.
//           카드와 섹션의 번호는 한 번 쓰면 다시 쓰지 않는 규칙이 있어서, 그런 삭제는 IDE에서 사람이 한다.
// 섹션 추가와 섹션 이동은 이 도구의 범위 밖이다. (구조가 크게 바뀌므로 상의해서 IDE에서 한다.)
import { parse } from "acorn";

export const PLACEHOLDER = "새 글자";
// 새 항목을 만들 때 값을 복사하지 않는 속성. 주소와 사진은 사람이 정한다.
const OMIT_KEYS = new Set(["id", "link", "linkText", "demo", "url", "image", "target"]);
// 값이 없을 때 set으로 새로 만들 수 있는 속성. (카드의 링크 칸. 편집 모드에서 빈 칸에 주소를 쓰면 만들어진다.)
const CREATABLE_PROPS = new Set(["link", "linkText", "demo", "url"]);
const MAX_TEXT = 5000;
const PARSE_OPTIONS = { ecmaVersion: "latest", sourceType: "module" };

// ---------- 구문 트리 ----------
const keyName = (prop) => (prop.key.type === "Identifier" ? prop.key.name : prop.key.value);

function getProp(objectNode, name) {
  if (objectNode?.type !== "ObjectExpression") return null;
  return objectNode.properties.find((prop) => prop.type === "Property" && keyName(prop) === name)?.value ?? null;
}

const isString = (node) => node?.type === "Literal" && typeof node.value === "string";

function pageOf(source) {
  const ast = parse(source, PARSE_OPTIONS);
  const exported = ast.body.find(
    (node) => node.type === "ExportNamedDeclaration" && node.declaration?.declarations?.[0]?.init?.type === "ObjectExpression",
  );
  const page = exported?.declaration.declarations[0].init;
  if (!page) throw new Error("데이터 파일에서 export한 페이지 객체를 찾지 못함");
  return page;
}

// 구문 트리 노드를 일반 값으로 바꾼다. 글자, 숫자, 배열, 객체만 다룬다.
function toValue(node) {
  if (node.type === "Literal") return node.value;
  if (node.type === "ArrayExpression") return node.elements.map(toValue);
  if (node.type === "ObjectExpression") {
    const out = {};
    for (const prop of node.properties) {
      if (prop.type !== "Property") throw new Error("지원하지 않는 객체 모양");
      out[keyName(prop)] = toValue(prop.value);
    }
    return out;
  }
  throw new Error(`지원하지 않는 값 종류: ${node.type}`);
}

// ---------- 경로 ----------
const PATH_CHARS = /^[A-Za-z0-9_.\[\]=\-가-힣]+$/;

export function parsePath(path) {
  if (typeof path !== "string" || path.length === 0 || path.length > 300 || !PATH_CHARS.test(path)) {
    throw new Error("경로 형식 오류");
  }
  const steps = [];
  const re = /\.?([A-Za-z_][A-Za-z0-9_]*)|\[(\d+)\]|\[([A-Za-z_][A-Za-z0-9_]*)=([^\]]+)\]/y;
  let pos = 0;
  while (pos < path.length) {
    re.lastIndex = pos;
    const match = re.exec(path);
    if (!match) throw new Error(`경로 형식 오류: ${path}`);
    if (match[1]) steps.push({ prop: match[1] });
    else if (match[2] !== undefined) steps.push({ index: Number(match[2]) });
    else steps.push({ key: match[3], value: match[4] });
    pos = re.lastIndex;
  }
  return steps;
}

// 경로가 가리키는 노드를 찾는다. 마지막 단계가 배열 요소이면 배열 노드와 위치도 알려 준다.
function resolve(page, path) {
  const steps = parsePath(path);
  let node = page;
  let container = null;
  let index = -1;
  for (const step of steps) {
    container = null;
    index = -1;
    if (step.prop) {
      if (node?.type !== "ObjectExpression") throw new Error(`경로를 찾을 수 없음: ${path}`);
      node = getProp(node, step.prop);
    } else if (step.index !== undefined) {
      if (node?.type !== "ArrayExpression") throw new Error(`경로를 찾을 수 없음: ${path}`);
      container = node;
      index = step.index;
      node = node.elements[step.index] ?? null;
    } else {
      if (node?.type !== "ArrayExpression") throw new Error(`경로를 찾을 수 없음: ${path}`);
      container = node;
      index = node.elements.findIndex((element) => {
        const value = getProp(element, step.key);
        return value?.type === "Literal" && String(value.value) === step.value;
      });
      node = index >= 0 ? node.elements[index] : null;
    }
    if (!node) throw new Error(`경로를 찾을 수 없음: ${path}`);
  }
  return { node, container, index, steps };
}

// 경로의 마지막 단계를 새 단계로 바꾼 경로를 만든다. 예: ...roles[0] + 위치 1 -> ...roles[1]
function withLastStep(path, lastStep) {
  const base = path.slice(0, path.lastIndexOf("["));
  if (lastStep.index !== undefined) return `${base}[${lastStep.index}]`;
  return `${base}[${lastStep.key}=${lastStep.value}]`;
}

// ---------- 글자 만들기 ----------
function lineIndent(source, pos) {
  const lineStart = source.lastIndexOf("\n", pos - 1) + 1;
  return /^[ \t]*/.exec(source.slice(lineStart, pos))[0];
}

const keyText = (key) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key));
const isPrimitive = (value) => value === null || typeof value !== "object";

// 값을 소스 글자로 바꾼다. multi가 참이면 객체와 배열을 여러 줄로 쓴다.
function serialize(value, indent, multi) {
  if (typeof value === "string") return JSON.stringify(value);
  if (isPrimitive(value)) return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    // 글자만 든 배열은 한 줄로 쓴다.
    if (!multi || value.every(isPrimitive)) return `[${value.map((item) => serialize(item, indent, false)).join(", ")}]`;
    const inner = `${indent}  `;
    return `[\n${value.map((item) => `${inner}${serialize(item, inner, true)},`).join("\n")}\n${indent}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  if (!multi) return `{ ${entries.map(([key, item]) => `${keyText(key)}: ${serialize(item, indent, false)}`).join(", ")} }`;
  const inner = `${indent}  `;
  return `{\n${entries.map(([key, item]) => `${inner}${keyText(key)}: ${serialize(item, inner, true)},`).join("\n")}\n${indent}}`;
}

// 형제 항목의 모양을 따르되 글자는 견본 글자로 채운 값을 만든다.
function blank(value) {
  if (typeof value === "string") return PLACEHOLDER;
  if (isPrimitive(value)) return value;
  if (Array.isArray(value)) return value.length > 0 ? [blank(value[0])] : [];
  const out = {};
  for (const [name, item] of Object.entries(value)) {
    if (OMIT_KEYS.has(name)) continue;
    // 블록의 종류(type)는 견본 글자로 바꾸지 않는다. 바꾸면 어떤 블록인지 알 수 없게 된다.
    out[name] = name === "type" ? item : blank(item);
  }
  return out;
}

const withNewlines = (text, source) => (source.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text);

// 배열의 idx번째 요소 뒤에 값을 넣은 새 소스를 만든다.
function insertAfterElement(source, container, idx, value) {
  const sibling = container.elements[idx];
  const siblingText = source.slice(sibling.start, sibling.end);
  const containerText = source.slice(container.start, container.end);
  const multi = siblingText.includes("\n");
  const indent = lineIndent(source, sibling.start);
  const text = serialize(value, indent, multi);
  // 배열이 한 줄이면 같은 줄에 이어 붙이고, 여러 줄이면 다음 줄에 넣는다.
  const insertion = containerText.includes("\n") ? `,\n${indent}${text}` : `, ${text}`;
  return source.slice(0, sibling.end) + withNewlines(insertion, source) + source.slice(sibling.end);
}

// 배열의 맨 앞에 값을 넣은 새 소스를 만든다. (insertAfterElement의 앞쪽 판)
function insertBeforeFirst(source, container, value) {
  const first = container.elements[0];
  const multi = source.slice(first.start, first.end).includes("\n");
  const indent = lineIndent(source, first.start);
  const text = serialize(value, indent, multi);
  const gap = source.slice(container.start, container.end).includes("\n") ? `,\n${indent}` : ", ";
  return source.slice(0, first.start) + withNewlines(text + gap, source) + source.slice(first.start);
}

// ---------- 작업 ----------
function checkText(value) {
  if (typeof value !== "string") throw new Error("글자가 아님");
  if (value.length > MAX_TEXT) throw new Error(`글자가 너무 김 (최대 ${MAX_TEXT}자)`);
  // 줄바꿈 외의 제어 문자는 거부한다.
  if (/[\u0000-\u0009\u000b-\u001f\u007f]/.test(value)) throw new Error("허용되지 않는 제어 문자");
}

// 객체의 맨 끝에 속성 하나를 더한 새 소스를 만든다. 객체에 속성이 하나도 없으면 거절한다.
function appendProp(source, objectNode, name, value) {
  const last = objectNode.properties[objectNode.properties.length - 1];
  if (!last) throw new Error("빈 객체에는 속성을 더하지 않음");
  const text = withNewlines(`,
${lineIndent(source, last.start)}${name}: ${JSON.stringify(value)}`, source);
  return source.slice(0, last.end) + text + source.slice(last.end);
}

// 없는 속성(CREATABLE_PROPS)에 처음 값을 쓰는 set이면 속성을 만든다. 원래 값(old)은 빈 글자여야 한다.
function createProp(source, op) {
  const steps = parsePath(op.path);
  const last = steps[steps.length - 1];
  if (!last.prop || !CREATABLE_PROPS.has(last.prop) || steps.length < 2) return null;
  const parentPath = op.path.slice(0, op.path.lastIndexOf("."));
  const { node: parent } = resolve(pageOf(source), parentPath);
  if (parent.type !== "ObjectExpression" || getProp(parent, last.prop)) return null;
  if (op.old !== "") throw new Error(`파일의 값이 화면과 다름: ${op.path}`);
  if (op.value === "") return { source };
  return { source: appendProp(source, parent, last.prop, op.value) };
}

function opSet(source, op) {
  checkText(op.value);
  const created = createProp(source, op);
  if (created) return created;
  const { node } = resolve(pageOf(source), op.path);
  if (!isString(node)) throw new Error(`글자가 아닌 위치: ${op.path}`);
  if (node.value !== op.old) throw new Error(`파일의 값이 화면과 다름 (IDE에서 먼저 고쳤을 수 있음): ${op.path}`);
  // 글자가 같으면 소스를 바꾸지 않는다.
  if (op.value === node.value) return { source };
  return { source: source.slice(0, node.start) + JSON.stringify(op.value) + source.slice(node.end) };
}

function nextNumber(container) {
  let max = 0;
  for (const element of container.elements) {
    const no = getProp(element, "no");
    if (no?.type === "Literal" && Number.isInteger(no.value)) max = Math.max(max, no.value);
  }
  return max + 1;
}

// 구분선 항목의 글자. 화면 코드(common/section-parts.js)의 DIVIDER와 같아야 한다.
const DIVIDER = "---";
// 인쇄 쪽 나눔 표식의 글자. 화면 코드(common/section-parts.js)의 PAGE_BREAK와 같아야 한다.
const PAGE_BREAK = "===";
const isMarker = (node) => isString(node) && (node.value === DIVIDER || node.value === PAGE_BREAK);

// 쪽 나눔 표식을 넣을 수 있는 배열인가. 번호나 이름표(no, id)가 있는 항목(카드, 섹션)의 배열이 아니면 된다.
// 경력의 직책(roles)과 묶음(groups), 글머리 목록, 소개 단락, 프로젝트 블록(blocks)과 줄글(text)이 여기에 든다.
function allowsPageBreak(container) {
  return container.elements.every((node) => !(getProp(node, "no") || getProp(node, "id")));
}

// 구분선과 하위 줄을 넣을 수 있는 목록의 항목인가. 글자이거나, text가 글자이고 label과 번호(no, id)가 없는 객체이다.
function isListItemNode(node) {
  if (isString(node)) return true;
  return node?.type === "ObjectExpression" && isString(getProp(node, "text")) && !getProp(node, "label") && !getProp(node, "no") && !getProp(node, "id");
}

// 직책 행 목록(roles)의 직책인가. role, period, groups, body 중 하나를 가지고 번호(no, id)가 없는 객체이다.
// 직책 사이에도 구분선("---")을 넣을 수 있다. (화면 코드: sections/career.js)
function isRoleNode(node) {
  if (node?.type !== "ObjectExpression" || getProp(node, "no") || getProp(node, "id")) return false;
  return ["role", "period", "groups", "body"].some((name) => getProp(node, name));
}

// 구분선을 넣을 수 있는 배열인가. 글자 목록(항목, 구분선)이거나 직책 행 목록(직책, 구분선)이다. 둘이 섞인 배열은 아니다.
function allowsDivider(container) {
  const elements = container.elements;
  return elements.every(isListItemNode) || elements.every((node) => isRoleNode(node) || isMarker(node));
}

// 경로가 하위 줄(...sub[n])을 가리키는가. 하위 줄은 한 단계만 허용한다.
const isSubPath = (steps) => steps.length >= 2 && steps[steps.length - 2].prop === "sub" && steps[steps.length - 1].index !== undefined;

function opInsert(source, op) {
  const { node, container, index, steps } = resolve(pageOf(source), op.path);
  if (!container) throw new Error(`배열 항목이 아닌 위치: ${op.path}`);
  if (op.value !== undefined) {
    // 값을 주면 견본 글자 대신 그 값을 넣는다. 넣을 수 있는 값은 구분선과 인쇄 쪽 나눔 표식뿐이다.
    if (op.value === PAGE_BREAK) {
      if (isSubPath(steps)) throw new Error("하위 줄에는 쪽 나눔을 넣지 않음");
      if (!allowsPageBreak(container)) throw new Error("쪽 나눔을 넣을 수 없는 목록 (카드, 섹션 목록)");
      return { source: insertAfterElement(source, container, index, PAGE_BREAK), path: withLastStep(op.path, { index: index + 1 }) };
    }
    if (op.value !== DIVIDER) throw new Error("넣을 수 있는 값은 구분선(---)과 쪽 나눔(===)뿐");
    if (isSubPath(steps)) throw new Error("하위 줄에는 구분선을 넣지 않음");
    if (!allowsDivider(container)) throw new Error("구분선을 넣을 수 없는 목록");
    return { source: insertAfterElement(source, container, index, DIVIDER), path: withLastStep(op.path, { index: index + 1 }) };
  }
  // 직책 행 목록에서 구분선을 눌러 "+"를 하면 글자 "새 글자"가 아니라 가까운 직책의 모양을 따른 새 직책을 넣는다.
  const isRoleList = container.elements.some(isRoleNode);
  if (isRoleList && isMarker(node)) {
    const before = container.elements.slice(0, index).reverse().find(isRoleNode);
    const template = before ?? container.elements.find(isRoleNode);
    const value = blank(toValue(template));
    return { source: insertAfterElement(source, container, index, value), path: withLastStep(op.path, { index: index + 1 }) };
  }
  const sibling = toValue(node);
  const value = blank(sibling);
  if (!isPrimitive(value) && !Array.isArray(value) && "no" in sibling) value.no = nextNumber(container);
  // 블록으로 짠 카드를 따라 만들면 첫 블록만 복사되어 주소가 견본 글자인 사진 블록이 생긴다.
  // 새 카드는 제목줄과 빈 줄글로 시작한다. 사진은 "사진 추가"로 넣는다. (제목줄 위에 들어간다.)
  if (!isPrimitive(value) && Array.isArray(sibling?.blocks)) value.blocks = [BLOCK_TEMPLATES.head(), BLOCK_TEMPLATES.text()];
  const next = insertAfterElement(source, container, index, value);
  const last = steps[steps.length - 1];
  const newStep = last.index !== undefined ? { index: last.index + 1 } : { key: last.key, value: String(value[last.key]) };
  return { source: next, path: withLastStep(op.path, newStep) };
}

// 항목 아래에 하위 줄을 하나 더한다. 하위 줄은 항목의 sub 배열에 글자로 들어간다. (한 단계만)
//   글자 항목        -> { text: "원래 글자", sub: ["새 글자"] } 로 바꾼다.
//   sub가 없는 객체  -> sub: ["새 글자"]를 더한다.
//   sub가 있는 객체  -> sub의 맨 끝에 "새 글자"를 넣는다.
function opInsertChild(source, op) {
  const { node, container, steps } = resolve(pageOf(source), op.path);
  if (!container) throw new Error(`배열 항목이 아닌 위치: ${op.path}`);
  if (isSubPath(steps)) throw new Error("하위 줄에는 하위 줄을 만들지 않음 (한 단계만)");
  if (!isListItemNode(node)) throw new Error("하위 줄을 만들 수 없는 항목");
  if (isMarker(node)) throw new Error("구분선과 쪽 나눔에는 하위 줄을 만들지 않음");
  const replaceNode = (value) => ({
    source: source.slice(0, node.start) + serialize(value, "", false) + source.slice(node.end),
    path: `${op.path}.sub[0]`,
  });
  if (isString(node)) return replaceNode({ text: node.value, sub: [PLACEHOLDER] });
  const sub = getProp(node, "sub");
  if (!sub) return replaceNode({ ...toValue(node), sub: [PLACEHOLDER] });
  if (sub.type !== "ArrayExpression") throw new Error("sub가 배열이 아님");
  if (sub.elements.length === 0) {
    return { source: source.slice(0, sub.start) + serialize([PLACEHOLDER], "", false) + source.slice(sub.end), path: `${op.path}.sub[0]` };
  }
  const last = sub.elements.length - 1;
  return { source: insertAfterElement(source, sub, last, PLACEHOLDER), path: `${op.path}.sub[${last + 1}]` };
}

// 카드 경로. 예: sections[id=s03-projects].cards[no=2]
export const CARD_PATH = /^sections\[id=[A-Za-z0-9-]+\]\.cards\[no=\d+\]$/;
// 카드 사진 목록(images)의 한 사진 경로. 예: sections[id=s03-projects].cards[no=2].images[1]
export const IMAGE_ITEM_PATH = /^sections\[id=[A-Za-z0-9-]+\]\.cards\[no=\d+\]\.images\[\d+\]$/;
// 올려 받은 사진의 주소. 개발 서버가 만드는 이름 모양과 같다.
export const IMAGE_SRC = /^\/images\/[A-Za-z0-9._-]+\.webp$/;

// 카드 블록 목록(blocks)의 한 블록 경로. 예: sections[id=s03-projects].cards[no=1].blocks[2]
export const BLOCK_PATH = /^sections\[id=[A-Za-z0-9-]+\]\.cards\[no=\d+\]\.blocks\[\d+\]$/;

// 새 블록의 처음 모양. 사진 블록은 사진을 올려서 만든다. (addImage)
const BLOCK_TEMPLATES = {
  head: () => ({ type: "head", title: PLACEHOLDER, links: [{ label: "GitHub Repo", url: "" }] }),
  // 줄글 블록은 두 칸 행(소제목 | 줄글들)으로 시작한다. 소제목과 줄글은 편집 모드에서 눌러서 쓴다.
  text: () => ({ type: "text", rows: [{ head: "", body: [""] }] }),
};

// 블록 경로나 카드 경로에서 카드 경로, 블록 목록 노드, 넣을 위치(그 뒤)를 찾는다.
// 카드 경로이면 맨 끝 뒤에 넣는다. 카드에 블록 목록이 없으면 null을 돌려준다.
function blockTarget(source, path) {
  const isBlock = BLOCK_PATH.test(path ?? "");
  const cardPathText = isBlock ? path.replace(/\.blocks\[\d+\]$/, "") : path;
  if (!CARD_PATH.test(cardPathText ?? "")) return null;
  const { node: card } = resolve(pageOf(source), cardPathText);
  const blocks = getProp(card, "blocks");
  if (blocks?.type !== "ArrayExpression" || blocks.elements.length === 0) return null;
  const after = isBlock ? Number(/\[(\d+)\]$/.exec(path)[1]) : blocks.elements.length - 1;
  if (after >= blocks.elements.length) throw new Error(`블록이 없음: ${path}`);
  return { cardPathText, card, blocks, after, isBlock };
}

// 블록을 하나 넣는다. kind는 head(제목줄) 또는 text(줄글)이다. path는 블록(그 뒤에) 또는 카드(맨 끝에)이다.
function opInsertBlock(source, op) {
  const make = BLOCK_TEMPLATES[op.kind];
  if (!make) throw new Error("블록 종류는 head 또는 text");
  const target = blockTarget(source, op.path);
  if (!target) throw new Error("블록 목록(blocks)이 있는 카드가 아님");
  const { cardPathText, blocks, after } = target;
  return { source: insertAfterElement(source, blocks, after, make()), path: `${cardPathText}.blocks[${after + 1}]` };
}

// 사진 객체의 src 글자만 바꾼다. (설명 alt와 줄글 text는 그대로)
function replaceSrc(source, imageNode, src) {
  const node = getProp(imageNode, "src");
  if (!isString(node)) throw new Error("사진에 src가 없음 (IDE에서 고쳐야 함)");
  return { source: source.slice(0, node.start) + JSON.stringify(src) + source.slice(node.end) };
}

// 사진 주소를 바꾼다.
//   path가 사진 목록의 한 사진(...images[n])이면 그 사진을 바꾼다.
//   path가 카드이면: 사진 목록(images)이 있으면 첫 사진을, 없으면 image를 바꾼다. image도 없으면 image를 새로 만든다.
function opSetImage(source, op) {
  if (!IMAGE_SRC.test(op.src ?? "")) throw new Error("사진 주소 형식 오류");
  // 블록 목록: 사진 블록이면 그 사진을, 카드이면 첫 사진 블록을 바꾼다.
  if (BLOCK_PATH.test(op.path ?? "")) {
    const { node } = resolve(pageOf(source), op.path);
    if (!isString(getProp(node, "type")) || getProp(node, "type").value !== "image") throw new Error("사진 블록이 아님");
    return replaceSrc(source, node, op.src);
  }
  const blockCard = blockTarget(source, op.path);
  if (blockCard) {
    const first = blockCard.blocks.elements.find((node) => isString(getProp(node, "type")) && getProp(node, "type").value === "image");
    if (!first) throw new Error("사진 블록이 없음 (사진 추가로 만든다)");
    return replaceSrc(source, first, op.src);
  }
  if (IMAGE_ITEM_PATH.test(op.path ?? "")) {
    const { node } = resolve(pageOf(source), op.path);
    if (node.type !== "ObjectExpression") throw new Error(`사진이 아님: ${op.path}`);
    return replaceSrc(source, node, op.src);
  }
  if (!CARD_PATH.test(op.path ?? "")) throw new Error("카드 경로가 아님");
  const { node: card } = resolve(pageOf(source), op.path);
  if (card.type !== "ObjectExpression") throw new Error(`카드가 아님: ${op.path}`);
  const images = getProp(card, "images");
  if (images?.type === "ArrayExpression" && images.elements.length > 0) return replaceSrc(source, images.elements[0], op.src);
  const image = getProp(card, "image");
  if (image) return replaceSrc(source, image, op.src);
  const title = getProp(card, "title");
  const alt = isString(title) ? `${title.value} 사진` : "";
  const last = card.properties[card.properties.length - 1];
  const indent = lineIndent(source, last.start);
  const text = withNewlines(`,\n${indent}image: { src: ${JSON.stringify(op.src)}, alt: ${JSON.stringify(alt)} }`, source);
  return { source: source.slice(0, last.end) + text + source.slice(last.end) };
}

// 본문(body)을 첫 사진의 줄글로 옮길 수 있으면 줄글 목록을 돌려준다. 옮길 수 없으면 null이다.
// 문자열 하나이거나 문자열만 든 배열일 때만 옮긴다. (하위 줄이 있는 항목, 구분선은 줄글이 아니므로 본문에 남긴다.)
// 빈 글자("")는 버린다.
function bodyAsText(body) {
  if (!body) return [];
  if (isString(body)) return body.value ? [body.value] : [];
  if (body.type !== "ArrayExpression") return null;
  if (!body.elements.every((node) => isString(node) && node.value !== "---")) return null;
  return body.elements.map((node) => node.value).filter(Boolean);
}

// 사진을 하나 더한다. 둘째 사진부터는 인쇄에서 새 쪽에서 시작한다.
//   path가 사진 목록의 한 사진(...images[n])이면 그 뒤에 넣는다. 카드이면 맨 끝에 넣는다.
//   카드가 아직 예전 방식(image 한 장과 body)이면 먼저 사진 목록으로 바꾼다.
//     image -> images[0], body(줄글로 옮길 수 있으면) -> images[0].text. 옮긴 image와 body는 지운다.
//   새 사진의 줄글은 빈 줄글 하나([""])로 시작한다. 편집 모드에서 눌러서 쓴다.
function opAddImage(source, op) {
  if (!IMAGE_SRC.test(op.src ?? "")) throw new Error("사진 주소 형식 오류");
  // 블록 목록: 사진 블록을 그 블록 뒤(카드이면 맨 끝)에 넣는다.
  const blockCard = blockTarget(source, op.path);
  if (blockCard) {
    const { cardPathText, card: blockOwner, blocks, isBlock } = blockCard;
    const ownerTitle = getProp(blockOwner, "title");
    const isImage = (node) => isString(getProp(node, "type")) && getProp(node, "type").value === "image";
    const count = blocks.elements.filter(isImage).length;
    const value = { type: "image", src: op.src, alt: `${isString(ownerTitle) ? ownerTitle.value : ""} 사진 ${count + 1}`.trim() };
    // 블록을 골랐으면 그 뒤에 넣는다. 카드를 골랐으면 마지막 사진 블록 뒤에 넣는다. 사진 블록이 없으면 맨 앞에 넣는다.
    // (보통의 순서가 사진1, 사진2, 제목줄, 줄글이기 때문이다.)
    let after = blockCard.after;
    if (!isBlock) {
      after = -1;
      blocks.elements.forEach((node, index) => { if (isImage(node)) after = index; });
    }
    if (after < 0) return { source: insertBeforeFirst(source, blocks, value), path: `${cardPathText}.blocks[0]` };
    return { source: insertAfterElement(source, blocks, after, value), path: `${cardPathText}.blocks[${after + 1}]` };
  }
  const itemMatch = IMAGE_ITEM_PATH.test(op.path ?? "");
  const cardPathText = itemMatch ? op.path.replace(/\.images\[\d+\]$/, "") : op.path;
  if (!CARD_PATH.test(cardPathText ?? "")) throw new Error("카드 경로가 아님");
  let { node: card } = resolve(pageOf(source), cardPathText);
  if (card.type !== "ObjectExpression") throw new Error(`카드가 아님: ${cardPathText}`);
  const title = getProp(card, "title");
  const titleText = isString(title) ? title.value : "";
  const images = getProp(card, "images");

  if (images?.type === "ArrayExpression" && images.elements.length > 0) {
    const after = itemMatch ? Number(/\[(\d+)\]$/.exec(op.path)[1]) : images.elements.length - 1;
    if (after >= images.elements.length) throw new Error(`사진이 없음: ${op.path}`);
    const value = { src: op.src, alt: `${titleText} 사진 ${images.elements.length + 1}`.trim(), text: [""] };
    return { source: insertAfterElement(source, images, after, value), path: `${cardPathText}.images[${after + 1}]` };
  }

  // 예전 방식 -> 사진 목록
  const list = [];
  const image = getProp(card, "image");
  const moved = bodyAsText(getProp(card, "body"));
  if (image?.type === "ObjectExpression") {
    const src = getProp(image, "src");
    const alt = getProp(image, "alt");
    list.push({ src: isString(src) ? src.value : "", alt: isString(alt) ? alt.value : "", text: moved && moved.length > 0 ? moved : [""] });
  }
  list.push({ src: op.src, alt: `${titleText} 사진 ${list.length + 1}`.trim(), text: [""] });
  let next = source;
  const remove = ["image", ...(image && moved ? ["body"] : [])];
  for (const name of remove) {
    next = removeProp(next, card, name);
    card = resolve(pageOf(next), cardPathText).node;
  }
  const last = card.properties[card.properties.length - 1];
  if (!last) throw new Error("빈 카드에는 사진 목록을 만들지 않음");
  const indent = lineIndent(next, last.start);
  next = next.slice(0, last.end) + withNewlines(`,\n${indent}images: ${serialize(list, indent, true)}`, next) + next.slice(last.end);
  return { source: next, path: `${cardPathText}.images[${list.length - 1}]` };
}

// 객체의 속성 하나를 지운 새 소스를 만든다. 속성이 자기 줄에 있으면 그 줄을 통째로 지운다.
function removeProp(source, objectNode, name) {
  const prop = objectNode.properties.find((item) => item.type === "Property" && keyName(item) === name);
  if (!prop) return source;
  const lineStart = source.lastIndexOf("\n", prop.start - 1) + 1;
  const lineEndAt = source.indexOf("\n", prop.end);
  const lineEnd = lineEndAt < 0 ? source.length : lineEndAt;
  const before = source.slice(lineStart, prop.start);
  const after = source.slice(prop.end, lineEnd);
  if (/^[ \t]*$/.test(before) && /^[ \t]*,?[ \t]*(\/\/.*)?\r?$/.test(after)) {
    return source.slice(0, lineStart) + source.slice(Math.min(lineEnd + 1, source.length));
  }
  // 한 줄에 여러 속성이 있으면 뒤의 쉼표와 공백까지 지운다.
  const tail = /^\s*,\s*/.exec(source.slice(prop.end))?.[0] ?? "";
  return source.slice(0, prop.start) + source.slice(prop.end + tail.length);
}

const isHttp = (value) => typeof value === "string" && /^https?:\/\//.test(value);

function opInitLinks(source, op) {
  if (!CARD_PATH.test(op.path ?? "")) throw new Error("카드 경로가 아님");
  let { node: card } = resolve(pageOf(source), op.path);
  if (card.type !== "ObjectExpression") throw new Error(`카드가 아님: ${op.path}`);
  if (getProp(card, "links")) throw new Error("이미 링크 목록(links)이 있음");
  const text = (name) => (isString(getProp(card, name)) ? getProp(card, name).value : "");
  const repo = isHttp(text("linkText")) ? text("linkText") : text("link");
  const links = [];
  if (repo) links.push({ label: "GitHub Repo", url: repo });
  if (text("demo")) links.push({ label: "배포 링크", url: text("demo") });
  if (links.length === 0) links.push({ label: "GitHub Repo", url: "" });
  // 옮긴 속성을 지운다. 지울 때마다 위치가 바뀌므로 카드를 다시 찾는다.
  let next = source;
  for (const name of ["link", "linkText", "demo"]) {
    next = removeProp(next, card, name);
    card = resolve(pageOf(next), op.path).node;
  }
  const last = card.properties[card.properties.length - 1];
  if (!last) throw new Error("빈 카드에는 링크 목록을 만들지 않음");
  const indent = lineIndent(next, last.start);
  const value = serialize(links, indent, true);
  next = next.slice(0, last.end) + withNewlines(`,\n${indent}links: ${value}`, next) + next.slice(last.end);
  return { source: next };
}

function opMove(source, op) {
  if (op.dir !== -1 && op.dir !== 1) throw new Error("이동 방향 오류");
  const { container, index, steps } = resolve(pageOf(source), op.path);
  if (!container) throw new Error(`배열 항목이 아닌 위치: ${op.path}`);
  const other = index + op.dir;
  if (other < 0 || other >= container.elements.length) throw new Error("더 이상 이동할 수 없음");
  const [first, second] = op.dir === 1 ? [container.elements[index], container.elements[other]] : [container.elements[other], container.elements[index]];
  const firstText = source.slice(first.start, first.end);
  const secondText = source.slice(second.start, second.end);
  const next = source.slice(0, first.start) + secondText + source.slice(first.end, second.start) + firstText + source.slice(second.end);
  const last = steps[steps.length - 1];
  // 번호로 찾는 항목(no, id)은 이동해도 경로가 같다.
  const path = last.index !== undefined ? withLastStep(op.path, { index: other }) : op.path;
  return { source: next, path };
}

function opDelete(source, op) {
  const { node, container, index, steps } = resolve(pageOf(source), op.path);
  if (!container) throw new Error(`배열 항목이 아닌 위치: ${op.path}`);
  if (getProp(node, "no") || getProp(node, "id")) {
    throw new Error("번호가 있는 항목(카드, 섹션)은 삭제하지 않음 (번호를 다시 쓰지 않는 규칙. IDE에서 삭제)");
  }
  if (isSubPath(steps) && container.elements.length <= 1) {
    // 하위 줄의 마지막 하나: 하위 줄 묶음(sub)을 통째로 지운다. 글자(text)만 남으면 다시 글자 항목으로 되돌린다.
    const parent = resolve(pageOf(source), op.path.replace(/\.sub\[\d+\]$/, "")).node;
    const value = toValue(parent);
    delete value.sub;
    const keys = Object.keys(value);
    const text = keys.length === 1 && keys[0] === "text" ? JSON.stringify(value.text) : serialize(value, "", false);
    return { source: source.slice(0, parent.start) + text + source.slice(parent.end) };
  }
  if (container.elements.length <= 1) throw new Error("배열의 마지막 항목은 삭제하지 않음 (비면 다시 추가할 수 없음)");

  const lineStart = source.lastIndexOf("\n", node.start - 1) + 1;
  const lineEndAt = source.indexOf("\n", node.end);
  const lineEnd = lineEndAt < 0 ? source.length : lineEndAt;
  const before = source.slice(lineStart, node.start);
  const after = source.slice(node.end, lineEnd);
  let next;
  if (/^[ \t]*$/.test(before) && /^[ \t]*,?[ \t]*(\/\/.*)?\r?$/.test(after)) {
    // 항목이 자기 줄에 있으면 그 줄 전체(뒤의 쉼표와 줄 끝 주석 포함)를 지운다.
    next = source.slice(0, lineStart) + source.slice(Math.min(lineEnd + 1, source.length));
  } else if (index < container.elements.length - 1) {
    // 한 줄 배열의 앞쪽, 중간 항목: 뒤의 항목 시작까지 지운다.
    next = source.slice(0, node.start) + source.slice(container.elements[index + 1].start);
  } else {
    // 한 줄 배열의 마지막 항목: 앞 항목 끝부터 지운다.
    next = source.slice(0, container.elements[index - 1].end) + source.slice(node.end);
  }
  return { source: next };
}

// 작업 목록을 차례로 적용한 새 소스를 반환한다. 하나라도 실패하면 오류를 던진다. (파일은 바꾸지 않는다.)
export function applyOps(source, ops) {
  if (!Array.isArray(ops) || ops.length === 0 || ops.length > 200) throw new Error("작업 목록 오류");
  let current = source;
  const results = [];
  for (const op of ops) {
    let outcome;
    if (op?.type === "set") outcome = opSet(current, op);
    else if (op?.type === "insert") outcome = opInsert(current, op);
    else if (op?.type === "insertChild") outcome = opInsertChild(current, op);
    else if (op?.type === "move") outcome = opMove(current, op);
    else if (op?.type === "setImage") outcome = opSetImage(current, op);
    else if (op?.type === "initLinks") outcome = opInitLinks(current, op);
    else if (op?.type === "addImage") outcome = opAddImage(current, op);
    else if (op?.type === "insertBlock") outcome = opInsertBlock(current, op);
    else if (op?.type === "delete") outcome = opDelete(current, op);
    else throw new Error(`알 수 없는 작업: ${op?.type}`);
    current = outcome.source;
    // 매 작업 뒤에 문법이 맞는지 확인한다.
    pageOf(current);
    const { source: _source, ...info } = outcome;
    results.push(info);
  }
  return { source: current, results };
}
