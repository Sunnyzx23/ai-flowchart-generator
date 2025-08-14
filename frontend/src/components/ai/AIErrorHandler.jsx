import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';

/**
 * AI分析错误处理组件
 * 支持不同类型错误的友好展示和处理
 */
const AIErrorHandler = ({ 
  error = null,
  errorType = 'unknown',
  onRetry = null,
  onCancel = null,
  onFeedback = null,
  className = '',
  showDetails = false,
  retryCount = 0,
  maxRetries = 3
}) => {
  if (!error) return null;

  // 错误类型配置
  const errorConfig = {
    network: {
      title: '网络连接异常',
      icon: '🌐',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: '网络连接不稳定，请检查网络后重试',
      solutions: [
        '检查网络连接是否正常',
        '尝试刷新页面',
        '稍后再试'
      ],
      canRetry: true
    },
    timeout: {
      title: 'AI分析超时',
      icon: '⏱️',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'AI分析时间过长，可能是需求过于复杂',
      solutions: [
        '简化需求描述，减少复杂度',
        '分段描述需求内容',
        '重新尝试分析'
      ],
      canRetry: true
    },
    validation: {
      title: '输入内容不符合要求',
      icon: '⚠️',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: '输入的需求内容格式或内容不符合分析要求',
      solutions: [
        '检查需求描述是否完整',
        '确保文件格式正确',
        '参考示例格式重新输入'
      ],
      canRetry: false
    },
    api_error: {
      title: 'AI服务异常',
      icon: '🤖',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'AI分析服务出现异常，我们正在努力修复',
      solutions: [
        '稍后重试',
        '如果持续出现，请联系技术支持',
        '可以尝试简化需求后重试'
      ],
      canRetry: true
    },
    quota_exceeded: {
      title: '使用次数已达上限',
      icon: '📊',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '今日AI分析次数已达上限',
      solutions: [
        '明日再来使用',
        '升级到专业版获得更多次数',
        '联系客服了解更多'
      ],
      canRetry: false
    },
    file_error: {
      title: '文件解析失败',
      icon: '📄',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      description: '上传的文件无法正确解析',
      solutions: [
        '检查文件格式是否支持',
        '确保文件内容完整',
        '尝试使用文本输入方式'
      ],
      canRetry: false
    },
    unknown: {
      title: '未知错误',
      icon: '❓',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: '出现了意外错误，请重试或联系技术支持',
      solutions: [
        '刷新页面重试',
        '清除浏览器缓存',
        '联系技术支持'
      ],
      canRetry: true
    }
  };

  const config = errorConfig[errorType] || errorConfig.unknown;
  const canRetry = config.canRetry && retryCount < maxRetries;

  return (
    <div className={cn(
      'w-full max-w-lg mx-auto p-6 rounded-lg border-2',
      config.bgColor,
      config.borderColor,
      'shadow-lg',
      className
    )}>
      {/* 错误标题和图标 */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-3xl mr-3">{config.icon}</div>
        <div className="text-center">
          <h3 className={cn('text-lg font-semibold', config.color)}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {config.description}
          </p>
        </div>
      </div>

      {/* 错误详情 */}
      {showDetails && error.message && (
        <div className="mb-4 p-3 bg-white rounded border">
          <p className="text-xs text-gray-500 mb-1">错误详情：</p>
          <p className="text-sm text-gray-700 font-mono break-all">
            {error.message}
          </p>
          {error.code && (
            <p className="text-xs text-gray-500 mt-1">
              错误代码: {error.code}
            </p>
          )}
        </div>
      )}

      {/* 解决方案 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-2">建议解决方案：</h4>
        <ul className="space-y-1">
          {config.solutions.map((solution, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <span className="text-gray-400 mr-2">•</span>
              <span>{solution}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 重试次数提示 */}
      {retryCount > 0 && (
        <div className="mb-4 p-2 bg-white rounded border">
          <p className="text-xs text-gray-500">
            已重试 {retryCount} 次 {maxRetries > retryCount && `(最多重试 ${maxRetries} 次)`}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {canRetry && onRetry && (
          <Button 
            onClick={onRetry}
            className={cn(
              'flex-1',
              config.color.replace('text-', 'bg-').replace('-600', '-500'),
              'hover:' + config.color.replace('text-', 'bg-').replace('-600', '-600'),
              'text-white'
            )}
          >
            {retryCount > 0 ? '重新尝试' : '重试'}
          </Button>
        )}
        
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            取消
          </Button>
        )}

        {onFeedback && (
          <Button 
            variant="outline" 
            onClick={onFeedback}
            className="flex-1 text-gray-600"
          >
            问题反馈
          </Button>
        )}
      </div>

      {/* 技术支持信息 */}
      {errorType === 'api_error' || errorType === 'unknown' ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            如果问题持续存在，请联系技术支持：support@example.com
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default AIErrorHandler;
