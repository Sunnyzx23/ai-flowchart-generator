import React, { useState } from 'react';
import { 
  FlowchartPreview, 
  FlowchartViewer, 
  FlowchartContainer, 
  FlowchartGrid,
  FlowchartSplitView,
  useFlowchart 
} from '../components/flowchart';
import { Button } from '../components/ui';

/**
 * 流程图演示页面
 * 用于测试Mermaid渲染和流程图预览功能
 */
const FlowchartDemo = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [viewMode, setViewMode] = useState('preview'); // preview, viewer, grid, split
  const flowchart = useFlowchart();

  // 示例流程图代码
  const examples = [
    {
      title: '用户登录流程',
      code: `flowchart TD
    A[用户访问登录页] --> B{是否已登录}
    B -->|是| C[跳转到主页]
    B -->|否| D[显示登录表单]
    D --> E[用户输入账号密码]
    E --> F{输入验证}
    F -->|失败| G[显示错误信息]
    G --> D
    F -->|成功| H[发送登录请求]
    H --> I{服务器验证}
    I -->|失败| J[返回错误信息]
    J --> G
    I -->|成功| K[生成用户Token]
    K --> L[保存登录状态]
    L --> M[跳转到目标页面]
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
    style M fill:#e8f5e8
    style G fill:#ffebee
    style J fill:#ffebee`
    },
    {
      title: '订单处理流程',
      code: `flowchart TD
    A[客户下单] --> B[订单验证]
    B --> C{库存检查}
    C -->|库存充足| D[创建订单]
    C -->|库存不足| E[库存预警]
    E --> F[通知补货]
    F --> G[等待补货]
    G --> C
    D --> H[支付处理]
    H --> I{支付结果}
    I -->|成功| J[订单确认]
    I -->|失败| K[支付失败处理]
    K --> L[取消订单]
    J --> M[发货准备]
    M --> N[物流配送]
    N --> O[订单完成]
    
    style A fill:#e3f2fd
    style O fill:#e8f5e8
    style K fill:#ffebee
    style L fill:#ffebee`
    },
    {
      title: 'AI写作助手流程',
      code: `flowchart TD
    A[用户打开文档] --> B[激活AI助手]
    B --> C[选择写作类型]
    C --> D{输入内容检查}
    D -->|内容完整| E[AI分析需求]
    D -->|内容不足| F[提示补充信息]
    F --> C
    E --> G[生成写作建议]
    G --> H[展示多个方案]
    H --> I{用户选择}
    I -->|采用建议| J[应用到文档]
    I -->|修改建议| K[用户调整]
    I -->|重新生成| E
    K --> L[AI优化调整]
    L --> H
    J --> M[保存文档]
    M --> N[完成写作]
    
    style A fill:#f3e5f5
    style N fill:#e8f5e8
    style F fill:#fff3e0`
    },
    {
      title: '简单决策树',
      code: `flowchart TD
    A[开始] --> B{天气如何?}
    B -->|晴天| C[去公园]
    B -->|雨天| D[在家休息]
    B -->|阴天| E[去购物]
    C --> F[享受阳光]
    D --> G[看书或电影]
    E --> H[买些必需品]
    F --> I[结束]
    G --> I
    H --> I
    
    style A fill:#e1f5fe
    style I fill:#e8f5e8`
    },
    {
      title: '商务流程图',
      code: `graph TD
    A[客户提交需求] --> B[需求分析]
    B --> C{需求可行性}
    C -->|可行| D[制定方案]
    C -->|不可行| E[需求调整]
    E --> B
    D --> F[方案评审]
    F --> G{评审通过}
    G -->|通过| H[项目启动]
    G -->|不通过| I[方案修改]
    I --> F
    H --> J[项目执行]
    J --> K[项目交付]
    K --> L[客户验收]
    L --> M[项目完成]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style M fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
    }
  ];

  // 加载示例
  const loadExample = (index) => {
    setSelectedExample(index);
    flowchart.setCode(examples[index].code);
  };

  // 处理导出
  const handleExport = async (format) => {
    let success = false;
    
    switch (format) {
      case 'svg':
        success = flowchart.exportSVG(`${examples[selectedExample].title}.svg`);
        break;
      case 'png':
        success = await flowchart.exportPNG(`${examples[selectedExample].title}.png`);
        break;
      case 'code':
        success = await flowchart.copyCode();
        break;
    }
    
    if (success) {
      alert(`${format.toUpperCase()}导出成功！`);
    } else {
      alert(`${format.toUpperCase()}导出失败！`);
    }
  };

  // 初始化加载第一个示例
  React.useEffect(() => {
    if (examples.length > 0) {
      loadExample(0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            流程图预览演示
          </h1>
          <p className="text-gray-600">
            测试Mermaid.js渲染和流程图预览功能
          </p>
          
          {/* 视图模式切换 */}
          <div className="flex justify-center mt-6">
            <div className="bg-white p-1 rounded-lg border inline-flex">
              {[
                { key: 'preview', label: '预览模式' },
                { key: 'viewer', label: '查看器' },
                { key: 'grid', label: '网格布局' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === mode.key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏 - 示例选择 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">示例流程图</h2>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedExample === index
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm">{example.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {example.code.split('\n').length} 行代码
                    </div>
                  </button>
                ))}
              </div>

              {/* 统计信息 */}
              {flowchart.hasCode && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-sm mb-2">统计信息</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    {(() => {
                      const stats = flowchart.getStats();
                      return (
                        <>
                          <div>代码长度: {stats?.codeLength}</div>
                          <div>节点数量: {stats?.nodeCount}</div>
                          <div>连接数量: {stats?.connectionCount}</div>
                          <div>当前主题: {stats?.theme}</div>
                          <div>缩放比例: {Math.round((stats?.scale || 1) * 100)}%</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <Button
                  onClick={() => handleExport('svg')}
                  disabled={!flowchart.canExport}
                  className="w-full"
                  size="sm"
                >
                  导出SVG
                </Button>
                <Button
                  onClick={() => handleExport('png')}
                  disabled={!flowchart.canExport}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  导出PNG
                </Button>
                <Button
                  onClick={() => handleExport('code')}
                  disabled={!flowchart.hasCode}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  复制代码
                </Button>
              </div>

              {/* 缩放控制 */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-sm mb-2">缩放控制</h3>
                <div className="flex space-x-1">
                  <Button
                    onClick={() => flowchart.zoom(1.2)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    放大
                  </Button>
                  <Button
                    onClick={() => flowchart.zoom(0.8)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    缩小
                  </Button>
                  <Button
                    onClick={flowchart.resetZoom}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    重置
                  </Button>
                </div>
                <Button
                  onClick={flowchart.fitToScreen}
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                >
                  适应屏幕
                </Button>
              </div>
            </div>
          </div>

          {/* 主内容区 - 流程图预览 */}
          <div className="lg:col-span-3">
            {viewMode === 'preview' && (
              <FlowchartPreview
                code={flowchart.code}
                title={examples[selectedExample]?.title || '流程图预览'}
                onExport={(svg, format) => handleExport(format)}
                onEdit={() => alert('编辑功能待开发')}
                onFullscreen={(isFullscreen) => console.log('全屏状态:', isFullscreen)}
                className="h-[600px]"
              />
            )}

            {viewMode === 'viewer' && (
              <FlowchartViewer
                code={flowchart.code}
                title={examples[selectedExample]?.title || '流程图查看器'}
                onEdit={() => alert('编辑功能待开发')}
                onShare={(type) => alert(`分享类型: ${type}`)}
                showToolbar={true}
                showStatusBar={true}
                toolbarLayout="horizontal"
                className="h-[600px]"
              />
            )}

            {viewMode === 'grid' && (
              <FlowchartGrid
                items={examples.map((example, index) => ({
                  id: index,
                  content: (
                    <FlowchartContainer
                      responsive={true}
                      aspectRatio="16:9"
                    >
                      <FlowchartViewer
                        code={example.code}
                        title={example.title}
                        showToolbar={false}
                        showStatusBar={false}
                        autoFit={true}
                      />
                    </FlowchartContainer>
                  )
                }))}
                columns="auto"
                gap={4}
                className="min-h-[600px]"
              />
            )}

            {/* 代码预览区 */}
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Mermaid代码</h3>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded overflow-x-auto">
                  {flowchart.code || '// 暂无代码'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">渲染功能</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Mermaid.js集成渲染</li>
                <li>• 4种主题支持</li>
                <li>• 自适应容器尺寸</li>
                <li>• 渲染错误处理</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">交互功能</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 缩放和平移控制</li>
                <li>• 全屏预览模式</li>
                <li>• 主题切换</li>
                <li>• 适应屏幕功能</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">导出功能</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• SVG格式导出</li>
                <li>• PNG格式导出</li>
                <li>• 代码复制功能</li>
                <li>• 统计信息展示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartDemo;
