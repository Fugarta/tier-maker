import { CONFIG, getCurrentPreset } from './config.js';
import { showErrorMessage, captureMainContainer } from './utils.js';

/**
 * エクスポート（保存・共有）機能モジュール
 */

// 現在のプリセット
const currentPreset = getCurrentPreset();

/**
 * Tier表を画像として保存
 */
async function saveTierList() {
  try {
    const canvas = await captureMainContainer();
    const link = document.createElement("a");
    link.download = CONFIG.DOWNLOAD_FILENAME;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Tier表の保存に失敗しました:", error);
    showErrorMessage("Tier表の保存に失敗しました");
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
