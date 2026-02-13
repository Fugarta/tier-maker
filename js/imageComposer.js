/**
 * 画像結合モジュール
 */

import { showErrorMessage } from './utils.js';
import { addImageToPool } from './imageManager.js';

// 選択中の画像
let selectedImages = [];

/**
 * 画像の選択状態を切り替え
 * @param {HTMLElement} wrapper - 画像のラッパー要素
 */
export function toggleImageSelection(wrapper) {
  const img = wrapper.querySelector('.tier-item');
  if (!img) return;

  // 既に選択されている場合は解除
  const index = selectedImages.findIndex(item => item.wrapper === wrapper);
  if (index !== -1) {
    selectedImages.splice(index, 1);
    wrapper.classList.remove('selected');
    updateCompositionButtons();
    return;
  }

  // 最大2枚まで選択可能
  if (selectedImages.length >= 2) {
    showErrorMessage('最大2枚まで選択できます');
    return;
  }

  // 選択状態に追加
  selectedImages.push({
    wrapper: wrapper,
    img: img,
    src: img.src,
    label: wrapper.querySelector('.label-overlay')?.value || ''
  });
  wrapper.classList.add('selected');
  updateCompositionButtons();
}

/**
 * すべての選択を解除
 */
export function clearSelection() {
  selectedImages.forEach(item => {
    item.wrapper.classList.remove('selected');
  });
  selectedImages = [];
  updateCompositionButtons();
}

/**
 * 選択された画像の数を取得
 * @returns {number}
 */
export function getSelectedCount() {
  return selectedImages.length;
}

/**
 * 結合ボタンの有効/無効を更新
 */
function updateCompositionButtons() {
  const composeHBtn = document.getElementById('composeHorizontalBtn');
  const composeVBtn = document.getElementById('composeVerticalBtn');
  const clearSelectionBtn = document.getElementById('clearSelectionBtn');

  if (composeHBtn && composeVBtn && clearSelectionBtn) {
    const canCompose = selectedImages.length === 2;
    const hasSelection = selectedImages.length > 0;

    composeHBtn.disabled = !canCompose;
    composeVBtn.disabled = !canCompose;
    clearSelectionBtn.disabled = !hasSelection;

    // 選択数の表示を更新
    const countSpan = document.getElementById('selectionCount');
    if (countSpan) {
      countSpan.textContent = `${selectedImages.length}/2枚選択中`;
      countSpan.style.display = hasSelection ? 'inline' : 'none';
    }
  }
}

/**
 * 画像を読み込んでImageオブジェクトを返す
 * @param {string} src - 画像のURL
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 2枚の画像を横に結合（1枚目の左半分 + 2枚目の右半分）
 */
export async function composeHorizontal() {
  if (selectedImages.length !== 2) {
    showErrorMessage('2枚の画像を選択してください');
    return;
  }

  try {
    const [img1Data, img2Data] = selectedImages;
    const img1 = await loadImage(img1Data.src);
    const img2 = await loadImage(img2Data.src);

    // キャンバスを作成（1枚目のサイズに合わせる）
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img1.width;
    canvas.height = img1.height;

    // 背景を白で塗りつぶし
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1枚目の左半分を描画
    const halfWidth = img1.width / 2;
    ctx.drawImage(
      img1,
      0, 0, halfWidth, img1.height,           // ソース: 左半分
      0, 0, halfWidth, img1.height            // 描画先: 左半分
    );

    // 2枚目の右半分を描画（1枚目のサイズにリサイズしてから）
    // 2枚目全体を1枚目のサイズに一時的にリサイズ
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img1.width;
    tempCanvas.height = img1.height;
    tempCtx.drawImage(img2, 0, 0, img1.width, img1.height);

    // リサイズした2枚目の右半分を取得して描画
    ctx.drawImage(
      tempCanvas,
      halfWidth, 0, halfWidth, img1.height,   // ソース: 右半分
      halfWidth, 0, halfWidth, img1.height    // 描画先: 右半分
    );

    // Base64に変換
    const composedImage = canvas.toDataURL('image/png');

    // ラベルを結合
    const combinedLabel = [img1Data.label, img2Data.label]
      .filter(l => l)
      .join(' / ') || '';

    // プールに追加
    addImageToPool(composedImage, combinedLabel, true);

    // 選択をクリア
    clearSelection();
  } catch (error) {
    console.error('画像の結合に失敗しました:', error);
    showErrorMessage('画像の結合に失敗しました');
  }
}

/**
 * 2枚の画像を縦に結合（1枚目の上半分 + 2枚目の下半分）
 */
export async function composeVertical() {
  if (selectedImages.length !== 2) {
    showErrorMessage('2枚の画像を選択してください');
    return;
  }

  try {
    const [img1Data, img2Data] = selectedImages;
    const img1 = await loadImage(img1Data.src);
    const img2 = await loadImage(img2Data.src);

    // キャンバスを作成（1枚目のサイズに合わせる）
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img1.width;
    canvas.height = img1.height;

    // 背景を白で塗りつぶし
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1枚目の上半分を描画
    const halfHeight = img1.height / 2;
    ctx.drawImage(
      img1,
      0, 0, img1.width, halfHeight,           // ソース: 上半分
      0, 0, img1.width, halfHeight            // 描画先: 上半分
    );

    // 2枚目の下半分を描画（1枚目のサイズにリサイズしてから）
    // 2枚目全体を1枚目のサイズに一時的にリサイズ
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img1.width;
    tempCanvas.height = img1.height;
    tempCtx.drawImage(img2, 0, 0, img1.width, img1.height);

    // リサイズした2枚目の下半分を取得して描画
    ctx.drawImage(
      tempCanvas,
      0, halfHeight, img1.width, halfHeight,  // ソース: 下半分
      0, halfHeight, img1.width, halfHeight   // 描画先: 下半分
    );

    // Base64に変換
    const composedImage = canvas.toDataURL('image/png');

    // ラベルを結合
    const combinedLabel = [img1Data.label, img2Data.label]
      .filter(l => l)
      .join(' / ') || '';

    // プールに追加
    addImageToPool(composedImage, combinedLabel, true);

    // 選択をクリア
    clearSelection();
  } catch (error) {
    console.error('画像の結合に失敗しました:', error);
    showErrorMessage('画像の結合に失敗しました');
  }
}

/**
 * 画像結合機能を初期化
 */
export function initializeImageComposer() {
  const composeHBtn = document.getElementById('composeHorizontalBtn');
  const composeVBtn = document.getElementById('composeVerticalBtn');
  const clearSelectionBtn = document.getElementById('clearSelectionBtn');

  if (composeHBtn) {
    composeHBtn.addEventListener('click', composeHorizontal);
  }

  if (composeVBtn) {
    composeVBtn.addEventListener('click', composeVertical);
  }

  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener('click', clearSelection);
  }

  // 初期状態でボタンを無効化
  updateCompositionButtons();
}
