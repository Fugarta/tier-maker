/**
 * Tier Maker - メインエントリーポイント
 */

import { getCurrentPreset } from './config.js';
import { initializeDragDrop } from './dragDrop.js';
import { initializeImages, setupImageUpload, setupImagePaste } from './imageManager.js';
import { initializeExporter } from './exporter.js';

/**
 * タイトルを更新
 */
function updateTitle() {
  const preset = getCurrentPreset();
  const titleElement = document.querySelector('.title');
  if (titleElement && preset.title) {
    titleElement.textContent = preset.title;
  }
  // ページタイトルも更新
  document.title = `${preset.name} - Tier Maker`;
}

/**
 * 現在のプリセットに応じてナビゲーションをハイライト
 */
function highlightActivePreset() {
  const params = new URLSearchParams(window.location.search);
  const currentPreset = params.get('preset') || 'default';

  const links = document.querySelectorAll('.preset-link');
  links.forEach(link => {
    const href = link.getAttribute('href');

    // デフォルトプリセットの判定
    if (currentPreset === 'default' && (href === 'index.html' || href === './')) {
      link.classList.add('active');
    }
    // URLパラメータでの判定
    else if (href.includes(`preset=${currentPreset}`)) {
      link.classList.add('active');
    }
  });
}

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
  // タイトルを更新
  updateTitle();

  // ナビゲーションをハイライト
  highlightActivePreset();

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
