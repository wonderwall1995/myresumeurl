// 경력 섹션. 카드는 두 가지 형태를 받는다.
//
// 1. 직책이 하나인 카드 (card.role, card.period, card.body)
//    순서: 머리(기업명과 직책명), 근속기간, 스킬, 내용.
//
// 2. 직책이 바뀐 카드 (card.roles). 같은 기업에서 직책이 변한 경력이다.
//    순서: 기업명(card.company), 설명(card.description), 스킬(card.skills, 선택). 이 값들은 카드 하나에 한 번만 나온다.
//    그 아래에 직책마다 머리(직책명과 근속기간 한 줄), 내용이 차례로 나온다.
//    직책의 내용은 묶음(stage.groups)이거나 글자 목록(stage.body)이다.
//    묶음은 { label: "소제목", items: ["항목", ...] } 배열이다. 소제목 아래에 항목이 불릿으로 나온다.
//    직책 구간은 roles 배열의 순서대로 나온다. 이름표는 <카드>-r1-head, <카드>-r1-g1-list 형태이다.
//    roles 배열에 글자 "---"를 넣으면 그 자리에 구분선이 나온다. 이름표는 <카드>-d1 형태이고, 직책 번호(r1, r2)에는 영향이 없다.
//
// 섹션 제목 아래에는 실행 분야(data.interests)가 한 번 나온다. 카드 앞에 놓인다. (renderInterests)
// 그 바로 아래에 관심 분야 글(data.focus)이 한 번 나온다. (renderFocus)
// 그 아래에 Worklist 제목(data.worklistHeading)이 한 번 나오고, 이어서 카드(경력 목록)가 나온다. (renderWorklistHeading)
// 직책이 바뀐 카드는 테두리가 없다. 직책마다 행(div.card-role-row)이 있고, 행은 왼쪽 칸(머리)과 오른쪽 칸(내용)으로 나뉜다.
// 박스는 세로로 쌓인다. 기업명과 직책명은 같은 줄에 놓고 근속기간은 다음 줄에 놓는다.
// 함수의 base(p)는 카드의 편집 경로이다. 편집 모드에서 요소와 데이터 위치를 잇는다. (lib/edit-path.js)
import { el } from "../lib/dom.js";
import { partId, testAttr } from "../lib/ids.js";
import { cardPath, itemPath, sectionPath } from "../lib/edit-path.js";
import { box, renderCards } from "../common/card.js";
import { createBody, createList, DIVIDER, renderHeading } from "../common/section-parts.js";

// 기업명과 직책명을 제목(h3) 하나에 담는다. 두 값 사이에 공백을 둔다.
// baseId는 이름표의 앞부분이다. p는 카드의 편집 경로이다.
function createTitle(company, role, baseId, p) {
  const parts = [];
  // 클래스 card-company와 card-role은 CSS가 굵기를 다르게 하는 데 쓴다.
  if (company) {
    parts.push(el("span", { text: company, className: "card-company", attrs: testAttr(partId(baseId, "company")), edit: `${p}.company` }));
  }
  if (role) {
    if (company) parts.push(document.createTextNode(" "));
    parts.push(el("span", { text: role, className: "card-role", attrs: testAttr(partId(baseId, "role")), edit: `${p}.role` }));
  }
  return parts.length > 0 ? el("h3", {}, parts) : null;
}

// 직책이 하나인 카드의 박스들
function buildSingle(card, id, p) {
  return [
    box(id, "head", [createTitle(card.company, card.role, id, p)]),
    box(id, "period", card.period ? [el("p", { text: card.period, edit: `${p}.period` })] : []),
    box(id, "skills", [createList(card.skills, partId(id, "skills-list"), "tag-list", `${p}.skills`)]),
    box(id, "body", [createBody(card.body, partId(id, "body-text"), `${p}.body`)]),
  ];
}

// 직책 머리 한 줄. 직책명(굵게)과 근속기간이 같은 줄에 놓인다. rp는 직책의 편집 경로이다.
function createStageHead(stage, stageId, rp) {
  const parts = [];
  if (stage.role) parts.push(el("span", { text: stage.role, className: "card-stage-role", attrs: testAttr(partId(stageId, "role")), edit: `${rp}.role` }));
  if (stage.period) parts.push(el("span", { text: stage.period, className: "card-stage-period", attrs: testAttr(partId(stageId, "period")), edit: `${rp}.period` }));
  return parts.length > 0 ? el("h4", { className: "card-stage-head" }, parts) : null;
}

