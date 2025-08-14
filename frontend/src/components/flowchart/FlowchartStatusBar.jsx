import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 流程图状态栏组件
 * 显示流程图的状态信息和统计数据
 */
const FlowchartStatusBar = ({
  isRendered = false,
  renderError = null,
  isLoading = false,
  scale = 1,
  theme = 'default',
  flowchartType = 'flowchart',
  stats = null,
  renderTime = 0,
  className = '',
  showDetails = true
}) => {
  // 状态指示器
  const StatusIndicator = ({ status, label, color = 'gray' }) => {
    const colors = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-400'
    };

    return (
      <div className="flex items-center space-x-2">
        <div className={cn('w-2 h-2 rounded-full', colors[color])} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    );
  };

  // 获取渲染状态
  const getRenderStatus = () => {
    if (isLoading) {
      return { status: 'loading', label: '渲染中...', color: 'blue' };
    }
    if (renderError) {
      return { status: 'error', label: '渲染失败', color: 'red' };
    }
    if (isRendered) {
      return { status: 'success', label: '渲染成功', color: 'green' };
    }
    return { status: 'idle', label: '等待渲染', color: 'gray' };
  };

  const renderStatus = getRenderStatus();

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-sm',
      className
    )}>
      {/* 左侧状态信息 */}
      <div className="flex items-center space-x-6">
        {/* 渲染状态 */}
        <StatusIndicator
          status={renderStatus.status}
          label={renderStatus.label}
          color={renderStatus.color}
        />

        {/* 错误信息 */}
        {renderError && (
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-xs">⚠️</span>
            <span className="text-xs truncate max-w-48">
              {renderError.message || '未知错误'}
            </span>
          </div>
        )}

        {/* 渲染时间 */}
        {renderTime > 0 && (
          <div className="text-xs text-gray-500">
            渲染耗时: {renderTime}ms
          </div>
        )}
      </div>

      {/* 右侧详细信息 */}
      {showDetails && (
        <div className="flex items-center space-x-6">
          {/* 统计信息 */}
          {stats && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>节点: {stats.nodeCount || 0}</span>
              <span>连接: {stats.connectionCount || 0}</span>
              <span>代码: {stats.codeLength || 0}字符</span>
            </div>
          )}

          {/* 流程图类型 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">类型:</span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              {flowchartType}
            </span>
          </div>

          {/* 主题 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">主题:</span>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
              {theme}
            </span>
          </div>

          {/* 缩放比例 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">缩放:</span>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-mono">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowchartStatusBar;
