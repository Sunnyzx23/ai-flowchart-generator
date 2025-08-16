import express from 'express';
import { exportController } from '../controllers/exportController.js';

const router = express.Router();

// API文档和健康检查
router.get('/docs', (req, res) => exportController.getApiDocs(req, res));
router.get('/health', (req, res) => exportController.getHealthStatus(req, res));

// 格式支持
router.get('/formats', (req, res) => exportController.getSupportedFormats(req, res));

// 导出功能
router.post('/', (req, res) => exportController.exportFlowchart(req, res));
router.post('/batch', (req, res) => exportController.batchExport(req, res));

// 文件下载
router.get('/download/:fileName', (req, res) => exportController.downloadFile(req, res));

export default router;
