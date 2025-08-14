import { useState, useCallback, useRef } from 'react';

/**
 * 错误恢复管理Hook
 * 处理错误状态、重试逻辑、错误分类和恢复
 */
export const useErrorRecovery = (maxRetries = 3, retryDelay = 1000) => {
  const [errorState, setErrorState] = useState({
    hasError: false,
    error: null,
    errorType: 'unknown',
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: null
  });

  const retryTimeoutRef = useRef(null);

  // 错误分类函数
  const classifyError = useCallback((error) => {
    if (!error) return 'unknown';

    const message = error.message?.toLowerCase() || '';
    const code = error.code || error.status;

    // 网络错误
    if (
      message.includes('network') || 
      message.includes('fetch') ||
      message.includes('connection') ||
      code === 'NETWORK_ERROR' ||
      error.name === 'NetworkError'
    ) {
      return 'network';
    }

    // 超时错误
    if (
      message.includes('timeout') || 
      message.includes('time out') ||
      code === 'TIMEOUT' ||
      code === 408
    ) {
      return 'timeout';
    }

    // API错误
    if (code >= 500 && code < 600) {
      return 'api_error';
    }

    // 验证错误
    if (
      code >= 400 && code < 500 ||
      message.includes('validation') ||
      message.includes('invalid')
    ) {
      return 'validation';
    }

    // 配额超限
    if (
      code === 429 ||
      message.includes('quota') ||
      message.includes('limit')
    ) {
      return 'quota_exceeded';
    }

    // 文件错误
    if (
      message.includes('file') ||
      message.includes('parse') ||
      message.includes('format')
    ) {
      return 'file_error';
    }

    return 'unknown';
  }, []);

  // 设置错误
  const setError = useCallback((error, customType = null) => {
    const errorType = customType || classifyError(error);
    
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorType,
      isRetrying: false
    }));
  }, [classifyError]);

  // 清除错误
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setErrorState({
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: null
    });
  }, []);

  // 重试操作
  const retry = useCallback(async (operation) => {
    if (!operation || errorState.retryCount >= maxRetries) {
      return false;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      lastRetryTime: Date.now()
    }));

    // 指数退避延迟
    const delay = retryDelay * Math.pow(2, errorState.retryCount);
    
    try {
      await new Promise(resolve => {
        retryTimeoutRef.current = setTimeout(resolve, delay);
      });

      const result = await operation();
      
      // 重试成功，清除错误状态
      clearError();
      return result;
      
    } catch (error) {
      // 重试失败，更新错误状态
      setErrorState(prev => ({
        ...prev,
        error,
        errorType: classifyError(error),
        isRetrying: false
      }));
      
      return false;
    }
  }, [errorState.retryCount, maxRetries, retryDelay, classifyError, clearError]);

  // 自动重试（用于某些类型的错误）
  const autoRetry = useCallback(async (operation, shouldAutoRetry = null) => {
    const defaultAutoRetryTypes = ['network', 'timeout', 'api_error'];
    const shouldRetry = shouldAutoRetry ? 
      shouldAutoRetry(errorState.errorType, errorState.retryCount) :
      defaultAutoRetryTypes.includes(errorState.errorType);

    if (shouldRetry && errorState.retryCount < maxRetries) {
      return await retry(operation);
    }

    return false;
  }, [errorState.errorType, errorState.retryCount, maxRetries, retry]);

  // 获取错误信息
  const getErrorInfo = useCallback(() => {
    if (!errorState.hasError) return null;

    return {
      message: errorState.error?.message || '未知错误',
      type: errorState.errorType,
      code: errorState.error?.code || errorState.error?.status,
      canRetry: errorState.retryCount < maxRetries,
      retryCount: errorState.retryCount,
      isRetrying: errorState.isRetrying,
      nextRetryDelay: retryDelay * Math.pow(2, errorState.retryCount)
    };
  }, [errorState, maxRetries, retryDelay]);

  // 错误恢复策略
  const getRecoveryStrategy = useCallback(() => {
    const strategies = {
      network: {
        immediate: ['检查网络连接', '刷新页面'],
        delayed: ['等待网络恢复', '切换网络环境'],
        fallback: ['使用离线模式', '保存草稿']
      },
      timeout: {
        immediate: ['减少请求复杂度', '分批处理'],
        delayed: ['稍后重试', '优化网络环境'],
        fallback: ['简化操作', '使用缓存结果']
      },
      api_error: {
        immediate: ['重试请求'],
        delayed: ['等待服务恢复'],
        fallback: ['联系技术支持', '使用备用功能']
      },
      validation: {
        immediate: ['检查输入内容', '修正格式错误'],
        delayed: [],
        fallback: ['查看帮助文档', '使用示例模板']
      },
      quota_exceeded: {
        immediate: [],
        delayed: ['等待配额重置'],
        fallback: ['升级账户', '明日再试']
      },
      file_error: {
        immediate: ['检查文件格式', '重新上传'],
        delayed: [],
        fallback: ['使用文本输入', '转换文件格式']
      }
    };

    return strategies[errorState.errorType] || strategies.api_error;
  }, [errorState.errorType]);

  // 组件卸载清理
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 状态
    hasError: errorState.hasError,
    error: errorState.error,
    errorType: errorState.errorType,
    retryCount: errorState.retryCount,
    isRetrying: errorState.isRetrying,
    canRetry: errorState.retryCount < maxRetries,
    
    // 方法
    setError,
    clearError,
    retry,
    autoRetry,
    
    // 信息获取
    getErrorInfo,
    getRecoveryStrategy,
    
    // 便捷检查
    isNetworkError: errorState.errorType === 'network',
    isTimeoutError: errorState.errorType === 'timeout',
    isValidationError: errorState.errorType === 'validation',
    isApiError: errorState.errorType === 'api_error',
    isQuotaError: errorState.errorType === 'quota_exceeded',
    isFileError: errorState.errorType === 'file_error'
  };
};
