import React, { useState } from 'react';
import { ExportPanel } from '../components/export';
import { FlowchartViewer } from '../components/flowchart';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import drawioService from '../services/drawioService';
import clipboardService from '../services/clipboardService';

/**
 * 导出功能演示页面
 * 展示导出面板和流程图预览的集成
 */
const ExportDemo = () => {
  const [selectedFlowchart, setSelectedFlowchart] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  // 示例流程图数据
  const sampleFlowcharts = [
    {
      id: 'login-flow',
      title: '用户登录流程',
      code: `flowchart TD
    A[用户访问登录页] --> B{用户是否已登录}
    B -->|是| C[跳转到主页]
    B -->|否| D[显示登录表单]
    D --> E[用户输入账号密码]
    E --> F[提交登录请求]
    F --> G{验证用户信息}
    G -->|成功| H[生成登录token]
    G -->|失败| I[显示错误信息]
    H --> J[保存用户状态]
    J --> C
    I --> D
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
    style I fill:#ffebee`,
      data: {
        type: 'flowchart',
        nodes: 10,
        connections: 11
      }
    },
    {
      id: 'payment-flow',
      title: '支付处理流程',
      code: `graph TD
    A[用户选择商品] --> B[添加到购物车]
    B --> C[点击结算]
    C --> D{用户是否登录}
    D -->|否| E[跳转登录]
    D -->|是| F[确认订单信息]
    E --> F
    F --> G[选择支付方式]
    G --> H[调用支付接口]
    H --> I{支付结果}
    I -->|成功| J[更新订单状态]
    I -->|失败| K[显示支付失败]
    J --> L[发送确认邮件]
    K --> G
    L --> M[跳转成功页面]
    
    style A fill:#fff3e0
    style M fill:#e8f5e8
    style K fill:#ffebee`,
      data: {
        type: 'graph',
        nodes: 13,
        connections: 14
      }
    },
    {
      id: 'approval-flow',
      title: '审批流程',
      code: `flowchart TD
    A[提交申请] --> B[部门主管审批]
    B --> C{审批结果}
    C -->|通过| D[HR审核]
    C -->|拒绝| E[申请被拒绝]
    D --> F{HR审核结果}
    F -->|通过| G[财务审批]
    F -->|拒绝| E
    G --> H{财务审批结果}
    H -->|通过| I[申请通过]
    H -->|拒绝| E
    I --> J[发送通知]
    E --> K[发送拒绝通知]
    
    style A fill:#e3f2fd
    style I fill:#e8f5e8
    style E fill:#ffebee`,
      data: {
        type: 'flowchart',
        nodes: 11,
        connections: 12
      }
    }
  ];

  const currentFlowchart = sampleFlowcharts[selectedFlowchart];

  // 导出处理函数
  const handleExportPNG = async (flowchartData, mermaidCode) => {
    setExportStatus('正在导出PNG...');
    
    try {
      const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mermaidCode,
          format: 'png',
          options: {
            width: 1200,
            height: 800,
            quality: 90
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setExportStatus('PNG导出成功！正在下载...');
        
        // 触发文件下载
        const downloadLink = document.createElement('a');
        downloadLink.href = result.data.downloadUrl;
        downloadLink.download = result.data.fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setExportStatus('PNG文件已下载！');
      } else {
        throw new Error(result.error || 'PNG导出失败');
      }
    } catch (error) {
      setExportStatus('PNG导出失败: ' + error.message);
      console.error('PNG导出失败:', error);
    }
    
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleExportPDF = async (flowchartData, mermaidCode) => {
    setExportStatus('正在导出PDF...');
    
    try {
      const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mermaidCode,
          format: 'pdf',
          options: {
            width: 1200,
            height: 800
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setExportStatus('PDF导出成功！正在下载...');
        
        // 触发文件下载
        const downloadLink = document.createElement('a');
        downloadLink.href = result.data.downloadUrl;
        downloadLink.download = result.data.fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setExportStatus('PDF文件已下载！');
      } else {
        throw new Error(result.error || 'PDF导出失败');
      }
    } catch (error) {
      setExportStatus('PDF导出失败: ' + error.message);
      console.error('PDF导出失败:', error);
    }
    
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleCopySource = async (mermaidCode) => {
    try {
      const result = await clipboardService.copyMermaidCode(mermaidCode);
      
      if (result.success) {
        setExportStatus(result.message);
        console.log('复制成功:', result);
      } else {
        setExportStatus(result.message || '复制失败，请手动复制源码');
        console.warn('复制失败:', result);
      }
      
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('复制过程中出现错误');
      setTimeout(() => setExportStatus(''), 3000);
      console.error('复制异常:', error);
    }
  };

  const handleOpenDrawio = async (mermaidCode) => {
    try {
      const result = await drawioService.openDrawioEditor(mermaidCode, {
        width: 1200,
        height: 800
      });
      
      if (result.success) {
        setExportStatus(result.message);
        console.log('Draw.io跳转成功:', result);
      } else {
        setExportStatus(result.message || 'Draw.io跳转失败');
        console.warn('Draw.io跳转失败:', result);
        
        // 如果有降级URL，可以提供手动访问选项
        if (result.fallbackUrl) {
          console.log('降级URL:', result.fallbackUrl);
        }
      }
      
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('Draw.io跳转过程中出现错误');
      setTimeout(() => setExportStatus(''), 3000);
      console.error('Draw.io跳转异常:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            M005 导出功能演示
          </h1>
          <p className="text-gray-600">
            PNG/PDF导出、源码复制、Draw.io集成
          </p>
        </div>

        {/* 流程图选择器 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>选择流程图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {sampleFlowcharts.map((flowchart, index) => (
                <Button
                  key={flowchart.id}
                  variant={selectedFlowchart === index ? 'default' : 'outline'}
                  onClick={() => setSelectedFlowchart(index)}
                  className="flex items-center space-x-2"
                >
                  <span>{flowchart.title}</span>
                  <span className="text-xs opacity-75">
                    ({flowchart.data.nodes}节点)
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 状态显示 */}
        {exportStatus && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-800 font-medium">{exportStatus}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 流程图预览区域 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{currentFlowchart.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {currentFlowchart.data.type}
                  </span>
                  <span>{currentFlowchart.data.nodes} 个节点</span>
                  <span>{currentFlowchart.data.connections} 个连接</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg overflow-hidden">
                  <FlowchartViewer
                    code={currentFlowchart.code}
                    title={currentFlowchart.title}
                    theme="default"
                    showToolbar={true}
                    showStatusBar={true}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 源码预览 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mermaid源码</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{currentFlowchart.code}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* 导出面板 */}
          <div>
            <ExportPanel
              flowchartData={currentFlowchart.data}
              mermaidCode={currentFlowchart.code}
              title="导出操作"
              onExportPNG={handleExportPNG}
              onExportPDF={handleExportPDF}
              onCopySource={handleCopySource}
              onOpenDrawio={handleOpenDrawio}
            />

            {/* 功能说明 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">功能说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">🖼️</span>
                  <div>
                    <div className="font-medium">PNG导出</div>
                    <div className="text-sm text-gray-600">
                      导出高质量PNG图片文件
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-medium">PDF导出</div>
                    <div className="text-sm text-gray-600">
                      导出可打印的PDF文档
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <div className="font-medium">复制源码</div>
                    <div className="text-sm text-gray-600">
                      复制Mermaid代码到剪贴板
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">✏️</span>
                  <div>
                    <div className="font-medium">Draw.io编辑</div>
                    <div className="text-sm text-gray-600">
                      在Draw.io中进行深度编辑
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDemo;
