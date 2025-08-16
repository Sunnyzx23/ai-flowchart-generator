import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import ExportPanel from '../components/export/ExportPanel';
import DrawioGuide from '../components/export/DrawioGuide';
import FlowchartCanvas from '../components/flowchart/FlowchartCanvas';
import drawioService from '../services/drawioService';
import clipboardService from '../services/clipboardService';

const FlowchartResult = ({ onNavigate, currentPage, resultData, onBack }) => {
  const [mermaidCode, setMermaidCode] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const [showDrawioGuide, setShowDrawioGuide] = useState(false);

  useEffect(() => {
    console.log('FlowchartResult - resultData:', resultData);
    
    // resultData 直接就是 result 对象：{mermaidCode: "...", rawResponse: "...", validation: {...}}
    if (resultData?.mermaidCode) {
      const code = resultData.mermaidCode;
      console.log('FlowchartResult - 设置Mermaid代码:', code);
      setMermaidCode(code);
    } else {
      console.log('FlowchartResult - 没有找到Mermaid代码, resultData结构:', JSON.stringify(resultData, null, 2));
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
      const response = await fetch('http://localhost:3001/api/v1/export', {
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
        const downloadUrl = `http://localhost:3001${result.data.downloadUrl}`;
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
      const response = await fetch('http://localhost:3001/api/v1/export', {
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
        const downloadUrl = `http://localhost:3001${result.data.downloadUrl}`;
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

  const handleOpenDrawio = async (code) => {
    try {
      console.log('Draw.io跳转 - 尝试自动导入');
      const codeToUse = code || mermaidCode;
      
      if (!codeToUse) {
        throw new Error('没有可导出的流程图代码');
      }
      
      const result = await drawioService.openDrawioEditor(codeToUse);
      if (!result.success) {
        throw new Error(result.message);
      }
      console.log('Draw.io跳转成功:', result);
      
      // 不再显示立即的提示，让系统自动尝试导入
      // 如果8秒后自动导入失败，系统会自动显示指导
      console.log('Draw.io已打开，系统正在后台尝试自动导入...');
    } catch (error) {
      console.error('Draw.io跳转失败:', error);
      // 如果自动化失败，显示指导页面作为备用方案
      setShowDrawioGuide(true);
    }
  };

  if (!resultData) {
    return (
      <Layout onNavigate={onNavigate} currentPage={currentPage}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            没有找到流程图数据
          </h1>
          <Button onClick={() => onNavigate('input')}>
            返回输入页面
          </Button>
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
              {resultData?.rawResponse?.includes('降级方案') 
                ? '使用降级方案生成的基础流程图' 
                : 'AI智能分析生成的业务流程图'}
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
          onOpenDrawio={handleOpenDrawio}
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

        {/* AI分析信息 */}
        {resultData?.rawResponse && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">AI分析说明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-sm">
                {resultData.rawResponse}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Draw.io指导弹窗 */}
      {showDrawioGuide && (
        <DrawioGuide
          mermaidCode={mermaidCode}
          onClose={() => setShowDrawioGuide(false)}
        />
      )}
    </Layout>
  );
};

export default FlowchartResult;
