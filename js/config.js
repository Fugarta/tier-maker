/**
 * アプリケーション設定
 */

// プリセット定義
export const PRESETS = {
  default: {
    name: '遊戯王マスターデュエル',
    title: 'TIER MAKER',
    initialImagesPath: './initialImages.txt',
    tweetText: 'Tier Makerで自分だけのティア表を作りました\nhttps://fugarta.github.io/tier-maker/'
  },
  'syncro-cup': {
    name: 'Syncro Cup',
    title: 'SYNCRO CUP TIER MAKER',
    initialImagesPath: './syncro-cup/initialImages.txt',
    tweetText: 'Syncro Cup Tier Makerでティア表を作りました\nhttps://fugarta.github.io/tier-maker/?preset=syncro-cup'
  }
};

// 基本設定
export const CONFIG = {
  // ダウンロード設定
  DOWNLOAD_FILENAME: 'tier-list.png',

  // Twitter設定
  TWEET_URL: 'https://twitter.com/intent/tweet',

  // キャプチャ設定
  CAPTURE_BACKGROUND_COLOR: '#f2f2f2',
  CAPTURE_SCALE: 2,

  // エラーメッセージ表示時間（ミリ秒）
  ERROR_MESSAGE_DURATION: 3000,
  ERROR_MESSAGE_FADE_DURATION: 300
};

/**
 * URLパラメータから現在のプリセットを取得
 * @returns {Object} プリセット設定
 */
export function getCurrentPreset() {
  const params = new URLSearchParams(window.location.search);
  const presetName = params.get('preset') || 'default';
  return PRESETS[presetName] || PRESETS.default;
}
