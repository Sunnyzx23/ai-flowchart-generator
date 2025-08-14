import React from 'react';
import { cn } from '../../utils/cn';

/**
 * AI分析进度展示组件
 * 更详细的进度展示，包括步骤指示器、时间统计等
 */
const AIAnalysisProgress = ({ 
  status = 'preparing',
  progress = 0,
  message = '',
  analysisTime = 0,
  className = '',
  onCancel = null,
  showSteps = true,
  showStats = true,
  compact = false
}) => {
  // 分析步骤配置
  const analysisSteps = [
    { 
      key: 'preparing', 
      label: '准备分析', 
      icon: '🔍', 
      description: '初始化分析环境' 
    },
    { 
      key: 'analyzing', 
      label: '需求分析', 
      icon: '🧠', 
      description: '7维度智能分析' 
    },
    { 
      key: 'generating', 
      label: '生成流程图', 
      icon: '⚡', 
      description: '创建Mermaid代码' 
    },
    { 
      key: 'optimizing', 
      label: '优化完善', 
      icon: '✨', 
      description: '格式化和优化' 
    },
    { 
      key: 'completing', 
      label: '质量检查', 
      icon: '✅', 
      description: '最终验证' 
    }
  ];

  // 获取当前步骤索引
  const getCurrentStepIndex = () => {
    return analysisSteps.findIndex(step => step.key === status);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (compact) {
    // 紧凑模式
    return (
      <div className={cn(
        'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border',
        className
      )}>
        {/* 旋转图标 */}
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        
        {/* 状态信息 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {analysisSteps[currentStepIndex]?.label || '处理中'}
          </p>
          {message && (
            <p className="text-xs text-gray-500 truncate">{message}</p>
          )}
        </div>

        {/* 进度 */}
        <div className="text-xs text-gray-500 flex-shrink-0">
          {Math.round(progress)}%
        </div>

        {/* 取消按钮 */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            取消
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border',
      className
    )}>
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI智能分析中</h3>
            <p className="text-sm text-gray-500">
              正在为您生成专业的业务流程图
            </p>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消分析
          </button>
        )}
      </div>

      {/* 步骤指示器 */}
      {showSteps && (
        <div className="mb-6">
          <div className="flex items-center justify-between relative">
            {/* 进度线 */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ 
                  width: `${(currentStepIndex / (analysisSteps.length - 1)) * 100}%` 
                }}
              />
            </div>
            
            {analysisSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;
              
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center space-y-2 relative z-10"
                >
                  {/* 步骤图标 */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300',
                    isActive && 'bg-blue-500 border-blue-500 text-white animate-pulse',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isPending && 'bg-gray-100 border-gray-300 text-gray-400'
                  )}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  
                  {/* 步骤标签 */}
                  <div className="text-center">
                    <p className={cn(
                      'text-xs font-medium',
                      isActive && 'text-blue-600',
                      isCompleted && 'text-green-600',
                      isPending && 'text-gray-400'
                    )}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 当前状态信息 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {message || analysisSteps[currentStepIndex]?.description || '处理中...'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      {/* 统计信息 */}
      {showStats && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>已用时: {formatTime(analysisTime)}</span>
            <span>•</span>
            <span>
              {progress < 50 ? '预计还需 20-40 秒' : 
               progress < 80 ? '预计还需 10-20 秒' : 
               '即将完成'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            <span>AI引擎运行中</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisProgress;
