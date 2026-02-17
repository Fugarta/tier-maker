import { CONFIG, getCurrentPreset } from './config.js';
import { showErrorMessage, captureMainContainer } from './utils.js';

/**
 * エクスポート（保存・共有）機能モジュール
 */

// 現在のプリセット
const currentPreset = getCurrentPreset();

/**
 * 各tier行の実際のコンテンツ幅を計算
 * @param {HTMLElement} tierRow - tier行の要素
 * @returns {number} コンテンツの幅（px）
 */
function calculateRowContentWidth(tierRow) {
  const items = tierRow.querySelectorAll('.tier-item-wrapper');
  if (items.length === 0) return 0;

  // 各アイテムの幅とギャップを計算
  const itemWidth = items[0].offsetWidth;
  const computedStyle = window.getComputedStyle(tierRow);
  const gap = parseFloat(computedStyle.gap) || 0;

  // 合計幅 = (アイテム幅 × 個数) + (ギャップ × (個数 - 1))
  return itemWidth * items.length + gap * (items.length - 1);
}

/**
 * mainContainerの幅を最適化
 * @returns {Object} 元の幅とスタイル情報
 */
function optimizeContainerWidth() {
  const mainContainer = document.getElementById('mainContainer');
  const tierRows = document.querySelectorAll('.tier-row');
  const tierLabel = document.querySelector('.tier-label');

  // 元のスタイルを保存
  const originalWidth = mainContainer.style.width;
  const originalMaxWidth = mainContainer.style.maxWidth;

  // 各tier行の最大コンテンツ幅を計算
  let maxContentWidth = 0;
  tierRows.forEach(row => {
    // プールは除外（tierリスト内の行のみ対象）
    if (row.closest('#imagePool')) return;

    const contentWidth = calculateRowContentWidth(row);
    if (contentWidth > maxContentWidth) {
      maxContentWidth = contentWidth;
    }
  });

  // tier-labelとpaddingを考慮した最適な幅を計算
  const tierLabelWidth = tierLabel ? tierLabel.offsetWidth : 0;
  const tier = document.querySelector('.tier');
  const tierComputedStyle = window.getComputedStyle(tier);
  const tierPaddingLeft = parseFloat(tierComputedStyle.paddingLeft) || 0;
  const tierPaddingRight = parseFloat(tierComputedStyle.paddingRight) || 0;
  const tierLabelMargin = 14; // tier-labelのmargin-right

  // 最適な幅 = ラベル幅 + マージン + コンテンツ幅 + パディング + 余裕
  const optimalWidth = tierLabelWidth + tierLabelMargin + maxContentWidth + tierPaddingLeft + tierPaddingRight + 40;

  // 最小幅を確保（タイトルが表示できる程度）
  const minWidth = 300;
  const finalWidth = Math.max(optimalWidth, minWidth);

  // 幅を一時的に設定
  mainContainer.style.width = `${finalWidth}px`;
  mainContainer.style.maxWidth = `${finalWidth}px`;

  return {
    originalWidth,
    originalMaxWidth
  };
}

/**
 * mainContainerの幅を元に戻す
 * @param {Object} originalStyles - 元のスタイル情報
 */
function restoreContainerWidth(originalStyles) {
  const mainContainer = document.getElementById('mainContainer');
  mainContainer.style.width = originalStyles.originalWidth;
  mainContainer.style.maxWidth = originalStyles.originalMaxWidth;
}

/**
 * Tier表を画像として保存
 */
async function saveTierList() {
  let originalStyles = null;

  try {
    // 保存前に幅を最適化
    originalStyles = optimizeContainerWidth();

    // 少し待ってからキャプチャ（レイアウト再計算のため）
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await captureMainContainer();
    const link = document.createElement("a");
    link.download = CONFIG.DOWNLOAD_FILENAME;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Tier表の保存に失敗しました:", error);
    showErrorMessage("Tier表の保存に失敗しました");
  } finally {
    // 幅を元に戻す
    if (originalStyles) {
      restoreContainerWidth(originalStyles);
    }
  }
}

/**
 * Twitterに投稿（画像なしのテキスト投稿）
 */
async function shareToTwitter() {
  const tweetText = encodeURIComponent(currentPreset.tweetText);

  try {
    // キャプチャは成功確認のため実行（将来的に画像付き投稿に対応する場合に備えて）
    await captureMainContainer();

    // Twitterインテントを開く
    const url = `${CONFIG.TWEET_URL}?text=${tweetText}`;
    window.open(url, "_blank");
  } catch (error) {
    console.error("キャプチャに失敗しました:", error);
    showErrorMessage("キャプチャに失敗しました。それでもツイートしますか？");

    // エラーが発生してもツイートだけは可能にする
    setTimeout(() => {
      const url = `${CONFIG.TWEET_URL}?text=${tweetText}`;
      window.open(url, "_blank");
    }, 2000);
  }
}

/**
 * エクスポート機能を初期化
 */
export function initializeExporter() {
  // 保存ボタン
  document.getElementById("saveButton").addEventListener("click", saveTierList);

  // ツイートボタン
  document.getElementById("tweetButton").addEventListener("click", shareToTwitter);
}
