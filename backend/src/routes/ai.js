import express from 'express';
import multer from 'multer';
import path from 'path';
import { aiController } from '../controllers/aiController.js';
import { config } from '../config/config.js';
import mermaidGenerator from '../services/mermaidGenerator.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// 配置文件上传中间件
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.upload.allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${ext}`), false);
    }
  }
});

/**
 * AI服务路由
 */

// AI服务健康检查
router.get('/health', aiController.healthCheck);

// 获取可用模型列表
router.get('/models', aiController.getModels);

// 分析文本需求（完整版）
router.post('/analyze', aiController.analyzeRequirement);

// 快速分析（简化版）
router.post('/quick-analyze', aiController.quickAnalyze);

// 智能分析（7维度分析引擎）
router.post('/intelligent-analyze', aiController.intelligentAnalyze);

// AI分析端点 - 兼容前端调用
router.post('/analysis', aiController.analyzeRequirement);

// 分析文件需求
router.post('/analyze-file', upload.single('file'), aiController.analyzeFile);

// 测试AI生成（开发用）
router.post('/test', aiController.testGeneration);

// Mermaid相关接口
// 验证Mermaid代码语法
router.post('/mermaid/validate', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mermaid代码不能为空', field: 'code' }
      });
    }

    const validation = mermaidGenerator.validateSyntax(code);
    
    res.json({
      success: true,
      data: validation,
      message: validation.isValid ? 'Mermaid代码语法正确' : 'Mermaid代码存在语法问题'
    });
  } catch (error) {
    console.error('[AI Routes] Mermaid验证失败:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Mermaid代码验证失败', details: error.message }
    });
  }
});

// 优化Mermaid代码
router.post('/mermaid/optimize', (req, res) => {
  try {
    const { code, options = {} } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mermaid代码不能为空', field: 'code' }
      });
    }

    const optimizedCode = mermaidGenerator.optimizeCode(code, options);
    const validation = mermaidGenerator.validateSyntax(optimizedCode);
    
    res.json({
      success: true,
      data: {
        originalCode: code,
        optimizedCode: optimizedCode,
        validation: validation,
        improvements: {
          lengthReduction: code.length - optimizedCode.length,
          formatImproved: true
        }
      },
      message: 'Mermaid代码优化完成'
    });
  } catch (error) {
    console.error('[AI Routes] Mermaid优化失败:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Mermaid代码优化失败', details: error.message }
    });
  }
});

// 生成示例Mermaid流程图
router.get('/mermaid/example', (req, res) => {
  try {
    const exampleCode = mermaidGenerator.generateExample();
    const validation = mermaidGenerator.validateSyntax(exampleCode);
    
    res.json({
      success: true,
      data: {
        mermaidCode: exampleCode,
        validation: validation,
        description: '这是一个包含7个分析维度的示例流程图'
      },
      message: '示例Mermaid流程图生成成功'
    });
  } catch (error) {
    console.error('[AI Routes] 生成示例失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '生成示例流程图失败', details: error.message }
    });
  }
});

// 错误统计和系统状态接口
// 获取错误统计信息
router.get('/stats/errors', (req, res) => {
  try {
    const stats = aiService.getErrorStats();
    
    res.json({
      success: true,
      data: stats,
      message: '错误统计信息获取成功'
    });
  } catch (error) {
    console.error('[AI Routes] 获取错误统计失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取错误统计失败', details: error.message }
    });
  }
});

// 重置错误统计
router.post('/stats/reset', (req, res) => {
  try {
    aiService.resetErrorStats();
    
    res.json({
      success: true,
      message: '错误统计已重置'
    });
  } catch (error) {
    console.error('[AI Routes] 重置错误统计失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '重置错误统计失败', details: error.message }
    });
  }
});

// 获取系统状态
router.get('/system/status', async (req, res) => {
  try {
    const [connectionStatus, promptConfig] = await Promise.all([
      aiService.checkConnection(),
      Promise.resolve(aiService.getCurrentPromptConfig())
    ]);
    
    res.json({
      success: true,
      data: {
        connection: {
          status: connectionStatus ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        },
        promptConfig: promptConfig,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      },
      message: '系统状态获取成功'
    });
  } catch (error) {
    console.error('[AI Routes] 获取系统状态失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取系统状态失败', details: error.message }
    });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  console.error('[AI Routes] 路由错误:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: `文件大小超过限制，最大支持 ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
          type: 'file_size_error'
        }
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: {
      message: error.message || 'AI服务内部错误',
      type: 'ai_service_error'
    }
  });
});

export default router;