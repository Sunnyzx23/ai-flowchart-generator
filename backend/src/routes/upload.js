import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadController } from '../controllers/uploadController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.txt', '.md', '.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}. 支持的格式: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// 文件上传路由
router.post('/file', upload.single('file'), uploadController.uploadFile);

// 测试上传功能
router.get('/test', (req, res) => {
  res.json({
    message: '文件上传服务正常',
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
    supportedTypes: ['.txt', '.md', '.pdf', '.docx'],
    timestamp: new Date().toISOString()
  });
});

export default router;
