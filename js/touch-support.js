export function enableTouchDrag(ev) {
  ev.preventDefault();

  const draggingElem = ev.target.closest('.tier-item-wrapper');
  if (!draggingElem) return;

  /**
   * スマートフォンでのドラッグ移動時の挙動を設定
   *
   * @param {Event} ev
   */
  const handleTouchMove = (ev) => {
    const touch = ev.touches[0];

    // 追従用classを追加
    draggingElem.classList.add('touch-dragging');

    // ドラッグ中の要素を画面上で移動させる
    draggingElem.style.position = 'fixed';
    draggingElem.style.left = `${
      touch.clientX - draggingElem.offsetWidth / 2
    }px`;
    draggingElem.style.top = `${
      touch.clientY - draggingElem.offsetHeight / 2
    }px`;
  };

  /**
   * スマートフォンでのドラッグ終了時の挙動を設定
   *
   * @param {Event} ev
   */
  const handleTouchEnd = (ev) => {
    const touch = ev.changedTouches[0];
    // ドロップ先の要素を取得
    const dropElem = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = dropElem?.closest('.tier-row');
    const target = dropElem?.closest('.tier-item-wrapper');

    if (row) {
      if (target && target !== draggingElem) {
        // tier-item-wrapper上にドロップした場合、その前に挿入
        row.insertBefore(draggingElem, target);
      } else {
        // tier-rowの空き部分にドロップした場合、末尾に追加
        row.appendChild(draggingElem);
      }
    }

    // ドラッグ中の要素を元の位置に戻す
    draggingElem.classList.remove('touch-dragging');
    draggingElem.style.left = '';
    draggingElem.style.top = '';
    draggingElem.style.position = '';
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
}
