import React, { useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * AI分析错误提示组件
 * 简洁的错误提示，适用于内联显示
 */
const AIErrorAlert = ({ 
  error = null,
  errorType = 'error',
  title = '',
  message = '',
  onClose = null,
  onRetry = null,
  className = '',
  variant = 'default', // default, compact, banner
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  if (!isVisible || (!error && !message)) return null;

  // 错误类型样式配置
  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
      iconColor: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
      iconColor: 'text-blue-500'
    },
    network: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: '🌐',
      iconColor: 'text-orange-500'
    },
    timeout: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: '⏱️',
      iconColor: 'text-purple-500'
    }
  };

  const styles = typeStyles[errorType] || typeStyles.error;
  const displayTitle = title || (error?.name || '错误');
  const displayMessage = message || (error?.message || '发生了未知错误');

  // 紧凑模式
  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center p-2 rounded border text-sm',
        styles.bg,
        styles.border,
        styles.text,
        className
      )}>
        <span className="mr-2">{styles.icon}</span>
        <span className="flex-1 truncate">{displayMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-xs underline hover:no-underline"
          >
            重试
          </button>
        )}
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // 横幅模式
  if (variant === 'banner') {
    return (
      <div className={cn(
        'w-full p-3 border-l-4 flex items-center justify-between',
        styles.bg,
        styles.border.replace('border-', 'border-l-'),
        className
      )}>
        <div className="flex items-center">
          <span className={cn('text-lg mr-3', styles.iconColor)}>{styles.icon}</span>
          <div>
            {displayTitle && (
              <div className={cn('font-medium text-sm', styles.text)}>
                {displayTitle}
              </div>
            )}
            <div className={cn('text-sm', styles.text, displayTitle ? 'opacity-90' : '')}>
              {displayMessage}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded border',
                'hover:bg-white hover:bg-opacity-50',
                styles.text,
                styles.border
              )}
            >
              重试
            </button>
          )}
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className={cn('text-lg hover:opacity-70', styles.iconColor)}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  // 默认模式
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      styles.bg,
      styles.border,
      className
    )}>
      <div className="flex items-start">
        <span className={cn('text-xl mr-3 mt-0.5', styles.iconColor)}>
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <h3 className={cn('font-medium text-sm mb-1', styles.text)}>
              {displayTitle}
            </h3>
          )}
          <p className={cn('text-sm', styles.text, displayTitle ? 'opacity-90' : '')}>
            {displayMessage}
          </p>
          
          {/* 错误详情（如果有） */}
          {error?.stack && (
            <details className="mt-2">
              <summary className={cn('text-xs cursor-pointer', styles.text, 'opacity-70')}>
                查看详细信息
              </summary>
              <pre className={cn('text-xs mt-1 p-2 bg-white rounded overflow-x-auto', styles.text)}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-2 ml-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded border',
                'hover:bg-white hover:bg-opacity-50 transition-colors',
                styles.text,
                styles.border
              )}
            >
              重试
            </button>
          )}
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className={cn(
                'text-lg hover:opacity-70 transition-opacity',
                styles.iconColor
              )}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIErrorAlert;
