/**
 * Tier Maker - メインエントリーポイント
 */

import { initializeDragDrop } from './dragDrop.js';
import { initializeImages, setupImageUpload, setupImagePaste } from './imageManager.js';
import { initializeExporter } from './exporter.js';

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
  // ドラッグ&ドロップ機能を初期化
  initializeDragDrop();

  // 画像関連機能を初期化
  setupImageUpload();
  setupImagePaste();

  // エクスポート機能を初期化
  initializeExporter();

  // 初期画像を読み込み
  await initializeImages();
}

// DOMの読み込み完了後にアプリを初期化
window.addEventListener("DOMContentLoaded", initializeApp);
