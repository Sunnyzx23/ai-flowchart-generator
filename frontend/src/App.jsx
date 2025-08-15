import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import InputPage from './pages/InputPage';
import FlowchartResult from './pages/FlowchartResult';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui';

function App() {
  const [currentPage, setCurrentPage] = useState('input'); // 'input' | 'result'
  const [flowchartResult, setFlowchartResult] = useState(null);

  if (currentPage === 'input') {
    return <InputPage onNavigate={setCurrentPage} currentPage={currentPage} onResult={(result) => {
      setFlowchartResult(result);
      setCurrentPage('result');
    }} />;
  }

  if (currentPage === 'result') {
    return <FlowchartResult 
      onNavigate={setCurrentPage} 
      currentPage={currentPage} 
      resultData={flowchartResult}
      onBack={() => setCurrentPage('input')}
    />;
  }

  return (
    <Layout onNavigate={setCurrentPage} currentPage={currentPage}>
      <div className="space-y-8">
        {/* 欢迎区域 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            将文字需求转化为专业流程图
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            面向产品经理和营销人员的智能业务流程图生成工具，通过AI技术快速生成开发可直接实现的详细流程图
          </p>
        </div>

        {/* 功能演示卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📝 需求输入</CardTitle>
              <CardDescription>
                支持文本输入或文件上传，自动解析需求内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 文本框直接输入</li>
                <li>• 支持 .txt、.docx、.pdf、.md</li>
                <li>• 产品形态选择</li>
                <li>• 实现方式选择</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI智能分析</CardTitle>
              <CardDescription>
                基于7个维度进行深度分析，生成完整业务逻辑
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 功能触发分析</li>
                <li>• 权限验证流程</li>
                <li>• 核心业务逻辑</li>
                <li>• 异常处理设计</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 流程图生成</CardTitle>
              <CardDescription>
                生成Mermaid格式流程图，支持多种导出方式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 交互式预览</li>
                <li>• PNG/PDF导出</li>
                <li>• 源码复制</li>
                <li>• Draw.io编辑</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮区域 */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => setCurrentPage('input')}
          >
            开始创建流程图
          </Button>
        </div>

        {/* 状态展示 */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-green-600 font-medium">✅ 前端基础架构已完成</div>
              <div className="text-sm text-green-700 mt-2">
                React + Vite + Tailwind CSS + 基础UI组件已就绪
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default App;