/**
 * Tier Maker - メインエントリーポイント
 */

import { getCurrentPreset } from './config.js';
import { initializeDragDrop } from './dragDrop.js';
import { initializeImages, setupImageUpload, setupImagePaste } from './imageManager.js';
import { initializeExporter } from './exporter.js';
import { initializeImageComposer } from './imageComposer.js';

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
const DEFAULT_TIER_COUNT = 4;
const MIN_TIER_COUNT = 3;
const MAX_TIER_COUNT = 10;

function createTierElement(tierNumber) {
  const tier = document.createElement('div');
  tier.className = 'tier';
  tier.dataset.tier = tierNumber;

  const label = document.createElement('div');
  label.className = 'tier-label';
  label.textContent = tierNumber;

  const row = document.createElement('div');
  row.className = 'tier-row';
  row.setAttribute('ondrop', 'drop(event)');
  row.setAttribute('ondragover', 'allowDrop(event)');

  tier.append(label, row);
  return tier;
}

function getTierListContainer() {
  return document.getElementById('tierList');
}

function updateTierCountDisplay(count) {
  const countSpan = document.getElementById('tierCountDisplay');
  if (countSpan) {
    countSpan.textContent = `${count}`;
  }
}

function moveTierItemsToPool(tierRow) {
  const poolRow = document.getElementById('poolRow');
  if (!poolRow || !tierRow) return;

  Array.from(tierRow.children).forEach((item) => {
    poolRow.appendChild(item);
  });
}

function updateTierLabels() {
  const tiers = Array.from(document.querySelectorAll('.tier'));
  tiers.forEach((tier, index) => {
    const label = tier.querySelector('.tier-label');
    if (label) {
      label.textContent = index + 1;
    }
    tier.dataset.tier = index + 1;
  });
}

function setTierCount(targetCount) {
  const tierList = getTierListContainer();
  if (!tierList) return;

  const currentCount = tierList.querySelectorAll('.tier').length;
  let newCount = Math.max(MIN_TIER_COUNT, Math.min(MAX_TIER_COUNT, targetCount));
  if (newCount === currentCount) {
    updateTierCountDisplay(currentCount);
    return;
  }

  if (newCount > currentCount) {
    for (let i = currentCount + 1; i <= newCount; i += 1) {
      tierList.appendChild(createTierElement(i));
    }
  } else {
    for (let i = currentCount; i > newCount; i -= 1) {
      const tier = tierList.querySelector(`.tier[data-tier="${i}"]`);
      if (tier) {
        const row = tier.querySelector('.tier-row');
        moveTierItemsToPool(row);
        tier.remove();
      }
    }
  }

  updateTierLabels();
  updateTierCountDisplay(newCount);
}

function initializeTierControls() {
  updateTierCountDisplay(DEFAULT_TIER_COUNT);

  const increaseBtn = document.getElementById('increaseTierBtn');
  const decreaseBtn = document.getElementById('decreaseTierBtn');

  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      const currentCount = getTierListContainer()?.querySelectorAll('.tier').length || DEFAULT_TIER_COUNT;
      setTierCount(currentCount + 1);
    });
  }

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      const currentCount = getTierListContainer()?.querySelectorAll('.tier').length || DEFAULT_TIER_COUNT;
      setTierCount(currentCount - 1);
    });
  }
}

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

  // 画像結合機能を初期化
  initializeImageComposer();

  // Tier数コントロールを初期化
  initializeTierControls();

  // 初期画像を読み込み
  await initializeImages();
}

// DOMの読み込み完了後にアプリを初期化
window.addEventListener("DOMContentLoaded", initializeApp);
