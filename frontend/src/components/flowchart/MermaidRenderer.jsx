import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '../../utils/cn';
import { getThemeConfig, applyStylesToCode, detectFlowchartType } from './FlowchartThemes';

// 智能修复Mermaid代码（与后端cleanMermaidCode保持一致）
const attemptCodeFix = (code, errorMessage) => {
  let fixedCode = code;
  
  // 根据错误信息进行针对性修复
  if (errorMessage.includes('Parse error')) {
    fixedCode = fixedCode
      // 第一步：预处理 - 先处理最严重的语法错误
      .replace(/\|{2,}/g, ' ')  // 所有多个管道符都替换为空格
      .replace(/#{2,}/g, '#')   // 多个#符号简化为单个
      .replace(/\*{2,}/g, '*')  // 多个*符号简化为单个
      
      // 第二步：修复节点语法 - 彻底清理节点内的特殊字符
      .replace(/\[([^\]]*)\]/g, (match, content) => {
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
        
        const shortContent = cleanContent.length > 20 
          ? cleanContent.substring(0, 15) + '...' 
          : cleanContent;
          
        return shortContent ? `[${shortContent}]` : '[步骤]';
      })
      .replace(/\{([^}]*)\}/g, (match, content) => {
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
          
        const shortContent = cleanContent.length > 20 
          ? cleanContent.substring(0, 15) + '...' 
          : cleanContent;
          
        return shortContent ? `{${shortContent}}` : '{条件}';
      })
      
      // 第三步：彻底修复连接符
      .replace(/={2,}>{1,}/g, ' --> ')    // ===>>> 等转为 -->
      .replace(/={2,}/g, ' --> ')         // == 等转为 -->
      .replace(/-{3,}>/g, ' --> ')        // -----> 等转为 -->
      .replace(/-{3,}/g, ' --- ')         // ------ 等转为 ---
      .replace(/>{2,}/g, ' --> ')         // >> 等转为 -->
      .replace(/\s*-->\s*/g, ' --> ')     // 标准化箭头连接
      .replace(/\s*---\s*/g, ' --- ')     // 标准化线条连接
      
      // 第四步：清理残留的特殊字符
      .replace(/\s*\|\s*-+\s*>/g, ' --> ')  // |---> 转为 -->
      .replace(/\s*\|\s*=+\s*>/g, ' --> ')  // |===> 转为 -->
      .replace(/\s*\|\s*/g, ' ')            // 清理剩余的独立管道符
      
      // 第五步：修复连接符后可能出现的问题
      .replace(/-->\s*>+/g, ' --> ')        // --> >> 转为 -->
      .replace(/---\s*-+/g, ' --- ')        // --- -- 转为 ---
      .replace(/=+\s*>+/g, ' --> ')         // = > 转为 -->
      
      // 第六步：修复subgraph和注释语法
      .replace(/subgraph\s+([^{}\n]+)/g, (match, title) => {
        const cleanTitle = title
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return cleanTitle ? `subgraph ${cleanTitle}` : 'subgraph 流程';
      })
      // 简单修复：与后端保持一致
      // 1. 修复节点ID连在一起
      .replace(/([A-Za-z0-9_]+\[[^\]]*\])([A-Za-z0-9_]+)/g, '$1\n$2')
      // 2. 移除连接中的中文文本
      .replace(/(-->|---)\s+[^\sA-Za-z0-9_\[\(\{]+\s+([A-Za-z0-9_]+)/g, '$1 $2')
      // 移除或转换非法的文本内容
      .replace(/^#[^%]/gm, '%% ')          // 将#注释转为%%注释
      .replace(/^\d+\.\s*/gm, '%% ')       // 将数字列表转为注释
      .replace(/^\*\s*/gm, '%% ')          // 将星号列表转为注释
      .replace(/^-\s*/gm, '%% ')           // 将短横线列表转为注释
      
      // 最终清理
      .replace(/\s{2,}/g, ' ')              // 合并多个空格
      .trim();
  }
  
  return fixedCode !== code ? fixedCode : null;
};

// 获取错误类型和建议
const getErrorType = (errorMessage) => {
  if (!errorMessage) {
    return {
      message: '未知渲染错误',
      suggestions: ['请尝试刷新页面', '检查网络连接']
    };
  }
  
  if (errorMessage.includes('Parse error')) {
    return {
      message: 'Mermaid语法解析错误',
      suggestions: [
        '代码包含不支持的特殊字符',
        '节点文本可能过长或格式不正确',
        '建议重新生成流程图'
      ]
    };
  }
  
  if (errorMessage.includes('render')) {
    return {
      message: '流程图渲染失败',
      suggestions: [
        '流程图结构可能过于复杂',
        '尝试简化流程图内容',
        '检查浏览器兼容性'
      ]
    };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      message: '网络连接错误',
      suggestions: [
        '检查网络连接状态',
        '刷新页面重试',
        '稍后再试'
      ]
    };
  }
  
  return {
    message: errorMessage.substring(0, 50) + (errorMessage.length > 50 ? '...' : ''),
    suggestions: [
      '请尝试刷新页面',
      '如问题持续存在，请联系支持'
    ]
  };
};

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
      
      // 分层修复策略
      if (error.message && code) {
        console.log('🔧 开始分层修复策略...');
        
        // 第一步：本地快速修复
        if (error.message.includes('Parse error')) {
          try {
            const fixedCode = attemptCodeFix(code, error.message);
            if (fixedCode && fixedCode !== code) {
              console.log('✅ 本地修复成功，重新渲染...');
              const { svg } = await mermaid.render(mermaidId + '_fixed', fixedCode);
              containerRef.current.innerHTML = svg;
              setRendered(true);
              onRenderSuccess?.(svg);
              return; // 本地修复成功
            }
          } catch (fixError) {
            console.log('❌ 本地修复失败:', fixError.message);
          }
        }
        
        // 第二步：调用专门修复服务
        console.log('🔧 调用专门修复服务...');
        try {
          const repairResponse = await fetch('/api/mermaid-repair', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mermaidCode: code,
              errorMessage: error.message,
              originalRequirement: 'flowchart repair'
            })
          });
          
          if (repairResponse.ok) {
            const repairResult = await repairResponse.json();
            
            if (repairResult.success && repairResult.repairedCode) {
              console.log(`✅ 修复服务成功 (${repairResult.repairMethod})`);
              
              try {
                const { svg } = await mermaid.render(mermaidId + '_repaired', repairResult.repairedCode);
                containerRef.current.innerHTML = svg;
                setRendered(true);
                onRenderSuccess?.(svg);
                return; // 修复服务成功
              } catch (repairRenderError) {
                console.log('❌ 修复后代码仍无法渲染:', repairRenderError.message);
              }
            }
          }
        } catch (repairServiceError) {
          console.log('❌ 修复服务调用失败:', repairServiceError.message);
        }
        
        console.log('⚠️ 所有修复尝试都失败，显示错误信息');
      }
      
      onRenderError?.(error);
      
      // 显示友好的错误信息和建议
      if (containerRef.current) {
        const errorType = getErrorType(error.message);
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center min-h-32 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="text-center max-w-md">
              <div class="text-red-600 font-medium mb-2">
                <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                流程图渲染失败
              </div>
              <div class="text-red-500 text-sm mb-3">${errorType.message}</div>
              <div class="text-gray-600 text-xs space-y-1">
                ${errorType.suggestions.map(suggestion => `<div>• ${suggestion}</div>`).join('')}
              </div>
              <button 
                onclick="window.location.reload()" 
                class="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                刷新重试
              </button>
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
