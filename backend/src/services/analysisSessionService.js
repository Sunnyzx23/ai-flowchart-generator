import { v4 as uuidv4 } from 'uuid';

/**
 * 分析会话管理服务
 * 管理AI分析的会话状态、进度跟踪、结果缓存
 */
class AnalysisSessionService {
  constructor() {
    // 会话存储（生产环境应使用Redis或数据库）
    this.sessions = new Map();
    
    // 会话配置
    this.config = {
      maxSessions: 100, // 最大并发会话数
      sessionTimeout: 300000, // 会话超时时间（5分钟）
      cleanupInterval: 60000, // 清理间隔（1分钟）
      maxRetries: 3, // 最大重试次数
      duplicateDetectionWindow: 30000 // 重复请求检测窗口（30秒）
    };
    
    // 分析状态枚举
    this.AnalysisStatus = {
      PENDING: 'pending',           // 等待中
      PROCESSING: 'processing',     // 处理中
      GENERATING: 'generating',     // 生成中
      VALIDATING: 'validating',     // 验证中
      COMPLETED: 'completed',       // 完成
      FAILED: 'failed',            // 失败
      TIMEOUT: 'timeout'           // 超时
    };
    
    // 启动定期清理
    this.startCleanupTimer();
    
    // 性能统计
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      failedSessions: 0,
      averageProcessingTime: 0,
      duplicateRequests: 0
    };
  }

  /**
   * 创建新的分析会话
   * @param {Object} request - 分析请求
   * @returns {Object} 会话信息
   */
  createSession(request) {
    // 检查重复请求
    const duplicateSession = this.findDuplicateSession(request);
    if (duplicateSession) {
      console.log('[Analysis Session] 检测到重复请求，返回已存在会话');
      this.stats.duplicateRequests++;
      return duplicateSession;
    }
    
    // 检查会话数量限制
    if (this.sessions.size >= this.config.maxSessions) {
      throw new Error('系统繁忙，请稍后重试');
    }
    
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      status: this.AnalysisStatus.PENDING,
      request: {
        requirement: request.requirement,
        productType: request.productType || 'web',
        implementType: request.implementType || 'standard',
        source: request.source || 'text',
        options: request.options || {}
      },
      progress: {
        stage: 'initializing',
        percentage: 0,
        message: '正在初始化分析...',
        steps: []
      },
      result: null,
      error: null,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: Date.now(),
        endTime: null,
        processingTime: 0,
        retryCount: 0,
        clientInfo: {
          userAgent: request.userAgent,
          ip: request.ip
        }
      },
      performance: {
        promptGeneration: 0,
        aiCall: 0,
        mermaidGeneration: 0,
        validation: 0
      }
    };
    
    this.sessions.set(sessionId, session);
    this.stats.totalSessions++;
    this.stats.activeSessions++;
    
    console.log(`[Analysis Session] 创建会话: ${sessionId}`);
    return session;
  }

  /**
   * 获取会话信息
   * @param {string} sessionId - 会话ID
   * @returns {Object|null} 会话信息
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * 更新会话状态
   * @param {string} sessionId - 会话ID
   * @param {string} status - 新状态
   * @param {Object} updates - 更新数据
   */
  updateSession(sessionId, status, updates = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`[Analysis Session] 会话不存在: ${sessionId}`);
      return false;
    }
    
    session.status = status;
    session.metadata.updatedAt = new Date().toISOString();
    
    // 更新进度信息
    if (updates.progress) {
      session.progress = { ...session.progress, ...updates.progress };
    }
    
    // 更新结果
    if (updates.result) {
      session.result = updates.result;
    }
    
    // 更新错误信息
    if (updates.error) {
      session.error = updates.error;
    }
    
    // 更新性能数据
    if (updates.performance) {
      session.performance = { ...session.performance, ...updates.performance };
    }
    
    // 如果是完成或失败状态，更新统计
    if (status === this.AnalysisStatus.COMPLETED) {
      session.metadata.endTime = Date.now();
      session.metadata.processingTime = session.metadata.endTime - session.metadata.startTime;
      this.stats.activeSessions--;
      this.stats.completedSessions++;
      this.updateAverageProcessingTime(session.metadata.processingTime);
    } else if (status === this.AnalysisStatus.FAILED || status === this.AnalysisStatus.TIMEOUT) {
      session.metadata.endTime = Date.now();
      session.metadata.processingTime = session.metadata.endTime - session.metadata.startTime;
      this.stats.activeSessions--;
      this.stats.failedSessions++;
    }
    
    console.log(`[Analysis Session] 更新会话 ${sessionId}: ${status}`);
    return true;
  }

  /**
   * 删除会话
   * @param {string} sessionId - 会话ID
   */
  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session && session.status === this.AnalysisStatus.PROCESSING) {
      this.stats.activeSessions--;
    }
    
    this.sessions.delete(sessionId);
    console.log(`[Analysis Session] 删除会话: ${sessionId}`);
  }

  /**
   * 查找重复请求
   * @param {Object} request - 请求信息
   * @returns {Object|null} 重复的会话
   */
  findDuplicateSession(request) {
    const now = Date.now();
    const window = this.config.duplicateDetectionWindow;
    
    for (const [sessionId, session] of this.sessions) {
      // 检查时间窗口
      if (now - session.metadata.startTime > window) {
        continue;
      }
      
      // 检查请求内容是否相同
      if (
        session.request.requirement === request.requirement &&
        session.request.productType === (request.productType || 'web') &&
        session.request.implementType === (request.implementType || 'standard')
      ) {
        return session;
      }
    }
    
    return null;
  }

  /**
   * 获取所有活跃会话
   * @returns {Array} 活跃会话列表
   */
  getActiveSessions() {
    const activeSessions = [];
    for (const [sessionId, session] of this.sessions) {
      if (session.status === this.AnalysisStatus.PROCESSING || 
          session.status === this.AnalysisStatus.GENERATING) {
        activeSessions.push({
          id: sessionId,
          status: session.status,
          progress: session.progress,
          startTime: session.metadata.startTime,
          processingTime: Date.now() - session.metadata.startTime
        });
      }
    }
    return activeSessions;
  }

  /**
   * 清理超时会话
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const timeout = this.config.sessionTimeout;
    const completedSessionTimeout = timeout * 2; // 已完成的会话保留更长时间
    const expiredSessions = [];
    
    for (const [sessionId, session] of this.sessions) {
      let shouldCleanup = false;
      
      // 对于进行中的会话，使用正常超时时间
      if (session.status === this.AnalysisStatus.PROCESSING || 
          session.status === this.AnalysisStatus.PENDING) {
        if (now - session.metadata.startTime > timeout) {
          shouldCleanup = true;
          // 设置超时状态
          this.updateSession(sessionId, this.AnalysisStatus.TIMEOUT, {
            error: { message: '分析超时，请重新尝试', type: 'timeout' }
          });
        }
      } 
      // 对于已完成的会话，使用更长的保留时间
      else if (session.status === this.AnalysisStatus.COMPLETED || 
               session.status === this.AnalysisStatus.ERROR) {
        if (now - session.metadata.startTime > completedSessionTimeout) {
          shouldCleanup = true;
        }
      }
      // 其他状态的会话使用正常超时时间
      else {
        if (now - session.metadata.startTime > timeout) {
          shouldCleanup = true;
        }
      }
      
      if (shouldCleanup) {
        expiredSessions.push(sessionId);
      }
    }
    
    // 删除过期会话
    expiredSessions.forEach(sessionId => {
      this.deleteSession(sessionId);
    });
    
    if (expiredSessions.length > 0) {
      console.log(`[Analysis Session] 清理了 ${expiredSessions.length} 个超时会话`);
    }
  }

  /**
   * 启动定期清理定时器
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.cleanupInterval);
    
    console.log('[Analysis Session] 启动会话清理定时器');
  }

  /**
   * 更新平均处理时间
   * @param {number} processingTime - 处理时间
   */
  updateAverageProcessingTime(processingTime) {
    const totalCompleted = this.stats.completedSessions;
    if (totalCompleted === 1) {
      this.stats.averageProcessingTime = processingTime;
    } else {
      this.stats.averageProcessingTime = 
        (this.stats.averageProcessingTime * (totalCompleted - 1) + processingTime) / totalCompleted;
    }
  }

  /**
   * 获取性能统计
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      activeSessions: this.getActiveSessions(),
      totalSessionsInMemory: this.sessions.size,
      averageProcessingTimeMs: Math.round(this.stats.averageProcessingTime),
      successRate: this.stats.totalSessions > 0 
        ? ((this.stats.completedSessions / this.stats.totalSessions) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      failedSessions: 0,
      averageProcessingTime: 0,
      duplicateRequests: 0
    };
    console.log('[Analysis Session] 统计信息已重置');
  }

  /**
   * 创建会话摘要
   * @param {Object} session - 会话对象
   * @returns {Object} 会话摘要
   */
  createSessionSummary(session) {
    return {
      id: session.id,
      status: session.status,
      progress: session.progress,
      hasResult: !!session.result,
      hasError: !!session.error,
      processingTime: session.metadata.processingTime || (Date.now() - session.metadata.startTime),
      createdAt: session.metadata.createdAt,
      request: {
        requirement: session.request.requirement.substring(0, 100) + '...',
        productType: session.request.productType,
        implementType: session.request.implementType
      }
    };
  }
}

// 导出单例
export const analysisSessionService = new AnalysisSessionService();
export default analysisSessionService;
