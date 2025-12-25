const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

/* =========================
   Render 一定要用這個 PORT
========================= */
const PORT = process.env.PORT || 3000;

/* =========================
   基本設定
========================= */
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   路徑設定
========================= */
const BASE_DIR = __dirname;
const DB_PATH = path.join(BASE_DIR, 'waste_db.json');
const CAPTURE_DIR = path.join(BASE_DIR, 'captures');

/* =========================
   建立資料夾
========================= */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(path.join(CAPTURE_DIR, 'recycle'));
ensureDir(path.join(CAPTURE_DIR, 'garbage'));

/* =========================
   讀取分類資料
========================= */
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

/* =========================
   假 AI 分類（先跑流程）
========================= */
function predictFake() {
  const items = ['寶特瓶', '鋁罐', '紙箱', '尿布', '菸蒂'];
  return items[Math.floor(Math.random() * items.length)];
}

/* =========================
   測試首頁
========================= */
app.get('/', (req, res) => {
  res.send('🚀 Waste AI server is running on Render');
});

/* =========================
   辨識 API
========================= */
app.post('/classify', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'missing image field "image"' });
  }

  const item = predictFake();
  let category = '未知';

  if (db.recycle.includes(item)) category = '資源回收';
  if (db.garbage.includes(item)) category = '一般垃圾';

  res.json({ item, category });
});

/* =========================
   儲存照片 API
========================= */
app.post('/capture', upload.single('image'), (req, res) => {
  try {
    const { item, category } = req.body;

    if (!req.file) {
      return res.status(400).send('missing image');
    }

    const folder = category === '資源回收' ? 'recycle' : 'garbage';
    const time = new Date().toISOString().replace(/[:.]/g, '-');
    const safeItem = String(item || 'unknown').replace(/[^\w\u4e00-\u9fa5]/g, '');
    const filename = `${safeItem}_${time}.jpg`;

    fs.writeFileSync(
      path.join(CAPTURE_DIR, folder, filename),
      req.file.buffer
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('capture failed');
  }
});

/* =========================
   一定只能 listen 一次
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

