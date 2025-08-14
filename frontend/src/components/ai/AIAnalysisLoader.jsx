import React from 'react';
import { cn } from '../../utils/cn';

/**
 * AI分析Loading状态组件
 * 支持不同分析阶段的状态显示和进度反馈
 */
const AIAnalysisLoader = ({ 
  status = 'preparing', 
  progress = 0, 
  message = '', 
  className = '',
  showProgress = true,
  showTimer = true
}) => {
  // 分析状态配置
  const statusConfig = {
    preparing: {
      label: '准备分析',
      description: '正在初始化AI分析引擎...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    analyzing: {
      label: '智能分析中',
      description: 'AI正在深度分析您的需求...',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    generating: {
      label: '生成流程图',
      description: '正在生成Mermaid流程图代码...',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    optimizing: {
      label: '优化中',
      description: '正在优化流程图结构和格式...',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    completing: {
      label: '即将完成',
      description: '正在进行最后的质量检查...',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.preparing;
  const displayMessage = message || currentStatus.description;

  // 估算剩余时间（简单的时间提示）
  const getTimeEstimate = (progress) => {
    if (progress < 20) return '预计还需 30-60 秒';
    if (progress < 50) return '预计还需 20-40 秒';
    if (progress < 80) return '预计还需 10-20 秒';
    return '即将完成';
  };

  return (
    <div className={cn(
      'w-full max-w-md mx-auto p-6 rounded-lg border-2',
      currentStatus.bgColor,
      currentStatus.borderColor,
      'transition-all duration-300 ease-in-out',
      className
    )}>
      {/* 状态标题和图标 */}
      <div className="flex items-center justify-center mb-4">
        {/* 旋转动画图标 */}
        <div className={cn(
          'w-8 h-8 rounded-full border-2 border-t-transparent mr-3',
          currentStatus.color.replace('text-', 'border-'),
          'animate-spin'
        )} />
        <h3 className={cn(
          'text-lg font-semibold',
          currentStatus.color
        )}>
          {currentStatus.label}
        </h3>
      </div>

      {/* 状态描述 */}
      <p className="text-center text-gray-600 mb-4 text-sm leading-relaxed">
        {displayMessage}
      </p>

      {/* 进度条 */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">进度</span>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-300 ease-out',
                currentStatus.color.replace('text-', 'bg-')
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* 时间估算 */}
      {showTimer && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {getTimeEstimate(progress)}
          </p>
        </div>
      )}

      {/* 脉冲效果背景 */}
      <div className={cn(
        'absolute inset-0 rounded-lg opacity-20',
        currentStatus.bgColor,
        'animate-pulse pointer-events-none'
      )} style={{ zIndex: -1 }} />
    </div>
  );
};

export default AIAnalysisLoader;
