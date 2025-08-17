import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../ui';
import FlowchartThemeSelector from './FlowchartThemeSelector';

/**
 * 支持缩放和拖拽的流程图画布组件
 */
const FlowchartCanvas = ({ 
  mermaidCode, 
  isLoading = false,
  onRenderComplete = null,
  onRenderError = null 
}) => {
  const containerRef = useRef(null);
  const svgContainerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRendered, setIsRendered] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [toolbarPosition, setToolbarPosition] = useState({ x: 16, y: 16 });
  const [isToolbarDragging, setIsToolbarDragging] = useState(false);
  const [toolbarDragStart, setToolbarDragStart] = useState({ x: 0, y: 0 });

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setScale(prevScale => Math.min(prevScale * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.3));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!svgContainerRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const svgElement = svgContainerRef.current.querySelector('svg');
    
    if (svgElement) {
      const containerRect = container.getBoundingClientRect();
      const svgRect = svgElement.getBBox();
      
      const scaleX = (containerRect.width - 40) / svgRect.width;
      const scaleY = (containerRect.height - 40) / svgRect.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(0.3, Math.min(3, prevScale * delta)));
  }, []);

  // 拖拽功能
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // 只处理左键
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 主题切换
  const handleThemeChange = useCallback((theme) => {
    setCurrentTheme(theme.id);
    // 重新渲染图表
    if (mermaidCode) {
      renderMermaid();
    }
  }, [mermaidCode]);

  // 工具栏拖拽功能
  const handleToolbarMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return; // 如果点击的是按钮，不启动拖拽
    }
    
    setIsToolbarDragging(true);
    setToolbarDragStart({
      x: e.clientX - toolbarPosition.x,
      y: e.clientY - toolbarPosition.y
    });
  }, [toolbarPosition]);

  const handleToolbarMouseMove = useCallback((e) => {
    if (!isToolbarDragging) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = Math.max(0, Math.min(
      containerRect.width - 300, // 工具栏宽度约300px
      e.clientX - toolbarDragStart.x
    ));
    const newY = Math.max(0, Math.min(
      containerRect.height - 60, // 工具栏高度约60px
      e.clientY - toolbarDragStart.y
    ));
    
    setToolbarPosition({ x: newX, y: newY });
  }, [isToolbarDragging, toolbarDragStart]);

  const handleToolbarMouseUp = useCallback(() => {
    setIsToolbarDragging(false);
  }, []);

  // 获取主题配置
  const getThemeConfig = useCallback(() => {
    const themes = {
      default: {
        theme: 'base',
        themeVariables: {
          primaryColor: '#e1f5fe',
          primaryTextColor: '#1a365d',
          primaryBorderColor: '#0ea5e9',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#64748b',
          arrowheadColor: '#475569',
          background: '#ffffff',
          mainBkg: '#f8fafc',
          secondBkg: '#e2e8f0',
          tertiaryBkg: '#f1f5f9',
          textColor: '#1e293b',
          titleColor: '#0f172a',
          nodeBorder: '#cbd5e1',
          tertiaryColor: '#dcfce7',
          tertiaryBorderColor: '#16a34a',
          tertiaryTextColor: '#15803d'
        }
      },
      forest: {
        theme: 'forest',
        themeVariables: {
          primaryColor: '#dcfce7',
          primaryTextColor: '#14532d',
          primaryBorderColor: '#16a34a',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#16a34a',
          arrowheadColor: '#15803d',
          background: '#ffffff',
          mainBkg: '#f0fdf4',
          secondBkg: '#dcfce7',
          tertiaryBkg: '#bbf7d0',
          textColor: '#14532d',
          titleColor: '#052e16',
          nodeBorder: '#16a34a',
          tertiaryColor: '#fef3c7',
          tertiaryBorderColor: '#f59e0b',
          tertiaryTextColor: '#92400e'
        }
      },
      dark: {
        theme: 'dark',
        themeVariables: {
          primaryColor: '#374151',
          primaryTextColor: '#f9fafb',
          primaryBorderColor: '#6b7280',
          cScale0: '#fbbf24',
          cScale1: '#f59e0b',
          cScale2: '#d97706',
          lineColor: '#9ca3af',
          arrowheadColor: '#d1d5db',
          background: '#1f2937',
          mainBkg: '#374151',
          secondBkg: '#4b5563',
          tertiaryBkg: '#6b7280',
          textColor: '#f9fafb',
          titleColor: '#ffffff',
          nodeBorder: '#6b7280',
          tertiaryColor: '#065f46',
          tertiaryBorderColor: '#10b981',
          tertiaryTextColor: '#d1fae5'
        }
      },
      neutral: {
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#f3f4f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#6b7280',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#6b7280',
          arrowheadColor: '#4b5563',
          background: '#ffffff',
          mainBkg: '#f9fafb',
          secondBkg: '#f3f4f6',
          tertiaryBkg: '#e5e7eb',
          textColor: '#1f2937',
          titleColor: '#111827',
          nodeBorder: '#d1d5db',
          tertiaryColor: '#ddd6fe',
          tertiaryBorderColor: '#8b5cf6',
          tertiaryTextColor: '#5b21b6'
        }
      }
    };
    return themes[currentTheme] || themes.default;
  }, [currentTheme]);

  // 渲染Mermaid图表
  const renderMermaid = useCallback(async () => {
    if (!mermaidCode || !svgContainerRef.current) return;

    try {
      setIsRendered(false);
      
      // 动态导入mermaid
      const mermaid = await import('mermaid');
      
      // 获取当前主题配置
      const themeConfig = getThemeConfig();
      
      // 配置mermaid - 优化样式
      mermaid.default.initialize({
        startOnLoad: false,
        theme: themeConfig.theme,
        securityLevel: 'loose',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
        flowchart: {
          useMaxWidth: false, // 不限制最大宽度，让我们自己控制
          htmlLabels: true,
          curve: 'basis',
          padding: 30,
          nodeSpacing: 80,
          rankSpacing: 100,
          diagramPadding: 30,
          wrappingWidth: 200
        },
        themeVariables: themeConfig.themeVariables
      });

      // 清空容器
      svgContainerRef.current.innerHTML = '';
      
      // 渲染图表
      const { svg } = await mermaid.default.render(
        'flowchart-canvas-' + Date.now(), 
        mermaidCode
      );
      
      // 插入SVG
      svgContainerRef.current.innerHTML = svg;
      
      // 优化SVG样式
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = 'none';
        svgElement.style.height = 'auto';
        svgElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
        
        // 添加更好的文字样式
        const textElements = svgElement.querySelectorAll('text');
        textElements.forEach(text => {
          text.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
          text.style.fontSize = '14px';
          text.style.fontWeight = '500';
          text.style.letterSpacing = '0.025em';
        });
        
        // 优化节点样式
        const rectElements = svgElement.querySelectorAll('rect');
        rectElements.forEach(rect => {
          const currentStroke = rect.getAttribute('stroke');
          if (currentStroke) {
            rect.style.strokeWidth = '2px';
            rect.style.filter = 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))';
          }
        });
        
        // 优化路径（箭头和连线）
        const pathElements = svgElement.querySelectorAll('path');
        pathElements.forEach(path => {
          const currentStroke = path.getAttribute('stroke');
          if (currentStroke && currentStroke !== 'none') {
            path.style.strokeWidth = '2px';
            path.style.strokeLinecap = 'round';
            path.style.strokeLinejoin = 'round';
          }
        });
        
        // 优化多边形（决策节点）
        const polygonElements = svgElement.querySelectorAll('polygon');
        polygonElements.forEach(polygon => {
          polygon.style.filter = 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))';
        });
        
        // 优化圆形节点
        const circleElements = svgElement.querySelectorAll('circle');
        circleElements.forEach(circle => {
          circle.style.filter = 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))';
        });
      }
      
      setIsRendered(true);
      onRenderComplete?.(svg);
      
    } catch (error) {
      console.error('Mermaid渲染失败:', error);
      svgContainerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-64 text-center">
          <div>
            <p class="text-red-600 font-medium">流程图渲染失败</p>
            <p class="text-gray-500 text-sm mt-2">${error.message}</p>
          </div>
        </div>
      `;
      onRenderError?.(error);
    }
  }, [mermaidCode, onRenderComplete, onRenderError, getThemeConfig]);

  // 监听代码变化重新渲染
  useEffect(() => {
    if (mermaidCode) {
      renderMermaid();
    }
  }, [mermaidCode, currentTheme]); // 依赖主题变化而不是renderMermaid函数

  // 添加事件监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleToolbarMouseMove);
    document.addEventListener('mouseup', handleToolbarMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleToolbarMouseMove);
      document.removeEventListener('mouseup', handleToolbarMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, handleToolbarMouseMove, handleToolbarMouseUp]);

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div 
        className={`absolute z-10 bg-white rounded-lg shadow-md p-2 ${
          isToolbarDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ 
          left: `${toolbarPosition.x}px`, 
          top: `${toolbarPosition.y}px`,
          userSelect: 'none'
        }}
        onMouseDown={handleToolbarMouseDown}
      >
        <div className="flex items-center space-x-2">
        {/* 拖拽手柄 */}
        <div className="flex flex-col space-y-1 px-1 cursor-grab active:cursor-grabbing" title="拖拽移动工具栏">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 self-center" />
        
        {/* 主题选择器 */}
        <FlowchartThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
        
        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 self-center" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= 0.3}
          title="缩小 (Ctrl + -)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </Button>
        
        <span className="px-2 py-1 text-sm text-gray-600 self-center min-w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= 3}
          title="放大 (Ctrl + +)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetZoom}
          title="重置缩放 (Ctrl + 0)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleFitToScreen}
          title="适应屏幕"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">正在渲染流程图...</p>
          </div>
        </div>
      )}

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: '500px' }}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={svgContainerRef}
          className="transform-gpu transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* 使用提示 */}
      {isRendered && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-lg">
          <p>💡 鼠标滚轮缩放 • 拖拽移动 • 右上角工具栏</p>
        </div>
      )}
    </div>
  );
};

export default FlowchartCanvas;
