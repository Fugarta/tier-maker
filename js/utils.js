import { CONFIG } from './config.js';

/**
 * エラーメッセージを画面に表示
 * @param {string} message - 表示するメッセージ
 */
export function showErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff5252;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => errorDiv.remove(), CONFIG.ERROR_MESSAGE_FADE_DURATION);
  }, CONFIG.ERROR_MESSAGE_DURATION);
}

/**
 * 画像ファイルをBase64に変換
 * @param {File|Blob} file - 画像ファイル
 * @returns {Promise<string>} Base64エンコードされた画像データ
 */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

/**
 * メインコンテナをキャプチャしてCanvasを返す
 * @returns {Promise<HTMLCanvasElement>} キャプチャされたCanvas
 */
export function captureMainContainer() {
  return html2canvas(document.getElementById("mainContainer"), {
    backgroundColor: CONFIG.CAPTURE_BACKGROUND_COLOR,
    scale: CONFIG.CAPTURE_SCALE
  });
}
