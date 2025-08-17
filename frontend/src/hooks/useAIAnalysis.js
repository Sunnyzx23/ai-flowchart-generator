import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * AI分析状态管理Hook
 * 管理AI分析的完整生命周期，包括状态跟踪、进度更新、错误处理
 */
export const useAIAnalysis = (existingSessionId = null) => {
  const [analysisState, setAnalysisState] = useState({
    status: 'idle', // idle, preparing, analyzing, generating, optimizing, completing, completed, error
    progress: 0,
    message: '',
    result: null,
    error: null,
    sessionId: null,
    startTime: null,
    estimatedTime: null
  });

  const progressTimerRef = useRef(null);
  const statusCheckTimerRef = useRef(null);

  // 辅助函数
  const getProgressFromStatus = useCallback((status) => {
    const statusMap = {
      'idle': 0,
      'pending': 10,
      'processing': 30,
      'analyzing': 50,
      'generating': 70,
      'validating': 85,
      'completed': 100,
      'failed': 0,
      'error': 0
    };
    return statusMap[status] || 0;
  }, []);

  const getStatusMessage = useCallback((status) => {
    const messageMap = {
      'idle': '准备中...',
      'pending': '等待处理...',
      'processing': '正在处理请求...',
      'analyzing': '正在分析需求...',
      'generating': '正在生成流程图...',
      'validating': '正在验证结果...',
      'completed': '分析完成',
      'failed': '分析失败',
      'error': '分析失败'
    };
    return messageMap[status] || '处理中...';
  }, []);

  // 状态轮询
  const startStatusPolling = useCallback((sessionId) => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/analysis/${sessionId}`);
        if (!response.ok) {
          throw new Error('状态查询失败');
        }

        const data = await response.json();
        if (data.success && data.data) {
          const sessionData = data.data;
          
          setAnalysisState(prev => ({
            ...prev,
            status: sessionData.status,
            progress: getProgressFromStatus(sessionData.status),
            message: getStatusMessage(sessionData.status)
          }));

          // 如果完成，设置结果并停止轮询
          if (sessionData.status === 'completed' && sessionData.result) {
            console.log('useAIAnalysis - 接收到完成的结果:', sessionData.result);
            setAnalysisState(prev => ({
              ...prev,
              result: sessionData.result,
              status: 'completed',
              progress: 100
            }));
            
            if (statusCheckTimerRef.current) {
              clearInterval(statusCheckTimerRef.current);
              statusCheckTimerRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('状态查询失败:', error);
      }
    };

    // 立即执行一次
    pollStatus();
    
    // 设置定时器
    if (statusCheckTimerRef.current) {
      clearInterval(statusCheckTimerRef.current);
    }
    statusCheckTimerRef.current = setInterval(pollStatus, 2000);
  }, [getProgressFromStatus, getStatusMessage]);

  // 如果传入了existingSessionId，直接查询该会话
  useEffect(() => {
    if (existingSessionId && analysisState.sessionId !== existingSessionId) {
      console.log('useAIAnalysis - 查询现有会话:', existingSessionId);
      setAnalysisState(prev => ({
        ...prev,
        sessionId: existingSessionId,
        status: 'analyzing'
      }));
      // 开始轮询现有会话状态
      startStatusPolling(existingSessionId);
    }
  }, [existingSessionId, startStatusPolling, analysisState.sessionId]);

  // 状态转换配置
  const statusFlow = {
    preparing: { next: 'analyzing', duration: 3000, progressRange: [0, 15] },
    analyzing: { next: 'generating', duration: 8000, progressRange: [15, 60] },
    generating: { next: 'optimizing', duration: 4000, progressRange: [60, 85] },
    optimizing: { next: 'completing', duration: 2000, progressRange: [85, 95] },
    completing: { next: 'completed', duration: 1000, progressRange: [95, 100] }
  };

  // 开始AI分析
  const startAnalysis = useCallback(async (analysisData) => {
    try {
      setAnalysisState(prev => ({
        ...prev,
        status: 'preparing',
        progress: 0,
        message: '',
        error: null,
        result: null,
        startTime: Date.now(),
        estimatedTime: 20000 // 预计20秒
      }));

      // 调用后端API创建分析会话
      const response = await fetch('http://localhost:3001/api/v1/analysis/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        throw new Error(`分析请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.sessionId) {
        throw new Error(data.error?.message || '创建分析会话失败');
      }
      
      setAnalysisState(prev => ({
        ...prev,
        sessionId: data.data.sessionId
      }));

      // 开始状态轮询
      startStatusPolling(data.data.sessionId);
      
    } catch (error) {
      setAnalysisState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || '分析启动失败'
      }));
    }
  }, []);

  // 模拟进度更新（当没有实时进度时）
  const simulateProgress = useCallback((status) => {
    const config = statusFlow[status];
    if (!config) return;

    const [minProgress, maxProgress] = config.progressRange;
    const duration = config.duration;
    const steps = 20; // 分20步更新进度
    const stepDuration = duration / steps;
    const progressStep = (maxProgress - minProgress) / steps;

    let currentStep = 0;
    
    progressTimerRef.current = setInterval(() => {
      currentStep++;
      const newProgress = minProgress + (progressStep * currentStep);
      
      setAnalysisState(prev => ({
        ...prev,
        progress: Math.min(maxProgress, newProgress)
      }));

      if (currentStep >= steps) {
        clearInterval(progressTimerRef.current);
      }
    }, stepDuration);
  }, []);

  // 取消分析
  const cancelAnalysis = useCallback(async () => {
    if (analysisState.sessionId) {
      try {
        await fetch(`http://localhost:3001/api/v1/analysis/${analysisState.sessionId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.warn('取消分析请求失败:', error);
      }
    }

    // 清理定时器
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    if (statusCheckTimerRef.current) {
      clearInterval(statusCheckTimerRef.current);
    }

    setAnalysisState({
      status: 'idle',
      progress: 0,
      message: '',
      result: null,
      error: null,
      sessionId: null,
      startTime: null,
      estimatedTime: null
    });
  }, [analysisState.sessionId]);

  // 重置状态
  const resetAnalysis = useCallback(() => {
    cancelAnalysis();
  }, [cancelAnalysis]);

  // 重试分析
  const retryAnalysis = useCallback((analysisData) => {
    resetAnalysis();
    setTimeout(() => startAnalysis(analysisData), 100);
  }, [resetAnalysis, startAnalysis]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (statusCheckTimerRef.current) {
        clearInterval(statusCheckTimerRef.current);
      }
    };
  }, []);

  // 计算分析耗时
  const getAnalysisTime = useCallback(() => {
    if (!analysisState.startTime) return 0;
    return Math.floor((Date.now() - analysisState.startTime) / 1000);
  }, [analysisState.startTime]);

  return {
    // 状态
    ...analysisState,
    analysisTime: getAnalysisTime(),
    
    // 操作方法
    startAnalysis,
    cancelAnalysis,
    resetAnalysis,
    retryAnalysis,
    
    // 状态检查
    isLoading: ['pending', 'processing', 'analyzing', 'generating', 'validating'].includes(analysisState.status),
    isCompleted: analysisState.status === 'completed',
    isError: ['failed', 'error'].includes(analysisState.status),
    isIdle: analysisState.status === 'idle'
  };
};
