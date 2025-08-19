import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from '../config/api.js';
import API_CONFIG from '../config/api.js';

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

  // 辅助函数 - 获取状态对应的进度范围（超平滑版：5%增量设计）
  const getProgressRange = useCallback((status) => {
    const statusRanges = {
      'idle': [0, 5],
      'pending': [5, 15],        // 缩小范围，避免大跳跃
      'processing': [15, 35],    // 20%范围，分4个5%增量
      'analyzing': [35, 55],     // 20%范围，分4个5%增量
      'generating': [55, 75],    // 20%范围，分4个5%增量
      'validating': [75, 90],    // 15%范围，分3个5%增量
      'completed': [100, 100],
      'failed': [0, 0],
      'error': [0, 0]
    };
    return statusRanges[status] || [0, 0];
  }, []);

  // 平滑进度计算
  const calculateSmoothProgress = useCallback((status, elapsedTime) => {
    const [minProgress, maxProgress] = getProgressRange(status);
    
    if (status === 'completed') return 100;
    if (status === 'failed' || status === 'error') return 0;
    
    // 基于时间的平滑进度增长（超平滑版：均匀时间分配）
    const statusDurations = {
      'idle': 2000,        // 2秒完成0-5%
      'pending': 3000,     // 3秒完成5-15%，每5%用1.5秒
      'processing': 8000,  // 8秒完成15-35%，每5%用2秒
      'analyzing': 8000,   // 8秒完成35-55%，每5%用2秒
      'generating': 8000,  // 8秒完成55-75%，每5%用2秒
      'validating': 6000   // 6秒完成75-90%，每5%用2秒
    };
    
    const expectedDuration = statusDurations[status] || 10000;
    
    // 使用缓动函数让进度更平滑，避免线性增长带来的突兀感
    const rawProgress = Math.min(elapsedTime / expectedDuration, 0.95); // 最多到95%，减少余量
    
    // 使用线性进度，确保稳定的5%增量
    const calculatedProgress = minProgress + (maxProgress - minProgress) * rawProgress;
    
    // 确保进度以5%为单位增长
    const progressIn5Percent = Math.floor(calculatedProgress / 5) * 5;
    
    // 添加微小的随机波动，但保持5%边界
    const randomVariation = (Math.random() - 0.5) * 0.3; // ±0.15%的随机变化
    
    return Math.min(maxProgress, Math.max(minProgress, progressIn5Percent + randomVariation));
  }, [getProgressRange]);

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

  // 开始平滑进度更新
  const startSmoothProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      setAnalysisState(prev => {
        if (prev.status === 'completed' || prev.status === 'failed' || prev.status === 'error') {
          return prev;
        }

        const now = Date.now();
        const elapsedTime = now - (prev.statusStartTime || prev.startTime || now);
        const newProgress = calculateSmoothProgress(prev.status, elapsedTime);
        
        // 只有进度真的变化了才更新
        if (newProgress !== prev.progress) {
          return {
            ...prev,
            progress: newProgress
          };
        }
        
        return prev;
      });
    }, 150); // 每150ms更新一次进度，让动画更平滑
  }, [calculateSmoothProgress]);

  // 状态轮询
  const startStatusPolling = useCallback((sessionId) => {
    const pollStatus = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/analysis/${sessionId}`));
        if (!response.ok) {
          throw new Error('状态查询失败');
        }

        const data = await response.json();
        if (data.success && data.data) {
          const sessionData = data.data;
          
          setAnalysisState(prev => {
            const now = Date.now();
            const statusChanged = prev.status !== sessionData.status;
            
            return {
              ...prev,
              status: sessionData.status,
              message: getStatusMessage(sessionData.status),
              // 如果状态改变了，重置该状态的开始时间
              statusStartTime: statusChanged ? now : (prev.statusStartTime || now)
            };
          });

          // 如果完成，设置结果并停止轮询
          if (sessionData.status === 'completed' && sessionData.result) {
            console.log('useAIAnalysis - 接收到完成的结果:', sessionData.result);
            setAnalysisState(prev => ({
              ...prev,
              result: sessionData.result,
              status: 'completed',
              progress: 100
            }));
            
            // 清理所有定时器
            if (statusCheckTimerRef.current) {
              clearInterval(statusCheckTimerRef.current);
              statusCheckTimerRef.current = null;
            }
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current);
              progressTimerRef.current = null;
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
    
    // 同时启动平滑进度更新
    startSmoothProgress();
  }, [getStatusMessage, startSmoothProgress]);

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
      const now = Date.now();
      setAnalysisState(prev => ({
        ...prev,
        status: 'pending',
        progress: 0,
        message: '正在提交请求...',
        error: null,
        result: null,
        startTime: now,
        statusStartTime: now,
        estimatedTime: 30000 // 预计30秒
      }));

      // 更新状态为处理中，确保用户能看到loading
      setAnalysisState(prev => ({
        ...prev,
        status: 'processing',
        progress: 10,
        message: '正在连接AI服务...'
      }));

      // 模拟进度更新，提升用户体验
      const progressUpdates = [
        { progress: 25, message: '正在分析需求内容...', delay: 800 },
        { progress: 45, message: '正在生成流程结构...', delay: 1500 },
        { progress: 70, message: '正在优化流程图代码...', delay: 2200 }
      ];

      // 启动进度更新
      const updateProgress = (index = 0) => {
        if (index < progressUpdates.length) {
          setTimeout(() => {
            setAnalysisState(prev => {
              // 只有在still processing时才更新进度
              if (['processing', 'analyzing'].includes(prev.status)) {
                return {
                  ...prev,
                  progress: progressUpdates[index].progress,
                  message: progressUpdates[index].message
                };
              }
              return prev;
            });
            updateProgress(index + 1);
          }, progressUpdates[index].delay);
        }
      };

      // 开始进度更新
      updateProgress();

      // 调用后端API创建分析会话
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AI_ANALYSIS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`分析请求失败: ${response.status} ${response.statusText}`);
      }

      // 更新为最终分析阶段
      setAnalysisState(prev => ({
        ...prev,
        status: 'analyzing',
        progress: 85,
        message: '正在生成最终结果...'
      }));

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '分析失败');
      }
      
      // 直接设置结果，不需要轮询
      console.log('AI分析完成:', data);
      
      setAnalysisState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        message: '分析完成',
        result: {
          mermaidCode: data.data?.mermaidCode?.mermaidCode || data.mermaidCode,
          fullResponse: data.data?.mermaidCode?.rawResponse || data.fullResponse,
          validation: data.data?.mermaidCode?.validation
        }
      }));
      
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
        await fetch(getApiUrl(`/api/analysis/${analysisState.sessionId}`), {
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
