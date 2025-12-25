const express = require('express');
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');
const Jimp = require('jimp');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(express.static('public'));

const MODEL_PATH = 'file://' + path.join(__dirname, 'waste_model/model.json');
const LABEL_PATH = path.join(__dirname, 'waste_model/labels.json');
const DB_PATH = path.join(__dirname, 'waste_db.json');
const CAPTURE_DIR = path.join(__dirname, 'captures');

const upload = multer({ storage: multer.memoryStorage() });

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(CAPTURE_DIR, 'recycle'));
ensureDir(path.join(CAPTURE_DIR, 'garbage'));

const db = JSON.parse(fs.readFileSync(DB_PATH));
// 🚧 暫時不載入模型（測系統用）
const labels = [];
let model = null;


// AI 預測
async function predict(imageBuffer) {
  // 模擬 AI 辨識結果（測流程用）
  const items = ["寶特瓶", "鋁罐", "紙箱", "尿布", "菸蒂"];
  return items[Math.floor(Math.random() * items.length)];
}


// 辨識 API
app.post('/classify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "missing image field 'image'" });
    }

    const item = await predict(req.file.buffer);

    let category = '未知';
    if (db.recycle.includes(item)) category = '資源回收';
    if (db.garbage.includes(item)) category = '一般垃圾';

    res.json({ item, category });
  } catch (e) {
    console.error("classify error:", e);
    res.status(500).json({ error: "classify failed" });
  }
});


// 拍照存證 API
app.post('/capture', upload.single('image'), (req, res) => {
  try {
    const { item, category } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).send("missing image field 'image'");
    }
    if (!item || !category) {
      return res.status(400).send("missing item/category");
    }

    const folder = category === '資源回收' ? 'recycle' : 'garbage';
    const time = new Date().toISOString().replace(/[:.]/g, '-');
    const safeItem = String(item).replace(/[^\w\u4e00-\u9fa5]/g, '');
    const filename = `${safeItem}_${time}.jpg`;

    fs.writeFileSync(
      path.join(CAPTURE_DIR, folder, filename),
      req.file.buffer
    );

    res.sendStatus(200);
  } catch (e) {
    console.error("capture error:", e);
    res.status(500).send("capture failed");
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

