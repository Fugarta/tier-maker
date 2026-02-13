/**
 * ドラッグ&ドロップ処理モジュール
 */

/**
 * ドロップ許可処理
 * @param {DragEvent} ev - ドラッグイベント
 */
export function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * ドラッグ開始処理
 * @param {DragEvent} ev - ドラッグイベント
 */
export function drag(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

/**
 * ドロップ処理
 * @param {DragEvent} ev - ドラッグイベント
 */
export function drop(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text/plain");
  const dragged = document.getElementById(id)?.closest(".tier-item-wrapper");
  let target = ev.target.closest(".tier-item-wrapper");

  const row = ev.target.closest(".tier-row");
  if (!dragged || !row) return;

  if (target && target !== dragged) {
    // tier-item-wrapper上にドロップした場合、その前に挿入
    row.insertBefore(dragged, target);
  } else {
    // tier-rowの空き部分にドロップした場合、末尾に追加
    row.appendChild(dragged);
  }
}

/**
 * ドラッグ&ドロップ機能を初期化
 */
export function initializeDragDrop() {
  // グローバルに公開（HTMLのインラインイベントハンドラ用）
  window.allowDrop = allowDrop;
  window.drop = drop;
}
