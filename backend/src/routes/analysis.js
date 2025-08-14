import express from 'express';
import { analysisController } from '../controllers/analysisController.js';
import analysisSessionService from '../services/analysisSessionService.js';

const router = express.Router();

/**
 * 统一的AI分析API路由
 * /api/v1/analysis
 */

// 创建新的分析会话
router.post('/create', analysisController.createAnalysis);

// 获取分析结果
router.get('/:sessionId', analysisController.getAnalysisResult);

// 取消分析会话
router.delete('/:sessionId', analysisController.cancelAnalysis);

// 获取所有活跃会话（管理接口）
router.get('/sessions/active', analysisController.getActiveSessions);

// 获取会话统计信息
router.get('/stats/overview', (req, res) => {
  try {
    const stats = analysisSessionService.getStats();
    
    res.json({
      success: true,
      data: stats,
      message: '统计信息获取成功'
    });
  } catch (error) {
    console.error('[Analysis Routes] 获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取统计信息失败', details: error.message }
    });
  }
});

// 重置统计信息（管理接口）
router.post('/stats/reset', (req, res) => {
  try {
    analysisSessionService.resetStats();
    
    res.json({
      success: true,
      message: '统计信息已重置'
    });
  } catch (error) {
    console.error('[Analysis Routes] 重置统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '重置统计信息失败', details: error.message }
    });
  }
});

// 批量分析接口（高级功能）
router.post('/batch', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: '请提供有效的分析请求列表',
          field: 'requests',
          type: 'validation_error'
        }
      });
    }
    
    if (requests.length > 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: '批量分析最多支持10个请求',
          type: 'batch_limit_exceeded'
        }
      });
    }
    
    // 创建批量会话
    const sessions = [];
    for (const request of requests) {
      try {
        const session = analysisSessionService.createSession({
          ...request,
          source: 'batch_api',
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
        sessions.push(session);
        
        // 异步执行分析
        setImmediate(() => {
          analysisController.executeAnalysis(session.id);
        });
      } catch (error) {
        console.error('[Analysis Routes] 批量创建会话失败:', error);
        sessions.push({
          error: error.message,
          request: request
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          sessionId: session.id || null,
          status: session.status || 'failed',
          error: session.error || null,
          request: session.request || session.request
        })),
        totalRequests: requests.length,
        successfulSessions: sessions.filter(s => s.id).length
      },
      message: `批量分析创建完成，成功创建 ${sessions.filter(s => s.id).length} 个会话`
    });
    
  } catch (error) {
    console.error('[Analysis Routes] 批量分析失败:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '批量分析创建失败',
        type: 'batch_analysis_error',
        details: error.message
      }
    });
  }
});

// 健康检查接口
router.get('/health/check', (req, res) => {
  try {
    const stats = analysisSessionService.getStats();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      sessions: {
        active: stats.activeSessions,
        total: stats.totalSessions,
        success_rate: stats.successRate
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // 检查系统负载
    if (stats.activeSessions > 50) {
      health.status = 'busy';
      health.warning = '系统负载较高';
    }
    
    res.json({
      success: true,
      data: health,
      message: '分析服务运行正常'
    });
  } catch (error) {
    console.error('[Analysis Routes] 健康检查失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '健康检查失败', details: error.message }
    });
  }
});

// API文档接口
router.get('/docs/api', (req, res) => {
  const documentation = {
    version: '1.0.0',
    title: 'AI流程图分析API',
    description: '统一的AI分析引擎API接口',
    baseUrl: '/api/v1/analysis',
    endpoints: [
      {
        method: 'POST',
        path: '/create',
        description: '创建新的分析会话',
        parameters: {
          requirement: 'string (必需) - 需求描述，最少10个字符',
          productType: 'string (可选) - 产品类型：web/desktop/mobile/plugin，默认web',
          implementType: 'string (可选) - 实现方式：standard/ai/simple，默认standard',
          options: 'object (可选) - 附加选项'
        },
        response: {
          sessionId: 'string - 会话ID',
          status: 'string - 会话状态',
          progress: 'object - 进度信息'
        }
      },
      {
        method: 'GET',
        path: '/:sessionId',
        description: '获取分析结果',
        parameters: {
          sessionId: 'string (路径参数) - 会话ID',
          includePerformance: 'boolean (查询参数) - 是否包含性能数据'
        },
        response: {
          sessionId: 'string - 会话ID',
          status: 'string - 会话状态',
          progress: 'object - 进度信息',
          result: 'object - 分析结果（如果完成）',
          error: 'object - 错误信息（如果失败）'
        }
      },
      {
        method: 'DELETE',
        path: '/:sessionId',
        description: '取消分析会话',
        parameters: {
          sessionId: 'string (路径参数) - 会话ID'
        }
      },
      {
        method: 'POST',
        path: '/batch',
        description: '批量分析（最多10个请求）',
        parameters: {
          requests: 'array - 分析请求列表'
        }
      }
    ],
    statusCodes: {
      'pending': '等待处理',
      'processing': '处理中',
      'generating': '生成中',
      'validating': '验证中',
      'completed': '完成',
      'failed': '失败',
      'timeout': '超时'
    }
  };
  
  res.json({
    success: true,
    data: documentation,
    message: 'API文档'
  });
});

// 错误处理中间件
router.use((error, req, res, next) => {
  console.error('[Analysis Routes] 路由错误:', error);
  
  res.status(500).json({
    success: false,
    error: {
      message: error.message || '分析服务内部错误',
      type: 'analysis_service_error',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
