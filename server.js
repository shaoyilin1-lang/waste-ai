const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Render 會給 PORT；本機可用 3000
const PORT = process.env.PORT || 3000;

// 讓首頁 / 直接顯示 public/index.html
app.use(express.static("public"));

// 健康檢查
app.get("/health", (req, res) => res.json({ ok: true }));

// 上傳圖片 → 回傳分類結果（先用假資料）
function fakePredict() {
  const items = [
    // 資源回收
    { item: "寶特瓶", category: "資源回收" },
    { item: "鋁罐", category: "資源回收" },
    { item: "鐵罐", category: "資源回收" },
    { item: "紙箱", category: "資源回收" },
    { item: "報紙", category: "資源回收" },
    { item: "玻璃瓶", category: "資源回收" },

    // 塑膠回收
    { item: "塑膠杯", category: "塑膠回收" },
    { item: "塑膠袋", category: "塑膠回收" },
    { item: "飲料杯蓋", category: "塑膠回收" },
    { item: "塑膠吸管", category: "塑膠回收" },

    // 一般垃圾（含衛生紙）
    { item: "衛生紙", category: "一般垃圾" },
    { item: "用過的衛生紙", category: "一般垃圾" },
    { item: "口罩", category: "一般垃圾" },
    { item: "尿布", category: "一般垃圾" },
    { item: "破布", category: "一般垃圾" },
    { item: "髒掉的紙張", category: "一般垃圾" }
  ];

  const pick = items[Math.floor(Math.random() * items.length)];

  return {
    item: pick.item,
    category: pick.category,
    confidence: (Math.random() * 0.15 + 0.85).toFixed(2)
  };
}
app.post("/classify", upload.single("image"), (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "missing image field 'image'" });
    }
    const result = fakePredict();
    res.json({
      ...result,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "classify failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
