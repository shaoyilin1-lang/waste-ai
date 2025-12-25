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
  const items = ["寶特瓶", "鋁罐", "紙箱", "尿布", "菸蒂"];
  const item = items[Math.floor(Math.random() * items.length)];
  const category =
    item === "寶特瓶" || item === "鋁罐" || item === "紙箱" ? "資源回收" : "一般垃圾";
  return { item, category };
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
