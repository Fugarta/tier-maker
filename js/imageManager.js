import { CONFIG, getCurrentPreset } from './config.js';
import { showErrorMessage, readImageFile } from './utils.js';
import { drag } from './dragDrop.js';
import { enableTouchDrag } from './touch-support.js';
import { toggleImageSelection } from './imageComposer.js';

/**
 * 画像管理モジュール
 */

// 画像カウンター
let itemCount = 0;

// 初期画像のsrc一覧を保持（削除防止用）
let initialImageSrcs = [];

// 現在のプリセット
const currentPreset = getCurrentPreset();

/**
 * 画像要素を作成
 * @param {string} src - 画像のURL
 * @param {string} labelText - ラベルテキスト
 * @returns {HTMLElement} 画像のラッパー要素
 */
export function createImageElement(src, labelText = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("tier-item-wrapper");

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("tier-item");
  img.setAttribute("draggable", "true");
  img.id = "item-" + itemCount++;
  img.addEventListener("dragstart", drag);
  img.addEventListener("touchstart", enableTouchDrag, { passive: false });

  // 右クリック処理
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const parent = wrapper.parentElement;
    const poolRow = document.getElementById("poolRow");

    // 初期画像は削除不可
    if (parent.id === "poolRow" && !initialImageSrcs.includes(img.src)) {
      wrapper.remove(); // プール内なら削除
    } else if (parent.id !== "poolRow") {
      poolRow.appendChild(wrapper); // それ以外なら戻す
    }
  });

  // クリックで選択（Ctrlキーを押しながら、またはプール内でのみ）
  img.addEventListener("click", (e) => {
    const parent = wrapper.parentElement;
    // プール内、またはCtrlキー押下時のみ選択可能
    if (parent.id === "poolRow" || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleImageSelection(wrapper);
    }
  });

  // ラベル要素を画像と一緒に作って重ねる
  const label = document.createElement("input");
  label.classList.add("label-overlay");
  label.type = "text";
  label.placeholder = "ラベル";
  label.value = labelText;

  wrapper.appendChild(img);
  wrapper.appendChild(label);

  return wrapper;
}

/**
 * 画像をプールに追加
 * @param {string} src - 画像のURL
 * @param {string} labelText - ラベルテキスト
 * @param {boolean} toFirst - 先頭に追加するかどうか
 */
export function addImageToPool(src, labelText = "", toFirst = false) {
  const poolRow = document.getElementById("poolRow");
  const wrapper = createImageElement(src, labelText);

  if (toFirst && poolRow.firstChild) {
    poolRow.insertBefore(wrapper, poolRow.firstChild);
  } else {
    poolRow.appendChild(wrapper);
  }
}

/**
 * 初期画像リストを読み込む
 * @returns {Promise<Array<{src: string, label: string}>>} 画像リスト
 */
async function loadInitialImagesList() {
  try {
    const response = await fetch(currentPreset.initialImagesPath);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [src, label = ""] = line.split(',').map(s => s.trim());
        return { src, label };
      });
  } catch (error) {
    console.error("初期画像リストの読み込みに失敗しました:", error);
    showErrorMessage("初期画像リストの読み込みに失敗しました");
    return [];
  }
}

/**
 * 初期画像を読み込んでプールに追加
 */
export async function initializeImages() {
  try {
    const initialImages = await loadInitialImagesList();

    // 初期画像のURLを保存（削除防止用）
    initialImageSrcs = initialImages.map(obj => {
      const a = document.createElement('a');
      a.href = obj.src;
      return a.href;
    });

    // 画像をプールに追加
    initialImages.forEach(obj => {
      addImageToPool(obj.src, obj.label); // 末尾に追加
    });
  } catch (error) {
    console.error("初期化処理に失敗しました:", error);
    showErrorMessage("初期化処理に失敗しました");
  }
}

/**
 * 画像アップロード機能を初期化
 */
export function setupImageUpload() {
  document.getElementById("imageUpload").addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);

    try {
      for (const file of files) {
        const imageData = await readImageFile(file);
        addImageToPool(imageData, "", true); // 先頭に追加
      }
    } catch (error) {
      console.error("画像のアップロードに失敗しました:", error);
      showErrorMessage("画像のアップロードに失敗しました");
    }
  });
}

/**
 * 画像ペースト機能を初期化
 */
export function setupImagePaste() {
  document.addEventListener("paste", async (event) => {
    const items = Array.from(event.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith("image/"));

    if (imageItems.length === 0) return;

    try {
      for (const item of imageItems) {
        const blob = item.getAsFile();
        if (!blob) continue;

        const imageData = await readImageFile(blob);
        addImageToPool(imageData, "", true); // 先頭に追加
      }
    } catch (error) {
      console.error("画像のペーストに失敗しました:", error);
      showErrorMessage("画像のペーストに失敗しました");
    }
  });
}
