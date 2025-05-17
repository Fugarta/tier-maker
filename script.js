function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text/plain");
  const dragged = document.getElementById(id)?.closest(".tier-item-wrapper");
  let target = ev.target.closest(".tier-item-wrapper");

  const row = ev.target.closest(".tier-row");

  if (!dragged || !row) return;

  if (target && target !== dragged) {
    // tier-item-wrapper上にドロップした場合、その前に挿入
    row.insertBefore(dragged, target);
  } else {
    // tier-rowの空き部分にドロップした場合、末尾に追加
    row.appendChild(dragged);
  }
}

let itemCount = 0;
const poolRow = document.getElementById("poolRow");

// 初期画像のsrc一覧を保持
let initialImageSrcs = [];

function createImageElement(src, labelText = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("tier-item-wrapper");

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("tier-item");
  img.setAttribute("draggable", "true");
  img.id = "item-" + itemCount++;
  img.addEventListener("dragstart", drag);

  // 右クリック処理
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const parent = wrapper.parentElement;
    // 初期画像は削除不可
    if (parent.id === "poolRow" && !initialImageSrcs.includes(img.src)) {
      wrapper.remove(); // プール内なら削除
    } else if (parent.id !== "poolRow") {
      poolRow.appendChild(wrapper); // それ以外なら戻す
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

function addImageToPool(src, labelText = "") {
  const wrapper = createImageElement(src, labelText);
  poolRow.appendChild(wrapper);
}

document.getElementById("imageUpload").addEventListener("change", (event) => {
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      addImageToPool(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("saveButton").addEventListener("click", () => {
  html2canvas(document.getElementById("mainContainer")).then(canvas => {
    const link = document.createElement("a");
    link.download = "tier-list.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = function(e) {
        addImageToPool(e.target.result);
      };
      reader.readAsDataURL(blob);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const initialImages = [
    { src: "images/snake.png", label: "スネークアイ" },
    { src: "images/blue.png", label: "青眼" },
    { src: "images/hakai.png", label: "破械" },
    { src: "images/memento.png", label: "メメント" },
    { src: "images/kaiou.png", label: "海皇" },
    { src: "images/tenpai.png", label: "天盃" },
    { src: "images/tiera.png", label: "ティアラ" },
    { src: "images/yubel.png", label: "ユベル" },
    { src: "images/metabi.png", label: "メタビ" },
];
  // 初期画像のsrcを絶対パスで保持
  initialImageSrcs = initialImages.map(obj => {
    const a = document.createElement('a');
    a.href = obj.src;
    return a.href;
  });
  initialImages.forEach(obj => {
    addImageToPool(obj.src, obj.label);
  });
});
