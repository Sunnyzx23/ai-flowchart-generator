import React, { useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';
import MermaidRenderer from './MermaidRenderer';
import FlowchartStyleEditor from './FlowchartStyleEditor';
import { flowchartThemes, detectFlowchartType } from './FlowchartThemes';

/**
 * 流程图预览组件
 * 提供完整的流程图预览功能，包括工具栏和交互控制
 */
const FlowchartPreview = ({
  code = '',
  title = '业务流程图',
  className = '',
  onExport = null,
  onEdit = null,
  onFullscreen = null,
  showToolbar = true,
  defaultTheme = 'default'
}) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [isRendered, setIsRendered] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [flowchartType, setFlowchartType] = useState('flowchart');
  const previewRef = useRef(null);

  // 检测流程图类型
  React.useEffect(() => {
    if (code) {
      setFlowchartType(detectFlowchartType(code));
    }
  }, [code]);

  // 从主题配置获取主题选项
  const themes = Object.entries(flowchartThemes).map(([key, theme]) => ({
    value: key,
    label: theme.name,
    description: theme.description
  }));

  // 处理渲染成功
  const handleRenderSuccess = (svg) => {
    setIsRendered(true);
    setRenderError(null);
  };

  // 处理渲染错误
  const handleRenderError = (error) => {
    setIsRendered(false);
    setRenderError(error);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (previewRef.current?.requestFullscreen) {
        previewRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
    onFullscreen?.(isFullscreen);
  };

  // 导出功能
  const handleExport = (format = 'svg') => {
    if (!isRendered) return;
    
    const svgElement = previewRef.current?.querySelector('svg');
    if (svgElement) {
      onExport?.(svgElement, format);
    }
  };

  // 复制代码
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border shadow-sm overflow-hidden',
      isFullscreen && 'fixed inset-0 z-50 rounded-none',
      className
    )}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {code && (
            <p className="text-sm text-gray-600">
              代码长度: {code.length} 字符
            </p>
          )}
        </div>
        
        {/* 工具栏 */}
        {showToolbar && (
          <div className="flex items-center space-x-2">
            {/* 主题选择 */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themes.map(t => (
                <option key={t.value} value={t.value} title={t.description}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* 流程图类型显示 */}
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {flowchartType}
            </span>

            {/* 操作按钮 */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              disabled={!code}
            >
              复制代码
            </Button>

            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
              >
                编辑
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('svg')}
              disabled={!isRendered}
            >
              导出SVG
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStyleEditor(true)}
            >
              样式设置
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
          </div>
        )}
      </div>

      {/* 预览区域 */}
      <div 
        ref={previewRef}
        className={cn(
          'relative overflow-auto',
          isFullscreen ? 'h-screen' : 'min-h-96'
        )}
      >
        {code ? (
          <div className="p-4">
            <MermaidRenderer
              code={code}
              theme={theme}
              onRenderSuccess={handleRenderSuccess}
              onRenderError={handleRenderError}
              className="w-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-medium">暂无流程图</p>
              <p className="text-sm">请先生成Mermaid代码</p>
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      {showToolbar && (code || renderError) && (
        <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-sm">
          <div className="flex items-center space-x-4">
            {isRendered && (
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                渲染成功
              </span>
            )}
            
            {renderError && (
              <span className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                渲染失败: {renderError.message || '未知错误'}
              </span>
            )}
          </div>

          <div className="text-gray-500">
            主题: {themes.find(t => t.value === theme)?.label || theme}
          </div>
        </div>
      )}

      {/* 样式编辑器 */}
      <FlowchartStyleEditor
        currentTheme={theme}
        currentType={flowchartType}
        isOpen={showStyleEditor}
        onClose={() => setShowStyleEditor(false)}
        onThemeChange={setTheme}
        onTypeChange={setFlowchartType}
        onStyleApply={(styles) => {
          console.log('应用自定义样式:', styles);
          // 这里可以应用自定义样式
        }}
      />
    </div>
  );
};

export default FlowchartPreview;
