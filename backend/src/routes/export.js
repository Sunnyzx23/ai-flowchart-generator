import express from 'express';
import { exportController } from '../controllers/exportController.js';

const router = express.Router();

// API文档和健康检查
router.get('/docs', exportController.getApiDocs);
router.get('/health', exportController.getHealthStatus);

// 格式支持
router.get('/formats', exportController.getSupportedFormats);

// 导出功能
router.post('/', exportController.exportFlowchart);
router.post('/batch', exportController.batchExport);

// 文件下载
router.get('/download/:fileName', exportController.downloadFile);

export default router;
