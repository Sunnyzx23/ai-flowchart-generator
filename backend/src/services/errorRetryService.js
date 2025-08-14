/**
 * 错误处理和重试机制服务
 */
class ErrorRetryService {
  constructor() {
    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1秒基础延迟
      maxDelay: 10000, // 最大延迟10秒
      backoffMultiplier: 2, // 指数退避倍数
      jitterRange: 0.1 // 随机抖动范围
    };

    // 错误类型分类
    this.errorTypes = {
      NETWORK_ERROR: 'network_error',
      TIMEOUT_ERROR: 'timeout_error',
      AUTH_ERROR: 'auth_error',
      RATE_LIMIT_ERROR: 'rate_limit_error',
      AI_RESPONSE_ERROR: 'ai_response_error',
      VALIDATION_ERROR: 'validation_error',
      SYSTEM_ERROR: 'system_error'
    };

    // 可重试的错误类型
    this.retryableErrors = new Set([
      this.errorTypes.NETWORK_ERROR,
      this.errorTypes.TIMEOUT_ERROR,
      this.errorTypes.RATE_LIMIT_ERROR,
      this.errorTypes.AI_RESPONSE_ERROR
    ]);

    // 错误统计
    this.errorStats = {
      total: 0,
      byType: {},
      retryAttempts: 0,
      successAfterRetry: 0
    };
  }

  /**
   * 执行带重试的操作
   * @param {Function} operation - 要执行的操作
   * @param {Object} options - 重试选项
   * @returns {Promise} 执行结果
   */
  async executeWithRetry(operation, options = {}) {
    const config = { ...this.retryConfig, ...options };
    let lastError = null;
    let attempt = 0;

    while (attempt <= config.maxRetries) {
      try {
        console.log(`[Error Retry Service] 执行尝试 ${attempt + 1}/${config.maxRetries + 1}`);
        
        const result = await operation();
        
        if (attempt > 0) {
          this.errorStats.successAfterRetry++;
          console.log(`[Error Retry Service] 重试成功，尝试次数: ${attempt + 1}`);
        }
        
        return result;
      } catch (error) {
        attempt++;
        lastError = error;
        
        const errorInfo = this.classifyError(error);
        this.recordError(errorInfo);
        
        console.error(`[Error Retry Service] 尝试 ${attempt} 失败:`, errorInfo);
        
        // 检查是否应该重试
        if (attempt > config.maxRetries || !this.shouldRetry(errorInfo)) {
          console.error(`[Error Retry Service] 不再重试，原因: ${attempt > config.maxRetries ? '超过最大重试次数' : '错误类型不可重试'}`);
          break;
        }
        
        // 计算延迟时间并等待
        const delay = this.calculateDelay(attempt - 1, config);
        console.log(`[Error Retry Service] 等待 ${delay}ms 后重试...`);
        await this.sleep(delay);
      }
    }
    
    // 所有重试都失败了，抛出最后的错误
    throw this.enhanceError(lastError, attempt);
  }

  /**
   * 错误分类
   * @param {Error} error - 原始错误
   * @returns {Object} 错误信息
   */
  classifyError(error) {
    const errorInfo = {
      originalError: error,
      type: this.errorTypes.SYSTEM_ERROR,
      message: error.message,
      code: error.code,
      statusCode: error.response?.status,
      retryable: false,
      severity: 'high'
    };

    // 网络相关错误
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      errorInfo.type = this.errorTypes.NETWORK_ERROR;
      errorInfo.retryable = true;
      errorInfo.severity = 'medium';
    }
    
    // 超时错误
    else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorInfo.type = this.errorTypes.TIMEOUT_ERROR;
      errorInfo.retryable = true;
      errorInfo.severity = 'medium';
    }
    
    // HTTP状态码相关错误
    else if (error.response) {
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        errorInfo.type = this.errorTypes.AUTH_ERROR;
        errorInfo.retryable = false;
        errorInfo.severity = 'high';
      }
      else if (status === 429) {
        errorInfo.type = this.errorTypes.RATE_LIMIT_ERROR;
        errorInfo.retryable = true;
        errorInfo.severity = 'low';
      }
      else if (status >= 500) {
        errorInfo.type = this.errorTypes.AI_RESPONSE_ERROR;
        errorInfo.retryable = true;
        errorInfo.severity = 'medium';
      }
      else if (status >= 400) {
        errorInfo.type = this.errorTypes.VALIDATION_ERROR;
        errorInfo.retryable = false;
        errorInfo.severity = 'medium';
      }
    }
    
    // AI响应格式错误
    else if (error.message.includes('AI响应') || error.message.includes('格式')) {
      errorInfo.type = this.errorTypes.AI_RESPONSE_ERROR;
      errorInfo.retryable = true;
      errorInfo.severity = 'low';
    }

    return errorInfo;
  }

  /**
   * 判断是否应该重试
   * @param {Object} errorInfo - 错误信息
   * @returns {boolean} 是否应该重试
   */
  shouldRetry(errorInfo) {
    return this.retryableErrors.has(errorInfo.type);
  }

  /**
   * 计算重试延迟时间（指数退避 + 随机抖动）
   * @param {number} attempt - 重试次数（从0开始）
   * @param {Object} config - 重试配置
   * @returns {number} 延迟时间（毫秒）
   */
  calculateDelay(attempt, config) {
    // 指数退避
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    
    // 限制最大延迟
    delay = Math.min(delay, config.maxDelay);
    
    // 添加随机抖动，避免雷群效应
    const jitter = delay * config.jitterRange * (Math.random() * 2 - 1);
    delay += jitter;
    
    return Math.max(delay, 0);
  }

  /**
   * 等待指定时间
   * @param {number} ms - 等待时间（毫秒）
   * @returns {Promise} Promise对象
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 记录错误统计
   * @param {Object} errorInfo - 错误信息
   */
  recordError(errorInfo) {
    this.errorStats.total++;
    this.errorStats.retryAttempts++;
    
    if (!this.errorStats.byType[errorInfo.type]) {
      this.errorStats.byType[errorInfo.type] = 0;
    }
    this.errorStats.byType[errorInfo.type]++;
    
    // 记录详细日志
    console.error('[Error Retry Service] 错误记录:', {
      type: errorInfo.type,
      message: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      retryable: errorInfo.retryable,
      severity: errorInfo.severity,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 增强错误信息
   * @param {Error} error - 原始错误
   * @param {number} attempts - 尝试次数
   * @returns {Error} 增强后的错误
   */
  enhanceError(error, attempts) {
    const errorInfo = this.classifyError(error);
    const userFriendlyMessage = this.getUserFriendlyMessage(errorInfo);
    
    const enhancedError = new Error(userFriendlyMessage);
    enhancedError.originalError = error;
    enhancedError.errorType = errorInfo.type;
    enhancedError.attempts = attempts;
    enhancedError.retryable = errorInfo.retryable;
    enhancedError.severity = errorInfo.severity;
    
    return enhancedError;
  }

  /**
   * 获取用户友好的错误信息
   * @param {Object} errorInfo - 错误信息
   * @returns {string} 用户友好的错误消息
   */
  getUserFriendlyMessage(errorInfo) {
    const messageMap = {
      [this.errorTypes.NETWORK_ERROR]: '网络连接失败，请检查网络连接后重试',
      [this.errorTypes.TIMEOUT_ERROR]: 'AI服务响应超时，请稍后重试',
      [this.errorTypes.AUTH_ERROR]: 'AI服务认证失败，请检查API密钥配置',
      [this.errorTypes.RATE_LIMIT_ERROR]: 'API调用频率过高，请稍后重试',
      [this.errorTypes.AI_RESPONSE_ERROR]: 'AI服务暂时不可用，请稍后重试',
      [this.errorTypes.VALIDATION_ERROR]: '输入参数有误，请检查输入内容',
      [this.errorTypes.SYSTEM_ERROR]: '系统内部错误，请联系管理员'
    };
    
    return messageMap[errorInfo.type] || errorInfo.message || '未知错误，请重试';
  }

  /**
   * 创建降级方案
   * @param {string} operation - 操作类型
   * @param {Object} fallbackData - 降级数据
   * @returns {Object} 降级结果
   */
  createFallback(operation, fallbackData = {}) {
    console.warn(`[Error Retry Service] 启动降级方案: ${operation}`);
    
    const fallbackMap = {
      'ai_analysis': {
        rawResponse: '由于AI服务暂时不可用，已启用降级方案。请稍后重试以获得完整的AI分析结果。',
        mermaidCode: this.getFallbackMermaidCode(),
        validation: {
          isValid: true,
          errors: [],
          warnings: ['使用降级方案生成的基础流程图']
        },
        metadata: {
          model: 'fallback',
          timestamp: new Date().toISOString(),
          processed: true,
          fallback: true
        }
      }
    };
    
    return fallbackMap[operation] || {
      success: false,
      error: '降级方案暂不可用',
      fallback: true
    };
  }

  /**
   * 获取降级Mermaid代码
   * @returns {string} 基础的Mermaid流程图
   */
  getFallbackMermaidCode() {
    return `flowchart TD
    A([开始]) --> B[需求分析]
    B --> C{权限验证}
    C -->|通过| D[业务处理]
    C -->|失败| E[错误处理]
    D --> F[结果生成]
    E --> G([结束])
    F --> G
    
    %% 样式定义
    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style G fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style D fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style C fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:2px`;
  }

  /**
   * 获取错误统计信息
   * @returns {Object} 错误统计
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      retrySuccessRate: this.errorStats.retryAttempts > 0 
        ? (this.errorStats.successAfterRetry / this.errorStats.retryAttempts * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 重置错误统计
   */
  resetErrorStats() {
    this.errorStats = {
      total: 0,
      byType: {},
      retryAttempts: 0,
      successAfterRetry: 0
    };
    console.log('[Error Retry Service] 错误统计已重置');
  }

  /**
   * 检查AI响应的完整性
   * @param {string} response - AI响应内容
   * @returns {Object} 验证结果
   */
  validateAIResponse(response) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 检查响应是否为空
    if (!response || response.trim().length === 0) {
      result.isValid = false;
      result.errors.push('AI响应为空');
      return result;
    }

    // 检查是否包含Mermaid代码
    if (!response.includes('flowchart') && !response.includes('graph')) {
      result.warnings.push('响应中未检测到Mermaid流程图代码');
    }

    // 检查响应长度
    if (response.length < 50) {
      result.warnings.push('AI响应内容过短，可能不完整');
    }

    // 检查是否包含错误信息
    if (response.includes('error') || response.includes('Error') || response.includes('错误')) {
      result.warnings.push('响应中包含错误信息');
    }

    return result;
  }
}

// 导出单例
export const errorRetryService = new ErrorRetryService();
export default errorRetryService;
