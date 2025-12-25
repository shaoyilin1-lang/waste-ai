const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;

// 先讓 public 接管首頁
app.use(express.static("public"));

// 健康檢查用（不影響首頁）
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// 你的 API
app.post("/classify", upload.single("image"), async (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
