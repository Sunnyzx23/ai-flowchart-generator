import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import MermaidRenderer from './MermaidRenderer';
import FlowchartToolbar from './FlowchartToolbar';
import FlowchartStatusBar from './FlowchartStatusBar';
import FlowchartInteraction from './FlowchartInteraction';
import { useFlowchart } from '../../hooks/useFlowchart';
import { detectFlowchartType } from './FlowchartThemes';

/**
 * 流程图查看器组件
 * 提供完整的流程图查看体验，包括工具栏、状态栏和交互功能
 */
const FlowchartViewer = ({
  code = '',
  title = '流程图预览',
  theme = 'default',
  className = '',
  onEdit = null,
  onShare = null,
  showToolbar = true,
  showStatusBar = true,
  toolbarLayout = 'horizontal', // horizontal, vertical, compact
  autoFit = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [renderError, setRenderError] = useState(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const viewerRef = useRef(null);
  const flowchart = useFlowchart();

  // 流程图类型和统计信息
  const flowchartType = detectFlowchartType(code);
  const stats = flowchart.getStats();

  // 初始化流程图代码
  useEffect(() => {
    if (code) {
      flowchart.setCode(code);
    }
  }, [code]);

  // 初始化主题
  useEffect(() => {
    flowchart.setTheme(theme);
  }, [theme]);

  // 自动适应屏幕
  useEffect(() => {
    if (autoFit && isRendered && !isFullscreen) {
      const timer = setTimeout(() => {
        flowchart.fitToScreen();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRendered, autoFit, isFullscreen]);

  // 处理渲染成功
  const handleRenderSuccess = (svg) => {
    setIsRendered(true);
    setRenderError(null);
    setIsLoading(false);
    flowchart.setRenderStatus(true);
  };

  // 处理渲染错误
  const handleRenderError = (error) => {
    setIsRendered(false);
    setRenderError(error);
    setIsLoading(false);
    flowchart.setRenderStatus(false, error);
  };

  // 处理渲染开始
  const handleRenderStart = () => {
    setIsLoading(true);
    setRenderTime(0);
    const startTime = Date.now();
    
    // 模拟渲染时间计算
    const timer = setInterval(() => {
      if (!isLoading) {
        setRenderTime(Date.now() - startTime);
        clearInterval(timer);
      }
    }, 100);
  };

  // 全屏切换
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 导出处理
  const handleExport = async (format) => {
    let success = false;
    
    switch (format) {
      case 'svg':
        success = flowchart.exportSVG(`${title}.svg`);
        break;
      case 'png':
        success = await flowchart.exportPNG(`${title}.png`);
        break;
      case 'pdf':
        // PDF导出暂未实现
        success = false;
        break;
      case 'code':
        success = await flowchart.copyCode();
        break;
    }
    
    return success;
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            flowchart.zoom(1.2);
            break;
          case '-':
            e.preventDefault();
            flowchart.zoom(0.8);
            break;
          case '0':
            e.preventDefault();
            flowchart.resetZoom();
            break;
        }
      }
      
      if (e.key === 'F11') {
        e.preventDefault();
        handleFullscreen();
      }
      
      if (e.key === 'Escape' && isFullscreen) {
        handleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div
      ref={viewerRef}
      className={cn(
        'flex flex-col bg-white border rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* 标题栏 */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {code && (
              <p className="text-sm text-gray-600">
                {stats?.codeLength || code.length} 字符 | {flowchartType}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className={cn(
        'flex flex-1 overflow-hidden',
        toolbarLayout === 'vertical' && 'flex-row',
        toolbarLayout !== 'vertical' && 'flex-col'
      )}>
        {/* 工具栏 */}
        {showToolbar && (
          <FlowchartToolbar
            onZoomIn={() => flowchart.zoom(1.2)}
            onZoomOut={() => flowchart.zoom(0.8)}
            onZoomReset={flowchart.resetZoom}
            onFitToScreen={flowchart.fitToScreen}
            onFullscreen={handleFullscreen}
            onExport={handleExport}
            onEdit={onEdit}
            onShare={onShare}
            scale={flowchart.scale}
            isFullscreen={isFullscreen}
            canExport={flowchart.canExport}
            layout={toolbarLayout}
          />
        )}

        {/* 预览区域 */}
        <div className="flex-1 overflow-hidden relative">
          {code ? (
            <FlowchartInteraction
              className="w-full h-full"
              minScale={0.1}
              maxScale={5}
              initialScale={1}
              wheelSensitivity={0.1}
              panSensitivity={1}
              enableWheel={true}
              enablePan={true}
              enableTouch={true}
              enableAnimation={true}
              onScaleChange={flowchart.handleScaleChange}
              onPositionChange={flowchart.handlePositionChange}
              onInteractionStart={flowchart.handleInteractionStart}
              onInteractionEnd={flowchart.handleInteractionEnd}
            >
              <div 
                ref={flowchart.containerRef}
                className="flex items-center justify-center p-4"
              >
                <MermaidRenderer
                  code={code}
                  theme={theme}
                  onRenderSuccess={handleRenderSuccess}
                  onRenderError={handleRenderError}
                  onRenderStart={handleRenderStart}
                  className="max-w-full max-h-full"
                />
              </div>
            </FlowchartInteraction>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">暂无流程图</h3>
                <p className="text-sm">请提供Mermaid代码来预览流程图</p>
              </div>
            </div>
          )}

          {/* Loading覆盖层 */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">正在渲染流程图...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 状态栏 */}
      {showStatusBar && (
        <FlowchartStatusBar
          isRendered={isRendered}
          renderError={renderError}
          isLoading={isLoading}
          scale={flowchart.scale}
          theme={theme}
          flowchartType={flowchartType}
          stats={stats}
          renderTime={renderTime}
        />
      )}
    </div>
  );
};

export default FlowchartViewer;