// 직책의 내용. 묶음마다 소제목(p)과 불릿 목록(ul)이 차례로 나온다. 묶음이 없으면 글자 목록(body)을 쓴다.
function createGroups(stage, stageId, rp) {
  const nodes = [];
  (stage.groups ?? []).forEach((group, index) => {
    const groupId = partId(stageId, `g${index + 1}`);
    const gp = itemPath(`${rp}.groups`, index);
    if (group.label) {
      nodes.push(el("p", { text: group.label, className: "card-group-label", attrs: testAttr(partId(groupId, "label")), edit: `${gp}.label`, editItem: gp }));
    }
    nodes.push(createList(group.items, partId(groupId, "list"), undefined, `${gp}.items`));
  });
  nodes.push(createBody(stage.body, partId(stageId, "body-text"), `${rp}.body`));
  return nodes;
}

// 직책이 바뀐 카드의 박스들. 맨 위에 기업명, 설명, 스킬이 한 번 나오고 직책마다 머리, 내용이 이어진다.
// 박스의 이름표에는 직책 번호가 들어가고(r1-head), CSS 클래스는 항목 이름만 쓴다(card-box-head).
function buildRoles(card, id, p) {
  // 기업명과 설명은 테두리 상자(div.card-company-box) 하나에 담는다. 직책 행은 상자 밖에 놓인다.
  const companyBox = [
    box(id, "head", card.company ? [el("h3", { text: card.company, className: "card-company", attrs: testAttr(partId(id, "company")), edit: `${p}.company` })] : []),
    box(id, "description", card.description ? [el("p", { text: card.description, attrs: testAttr(partId(id, "description-text")), edit: `${p}.description`, md: "block" })] : []),
  ].filter(Boolean);
  const boxes = [
    companyBox.length > 0 ? el("div", { className: "card-company-box" }, companyBox) : null,
    box(id, "skills", [createList(card.skills, partId(id, "skills-list"), "tag-list", `${p}.skills`)]),
  ];
  // 직책 이름표의 번호(r1, r2)는 구분선을 세지 않는다. 구분선을 넣거나 빼도 직책의 이름표가 바뀌지 않는다.
  let roleCount = 0;
  let dividerCount = 0;
  card.roles.forEach((stage, index) => {
    const rp = itemPath(`${p}.roles`, index);
    // 글자 "---"는 직책 행 사이의 구분선이다. 행 전체 폭의 검정 1px 선이다. (예: QA Manager 시절과 QA Lead 시절을 나눈다.)
    if (stage === DIVIDER) {
      dividerCount += 1;
      boxes.push(el("div", { className: "role-divider", attrs: { role: "separator", ...testAttr(partId(id, `d${dividerCount}`)) }, editItem: rp }));
      return;
    }
    roleCount += 1;
    const stageName = `r${roleCount}`;
    const stageId = partId(id, stageName);
    // 직책 하나는 행 하나이다. 왼쪽 칸에 머리, 오른쪽 칸에 내용이 놓인다. (CSS: card-role-row)
    const cells = [
      box(id, `${stageName}-head`, [createStageHead(stage, stageId, rp)], "head", rp),
      box(id, `${stageName}-body`, createGroups(stage, stageId, rp), "body"),
    ].filter(Boolean);
    if (cells.length > 0) boxes.push(el("div", { className: "card-role-row" }, cells));
  });
  return boxes;
}

// 관심 분야의 묶음 하나. 소제목(label)과 한 줄 글자(text)로 이루어진다. 항목은 text 안에 쉼표로 직접 쓴다.
// 묶음 전체(div)가 배열의 한 항목이다. 편집 모드에서 묶음 단위로 추가, 이동, 삭제한다. gp는 묶음의 편집 경로이다.
function createInterestGroup(group, groupId, gp) {
  const parts = [];
  if (group.label) parts.push(el("p", { text: group.label, className: "card-group-label", attrs: testAttr(partId(groupId, "label")), edit: `${gp}.label` }));
  if (group.text) parts.push(el("p", { text: group.text, className: "interest-text", attrs: testAttr(partId(groupId, "text")), edit: `${gp}.text`, md: "inline" }));
  return parts.length > 0 ? el("div", { className: "interest-group", attrs: testAttr(groupId), editItem: gp }, parts) : null;
}

