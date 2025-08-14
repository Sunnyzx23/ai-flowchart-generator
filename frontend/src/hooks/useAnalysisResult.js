import { useState, useCallback, useEffect } from 'react';

/**
 * AI分析结果管理Hook
 * 管理分析结果的展示、导出、分享等功能
 */
export const useAnalysisResult = () => {
  const [resultState, setResultState] = useState({
    result: null,
    isVisible: false,
    showPreview: false,
    analysisTime: 0,
    timestamp: null,
    exportFormats: ['json', 'txt', 'pdf']
  });

  // 设置分析结果
  const setResult = useCallback((result, analysisTime = 0) => {
    setResultState(prev => ({
      ...prev,
      result,
      analysisTime,
      timestamp: new Date(),
      isVisible: true
    }));
  }, []);

  // 清除结果
  const clearResult = useCallback(() => {
    setResultState(prev => ({
      ...prev,
      result: null,
      isVisible: false,
      showPreview: false,
      analysisTime: 0,
      timestamp: null
    }));
  }, []);

  // 显示详细预览
  const showPreview = useCallback(() => {
    setResultState(prev => ({
      ...prev,
      showPreview: true
    }));
  }, []);

  // 隐藏详细预览
  const hidePreview = useCallback(() => {
    setResultState(prev => ({
      ...prev,
      showPreview: false
    }));
  }, []);

  // 导出结果
  const exportResult = useCallback(async (format = 'json', filename = null) => {
    if (!resultState.result) {
      throw new Error('没有可导出的结果');
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const defaultFilename = `ai-analysis-result-${timestamp}`;
    const finalFilename = filename || defaultFilename;

    try {
      let content;
      let mimeType;
      let fileExtension;

      switch (format) {
        case 'json':
          content = JSON.stringify(resultState.result, null, 2);
          mimeType = 'application/json';
          fileExtension = '.json';
          break;
          
        case 'txt':
          content = formatResultAsText(resultState.result);
          mimeType = 'text/plain';
          fileExtension = '.txt';
          break;
          
        case 'mermaid':
          content = resultState.result.mermaid || '';
          mimeType = 'text/plain';
          fileExtension = '.mmd';
          break;
          
        default:
          throw new Error(`不支持的导出格式: ${format}`);
      }

      // 创建下载链接
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${finalFilename}${fileExtension}`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('导出失败:', error);
      throw error;
    }
  }, [resultState.result]);

  // 复制结果到剪贴板
  const copyToClipboard = useCallback(async (type = 'mermaid') => {
    if (!resultState.result) {
      throw new Error('没有可复制的内容');
    }

    try {
      let content;
      
      switch (type) {
        case 'mermaid':
          content = resultState.result.mermaid || '';
          break;
        case 'json':
          content = JSON.stringify(resultState.result, null, 2);
          break;
        case 'summary':
          content = resultState.result.analysis?.summary || '';
          break;
        default:
          content = formatResultAsText(resultState.result);
      }

      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      throw error;
    }
  }, [resultState.result]);

  // 分享结果
  const shareResult = useCallback(async (options = {}) => {
    if (!resultState.result) {
      throw new Error('没有可分享的结果');
    }

    const shareData = {
      title: options.title || 'AI业务流程分析结果',
      text: options.text || resultState.result.analysis?.summary || 'AI分析完成',
      url: options.url || window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(shareData.url);
        return true;
      }
    } catch (error) {
      console.error('分享失败:', error);
      throw error;
    }
  }, [resultState.result]);

  // 获取结果统计信息
  const getResultStats = useCallback(() => {
    if (!resultState.result) return null;

    const result = resultState.result;
    
    return {
      analysisTime: resultState.analysisTime,
      timestamp: resultState.timestamp,
      dimensions: result.analysis?.dimensions?.length || 0,
      nodes: result.mermaid?.match(/\w+\[.*?\]/g)?.length || 0,
      connections: result.mermaid?.match(/-->/g)?.length || 0,
      complexity: result.analysis?.complexity || 'unknown',
      codeLength: result.mermaid?.length || 0,
      hasErrors: !result.mermaid || result.mermaid.length < 50
    };
  }, [resultState.result, resultState.analysisTime, resultState.timestamp]);

  // 验证结果完整性
  const validateResult = useCallback((result) => {
    const issues = [];
    
    if (!result) {
      issues.push('结果为空');
      return { isValid: false, issues };
    }

    if (!result.mermaid || result.mermaid.length < 20) {
      issues.push('Mermaid代码过短或缺失');
    }

    if (!result.analysis) {
      issues.push('缺少分析数据');
    }

    if (result.analysis && (!result.analysis.dimensions || result.analysis.dimensions.length < 5)) {
      issues.push('分析维度不完整');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }, []);

  // 自动保存到本地存储
  useEffect(() => {
    if (resultState.result) {
      try {
        const dataToSave = {
          result: resultState.result,
          analysisTime: resultState.analysisTime,
          timestamp: resultState.timestamp?.toISOString()
        };
        localStorage.setItem('ai-analysis-last-result', JSON.stringify(dataToSave));
      } catch (error) {
        console.warn('保存到本地存储失败:', error);
      }
    }
  }, [resultState.result, resultState.analysisTime, resultState.timestamp]);

  // 从本地存储恢复结果
  const restoreFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('ai-analysis-last-result');
      if (saved) {
        const data = JSON.parse(saved);
        setResultState(prev => ({
          ...prev,
          result: data.result,
          analysisTime: data.analysisTime || 0,
          timestamp: data.timestamp ? new Date(data.timestamp) : null,
          isVisible: true
        }));
        return true;
      }
    } catch (error) {
      console.warn('从本地存储恢复失败:', error);
    }
    return false;
  }, []);

  return {
    // 状态
    result: resultState.result,
    isVisible: resultState.isVisible,
    showPreview: resultState.showPreview,
    analysisTime: resultState.analysisTime,
    timestamp: resultState.timestamp,
    
    // 操作方法
    setResult,
    clearResult,
    showPreview: showPreview,
    hidePreview,
    exportResult,
    copyToClipboard,
    shareResult,
    
    // 工具方法
    getResultStats,
    validateResult,
    restoreFromStorage,
    
    // 便捷检查
    hasResult: !!resultState.result,
    isPreviewVisible: resultState.showPreview
  };
};

// 辅助函数：将结果格式化为文本
function formatResultAsText(result) {
  if (!result) return '';

  const lines = [];
  lines.push('AI业务流程分析结果');
  lines.push('='.repeat(30));
  lines.push('');
  
  // 基本信息
  if (result.analysis) {
    lines.push('基本信息:');
    lines.push(`- 产品类型: ${result.analysis.productType || '未指定'}`);
    lines.push(`- 实现方式: ${result.analysis.implementType || '未指定'}`);
    lines.push(`- 复杂度: ${result.analysis.complexity || '未知'}`);
    lines.push('');
  }
  
  // 需求摘要
  if (result.analysis?.summary || result.requirement) {
    lines.push('需求摘要:');
    lines.push(result.analysis?.summary || result.requirement);
    lines.push('');
  }
  
  // 维度分析
  if (result.analysis?.dimensions) {
    lines.push('维度分析:');
    result.analysis.dimensions.forEach((dim, index) => {
      lines.push(`${index + 1}. ${dim.name}`);
      if (dim.description) {
        lines.push(`   ${dim.description}`);
      }
    });
    lines.push('');
  }
  
  // Mermaid代码
  if (result.mermaid) {
    lines.push('Mermaid流程图代码:');
    lines.push('-'.repeat(20));
    lines.push(result.mermaid);
    lines.push('');
  }
  
  lines.push(`生成时间: ${new Date().toLocaleString()}`);
  
  return lines.join('\n');
}
