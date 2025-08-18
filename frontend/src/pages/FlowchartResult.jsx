import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import ExportPanel from '../components/export/ExportPanel';

import FlowchartCanvas from '../components/flowchart/FlowchartCanvas';
import drawioService from '../services/drawioService';
import clipboardService from '../services/clipboardService';
import { getApiUrl } from '../config/api.js';
import API_CONFIG from '../config/api.js';

const FlowchartResult = ({ onNavigate, currentPage, resultData, onBack }) => {
  const [mermaidCode, setMermaidCode] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  // 强制触发新部署以清除Vercel缓存


  useEffect(() => {
    console.log('FlowchartResult - resultData:', resultData);
    
    if (resultData?.mermaidCode) {
      const code = resultData.mermaidCode;
      console.log('FlowchartResult - 设置Mermaid代码:', code);
      setMermaidCode(code);
    } else {
      console.log('FlowchartResult - 没有找到Mermaid代码, 数据结构:', JSON.stringify(resultData, null, 2));
    }
  }, [resultData]);

  // 处理渲染完成
  const handleRenderComplete = (svg) => {
    console.log('Mermaid渲染成功');
    setIsRendering(false);
  };

  // 处理渲染错误
  const handleRenderError = (error) => {
    console.error('Mermaid渲染失败:', error);
    console.error('问题代码:', mermaidCode);
    
    // 详细的错误分析和记录
    const errorAnalysis = {
      type: 'render_error',
      message: error.message,
      code: mermaidCode,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // 尝试分析错误原因
    if (error.message.includes('Parse error')) {
      console.error('解析错误 - 可能的原因:');
      console.error('1. 节点文本包含特殊字符');
      console.error('2. 语法格式不正确');  
      console.error('3. 缺少必要的引号');
      console.error('4. 复杂的节点语法不支持');
      errorAnalysis.category = 'syntax_error';
    } else if (error.message.includes('render')) {
      errorAnalysis.category = 'render_error';
    } else {
      errorAnalysis.category = 'unknown_error';
    }
    
    // 记录错误用于后续分析优化
    console.log('错误分析报告:', JSON.stringify(errorAnalysis, null, 2));
    
    setIsRendering(false);
  };

  // 导出处理函数
  const handleExportPNG = async (code) => {
    const codeToUse = code || mermaidCode;
    if (!codeToUse) {
      alert('没有可导出的流程图代码');
      return;
    }
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EXPORT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mermaidCode: codeToUse,
          format: 'png',
          options: {
            width: 1200,
            height: 800,
            quality: 90
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`导出失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // 触发下载
        const downloadUrl = `${getApiUrl('')}${result.data.downloadUrl}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = result.data.fileName;
        link.click();
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('PNG导出失败:', error);
      alert('PNG导出失败: ' + error.message);
    }
  };

  const handleExportPDF = async (code) => {
    const codeToUse = code || mermaidCode;
    if (!codeToUse) {
      alert('没有可导出的流程图代码');
      return;
    }
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EXPORT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mermaidCode: codeToUse,
          format: 'pdf',
          options: {
            width: 1200,
            height: 800
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`导出失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // 触发下载
        const downloadUrl = `${getApiUrl('')}${result.data.downloadUrl}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = result.data.fileName;
        link.click();
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败: ' + error.message);
    }
  };

  const handleCopySource = async (code) => {
    try {
      const result = await clipboardService.copyMermaidCode(code);
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('复制失败:', error);
      throw new Error('复制到剪贴板失败');
    }
  };

  const handleOpenMermaidLive = async (code) => {
    try {
      console.log('打开Mermaid Live Editor');
      const codeToUse = code || mermaidCode;
      
      if (!codeToUse) {
        alert('没有可导出的流程图代码');
        return;
      }
      
      // 方案1: 尝试使用Mermaid Chart Play (推荐)
      try {
        // 复制代码到剪贴板，用户可以直接粘贴
        await navigator.clipboard.writeText(codeToUse);
        console.log('Mermaid代码已复制到剪贴板');
        
        // 打开Mermaid Chart Play编辑器
        const mermaidPlayUrl = 'https://www.mermaidchart.com/play';
        console.log('使用Mermaid Chart Play:', mermaidPlayUrl);
        window.open(mermaidPlayUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        
        // 显示使用提示
        setTimeout(() => {
          alert(`✅ 已在Mermaid Chart Play中打开！

📋 Mermaid代码已复制到剪贴板

🚀 详细操作步骤：
1️⃣ 点击页面左下角的 "Edit code" 按钮
2️⃣ 在弹出的代码输入框中粘贴代码 (Ctrl+V / Cmd+V)
3️⃣ 即可实时预览和编辑流程图
4️⃣ 使用右上角按钮导出PNG、SVG、PDF格式
5️⃣ 支持分享和保存项目到云端

💡 提示：如果没看到"Edit code"按钮，请刷新页面重试`);
        }, 500);
        
      } catch (clipboardError) {
        console.warn('复制到剪贴板失败，尝试备用方案:', clipboardError);
        
        // 方案2: 备用方案 - 直接打开编辑器，显示代码供用户复制
        const mermaidPlayUrl = 'https://www.mermaidchart.com/play';
        window.open(mermaidPlayUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        
        alert(`✅ Mermaid Chart Play已打开！

📋 请手动复制以下代码：
${codeToUse}

🚀 详细操作步骤：
1️⃣ 点击页面左下角的 "Edit code" 按钮
2️⃣ 在弹出的代码输入框中清空默认代码
3️⃣ 粘贴上述Mermaid代码
4️⃣ 即可实时预览和编辑流程图
5️⃣ 使用右上角按钮导出PNG、SVG、PDF格式

💡 提示：如果没看到"Edit code"按钮，请刷新页面重试`);
      }
      
    } catch (error) {
      console.error('打开Mermaid Live Editor失败:', error);
      
      // 方案3: 最后的备用方案 - 使用官方网站
      try {
        await navigator.clipboard.writeText(codeToUse);
        const mermaidChartUrl = 'https://www.mermaidchart.com/';
        window.open(mermaidChartUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        alert(`⚠️ 使用备用方案打开Mermaid Chart

✅ Mermaid代码已复制到剪贴板！

🚀 使用步骤：
1. 点击 "Start for free" 或 "Create new diagram"
2. 选择 "Flowchart" 类型
3. 在编辑器中粘贴代码 (Ctrl+V / Cmd+V)
4. 查看生成的流程图并可直接导出`);
        
      } catch (fallbackError) {
        alert('打开Mermaid编辑器失败: ' + fallbackError.message);
      }
    }
  };



  // 如果没有数据，显示错误状态
  if (!resultData) {
    return (
      <Layout onNavigate={onNavigate} currentPage={currentPage}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              流程图生成失败
            </h1>
            <p className="text-gray-600">
              没有找到分析结果，请重新生成
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => onNavigate('input')}>
              返回重新生成
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onNavigate={onNavigate} currentPage={currentPage}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              流程图生成结果
            </h1>
            <p className="text-gray-600">
              AI智能分析生成的业务流程图
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            重新生成
          </Button>
        </div>

        {/* 流程图预览区域 */}
        <Card>
          <CardHeader>
            <CardTitle>流程图预览</CardTitle>
            <CardDescription>
              支持缩放、拖拽查看，可导出多种格式
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '600px' }}>
              <FlowchartCanvas
                mermaidCode={mermaidCode}
                isLoading={isRendering}
                onRenderComplete={handleRenderComplete}
                onRenderError={handleRenderError}
              />
            </div>
          </CardContent>
        </Card>

        {/* 导出操作面板 */}
        <ExportPanel
          flowchartData={resultData}
          mermaidCode={mermaidCode}
          title="流程图导出"
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          onCopySource={handleCopySource}
          onOpenMermaidLive={handleOpenMermaidLive}
        />



        {/* 源码显示区域 */}
        <Card>
          <CardHeader>
            <CardTitle>Mermaid源码</CardTitle>
            <CardDescription>
              可以复制此代码在其他支持Mermaid的平台使用
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{mermaidCode}</code>
            </pre>
          </CardContent>
        </Card>


      </div>
      

    </Layout>
  );
};

export default FlowchartResult;
