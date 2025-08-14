import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';

/**
 * 流程图工具栏组件
 * 提供流程图预览的各种交互控制功能
 */
const FlowchartToolbar = ({
  onZoomIn = null,
  onZoomOut = null,
  onZoomReset = null,
  onFitToScreen = null,
  onFullscreen = null,
  onExport = null,
  onEdit = null,
  onShare = null,
  scale = 1,
  isFullscreen = false,
  canExport = false,
  className = '',
  layout = 'horizontal' // horizontal, vertical, compact
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // 导出选项
  const exportOptions = [
    { key: 'svg', label: 'SVG格式', icon: '📄', description: '矢量图格式，无损缩放' },
    { key: 'png', label: 'PNG格式', icon: '🖼️', description: '位图格式，通用性好' },
    { key: 'pdf', label: 'PDF格式', icon: '📋', description: '文档格式，便于打印' },
    { key: 'code', label: '复制代码', icon: '💻', description: '复制Mermaid源码' }
  ];

  // 分享选项
  const shareOptions = [
    { key: 'link', label: '分享链接', icon: '🔗', description: '生成分享链接' },
    { key: 'embed', label: '嵌入代码', icon: '📝', description: '获取嵌入代码' },
    { key: 'social', label: '社交媒体', icon: '📱', description: '分享到社交平台' }
  ];

  // 缩放比例格式化
  const formatScale = (scale) => {
    return `${Math.round(scale * 100)}%`;
  };

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      group: 'zoom',
      buttons: [
        {
          key: 'zoom-out',
          label: '缩小',
          icon: '🔍-',
          onClick: onZoomOut,
          disabled: scale <= 0.1,
          tooltip: '缩小 (Ctrl + -)'
        },
        {
          key: 'zoom-display',
          label: formatScale(scale),
          isDisplay: true,
          className: 'px-3 py-1 text-sm bg-gray-100 text-gray-700 min-w-16 text-center'
        },
        {
          key: 'zoom-in',
          label: '放大',
          icon: '🔍+',
          onClick: onZoomIn,
          disabled: scale >= 5,
          tooltip: '放大 (Ctrl + +)'
        },
        {
          key: 'zoom-reset',
          label: '重置',
          icon: '🎯',
          onClick: onZoomReset,
          tooltip: '重置缩放 (Ctrl + 0)'
        },
        {
          key: 'fit-screen',
          label: '适应屏幕',
          icon: '📐',
          onClick: onFitToScreen,
          tooltip: '适应屏幕大小'
        }
      ]
    },
    {
      group: 'view',
      buttons: [
        {
          key: 'fullscreen',
          label: isFullscreen ? '退出全屏' : '全屏',
          icon: isFullscreen ? '🗗' : '🗖',
          onClick: onFullscreen,
          tooltip: isFullscreen ? '退出全屏 (Esc)' : '全屏显示 (F11)'
        }
      ]
    },
    {
      group: 'actions',
      buttons: [
        {
          key: 'edit',
          label: '编辑',
          icon: '✏️',
          onClick: onEdit,
          tooltip: '编辑流程图'
        },
        {
          key: 'export',
          label: '导出',
          icon: '💾',
          onClick: () => setShowExportMenu(!showExportMenu),
          disabled: !canExport,
          tooltip: '导出流程图',
          hasDropdown: true,
          isActive: showExportMenu
        },
        {
          key: 'share',
          label: '分享',
          icon: '📤',
          onClick: () => setShowShareMenu(!showShareMenu),
          tooltip: '分享流程图',
          hasDropdown: true,
          isActive: showShareMenu
        }
      ]
    }
  ];

  const renderButton = (button) => {
    if (button.isDisplay) {
      return (
        <div
          key={button.key}
          className={cn('rounded border', button.className)}
          title={button.tooltip}
        >
          {button.label}
        </div>
      );
    }

    return (
      <div key={button.key} className="relative">
        <Button
          size="sm"
          variant={button.isActive ? 'default' : 'outline'}
          onClick={button.onClick}
          disabled={button.disabled}
          className={cn(
            'flex items-center space-x-1',
            layout === 'compact' && 'px-2',
            button.hasDropdown && 'pr-6'
          )}
          title={button.tooltip}
        >
          <span>{button.icon}</span>
          {layout !== 'compact' && <span>{button.label}</span>}
          {button.hasDropdown && (
            <span className="ml-1 text-xs">▼</span>
          )}
        </Button>

        {/* 导出下拉菜单 */}
        {button.key === 'export' && showExportMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            {exportOptions.map(option => (
              <button
                key={option.key}
                onClick={() => {
                  onExport?.(option.key);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <span>{option.icon}</span>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 分享下拉菜单 */}
        {button.key === 'share' && showShareMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            {shareOptions.map(option => (
              <button
                key={option.key}
                onClick={() => {
                  onShare?.(option.key);
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <span>{option.icon}</span>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderButtonGroup = (group) => (
    <div
      key={group.group}
      className={cn(
        'flex items-center space-x-1',
        layout === 'vertical' && 'flex-col space-y-1 space-x-0'
      )}
    >
      {group.buttons.map(renderButton)}
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 bg-white border-b',
        layout === 'vertical' && 'flex-col space-y-2 w-16 border-r border-b-0',
        layout === 'compact' && 'p-1',
        className
      )}
    >
      {layout === 'vertical' ? (
        <div className="flex flex-col space-y-3">
          {toolbarButtons.map(renderButtonGroup)}
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-4">
            {toolbarButtons.slice(0, 2).map(renderButtonGroup)}
          </div>
          <div className="flex items-center space-x-2">
            {toolbarButtons.slice(2).map(renderButtonGroup)}
          </div>
        </>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {(showExportMenu || showShareMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowExportMenu(false);
            setShowShareMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default FlowchartToolbar;
