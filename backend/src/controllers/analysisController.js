import aiService from '../services/aiService.js';
import analysisSessionService from '../services/analysisSessionService.js';

/**
 * 统一的AI分析控制器
 * 整合完整的需求分析到Mermaid代码生成流程
 */
export const analysisController = {
  /**
   * 创建新的分析会话
   * POST /api/v1/analysis/create
   */
  async createAnalysis(req, res) {
    try {
      const { requirement, productType, implementType, options } = req.body;
      
      // 参数验证
      if (!requirement || requirement.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: {
            message: '需求描述不能少于10个字符',
            field: 'requirement',
            type: 'validation_error'
          }
        });
      }
      
      // 创建分析会话
      const session = analysisSessionService.createSession({
        requirement: requirement.trim(),
        productType: productType || 'web',
        implementType: implementType || 'standard',
        source: 'api',
        options: options || {},
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      // 异步执行分析
      setImmediate(() => {
        this.executeAnalysis(session.id);
      });
      
      res.json({
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
          progress: session.progress,
          estimatedTime: '10-30秒'
        },
        message: '分析会话创建成功，正在处理中...'
      });
      
    } catch (error) {
      console.error('[Analysis Controller] 创建分析失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || '创建分析会话失败',
          type: 'analysis_creation_error'
        }
      });
    }
  },

  /**
   * 获取分析状态和结果
   * GET /api/v1/analysis/:sessionId
   */
  async getAnalysisResult(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            message: '会话ID不能为空',
            field: 'sessionId',
            type: 'validation_error'
          }
        });
      }
      
      const session = analysisSessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            message: '会话不存在或已过期',
            type: 'session_not_found'
          }
        });
      }
      
      // 构建响应数据
      const responseData = {
        sessionId: session.id,
        status: session.status,
        progress: session.progress,
        createdAt: session.metadata.createdAt,
        processingTime: session.metadata.processingTime || (Date.now() - session.metadata.startTime)
      };
      
      // 如果有结果，包含结果数据
      if (session.result) {
        responseData.result = session.result;
      }
      
      // 如果有错误，包含错误信息
      if (session.error) {
        responseData.error = session.error;
      }
      
      // 包含性能数据（可选）
      if (req.query.includePerformance === 'true') {
        responseData.performance = session.performance;
      }
      
      res.json({
        success: true,
        data: responseData,
        message: this.getStatusMessage(session.status)
      });
      
    } catch (error) {
      console.error('[Analysis Controller] 获取分析结果失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '获取分析结果失败',
          type: 'result_retrieval_error'
        }
      });
    }
  },

  /**
   * 获取所有活跃会话
   * GET /api/v1/analysis/sessions
   */
  async getActiveSessions(req, res) {
    try {
      const activeSessions = analysisSessionService.getActiveSessions();
      const stats = analysisSessionService.getStats();
      
      res.json({
        success: true,
        data: {
          activeSessions: activeSessions,
          stats: stats
        },
        message: `当前有 ${activeSessions.length} 个活跃会话`
      });
      
    } catch (error) {
      console.error('[Analysis Controller] 获取活跃会话失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '获取活跃会话失败',
          type: 'sessions_retrieval_error'
        }
      });
    }
  },

  /**
   * 取消分析会话
   * DELETE /api/v1/analysis/:sessionId
   */
  async cancelAnalysis(req, res) {
    try {
      const { sessionId } = req.params;
      
      const session = analysisSessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            message: '会话不存在',
            type: 'session_not_found'
          }
        });
      }
      
      // 只能取消处理中的会话
      if (session.status !== analysisSessionService.AnalysisStatus.PROCESSING &&
          session.status !== analysisSessionService.AnalysisStatus.PENDING) {
        return res.status(400).json({
          success: false,
          error: {
            message: '只能取消处理中的会话',
            type: 'invalid_session_status'
          }
        });
      }
      
      // 更新会话状态为失败
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.FAILED, {
        error: { message: '用户取消了分析', type: 'user_cancelled' }
      });
      
      res.json({
        success: true,
        message: '分析会话已取消'
      });
      
    } catch (error) {
      console.error('[Analysis Controller] 取消分析失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '取消分析失败',
          type: 'cancellation_error'
        }
      });
    }
  },

  /**
   * 执行分析的核心逻辑（异步）
   * @param {string} sessionId - 会话ID
   */
  async executeAnalysis(sessionId) {
    const session = analysisSessionService.getSession(sessionId);
    if (!session) {
      console.error(`[Analysis Controller] 会话不存在: ${sessionId}`);
      return;
    }
    
    try {
      // 更新状态为处理中
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.PROCESSING, {
        progress: {
          stage: 'analyzing',
          percentage: 10,
          message: '正在分析需求...',
          steps: ['需求解析', '7维度分析', 'Prompt生成']
        }
      });
      
      const startTime = Date.now();
      
      // 执行AI分析
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.PROCESSING, {
        progress: {
          stage: 'ai_processing',
          percentage: 30,
          message: '正在调用AI分析...',
          steps: ['需求解析', '7维度分析', 'Prompt生成', 'AI调用']
        }
      });
      
      const aiStartTime = Date.now();
      const analysisResult = await aiService.analyzeFlowchart(
        session.request.requirement,
        session.request.productType,
        session.request.implementType,
        session.request.options
      );
      const aiEndTime = Date.now();
      
      // 更新生成状态
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.GENERATING, {
        progress: {
          stage: 'generating',
          percentage: 70,
          message: '正在生成流程图代码...',
          steps: ['需求解析', '7维度分析', 'Prompt生成', 'AI调用', 'Mermaid生成']
        },
        performance: {
          aiCall: aiEndTime - aiStartTime
        }
      });
      
      // 验证结果
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.VALIDATING, {
        progress: {
          stage: 'validating',
          percentage: 90,
          message: '正在验证结果...',
          steps: ['需求解析', '7维度分析', 'Prompt生成', 'AI调用', 'Mermaid生成', '结果验证']
        }
      });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 完成分析
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.COMPLETED, {
        progress: {
          stage: 'completed',
          percentage: 100,
          message: '分析完成！',
          steps: ['需求解析', '7维度分析', 'Prompt生成', 'AI调用', 'Mermaid生成', '结果验证', '完成']
        },
        result: {
          ...analysisResult,
          metadata: {
            ...analysisResult.metadata,
            sessionId: sessionId,
            totalProcessingTime: totalTime
          }
        },
        performance: {
          ...session.performance,
          total: totalTime
        }
      });
      
      console.log(`[Analysis Controller] 分析完成: ${sessionId}, 耗时: ${totalTime}ms`);
      
    } catch (error) {
      console.error(`[Analysis Controller] 分析失败: ${sessionId}`, error);
      
      // 更新会话状态为失败
      analysisSessionService.updateSession(sessionId, analysisSessionService.AnalysisStatus.FAILED, {
        error: {
          message: error.message || '分析过程中发生错误',
          type: error.errorType || 'analysis_error',
          details: error.stack
        },
        progress: {
          stage: 'failed',
          percentage: 0,
          message: '分析失败: ' + (error.message || '未知错误')
        }
      });
    }
  },

  /**
   * 获取状态消息
   * @param {string} status - 状态
   * @returns {string} 状态消息
   */
  getStatusMessage(status) {
    const messages = {
      'pending': '等待处理中...',
      'processing': '正在分析需求...',
      'generating': '正在生成流程图...',
      'validating': '正在验证结果...',
      'completed': '分析完成',
      'failed': '分析失败',
      'timeout': '分析超时'
    };
    
    return messages[status] || '未知状态';
  }
};
