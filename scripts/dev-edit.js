// 개발 전용 편집 모드. 개발 서버가 HTML에 넣어 준다.
// 이 파일은 public 폴더 밖에 있다. 배포물에는 포함되지 않는다.
//
// 기능
// - 화면 왼쪽 아래의 "편집" 토글 버튼으로 켜고 끈다. (Inspector 버튼 오른쪽)
// - 켜면 data-edit 표시가 있는 글자를 눌러 바로 고친다. 일반 글자만 입력된다.
//   한 줄 글자는 Enter로 확정하고, 여러 줄 글자(소개, About)는 Enter가 줄바꿈이다. Esc는 그 글자 되돌리기, Ctrl+S는 저장이다.
// - 고친 글자는 주황 윤곽선으로 표시된다. 아래의 저장 막대에서 저장하면 서버가 데이터 파일의 그 글자만 바꾼다.
// - data-edit-item 표시가 있는 항목(카드, 직책, 묶음, 단락, 목록 항목)을 누르면 그 항목이 선택되고 도구 막대가 나타난다.
//   도구 막대는 선택된 동안 고정되어 있다. 다른 항목을 누르면 그 항목으로 옮겨 가고, 항목 밖을 누르거나 Esc를 누르면 사라진다.
//   도구: 위로, 아래로, 같은 종류 추가, 하위 줄 추가, 구분선 추가, 기호 고르기, 삭제, 상위 항목 선택. 삭제는 확인 창에서 한 번 더 묻는다.
//   기호 고르기: 선택 창에서 글머리 기호를 고르면 커서가 있는 줄의 맨 앞에 "기호 + 공백"이 들어간다. (저장 전 변경이 된다.)
//   하위 줄과 구분선은 글자 목록(ul.row-list)의 항목에서만 나온다. 하위 줄은 한 단계만이라 하위 줄에서는 숨는다.
//   직책 행의 머리 칸(직책명, 기간)을 누르면 구분선 버튼으로 그 행 아래에 직책 사이 구분선을 넣는다. (roles 배열의 글자 "---")
//   직책 사이 구분선도 선택해서 위아래 이동과 삭제를 할 수 있다. 구분선에서 "+"를 누르면 새 직책이 들어간다.
//   번호가 있는 카드는 삭제할 수 없다. (번호를 다시 쓰지 않는 규칙이 있어서 IDE에서 사람이 한다.)
// - 구조 변경(추가, 삭제, 이동)은 바로 저장된다. 저장하지 않은 글자 변경이 있으면 먼저 저장하라고 알린다.
// - "되돌리기": 저장하지 않은 글자 변경이 있으면 그것을 되돌린다. 없으면 가장 최근 저장(글자, 추가, 삭제, 이동)을 취소한다.
// - 글자 속 **굵게**와 # 제목, ## 제목, ### 제목(여러 줄 글자만)은 편집 중에도 바로 모양이 적용되어 보인다.
//   기호는 흐리게 남고 안쪽 글자만 굵게, 제목 줄은 크게 보인다. 편집을 끄면 기호 없이 굵은 글자와 제목으로 보인다. (lib/markdown.js)
// - 프로젝트 카드의 제목, 본문은 "상세 열기"로 모달을 열어 고친다. 타일의 제목은 모달의 제목과 같은 글자이다.
// - 저장, 되돌리기 결과는 화면 위쪽에 알림(토스트)으로 나온다. 성공은 초록, 실패는 빨강이다. 저장 뒤 새로고침이 일어나도 성공 알림은 이어서 보인다.
// - 저장이 끝나면 개발 서버가 화면을 새로고침한다. 편집 모드는 그대로 켜진 상태로 이어진다.
// - 왼쪽 사이드바(목차)는 편집하지 않는 영역이다. 섹션 추가와 이동도 이 도구에서 하지 않는다.
// - 인쇄할 때는 모든 편집 표시가 사라진다. (dev-edit.css)
// 하이퍼링크 주소, 사진, 사진 설명은 이 도구로 고치지 않는다.
(() => {
  const UI = "dev-edit-ui";
  const STORE_KEY = "devEditOn";
  const TOAST_KEY = "devEditToast";
  // 저장 뒤 새로고침할 때 열려 있던 프로젝트 상세(모달)의 id. 새로고침 뒤 다시 연다.
  const DIALOG_KEY = "devEditDialog";
  const KIND_LABEL = {
    cards: "카드",
    items: "항목",
    text: "단락",
    roles: "직책",
    groups: "묶음",
    contact: "연락처",
    skills: "스킬",
    body: "내용",
    sub: "하위 줄",
    links: "링크",
    images: "사진",
    blocks: "블록",
    rows: "행",
  };
  // 프로젝트 카드 링크 목록(links)의 최대 개수. 이보다 많으면 + 버튼이 멈춘다. (사용자 결정)
  const LINKS_MAX = 4;
  // 번호를 가진 카드의 경로. 삭제하지 않는다.
  const NUMBERED = /\.cards\[no=\d+\]$/;
  // 기호 선택 창에 나오는 글머리 기호. 흑백 인쇄에서 또렷한 기호만 둔다. (줄 맨 앞의 기호 마커. lib/markdown.js)
  const SYMBOLS = ["▸", "▶", "◆", "◇", "●", "○", "■", "□", "★", "☆", "✓", "✔", "✗", "✘", "→", "⇒", "※", "•", "◦", "–"];

  let enabled = false;
  let token = "";
  let undoDepth = 0;
  const pending = new Map(); // 경로 -> { old, value }
  let toggle = null;
  let bar = null;
  let barCount = null;
  let undoButton = null;
  let tools = null;
  let selected = null;
  let symbols = null; // 기호 선택 창
  let toast = null;
  let imageInput = null; // 사진 파일 선택 입력 (보이지 않음)
  let toastTimer = null;
  let md = null; // lib/markdown.js. 편집 중 굵게와 제목 표시, 편집을 끈 뒤의 화면 표시에 쓴다.
  let composing = false; // 한글 같은 조합 입력 중인지. 조합 중에는 글자 모양을 다시 입히지 않는다.

  // ---------- 보조 ----------
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // 요소의 글자를 읽는다. <br>은 줄바꿈이고, 편집 중 생긴 div는 줄 시작으로 본다.
  function readText(node) {
    let out = "";
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) out += child.nodeValue;
      else if (child.nodeName === "BR") out += "\n";
      else if (child.nodeType === Node.ELEMENT_NODE) {
        const block = child.nodeName === "DIV" || child.nodeName === "P";
        if (block && out && !out.endsWith("\n")) out += "\n";
        out += readText(child);
      }
    }
    return out;
  }

  const isMultiline = (node) => /^pre/.test(getComputedStyle(node).whiteSpace);

  // 알림(토스트)을 화면 위쪽 가운데에 띄운다. 제목 한 줄과 설명 한 줄이다.
  // kind: "info"(진행 중), "success"(성공, 초록), "error"(실패, 빨강). 알림을 누르면 바로 닫힌다.
  // 성공은 3초, 진행 중은 새 알림이 올 때까지, 실패는 10초 동안 보인다.
  function say(title, detail = "", kind = "info") {
    toast.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = title;
    toast.append(heading);
    if (detail) {
      const line = document.createElement("span");
      line.textContent = detail;
      toast.append(line);
    }
    toast.dataset.kind = kind;
    if (toast.matches(":popover-open")) toast.hidePopover();
    toast.showPopover();
    clearTimeout(toastTimer);
    if (kind !== "info") toastTimer = setTimeout(() => toast.matches(":popover-open") && toast.hidePopover(), kind === "error" ? 10000 : 3000);
  }

  // 저장이 끝나면 개발 서버가 화면을 새로고침한다. 그러면 알림이 사라지므로 새로고침 뒤에 이어서 보여 주도록 넘겨 둔다.
  function handoffToast(title, detail) {
    try {
      sessionStorage.setItem(TOAST_KEY, JSON.stringify({ title, detail }));
      // 모달 안에서 고치다가 저장하면 새로고침 뒤에도 같은 모달을 다시 연다. 그래야 이어서 고칠 수 있다.
      const open = document.querySelector("dialog.modal[open]");
      if (open?.id) sessionStorage.setItem(DIALOG_KEY, open.id);
      else sessionStorage.removeItem(DIALOG_KEY);
    } catch {
      // 저장소를 쓸 수 없으면 새로고침 뒤에는 알림이 보이지 않는다. 동작에는 문제가 없다.
    }
  }

  function showHandedOffToast() {
    try {
      const raw = sessionStorage.getItem(TOAST_KEY);
      sessionStorage.removeItem(TOAST_KEY);
      if (!raw) return;
      const { title, detail } = JSON.parse(raw);
      say(title, detail, "success");
    } catch {
      // 읽지 못하면 보여 주지 않는다.
    }
  }

  const OP_LABEL = { insertBlock: "블록 추가", initLinks: "링크 목록 만들기", insert: "항목 추가", insertChild: "하위 줄 추가", delete: "항목 삭제", move: "항목 이동", set: "글자 수정" };

  async function post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Dev-Token": token },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({ ok: false, error: "응답을 읽지 못함" }));
    if (typeof result.undo === "number") undoDepth = result.undo;
    if (!response.ok || !result.ok) throw new Error(result.error || `오류 ${response.status}`);
    return result;
  }

  const send = (ops) => post("/__dev/edit", { ops });

  // ---------- 사진 올리기 ----------
  // 프로젝트 타일(li.gallery-item)을 선택하고 "사진" 버튼을 누르면 사진 파일을 고른다.
  // 브라우저에서 가로 1200px 이하의 webp로 줄인 뒤 서버(POST /__dev/edit/image)에 보낸다. 서버가 파일을 저장하고 main.js의 image.src를 바꾼다.
  // 사진을 줄이는 이유: 큰 원본을 작게 보여 주면 윤곽에 계단이 생기고 파일도 무겁다.
  const IMAGE_MAX_WIDTH = 1200;
  const IMAGE_QUALITY = 0.85;

  // 사진 파일을 webp Blob으로 줄인다. 원본이 더 작으면 늘리지 않는다.
  async function toWebp(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_MAX_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((done) => canvas.toBlob(done, "image/webp", IMAGE_QUALITY));
    if (!blob || blob.type !== "image/webp") throw new Error("이 브라우저는 webp로 바꾸지 못함");
    return blob;
  }

  // mode: "set"(그 사진을 바꿈) 또는 "add"(그 뒤에 사진을 더함). path는 카드 또는 사진 목록의 한 사진이다.
  async function uploadImage(path, file, mode = "set") {
    if (!file.type.startsWith("image/")) {
      say("사진이 아닙니다", "이미지 파일(jpg, png, webp)을 고르세요.", "error");
      return;
    }
    say("사진을 올리는 중", `${file.name}`);
    try {
      const blob = await toWebp(file);
      const response = await fetch(`/__dev/edit/image?path=${encodeURIComponent(path)}&mode=${mode}`, {
        method: "POST",
        headers: { "Content-Type": "image/webp", "X-Dev-Token": token },
        body: blob,
      });
      const result = await response.json().catch(() => ({ ok: false, error: "응답을 읽지 못함" }));
      if (typeof result.undo === "number") undoDepth = result.undo;
      if (!response.ok || !result.ok) throw new Error(result.error || `오류 ${response.status}`);
      handoffToast(mode === "add" ? "사진을 더했습니다" : "사진을 바꿨습니다", `${result.src} (${Math.round(blob.size / 1024)}KB)`);
      say("사진을 올렸습니다", "화면을 새로 고칩니다.", "success");
    } catch (error) {
      say("사진을 올리지 못했습니다", error.message, "error");
    }
  }

  // 사진 파일 선택 창을 연다. 저장하지 않은 글자 변경이 있으면 화면이 새로고침될 때 사라지므로 먼저 저장하게 한다.
  function pickImage(path, mode = "set") {
    if (pending.size > 0) {
      say("먼저 저장하세요", "저장하지 않은 변경이 있습니다. 사진을 올리면 화면이 새로고침됩니다.", "error");
      return;
    }
    imageInput.onchange = () => {
      const file = imageInput.files[0];
      imageInput.value = "";
      if (file) uploadImage(path, file, mode);
    };
    imageInput.click();
  }

  // 되돌리기 기록은 편집을 켜 둔 동안에만 쓴다. 켤 때와 끌 때 서버의 기록을 비운다.
  // 새로고침으로 이어지는 켜짐(저장 뒤 자동 새로고침 포함)에서는 비우지 않는다.
  async function clearHistory() {
    undoDepth = 0;
    refreshBar();
    try {
      await post("/__dev/edit/undo-clear", {});
    } catch {
      // 서버가 기록을 비우지 못해도 화면의 되돌리기는 이미 막혀 있다. 다음 켜기나 끄기에서 다시 비운다.
    }
  }

  // ---------- 저장 막대 ----------
  function refreshBar() {
    barCount.textContent = `변경 ${pending.size}건`;
    if (enabled && !bar.matches(":popover-open")) bar.showPopover();
    if (!enabled && bar.matches(":popover-open")) bar.hidePopover();
    bar.classList.toggle("dev-edit-bar-dirty", pending.size > 0);
    // 저장하지 않은 변경이 있으면 그것을 되돌리고, 없으면 가장 최근 저장을 되돌린다.
    undoButton.textContent = pending.size === 0 && undoDepth > 0 ? `되돌리기 (저장 ${undoDepth}건)` : "되돌리기";
    undoButton.disabled = pending.size === 0 && undoDepth === 0;
  }

  // ---------- 굵게와 제목 표시 ----------
  const mdMode = (node) => node.dataset.md || "";

  // 요소 시작부터 (container, offset)까지의 글자 수. 글자를 읽는 방식(readText)과 같게 센다.
  function offsetOf(node, container, offset) {
    const range = document.createRange();
    range.selectNodeContents(node);
    range.setEnd(container, offset);
    return readText(range.cloneContents()).length;
  }

  // 글자 수로 정한 위치에 커서(선택 범위)를 놓는다.
  function placeCaret(node, anchor, focus) {
    const find = (target) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let passed = 0;
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const length = text.nodeValue.length;
        if (target <= passed + length) return [text, target - passed];
        passed += length;
      }
      return [node, node.childNodes.length];
    };
    const [anchorNode, anchorOffset] = find(anchor);
    const [focusNode, focusOffset] = find(focus);
    getSelection().setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
  }

  // 원본 글자(기호가 든 글자)를 돌려준다.
  // 굵게와 제목 표시가 있는 칸은 세 가지 모양(data-md-view) 중 하나이다.
  //   없음      원본 글자 그대로 (페이지가 처음 그려진 모양)
  //   edit      원본 글자에 모양만 입힘 (편집 중). 요소의 글자를 이어 붙이면 원본이다.
  //   display   기호를 지운 화면 모양. 요소에서는 원본을 읽을 수 없으므로 기억해 둔 값(data-md-raw)을 쓴다.
  // 표시 모양에서 요소의 글자를 원본으로 읽으면 ** 와 ## 가 빠진 글자가 원본이 되어, 저장이 거절되거나 기호가 지워진다.
  const rawOf = (node) => (node.dataset.mdView === "display" ? (node.dataset.mdRaw ?? "") : readText(node));

  // 편집 칸의 글자에 굵게와 제목 모양을 입힌다. 글자는 그대로이고 모양을 위한 요소만 바뀐다.
  // 커서는 글자 수로 기억했다가 되살린다.
  function showEditView(node) {
    if (!md || !node.dataset.md) return;
    const selection = getSelection();
    const inside = node.dataset.mdView !== "display" && selection.rangeCount > 0 && node.contains(selection.anchorNode) && node.contains(selection.focusNode);
    const anchor = inside ? offsetOf(node, selection.anchorNode, selection.anchorOffset) : 0;
    const focus = inside ? offsetOf(node, selection.focusNode, selection.focusOffset) : 0;
    const raw = rawOf(node);
    node.dataset.mdView = "edit";
    delete node.dataset.mdRaw;
    node.replaceChildren(...md.highlightMarkdown(raw, mdMode(node)));
    if (inside) placeCaret(node, anchor, focus);
  }

  // 편집이 아닐 때의 화면 모양으로 바꾼다. (굵게는 굵은 글자, 제목은 제목. 기호는 보이지 않는다.)
  // 원본은 data-md-raw에 기억해 둔다. 다시 편집을 켤 때 필요하다.
  function showDisplayView(node) {
    if (!md || !node.dataset.md) return;
    const raw = rawOf(node);
    node.dataset.mdRaw = raw;
    node.dataset.mdView = "display";
    node.replaceChildren(...md.renderMarkdown(raw, mdMode(node)));
  }

  // 글자를 새로 넣는다. 편집 중이면 굵게와 제목 모양까지 입힌다.
  function setValue(node, value) {
    node.textContent = value;
    delete node.dataset.mdView;
    delete node.dataset.mdRaw;
    if (enabled) showEditView(node);
  }

  // ---------- 글자 편집 ----------
  function onInput(event) {
    const node = event.target.closest?.("[data-edit]");
    if (!node || !enabled) return;
    if (!composing) showEditView(node);
    const path = node.getAttribute("data-edit");
    const orig = node.dataset.devOrig ?? "";
    let value = readText(node);
    // 여러 줄 글자 끝에 편집기가 붙인 줄바꿈 하나는 뗀다.
    if (value.endsWith("\n") && !orig.endsWith("\n")) value = value.slice(0, -1);
    if (value === orig) pending.delete(path);
    else pending.set(path, { old: orig, value });
    node.classList.toggle("dev-edit-dirty", value !== orig);
    refreshBar();
  }

  // 같은 경로를 가진 다른 요소(타일과 모달의 링크 글자 등)에 고친 글자를 보여 준다.
  function mirror(node) {
    const path = node.getAttribute("data-edit");
    const entry = pending.get(path);
    const value = entry ? entry.value : node.dataset.devOrig;
    for (const other of $$(`[data-edit="${CSS.escape(path)}"]`)) {
      if (other !== node && readText(other) !== value) {
        setValue(other, value);
        other.classList.toggle("dev-edit-dirty", Boolean(entry));
      }
    }
  }

  function onFocusOut(event) {
    const node = event.target.closest?.("[data-edit]");
    if (node && enabled) mirror(node);
  }

  function revert(node) {
    pending.delete(node.getAttribute("data-edit"));
    setValue(node, node.dataset.devOrig ?? "");
    node.classList.remove("dev-edit-dirty");
    mirror(node);
    refreshBar();
  }

  function onKeyDown(event) {
    if (!enabled) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save();
      return;
    }
    // 기호 선택 창이 열려 있으면 Esc는 그 창만 닫는다. (글자 편집 되돌리기나 선택 해제는 그다음 Esc이다.)
    if (event.key === "Escape" && symbols?.matches(":popover-open")) {
      event.preventDefault();
      closeSymbols();
      return;
    }
    const node = event.target.closest?.("[data-edit]");
    if (event.key === "Escape" && !node) {
      deselect();
      return;
    }
    if (!node) return;
    if (event.key === "Escape") {
      event.preventDefault();
      revert(node);
      node.blur();
    } else if (event.key === "Enter" && !isMultiline(node)) {
      event.preventDefault();
      node.blur();
    }
  }

  // 서식 없이 글자만 붙여 넣는다.
  function onPaste(event) {
    const node = event.target.closest?.("[data-edit]");
    if (!node || !enabled) return;
    event.preventDefault();
    let text = event.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
    if (!isMultiline(node)) text = text.replace(/\n+/g, " ");
    document.execCommand("insertText", false, text);
  }

  // 편집 중에는 본문의 링크와 프로젝트 타일의 열기 동작을 막는다. 글자를 고치려고 누르는 것이기 때문이다.
  // 사이드바(목차)는 편집하지 않는 영역이라 평소처럼 이동한다.
  function onClickCapture(event) {
    if (!enabled) return;
    const target = event.target;
    if (target.closest?.(`.${UI}`) || target.closest?.(".toc")) return;
    if (target.closest?.("a") && target.closest("[data-edit], .gallery-tile, .site-main")) event.preventDefault();
  }

  function setEditable(node, on) {
    if (on) {
      // 표시 모양에서 켜는 경우에도 원본(기호가 든 글자)을 기억해야 한다. (rawOf)
      node.dataset.devOrig = rawOf(node);
      node.contentEditable = "plaintext-only";
      if (node.contentEditable !== "plaintext-only") node.contentEditable = "true";
      node.spellcheck = false;
      showEditView(node);
    } else {
      showDisplayView(node);
      node.removeAttribute("contenteditable");
      node.removeAttribute("spellcheck");
      node.classList.remove("dev-edit-dirty");
      delete node.dataset.devOrig;
    }
  }

  async function save() {
    if (pending.size === 0) return;
    const ops = [...pending].map(([path, { old, value }]) => ({ type: "set", path, old, value }));
    say("저장 중…", `변경 ${ops.length}건`, "info");
    try {
      await send(ops);
      pending.clear();
      refreshBar();
      const title = `변경 ${ops.length}건 저장 완료`;
      const detail = "데이터 파일에 반영했습니다. 되돌리기로 취소할 수 있습니다.";
      handoffToast(title, detail);
      say(title, detail, "success");
    } catch (error) {
      say("저장 실패", `${error.message} (변경 ${ops.length}건은 그대로 남아 있습니다)`, "error");
    }
  }

  function revertAll() {
    for (const node of $$("[data-edit]")) {
      if (node.classList.contains("dev-edit-dirty")) {
        setValue(node, node.dataset.devOrig ?? "");
        node.classList.remove("dev-edit-dirty");
      }
    }
    pending.clear();
    refreshBar();
  }

  async function undo() {
    if (pending.size > 0) {
      revertAll();
      say("글자 변경 되돌림", "저장하지 않은 변경을 취소했습니다.", "success");
      return;
    }
    if (undoDepth === 0) {
      say("되돌릴 저장이 없습니다", "", "error");
      return;
    }
    say("되돌리는 중…", "", "info");
    try {
      await post("/__dev/edit/undo", {});
      deselect();
      const title = "되돌리기 완료";
      const detail = "마지막 저장을 취소했습니다.";
      handoffToast(title, detail);
      say(title, detail, "success");
    } catch (error) {
      say("되돌리기 실패", error.message, "error");
      refreshBar();
    }
  }

  // ---------- 프로젝트 상세 열기 ----------
  function addOpenButtons() {
    for (const item of $$(".gallery-item")) {
      const dialog = item.querySelector("dialog");
      const tile = item.querySelector(".gallery-tile");
      if (!dialog || !tile || tile.querySelector(".dev-edit-open")) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `dev-edit-open ${UI}`;
      button.textContent = "상세 열기 (제목, 본문 수정)";
      button.addEventListener("click", () => dialog.showModal());
      tile.append(button);
    }
  }

  // 모달(dialog)이 열려 있으면 모달 바깥의 모든 요소는 눌리지 않는다. (브라우저가 바깥을 inert로 만든다.)
  // 저장 막대, 도구 막대, 기호 창, 알림도 화면에는 보이지만 눌리지 않는다. 그래서 모달이 열려 있는 동안에는 이 편집 도구를 모달 안으로 옮긴다.
  // 모달이 닫히면 body로 되돌린다. 옮기면 popover가 닫히므로 열려 있던 것은 다시 띄운다. 다시 띄운 popover는 맨 위 층의 맨 앞에 온다.
  // 편집 버튼과 Inspector 버튼(개발 서버에서만 보이는 위젯)도 함께 옮긴다. 모달을 띄운 채 켜고 끌 수 있게 하기 위해서이다.
  // 두 버튼은 position: fixed라 모달 안으로 옮겨도 화면의 같은 자리(왼쪽 아래)에 보인다.
  function raiseUi() {
    const host = document.querySelector("dialog.modal[open]") ?? document.body;
    const inspector = [document.querySelector(".dev-inspector-toggle"), document.querySelector(".dev-inspector-tip")];
    for (const node of [toggle, ...inspector, bar, tools, symbols, toast, imageInput]) {
      if (!node) continue;
      const wasOpen = node.hasAttribute("popover") && node.matches(":popover-open");
      if (node.parentElement !== host) host.append(node);
      else if (wasOpen) node.hidePopover();
      if (wasOpen && !node.matches(":popover-open")) node.showPopover();
    }
    placeTools();
  }

  // 모달이 열리고 닫히는 것을 지켜본다. (open 속성의 변화)
  // 열리면 편집 도구를 앞으로 꺼내고, 닫히면 그 모달 안에서 선택한 항목의 선택을 푼다. (도구 막대가 빈 자리에 남지 않게 한다.)
  function watchDialogs() {
    new MutationObserver((records) => {
      for (const record of records) {
        const dialog = record.target;
        if (!(dialog instanceof HTMLDialogElement) || !dialog.classList.contains("modal")) continue;
        // 편집을 꺼 둔 동안에도 편집 버튼과 Inspector 버튼은 옮긴다.
        if (enabled && !dialog.open && selected && dialog.contains(selected)) deselect();
        raiseUi();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ["open"], subtree: true });
  }

  // 저장 뒤 새로고침되었으면 그 전에 열려 있던 모달을 다시 연다.
  function reopenDialog() {
    let id = "";
    try {
      id = sessionStorage.getItem(DIALOG_KEY) ?? "";
      sessionStorage.removeItem(DIALOG_KEY);
    } catch {
      return;
    }
    const dialog = id ? document.getElementById(id) : null;
    if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
  }

  function removeOpenButtons() {
    for (const button of $$(".dev-edit-open")) button.remove();
  }

  // ---------- 항목 선택과 도구 막대 ----------
  function pathLabel(path) {
    const names = [...path.matchAll(/\.?([A-Za-z_]\w*)(?=\[|$|\.)/g)].map((match) => match[1]);
    const last = names[names.length - 1];
    return KIND_LABEL[last] ?? last ?? "항목";
  }

  function placeTools() {
    if (!selected) return;
    const rect = selected.getBoundingClientRect();
    const width = tools.offsetWidth;
    const left = Math.min(Math.max(4, rect.right - width), window.innerWidth - width - 4);
    const top = Math.max(4, Math.min(rect.top - tools.offsetHeight + 2, window.innerHeight - tools.offsetHeight - 4));
    tools.style.left = `${left}px`;
    tools.style.top = `${top}px`;
    placeSymbols();
  }

  // ---------- 기호 선택 ----------
  // 줄 맨 앞의 기호(글머리 기호)를 고르는 창이다. 항목 도구 막대의 "기호" 버튼으로 연다.
  // 고른 기호는 선택한 항목의 글자에서 커서가 있는 줄(커서가 글자 밖이면 첫 줄)의 맨 앞에 "기호 + 공백"으로 들어간다.
  // 이미 기호가 있으면 새 기호로 바꾸고, "지움"은 맨 앞 기호만 지운다. 바꾼 글자는 저장 전 변경이 되며 저장 막대에서 저장한다.

  // 선택한 항목에서 기호를 넣을 글자 요소를 찾는다. 서식(data-md)이 켜진 글자만 기호 마커가 되므로 그런 요소만 대상이다.
  // label과 demo 모드(프로젝트 링크)는 줄 앞 기호가 없는 글자라 제외한다.
  const MD_TEXT = '[data-edit][data-md]:not([data-md="label"]):not([data-md="demo"])';
  function textTarget(item) {
    if (item.matches?.(MD_TEXT)) return item;
    return item.querySelector?.(MD_TEXT) ?? null;
  }

  // 글자를 새로 넣고 저장 전 변경으로 기록한다. (onInput과 같은 처리)
  function commitText(node, value) {
    setValue(node, value);
    const path = node.getAttribute("data-edit");
    const orig = node.dataset.devOrig ?? "";
    if (value === orig) pending.delete(path);
    else pending.set(path, { old: orig, value });
    node.classList.toggle("dev-edit-dirty", value !== orig);
    refreshBar();
    mirror(node);
  }

  // 글자(raw)의 lineIndex번째 줄 맨 앞 기호를 symbol로 바꾼다. symbol이 null이면 맨 앞 기호만 지운다.
  // 점 글머리("- ")는 기호로 바꾼다. 점 글머리는 "지움"으로 지우지 않는다.
  function withLineSymbol(raw, lineIndex, symbol) {
    const lines = raw.split("\n");
    const line = lines[lineIndex] ?? "";
    const marked = md.parseSymbol(line);
    const dash = md.parseBullet(line);
    const rest = marked ? marked.rest : dash ? dash.rest : line;
    if (symbol === null) lines[lineIndex] = marked ? rest : line;
    else lines[lineIndex] = `${symbol} ${rest}`;
    return lines.join("\n");
  }

  function applySymbol(symbol) {
    const node = selected ? textTarget(selected) : null;
    if (!node || !md) return;
    const raw = rawOf(node);
    let lineIndex = 0;
    const selection = getSelection();
    if (selection.rangeCount > 0 && node.dataset.mdView !== "display" && node.contains(selection.anchorNode)) {
      const caret = offsetOf(node, selection.anchorNode, selection.anchorOffset);
      lineIndex = (raw.slice(0, caret).match(/\n/g) ?? []).length;
    }
    const next = withLineSymbol(raw, lineIndex, symbol);
    closeSymbols();
    if (next !== raw) commitText(node, next);
  }

  function placeSymbols() {
    if (!symbols?.matches(":popover-open")) return;
    const rect = tools.getBoundingClientRect();
    const width = symbols.offsetWidth;
    const height = symbols.offsetHeight;
    const left = Math.min(Math.max(4, rect.right - width), window.innerWidth - width - 4);
    // 도구 막대 아래에 놓고, 화면 아래로 넘치면 위에 놓는다.
    const below = rect.bottom + 4;
    const top = below + height > window.innerHeight - 4 ? Math.max(4, rect.top - height - 4) : below;
    symbols.style.left = `${left}px`;
    symbols.style.top = `${top}px`;
  }

  function closeSymbols() {
    if (symbols?.matches(":popover-open")) symbols.hidePopover();
  }

  function toggleSymbols() {
    if (!selected || !textTarget(selected)) return;
    if (symbols.matches(":popover-open")) {
      symbols.hidePopover();
      return;
    }
    symbols.showPopover();
    placeSymbols();
  }

  // 항목을 선택한다. 도구 막대는 선택된 동안 고정되어 있다.
  function select(item) {
    if (selected === item && tools.matches(":popover-open")) {
      // 같은 항목이어도 그사이 모달이 열렸으면 도구 막대가 모달 뒤에 있다. 앞으로 다시 꺼낸다.
      raiseUi();
      return;
    }
    closeSymbols();
    selected?.classList.remove("dev-edit-item-hit");
    selected = item;
    item.classList.add("dev-edit-item-hit");
    const path = item.getAttribute("data-edit-item");
    tools.querySelector(".dev-edit-tools-label").textContent = pathLabel(path);
    tools.querySelector('[data-act="parent"]').hidden = !item.parentElement?.closest("[data-edit-item]");
    // 하위 줄과 구분선은 글자 목록(ul.row-list)의 항목에서만 넣는다. 하위 줄은 한 단계만이라 하위 줄에서는 숨긴다. 구분선 항목에는 하위 줄이 없다.
    const inRowList = item.tagName === "LI" && item.parentElement?.classList.contains("row-list");
    const isDivider = item.classList.contains("item-divider");
    // 직책 행(div.card-role-row)의 머리 칸을 누르면 그 아래에 직책 사이 구분선을 넣을 수 있다. 구분선(div.role-divider) 자신에는 넣지 않는다.
    const isRoleHead = item.classList.contains("card-box-head") && item.parentElement?.classList.contains("card-role-row");
    tools.querySelector('[data-act="child"]').hidden = !inRowList || isDivider;
    // 사진 버튼(교체, 추가)은 프로젝트 타일(li.gallery-item)과 사진 목록의 사진에서 나온다.
    // 사진 목록의 한 사진(모달의 첫 사진, 둘째 사진부터의 묶음)을 고르면 그 사진을 바꾸거나 그 뒤에 사진을 더한다.
    const isPhoto = /\.images\[\d+\]$/.test(path);
    // 블록(card.blocks의 한 블록)을 고르면 그 뒤에 제목줄, 줄글, 사진 블록을 넣는다. 블록으로 짠 카드를 고르면 맨 끝에 넣는다.
    const isBlock = /\.blocks\[\d+\]$/.test(path);
    const blockCard = item.classList.contains("gallery-item-blocks");
    const photoTarget = item.classList.contains("gallery-item") || isPhoto || isBlock;
    tools.querySelector('[data-act="image"]').hidden = !(item.classList.contains("gallery-item") || isPhoto || item.classList.contains("gallery-block-image"));
    tools.querySelector('[data-act="addimage"]').hidden = !photoTarget;
    tools.querySelector('[data-act="addhead"]').hidden = !(isBlock || blockCard);
    tools.querySelector('[data-act="addtext"]').hidden = !(isBlock || blockCard);
    // 블록에서는 같은 종류 추가(+) 대신 위의 세 버튼을 쓴다.
    tools.querySelector('[data-act="add"]').hidden = isBlock;
    // 링크 목록 버튼은 아직 예전 방식(저장소, 배포 두 칸)인 프로젝트 카드에서만 나온다. 이미 목록이면 링크를 눌러 + 버튼으로 늘린다.
    tools.querySelector('[data-act="links"]').hidden = !item.classList.contains("gallery-item") || blockCard || Boolean(item.querySelector(".gallery-link-item"));
    tools.querySelector('[data-act="divider"]').hidden = !(inRowList || isRoleHead);
    // 기호 버튼은 서식(data-md)이 켜진 글자가 있는 항목에서만 나온다. (소제목, 직책명 같은 글자에는 기호 마커가 없다.)
    // 프로젝트 카드(li.gallery-item) 전체를 고른 경우에는 숨긴다. 카드 안 요약 글에만 적용되어 무엇이 바뀌는지 알기 어렵다. (요약 글에는 기호를 직접 입력한다.)
    tools.querySelector('[data-act="symbol"]').hidden = !textTarget(item) || photoTarget;
    // 인쇄 쪽 나눔(끊기): 목록의 항목 뒤에 표식("===")을 넣는다. 인쇄에서 표식 다음 내용이 새 쪽에서 시작한다.
    // 카드, 섹션, 하위 줄, 링크, 스킬 태그, 연락처, 관심 분야 묶음에는 넣지 않는다.
    const isBreak = item.classList.contains("print-break");
    const canBreak = /\[\d+\]$/.test(path) && !NUMBERED.test(path) && !/\.(sub|links|images|skills|contact)\[\d+\]$/.test(path) && !/interests\.groups\[\d+\]$/.test(path);
    tools.querySelector('[data-act="pagebreak"]').hidden = !canBreak || isBreak;
    if (isBreak) {
      // 표식 자신은 이동(▲▼)과 삭제만 한다.
      tools.querySelector(".dev-edit-tools-label").textContent = "쪽 나눔";
      for (const act of ["add", "child", "divider", "symbol", "image", "addimage", "addhead", "addtext", "links"]) {
        tools.querySelector(`[data-act="${act}"]`).hidden = true;
      }
    }
    const remove = tools.querySelector('[data-act="delete"]');
    const locked = NUMBERED.test(path);
    remove.disabled = locked;
    remove.title = locked ? "번호가 있는 카드는 삭제하지 않습니다. (번호를 다시 쓰지 않는 규칙. IDE에서 삭제)" : "삭제 (확인 창이 나옵니다)";
    // 이미 열려 있으면 닫았다가 다시 연다. 맨 위 층의 맨 앞으로 와서 모달 창 위에 보인다.
    if (tools.matches(":popover-open")) tools.hidePopover();
    tools.showPopover();
    placeTools();
  }

  function deselect() {
    closeSymbols();
    selected?.classList.remove("dev-edit-item-hit");
    selected = null;
    if (tools.matches(":popover-open")) tools.hidePopover();
  }

  // 항목을 누르면 선택하고, 도구 막대나 다른 편집 도구가 아닌 곳을 누르면 선택을 푼다.
  function onPointerDown(event) {
    if (!enabled) return;
    const target = event.target;
    if (target.closest?.(`.${UI}`)) return;
    // 모달의 닫기 버튼은 모달을 닫는 동작이다. 모달을 품은 카드가 선택되지 않게 선택을 푼다.
    if (target.closest?.(".modal-close")) {
      deselect();
      return;
    }
    const item = target.closest?.("[data-edit-item]");
    if (item) select(item);
    else deselect();
  }

  async function structural(ops) {
    if (pending.size > 0) {
      say("먼저 저장해 주세요", "저장하지 않은 글자 변경이 있습니다. 저장하거나 되돌린 뒤에 다시 시도하세요.", "error");
      return;
    }
    const label = OP_LABEL[ops[0]?.type] ?? "구조 변경";
    say(`${label} 저장 중…`, "", "info");
    try {
      await send(ops);
      deselect();
      const title = `${label} 저장 완료`;
      const detail = "데이터 파일에 반영했습니다. 되돌리기로 취소할 수 있습니다.";
      handoffToast(title, detail);
      say(title, detail, "success");
    } catch (error) {
      say(`${label} 저장 실패`, error.message, "error");
    }
  }

  // 삭제 확인 창. 지울 항목의 글자 일부를 보여 주고 한 번 더 묻는다.
  function confirmDelete(item) {
    const path = item.getAttribute("data-edit-item");
    const preview = item.textContent.replace(/\s+/g, " ").trim();
    const dialog = document.createElement("dialog");
    dialog.className = `dev-edit-dialog ${UI}`;
    const form = document.createElement("form");
    form.method = "dialog";
    const heading = document.createElement("h3");
    heading.textContent = `${pathLabel(path)}을(를) 삭제할까요?`;
    const quote = document.createElement("p");
    quote.className = "dev-edit-quote";
    quote.textContent = preview.length > 90 ? `${preview.slice(0, 90)}…` : preview || "(글자 없음)";
    const note = document.createElement("p");
    note.className = "dev-edit-note";
    note.textContent = "삭제하면 데이터 파일에서 바로 지워집니다. 저장 막대의 되돌리기로 복구할 수 있습니다.";
    const actions = document.createElement("div");
    actions.className = "dev-edit-dialog-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "취소";
    cancel.addEventListener("click", () => dialog.close());
    const confirm = document.createElement("button");
    confirm.type = "submit";
    confirm.className = "dev-edit-danger";
    confirm.textContent = "삭제";
    actions.append(cancel, confirm);
    form.append(heading, quote, note, actions);
    dialog.append(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      dialog.close();
      structural([{ type: "delete", path }]);
    });
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
    // 실수로 Enter를 눌러 지우지 않도록 처음 초점은 취소 버튼에 둔다.
    cancel.focus();
  }

  function onToolsClick(event) {
    const button = event.target.closest("button[data-act]");
    if (!button || button.disabled || !selected) return;
    const item = selected;
    const path = item.getAttribute("data-edit-item");
    const act = button.dataset.act;
    if (act === "parent") {
      const parent = item.parentElement?.closest("[data-edit-item]");
      if (parent) select(parent);
    } else if (act === "up" || act === "down") {
      structural([{ type: "move", path, dir: act === "up" ? -1 : 1 }]);
    } else if (act === "add") {
      if (/\.links\[\d+\]$/.test(path) && item.parentElement.querySelectorAll(":scope > .gallery-link-item").length >= LINKS_MAX) {
        say(`링크는 ${LINKS_MAX}개까지입니다`, "더 넣으려면 기존 링크를 지우거나 본문에 적으세요.", "error");
        return;
      }
      structural([{ type: "insert", path }]);
    } else if (act === "links") {
      structural([{ type: "initLinks", path }]);
    } else if (act === "child") {
      structural([{ type: "insertChild", path }]);
    } else if (act === "divider") {
      structural([{ type: "insert", path, value: "---" }]);
    } else if (act === "image") {
      pickImage(path, "set");
    } else if (act === "addimage") {
      pickImage(path, "add");
    } else if (act === "pagebreak") {
      structural([{ type: "insert", path, value: "===" }]);
    } else if (act === "addhead") {
      structural([{ type: "insertBlock", path, kind: "head" }]);
    } else if (act === "addtext") {
      structural([{ type: "insertBlock", path, kind: "text" }]);
    } else if (act === "symbol") {
      toggleSymbols();
    } else if (act === "delete") {
      confirmDelete(item);
    }
  }

  // ---------- 켜고 끄기 ----------
  // keepHistory가 참이면 켤 때 되돌리기 기록을 비우지 않는다. (새로고침으로 이어지는 켜짐) 끌 때는 항상 비운다.
  function setEnabled(on, keepHistory = false) {
    if (!on && pending.size > 0 && !confirm("저장하지 않은 변경이 있습니다. 버리고 끌까요?")) return;
    if (!on) revertAll();
    const hadHistory = undoDepth > 0;
    enabled = on;
    toggle.setAttribute("aria-pressed", String(on));
    toggle.textContent = on ? "편집 켜짐" : "편집 꺼짐";
    document.documentElement.classList.toggle("dev-edit-on", on);
    for (const node of $$("[data-edit]")) setEditable(node, on);
    if (on) addOpenButtons();
    else {
      removeOpenButtons();
      deselect();
    }
    try {
      // 켜짐은 개발 서버의 암호(token)와 함께 기억한다. 서버를 다시 켜면 암호가 달라져 이전 기억은 무효가 된다.
      sessionStorage.setItem(STORE_KEY, on ? token : "");
    } catch {
      // 저장소를 쓸 수 없어도 동작에는 문제가 없다.
    }
    if (!on || !keepHistory) clearHistory();
    refreshBar();
    if (!on && hadHistory) say("편집을 껐습니다", "되돌리기 기록을 비웠습니다.", "success");
    // 모달이 열린 채 켜면 저장 막대가 모달 바깥(body)에 뜬다. 모달 안으로 옮겨 누를 수 있게 한다.
    raiseUi();
  }

  function makeButton(text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function buildUi() {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = `dev-edit-toggle ${UI}`;
    toggle.addEventListener("click", () => setEnabled(!enabled));

    bar = document.createElement("div");
    bar.className = `dev-edit-bar ${UI}`;
    bar.setAttribute("popover", "manual");
    barCount = document.createElement("span");
    undoButton = makeButton("되돌리기", undo);
    undoButton.title = "저장하지 않은 변경이 있으면 그것을, 없으면 가장 최근 저장(글자, 추가, 삭제, 이동)을 되돌립니다. 편집을 끄면 되돌리기 기록은 사라집니다.";
    bar.append(barCount, makeButton("저장", save), undoButton);

    tools = document.createElement("div");
    tools.className = `dev-edit-tools ${UI}`;
    tools.setAttribute("popover", "manual");
    const label = document.createElement("span");
    label.className = "dev-edit-tools-label";
    tools.append(label);
    for (const [act, text, title] of [
      ["up", "▲", "위로"],
      ["down", "▼", "아래로"],
      ["add", "+", "아래에 같은 종류 추가"],
      ["child", "+ 하위", "아래에 한 단계 들여쓴 하위 줄 추가 (글자가 1pt 작음)"],
      ["divider", "구분선", "이 줄 아래에 구분선 추가"],
      ["pagebreak", "끊기", "인쇄할 때 이 항목 다음부터 새 쪽에서 시작합니다. 편집 모드에서만 점선으로 보이고, 눌러서 삭제할 수 있습니다."],
      ["links", "링크 목록", "저장소, 배포 링크를 이름을 붙일 수 있는 링크 목록으로 바꿉니다 (최대 4개)"],
      ["image", "사진 교체", "이 사진을 바꿉니다. 카드에서 누르면 첫 사진입니다. (jpg, png, webp. 자동으로 줄여 저장)"],
      ["addhead", "+ 제목줄", "이 블록 뒤에 제목줄 블록(제목 | 링크)을 넣습니다. 카드에서 누르면 맨 끝에 넣습니다."],
      ["addtext", "+ 줄글", "이 블록 뒤에 줄글 블록을 넣습니다. 카드에서 누르면 맨 끝에 넣습니다."],
      ["addimage", "사진 추가", "이 사진 뒤에 사진을 하나 더합니다. 카드에서 누르면 맨 끝에 더합니다. 둘째 사진부터는 인쇄에서 새 쪽에서 시작합니다."],
      ["symbol", "기호", "줄 맨 앞의 글머리 기호 고르기 (커서가 있는 줄에 적용)"],
      ["delete", "삭제", "삭제"],
      ["parent", "상위", "상위 항목 선택"],
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.act = act;
      button.textContent = text;
      button.title = title;
      tools.append(button);
    }
    tools.addEventListener("click", onToolsClick);

    symbols = document.createElement("div");
    symbols.className = `dev-edit-symbols ${UI}`;
    symbols.setAttribute("popover", "manual");
    for (const symbol of SYMBOLS) {
      const button = makeButton(symbol, () => applySymbol(symbol));
      button.title = `줄 맨 앞을 ${symbol} 로 바꿉니다`;
      symbols.append(button);
    }
    const clear = makeButton("기호 지움 (점으로)", () => applySymbol(null));
    clear.className = "dev-edit-symbols-clear";
    clear.title = "줄 맨 앞의 기호를 지웁니다";
    symbols.append(clear);

    toast = document.createElement("div");
    toast.className = `dev-edit-toast ${UI}`;
    toast.setAttribute("popover", "manual");
    toast.title = "누르면 닫힙니다";
    toast.addEventListener("click", () => toast.matches(":popover-open") && toast.hidePopover());

    imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.hidden = true;

    document.body.append(toggle, bar, tools, symbols, toast, imageInput);
  }

  async function init() {
    buildUi();
    // 편집을 쓸 수 없는 경우(암호를 못 받음)에도 Inspector 버튼은 모달 위로 옮겨야 하므로 먼저 지켜본다.
    watchDialogs();
    toggle.textContent = "편집 꺼짐";
    try {
      const response = await fetch("/__dev/edit/token");
      const info = await response.json();
      if (!response.ok || !info.ok) throw new Error("token");
      token = info.token;
      undoDepth = info.undo ?? 0;
      toggle.title = `저장 대상: ${info.file}`;
    } catch {
      toggle.textContent = "편집 사용 불가";
      toggle.disabled = true;
      return;
    }
    // 편집을 켜지 않아도 개발 서버의 화면은 편집 모드용(원본 글자)으로 그려져 있다. 굵게와 제목 모양은 여기서 입힌다.
    try {
      md = await import("/js/lib/markdown.js");
    } catch {
      md = null;
    }
    document.addEventListener("input", onInput, true);
    document.addEventListener("compositionstart", () => { composing = true; }, true);
    document.addEventListener("compositionend", (event) => { composing = false; onInput(event); }, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    // 모달 본문처럼 페이지 안에서 따로 스크롤되는 영역도 잡도록 capture로 듣는다. (scroll 이벤트는 위로 전달되지 않는다.)
    document.addEventListener("scroll", () => selected && tools.matches(":popover-open") && placeTools(), { passive: true, capture: true });
    window.addEventListener("resize", placeTools);
    window.addEventListener("beforeunload", (event) => {
      if (pending.size > 0) event.preventDefault();
    });
    // 편집 켜짐은 새로고침(저장 뒤 자동 새로고침 포함)에서만 이어진다.
    // 주소를 새로 열거나 다른 쪽에서 돌아오면 꺼진 채 시작한다. 이때 이전 되돌리기 기록도 비운다.
    const reloaded = performance.getEntriesByType("navigation")[0]?.type === "reload";
    let remembered = false;
    try {
      remembered = reloaded && sessionStorage.getItem(STORE_KEY) === token;
    } catch {
      remembered = false;
    }
    if (remembered || new URLSearchParams(location.search).has("edit")) {
      setEnabled(true, reloaded);
      if (reloaded) reopenDialog();
    }
    else {
      clearHistory();
      for (const node of $$("[data-md]")) showDisplayView(node);
    }
    // 직전에 저장하고 새로고침되었다면 그 결과를 알려 준다.
    showHandedOffToast();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