// 관심 분야. 섹션 제목과 카드 사이에 한 번 나온다. 직책 행과 같은 두 칸이다.
// 왼쪽 칸은 소제목(data.interests.heading), 오른쪽 칸은 묶음(data.interests.groups: { label, text } 배열)이다.
// 이름표는 <섹션>-interests-head, -interests-body, -interests-heading, -interests-g1, -interests-g1-label, -interests-g1-text 형태이다.
function renderInterests(root, data) {
  const interests = data.interests;
  if (!interests) return;
  const id = partId(data.id, "interests");
  const ip = `${sectionPath(data.id)}.interests`;
  const heading = interests.heading
    ? el("h4", { className: "card-stage-head" }, [
        el("span", { text: interests.heading, className: "card-stage-role", attrs: testAttr(partId(id, "heading")), edit: `${ip}.heading` }),
      ])
    : null;
  const cells = [
    box(id, "head", [heading]),
    box(id, "body", (interests.groups ?? []).map((group, index) => createInterestGroup(group, partId(id, `g${index + 1}`), itemPath(`${ip}.groups`, index)))),
  ].filter(Boolean);
  if (cells.length > 0) root.append(el("div", { className: "card-role-row interests-row" }, cells));
}

// 관심 분야 글 (data.focus). 실행 분야(renderInterests) 행 바로 아래에 한 번 나온다. 같은 두 칸 행이다.
// 왼쪽 칸은 소제목(data.focus.heading), 오른쪽 칸은 글(data.focus.text)이다. 글은 소개 본문과 같은 블록 배열이다.
// 블록에서 문자열은 단락이고, 배열은 글머리 목록이다. 문자열 하나만 써도 된다. 단락과 목록은 편집 모드에서 블록 단위로 추가, 이동, 삭제한다.
// 이름표는 <섹션>-focus-head, -focus-body, -focus-heading, -focus-text-b1 형태이다. (목록 항목은 -focus-text-b2-i1)
function renderFocus(root, data) {
  const focus = data.focus;
  if (!focus) return;
  const id = partId(data.id, "focus");
  const fp = `${sectionPath(data.id)}.focus`;
  const heading = focus.heading
    ? el("h4", { className: "card-stage-head" }, [
        el("span", { text: focus.heading, className: "card-stage-role", attrs: testAttr(partId(id, "heading")), edit: `${fp}.heading` }),
      ])
    : null;
  const text = focus.text;
  const isArray = Array.isArray(text);
  const blocks = isArray ? text : text ? [text] : [];
  const nodes = blocks.map((block, index) => {
    const blockId = isArray ? partId(id, `text-b${index + 1}`) : partId(id, "text");
    // 블록 배열이면 블록이 배열의 한 항목이다. 문자열 하나면 항목이 아니다.
    const path = isArray ? itemPath(`${fp}.text`, index) : `${fp}.text`;
    if (Array.isArray(block)) return createList(block, blockId, "focus-list", path, path);
    if (!block) return null;
    return el("p", { text: String(block), className: "focus-text", attrs: testAttr(blockId), edit: path, editItem: isArray ? path : undefined, md: "block" });
  });
  const cells = [box(id, "head", [heading]), box(id, "body", nodes)].filter(Boolean);
  if (cells.length > 0) root.append(el("div", { className: "card-role-row interests-row focus-row" }, cells));
}

// Worklist 제목 (data.worklistHeading). 관심 분야 글(renderFocus) 바로 아래, 카드 앞에 한 번 나온다.
// 섹션 제목(h2)과 같은 모양의 제목이다. (CSS가 섹션 바로 아래의 h2를 같은 모양으로 그린다.) 경력 섹션 안에 속한다.
// 이름표는 <섹션>-worklist-heading 이다. 값이 비어 있으면 나오지 않는다.
function renderWorklistHeading(root, data) {
  if (!data.worklistHeading) return;
  root.append(
    el("h2", {
      text: data.worklistHeading,
      className: "career-worklist-heading",
      attrs: testAttr(partId(data.id, "worklist-heading")),
      edit: `${sectionPath(data.id)}.worklistHeading`,
    }),
  );
}

export function renderCareer(root, data) {
  if (!data.cards?.length) return;
  renderHeading(root, data);
  renderInterests(root, data);
  renderFocus(root, data);
  renderWorklistHeading(root, data);
  const base = sectionPath(data.id);
  renderCards(root, data, (card, id) => {
    const p = cardPath(base, card.no);
    return Array.isArray(card.roles) && card.roles.length > 0 ? buildRoles(card, id, p) : buildSingle(card, id, p);
  });
}
