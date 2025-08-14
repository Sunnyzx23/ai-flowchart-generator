import express from 'express';
import { flowchartController } from '../controllers/flowchartController.js';

const router = express.Router();

/**
 * 流程图数据验证路由
 */

// API文档
router.get('/docs', flowchartController.getApiDocs);

// 健康检查
router.get('/health', flowchartController.healthCheck);

// 获取支持的流程图类型
router.get('/types', flowchartController.getSupportedTypes);

// 获取验证规则
router.get('/rules', flowchartController.getValidationRules);

// 验证单个流程图数据
router.post('/validate', flowchartController.receiveFlowchartData);

// 批量验证流程图数据
router.post('/batch-validate', flowchartController.batchValidateFlowcharts);

export default router;
