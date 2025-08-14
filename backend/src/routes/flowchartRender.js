import express from 'express';
import { flowchartRenderController } from '../controllers/flowchartRenderController.js';

const router = express.Router();

/**
 * 流程图渲染API路由
 */

// API文档
router.get('/docs', flowchartRenderController.getApiDocs);

// 健康检查
router.get('/health', flowchartRenderController.healthCheck);

// 获取渲染配置
router.get('/config', flowchartRenderController.getRenderConfig);

// 获取渲染统计
router.get('/stats', flowchartRenderController.getRenderStats);

// 清理缓存
router.post('/clear-cache', flowchartRenderController.clearCache);

// 渲染单个流程图
router.post('/render', flowchartRenderController.renderFlowchart);

// 批量渲染流程图
router.post('/batch-render', flowchartRenderController.batchRenderFlowcharts);

// 获取流程图信息 (放在最后，避免与其他路由冲突)
router.get('/:id', flowchartRenderController.getFlowchartInfo);

export default router;
