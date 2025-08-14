import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '../../utils/cn';
import { getThemeConfig, applyStylesToCode, detectFlowchartType } from './FlowchartThemes';

/**
 * Mermaid流程图渲染组件
 * 将Mermaid代码渲染为SVG流程图
 */
const MermaidRenderer = ({
  code = '',
  theme = 'default',
  className = '',
  onRenderSuccess = null,
  onRenderError = null,
  width = '100%',
  height = 'auto',
  id = null
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [mermaidId] = useState(id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // 初始化Mermaid配置
  useEffect(() => {
    const themeConfig = getThemeConfig(theme);
    const flowchartType = detectFlowchartType(code);
    
    mermaid.initialize({
      startOnLoad: false,
      theme: themeConfig.config.theme,
      securityLevel: 'loose',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: flowchartType === 'horizontal' ? 80 : 50,
        rankSpacing: flowchartType === 'decision_tree' ? 100 : 50,
        diagramPadding: 20
      },
      graph: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 60,
        rankSpacing: 80,
        diagramPadding: 20
      },
      themeVariables: themeConfig.config.themeVariables
    });
  }, [theme, code]);

  // 渲染Mermaid图表
  const renderChart = async () => {
    if (!code || !containerRef.current) return;

    setIsLoading(true);
    setError(null);
    setRendered(false);

    try {
      // 清空容器
      containerRef.current.innerHTML = '';
      
      // 应用主题样式到代码
      const styledCode = applyStylesToCode(code, theme);
      
      // 验证Mermaid语法
      const isValid = await mermaid.parse(styledCode);
      if (!isValid) {
        throw new Error('Mermaid语法解析失败');
      }

      // 渲染图表
      const { svg, bindFunctions } = await mermaid.render(mermaidId, styledCode);
      
      // 插入SVG到容器
      containerRef.current.innerHTML = svg;
      
      // 绑定交互功能（如果有）
      if (bindFunctions) {
        bindFunctions(containerRef.current);
      }

      // 调整SVG尺寸
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = width;
        svgElement.style.height = height;
        svgElement.style.maxWidth = '100%';
      }

      setRendered(true);
      onRenderSuccess?.(svg);
      
    } catch (error) {
      console.error('Mermaid渲染失败:', error);
      setError(error.message || '渲染失败');
      onRenderError?.(error);
      
      // 显示错误信息
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg">
            <div class="text-center">
              <div class="text-red-600 font-medium mb-1">流程图渲染失败</div>
              <div class="text-red-500 text-sm">${error.message || '未知错误'}</div>
            </div>
          </div>
        `;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 当代码或主题变化时重新渲染
  useEffect(() => {
    if (code) {
      renderChart();
    }
  }, [code, theme]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 清理可能的内存泄漏
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Loading状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">正在渲染流程图...</span>
          </div>
        </div>
      )}

      {/* 渲染容器 */}
      <div
        ref={containerRef}
        className={cn(
          'mermaid-container overflow-auto',
          !rendered && !isLoading && !error && 'min-h-32 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg'
        )}
        style={{ width, height }}
      >
        {!code && !isLoading && !error && (
          <div className="text-gray-500 text-sm">
            暂无流程图数据
          </div>
        )}
      </div>

      {/* 渲染信息 */}
      {rendered && !error && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          流程图渲染完成
        </div>
      )}
    </div>
  );
};

export default MermaidRenderer;
