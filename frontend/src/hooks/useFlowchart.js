import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 流程图管理Hook
 * 管理流程图的渲染、导出、缩放等功能
 */
export const useFlowchart = () => {
  const [flowchartState, setFlowchartState] = useState({
    code: '',
    theme: 'default',
    isRendered: false,
    renderError: null,
    isFullscreen: false,
    scale: 1,
    position: { x: 0, y: 0 },
    isInteracting: false
  });

  const containerRef = useRef(null);
  const interactionRef = useRef(null);

  // 设置流程图代码
  const setCode = useCallback((code) => {
    setFlowchartState(prev => ({
      ...prev,
      code,
      isRendered: false,
      renderError: null
    }));
  }, []);

  // 设置主题
  const setTheme = useCallback((theme) => {
    setFlowchartState(prev => ({
      ...prev,
      theme
    }));
  }, []);

  // 设置渲染状态
  const setRenderStatus = useCallback((isRendered, error = null) => {
    setFlowchartState(prev => ({
      ...prev,
      isRendered,
      renderError: error
    }));
  }, []);

  // 缩放控制
  const zoom = useCallback((factor, center = null) => {
    setFlowchartState(prev => {
      const newScale = Math.max(0.1, Math.min(5, prev.scale * factor));
      
      // 如果提供了中心点，计算新的位置
      let newPosition = prev.position;
      if (center && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;
        
        newPosition = {
          x: prev.position.x - (centerX * (newScale - prev.scale)),
          y: prev.position.y - (centerY * (newScale - prev.scale))
        };
      }
      
      return {
        ...prev,
        scale: newScale,
        position: newPosition
      };
    });
  }, []);

  // 重置缩放
  const resetZoom = useCallback(() => {
    setFlowchartState(prev => ({
      ...prev,
      scale: 1,
      position: { x: 0, y: 0 }
    }));
  }, []);

  // 适应屏幕
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    const scaleX = containerRect.width / svgRect.width;
    const scaleY = containerRect.height / svgRect.height;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9; // 留10%边距

    setFlowchartState(prev => ({
      ...prev,
      scale: newScale,
      position: { x: 0, y: 0 }
    }));
  }, []);

  // 平移
  const pan = useCallback((deltaX, deltaY) => {
    setFlowchartState(prev => ({
      ...prev,
      position: {
        x: prev.position.x + deltaX,
        y: prev.position.y + deltaY
      }
    }));
  }, []);

  // 快捷缩放方法
  const zoomIn = useCallback(() => zoom(1.2), [zoom]);
  const zoomOut = useCallback(() => zoom(0.8), [zoom]);
  const zoomToFit = useCallback(() => fitToScreen(), [fitToScreen]);
  const zoomReset = useCallback(() => resetZoom(), [resetZoom]);

  // 设置交互状态
  const setInteracting = useCallback((isInteracting) => {
    setFlowchartState(prev => ({
      ...prev,
      isInteracting
    }));
  }, []);

  // 交互事件处理
  const handleInteractionStart = useCallback((type) => {
    setInteracting(true);
  }, [setInteracting]);

  const handleInteractionEnd = useCallback((type) => {
    setInteracting(false);
  }, [setInteracting]);

  const handleScaleChange = useCallback((newScale) => {
    setFlowchartState(prev => ({
      ...prev,
      scale: newScale
    }));
  }, []);

  const handlePositionChange = useCallback((newPosition) => {
    setFlowchartState(prev => ({
      ...prev,
      position: newPosition
    }));
  }, []);

  // 设置交互控制器引用
  const setInteractionRef = useCallback((ref) => {
    interactionRef.current = ref;
  }, []);

  // 导出SVG
  const exportSVG = useCallback((filename = 'flowchart.svg') => {
    if (!containerRef.current) return false;
    
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return false;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      return true;
    } catch (error) {
      console.error('SVG导出失败:', error);
      return false;
    }
  }, []);

  // 导出PNG
  const exportPNG = useCallback(async (filename = 'flowchart.png', scale = 2) => {
    if (!containerRef.current) return false;
    
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return false;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            resolve(true);
          }, 'image/png');
        };
        
        img.onerror = () => resolve(false);
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      });
    } catch (error) {
      console.error('PNG导出失败:', error);
      return false;
    }
  }, []);

  // 复制代码到剪贴板
  const copyCode = useCallback(async () => {
    if (!flowchartState.code) return false;
    
    try {
      await navigator.clipboard.writeText(flowchartState.code);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }, [flowchartState.code]);

  // 验证Mermaid语法
  const validateCode = useCallback(async (code = flowchartState.code) => {
    if (!code) return { isValid: false, error: '代码为空' };
    
    try {
      // 这里可以添加更详细的语法验证
      const mermaid = await import('mermaid');
      const isValid = await mermaid.default.parse(code);
      return { isValid: true, error: null };
    } catch (error) {
      return { 
        isValid: false, 
        error: error.message || '语法错误' 
      };
    }
  }, [flowchartState.code]);

  // 获取流程图统计信息
  const getStats = useCallback(() => {
    const code = flowchartState.code;
    if (!code) return null;

    return {
      codeLength: code.length,
      nodeCount: (code.match(/\w+\[.*?\]|\w+\(.*?\)|\w+\{.*?\}/g) || []).length,
      connectionCount: (code.match(/-->|---|\.-\.|==>/g) || []).length,
      decisionCount: (code.match(/\w+\{.*?\}/g) || []).length,
      theme: flowchartState.theme,
      isRendered: flowchartState.isRendered,
      scale: flowchartState.scale
    };
  }, [flowchartState]);

  // 获取视图信息
  const getViewInfo = useCallback(() => {
    return {
      scale: flowchartState.scale,
      position: flowchartState.position,
      isInteracting: flowchartState.isInteracting,
      canZoomIn: flowchartState.scale < 5,
      canZoomOut: flowchartState.scale > 0.1,
      isAtOriginalSize: flowchartState.scale === 1 && flowchartState.position.x === 0 && flowchartState.position.y === 0
    };
  }, [flowchartState]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            zoomReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, zoomReset]);

  return {
    // 状态
    code: flowchartState.code,
    theme: flowchartState.theme,
    isRendered: flowchartState.isRendered,
    renderError: flowchartState.renderError,
    isFullscreen: flowchartState.isFullscreen,
    scale: flowchartState.scale,
    position: flowchartState.position,
    isInteracting: flowchartState.isInteracting,
    
    // 引用
    containerRef,
    interactionRef,
    
    // 基本操作方法
    setCode,
    setTheme,
    setRenderStatus,
    
    // 缩放控制
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    zoomToFit,
    zoomReset,
    
    // 平移控制
    pan,
    
    // 交互处理
    setInteracting,
    handleInteractionStart,
    handleInteractionEnd,
    handleScaleChange,
    handlePositionChange,
    setInteractionRef,
    
    // 导出功能
    exportSVG,
    exportPNG,
    copyCode,
    
    // 验证和统计
    validateCode,
    getStats,
    getViewInfo,
    
    // 便捷检查
    hasCode: !!flowchartState.code,
    canExport: flowchartState.isRendered && !flowchartState.renderError
  };
};
