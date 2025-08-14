import React, { useState, useEffect } from 'react';
import { 
  AIAnalysisLoader, 
  AIAnalysisProgress, 
  AIErrorHandler,
  AIErrorAlert,
  AIErrorFeedback,
  AIAnalysisResult,
  AIResultPreview,
  useAIAnalysis,
  useErrorRecovery,
  useAnalysisResult
} from '../components/ai';
import { Button } from '../components/ui';

/**
 * AI分析演示页面
 * 用于测试AI分析Loading组件的各种状态
 */
const AIAnalysisDemo = () => {
  const [demoMode, setDemoMode] = useState('loader'); // loader, progress, hook, error, result
  const [currentStatus, setCurrentStatus] = useState('preparing');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const aiAnalysis = useAIAnalysis();
  const errorRecovery = useErrorRecovery();
  const analysisResult = useAnalysisResult();

  // 模拟分析状态切换
  const statusFlow = ['preparing', 'analyzing', 'generating', 'optimizing', 'completing'];
  
  useEffect(() => {
    let interval;
    
    if (isRunning) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5 + 2;
          
          // 根据进度更新状态
          if (newProgress < 15) setCurrentStatus('preparing');
          else if (newProgress < 40) setCurrentStatus('analyzing');
          else if (newProgress < 70) setCurrentStatus('generating');
          else if (newProgress < 90) setCurrentStatus('optimizing');
          else setCurrentStatus('completing');
          
          if (newProgress >= 100) {
            setIsRunning(false);
            return 100;
          }
          
          return newProgress;
        });
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const startDemo = () => {
    setProgress(0);
    setCurrentStatus('preparing');
    setIsRunning(true);
  };

  const stopDemo = () => {
    setIsRunning(false);
  };

  const resetDemo = () => {
    setProgress(0);
    setCurrentStatus('preparing');
    setIsRunning(false);
  };

  // 测试Hook模式
  const testHookAnalysis = async () => {
    const testData = {
      requirement: '用户登录系统',
      productType: 'web_app',
      implementType: 'mvp'
    };
    
    await aiAnalysis.startAnalysis(testData);
  };

  // 模拟不同类型的错误
  const simulateError = (type) => {
    const errors = {
      network: new Error('网络连接失败，请检查网络设置'),
      timeout: new Error('AI分析超时，请尝试简化需求描述'),
      validation: new Error('输入内容格式不正确，请检查需求描述'),
      api_error: new Error('AI服务暂时不可用，请稍后重试'),
      quota_exceeded: new Error('今日分析次数已达上限'),
      file_error: new Error('文件解析失败，请检查文件格式')
    };
    
    const error = errors[type] || errors.network;
    error.code = type === 'timeout' ? 'TIMEOUT' : type === 'quota_exceeded' ? 429 : 'ERROR';
    
    errorRecovery.setError(error, type);
  };

  // 模拟错误恢复
  const simulateRecovery = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('操作成功');
      }, 1000);
    });
  };

  // 模拟分析结果
  const mockAnalysisResult = {
    analysis: {
      productType: 'web_app',
      implementType: 'mvp',
      complexity: 'medium',
      summary: '这是一个用户登录系统的需求分析，包含了用户注册、登录、密码重置等核心功能。系统需要支持邮箱和手机号两种登录方式，并具备基础的安全防护措施。',
      dimensions: [
        { 
          name: '功能触发分析', 
          description: '用户可通过登录页面、注册页面等入口触发相关功能',
          keyPoints: ['用户主动访问登录页', '系统重定向到登录页', '第三方登录入口']
        },
        { 
          name: '权限验证分析', 
          description: '需要验证用户身份，检查账户状态，确保安全性',
          keyPoints: ['用户名密码验证', '账户状态检查', 'Token生成和验证']
        },
        { 
          name: '核心业务逻辑分析', 
          description: '包含登录验证、会话管理、权限控制等核心逻辑',
          keyPoints: ['登录流程', '会话管理', '权限分配']
        },
        { 
          name: 'AI能力调用分析', 
          description: '可集成智能验证码、风险识别等AI能力',
          keyPoints: ['智能验证码', '异常行为检测', '风险评估']
        },
        { 
          name: '商业化逻辑分析', 
          description: '考虑会员等级、付费功能等商业化要素',
          keyPoints: ['会员体系', '付费功能', '使用限制']
        },
        { 
          name: '交互反馈分析', 
          description: '提供清晰的用户反馈和状态提示',
          keyPoints: ['登录状态提示', '错误信息展示', '成功跳转']
        },
        { 
          name: '异常处理分析', 
          description: '处理登录失败、网络异常等各种异常情况',
          keyPoints: ['登录失败处理', '网络异常处理', '系统维护提示']
        }
      ],
      features: [
        '邮箱/手机号登录',
        '第三方登录集成',
        '密码加密存储',
        '登录状态保持',
        '异常登录检测',
        '密码重置功能'
      ]
    },
    mermaid: `flowchart TD
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
    style J fill:#ffebee`,
    requirement: '用户登录系统需求分析',
    timestamp: new Date().toISOString()
  };

  // 生成模拟结果
  const generateMockResult = () => {
    analysisResult.setResult(mockAnalysisResult, 23);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI分析Loading组件演示
          </h1>
          <p className="text-gray-600">
            测试不同的Loading状态和进度反馈效果
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg border inline-flex">
            {[
              { key: 'loader', label: '基础Loading' },
              { key: 'progress', label: '进度组件' },
              { key: 'hook', label: 'Hook测试' },
              { key: 'error', label: '错误处理' },
              { key: 'result', label: '结果展示' }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setDemoMode(mode.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  demoMode === mode.key
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* 演示区域 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {demoMode === 'loader' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-6">基础Loading组件</h2>
              
              {/* 不同状态展示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statusFlow.map(status => (
                  <div key={status} className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                      状态: {status}
                    </h3>
                    <AIAnalysisLoader 
                      status={status}
                      progress={status === currentStatus ? progress : Math.random() * 100}
                      showTimer={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {demoMode === 'progress' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-6">进度组件演示</h2>
              
              {/* 控制按钮 */}
              <div className="flex justify-center space-x-4 mb-6">
                <Button 
                  onClick={startDemo} 
                  disabled={isRunning}
                  className="bg-green-500 hover:bg-green-600"
                >
                  开始演示
                </Button>
                <Button 
                  onClick={stopDemo} 
                  disabled={!isRunning}
                  variant="outline"
                >
                  暂停
                </Button>
                <Button 
                  onClick={resetDemo} 
                  variant="outline"
                >
                  重置
                </Button>
              </div>

              {/* 完整进度组件 */}
              <AIAnalysisProgress
                status={currentStatus}
                progress={progress}
                message={`正在执行 ${currentStatus} 阶段...`}
                analysisTime={isRunning ? Math.floor(progress / 2) : 0}
                onCancel={stopDemo}
                showSteps={true}
                showStats={true}
              />

              {/* 紧凑模式 */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">紧凑模式</h3>
                <AIAnalysisProgress
                  status={currentStatus}
                  progress={progress}
                  message="简化显示模式"
                  onCancel={stopDemo}
                  compact={true}
                />
              </div>
            </div>
          )}

          {demoMode === 'hook' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-6">Hook测试</h2>
              
              {/* Hook状态显示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">当前状态:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>状态: {aiAnalysis.status}</p>
                  <p>进度: {Math.round(aiAnalysis.progress)}%</p>
                  <p>会话ID: {aiAnalysis.sessionId || '无'}</p>
                  <p>分析时间: {aiAnalysis.analysisTime}秒</p>
                  {aiAnalysis.error && (
                    <p className="text-red-600">错误: {aiAnalysis.error}</p>
                  )}
                </div>
              </div>

              {/* Hook控制按钮 */}
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={testHookAnalysis}
                  disabled={aiAnalysis.isLoading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  开始分析
                </Button>
                <Button 
                  onClick={aiAnalysis.cancelAnalysis}
                  disabled={!aiAnalysis.isLoading}
                  variant="outline"
                >
                  取消分析
                </Button>
                <Button 
                  onClick={aiAnalysis.resetAnalysis}
                  variant="outline"
                >
                  重置状态
                </Button>
              </div>

              {/* Hook状态组件展示 */}
              {aiAnalysis.isLoading && (
                <AIAnalysisProgress
                  status={aiAnalysis.status}
                  progress={aiAnalysis.progress}
                  message={aiAnalysis.message}
                  analysisTime={aiAnalysis.analysisTime}
                  onCancel={aiAnalysis.cancelAnalysis}
                />
              )}

              {aiAnalysis.isCompleted && aiAnalysis.result && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="text-green-800 font-medium mb-2">分析完成!</h3>
                  <pre className="text-sm text-green-700 bg-green-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(aiAnalysis.result, null, 2)}
                  </pre>
                </div>
              )}

              {aiAnalysis.isError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="text-red-800 font-medium mb-2">分析失败</h3>
                  <p className="text-red-700">{aiAnalysis.error}</p>
                </div>
              )}
            </div>
          )}

          {demoMode === 'error' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-6">错误处理演示</h2>
              
              {/* 错误类型按钮 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  { key: 'network', label: '网络错误', icon: '🌐' },
                  { key: 'timeout', label: '超时错误', icon: '⏱️' },
                  { key: 'validation', label: '验证错误', icon: '⚠️' },
                  { key: 'api_error', label: 'API错误', icon: '🤖' },
                  { key: 'quota_exceeded', label: '配额超限', icon: '📊' },
                  { key: 'file_error', label: '文件错误', icon: '📄' }
                ].map(errorType => (
                  <Button
                    key={errorType.key}
                    onClick={() => simulateError(errorType.key)}
                    variant="outline"
                    className="text-left"
                  >
                    <span className="mr-2">{errorType.icon}</span>
                    {errorType.label}
                  </Button>
                ))}
              </div>

              {/* 错误状态显示 */}
              {errorRecovery.hasError && (
                <div className="space-y-4">
                  {/* 完整错误处理组件 */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">完整错误处理组件</h3>
                    <AIErrorHandler
                      error={errorRecovery.error}
                      errorType={errorRecovery.errorType}
                      onRetry={() => errorRecovery.retry(simulateRecovery)}
                      onCancel={errorRecovery.clearError}
                      onFeedback={() => setShowFeedback(true)}
                      showDetails={true}
                      retryCount={errorRecovery.retryCount}
                    />
                  </div>

                  {/* 简洁错误提示 */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">简洁错误提示</h3>
                    
                    {/* 默认样式 */}
                    <AIErrorAlert
                      error={errorRecovery.error}
                      errorType={errorRecovery.errorType}
                      onRetry={() => errorRecovery.retry(simulateRecovery)}
                      onClose={errorRecovery.clearError}
                    />

                    {/* 紧凑样式 */}
                    <AIErrorAlert
                      error={errorRecovery.error}
                      errorType={errorRecovery.errorType}
                      onRetry={() => errorRecovery.retry(simulateRecovery)}
                      onClose={errorRecovery.clearError}
                      variant="compact"
                    />

                    {/* 横幅样式 */}
                    <AIErrorAlert
                      error={errorRecovery.error}
                      errorType={errorRecovery.errorType}
                      onRetry={() => errorRecovery.retry(simulateRecovery)}
                      onClose={errorRecovery.clearError}
                      variant="banner"
                    />
                  </div>
                </div>
              )}

              {/* 错误恢复状态 */}
              {!errorRecovery.hasError && (
                <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-800 font-medium">没有错误</p>
                  <p className="text-green-600 text-sm">点击上方按钮模拟不同类型的错误</p>
                </div>
              )}

              {/* 错误恢复Hook状态信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">错误恢复Hook状态:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>有错误: {errorRecovery.hasError ? '是' : '否'}</p>
                  <p>错误类型: {errorRecovery.errorType}</p>
                  <p>重试次数: {errorRecovery.retryCount}</p>
                  <p>可以重试: {errorRecovery.canRetry ? '是' : '否'}</p>
                  <p>正在重试: {errorRecovery.isRetrying ? '是' : '否'}</p>
                </div>
              </div>
            </div>
          )}

          {demoMode === 'result' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-6">结果展示演示</h2>
              
              {/* 控制按钮 */}
              <div className="flex justify-center space-x-4 mb-6">
                <Button 
                  onClick={generateMockResult}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  生成模拟结果
                </Button>
                <Button 
                  onClick={analysisResult.clearResult}
                  variant="outline"
                >
                  清除结果
                </Button>
                <Button 
                  onClick={analysisResult.showPreview}
                  variant="outline"
                  disabled={!analysisResult.hasResult}
                >
                  显示详细预览
                </Button>
              </div>

              {/* 结果展示组件 */}
              {analysisResult.hasResult && (
                <AIAnalysisResult
                  result={analysisResult.result}
                  analysisTime={analysisResult.analysisTime}
                  onGenerateFlowchart={() => alert('跳转到流程图预览页面')}
                  onReAnalyze={() => {
                    analysisResult.clearResult();
                    alert('重新开始分析');
                  }}
                  onExport={() => {
                    analysisResult.exportResult('json')
                      .then(() => alert('导出成功'))
                      .catch(error => alert('导出失败: ' + error.message));
                  }}
                  showAnimation={true}
                />
              )}

              {/* 无结果状态 */}
              {!analysisResult.hasResult && (
                <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600 font-medium">暂无分析结果</p>
                  <p className="text-gray-500 text-sm mt-1">点击"生成模拟结果"查看展示效果</p>
                </div>
              )}

              {/* 结果统计信息 */}
              {analysisResult.hasResult && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">结果统计信息:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {(() => {
                      const stats = analysisResult.getResultStats();
                      return (
                        <>
                          <p>分析耗时: {stats?.analysisTime}秒</p>
                          <p>分析维度: {stats?.dimensions}个</p>
                          <p>流程节点: {stats?.nodes}个</p>
                          <p>连接关系: {stats?.connections}个</p>
                          <p>复杂度: {stats?.complexity}</p>
                          <p>代码长度: {stats?.codeLength}字符</p>
                          <p>生成时间: {analysisResult.timestamp?.toLocaleString()}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Hook操作测试 */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Hook操作测试</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => analysisResult.copyToClipboard('mermaid')
                      .then(() => alert('Mermaid代码已复制'))
                      .catch(error => alert('复制失败: ' + error.message))
                    }
                    variant="outline"
                    size="sm"
                    disabled={!analysisResult.hasResult}
                  >
                    复制代码
                  </Button>
                  <Button
                    onClick={() => analysisResult.exportResult('txt')
                      .then(() => alert('文本导出成功'))
                      .catch(error => alert('导出失败: ' + error.message))
                    }
                    variant="outline"
                    size="sm"
                    disabled={!analysisResult.hasResult}
                  >
                    导出文本
                  </Button>
                  <Button
                    onClick={() => analysisResult.shareResult()
                      .then(() => alert('分享成功'))
                      .catch(error => alert('分享失败: ' + error.message))
                    }
                    variant="outline"
                    size="sm"
                    disabled={!analysisResult.hasResult}
                  >
                    分享结果
                  </Button>
                  <Button
                    onClick={() => {
                      const validation = analysisResult.validateResult(analysisResult.result);
                      alert(`验证结果: ${validation.isValid ? '通过' : '失败'}\n问题: ${validation.issues.join(', ')}`);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={!analysisResult.hasResult}
                  >
                    验证结果
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 说明文档 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">组件说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Loading组件</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• AIAnalysisLoader - 基础Loading</li>
                <li>• AIAnalysisProgress - 完整进度</li>
                <li>• 支持5种分析状态</li>
                <li>• 步骤指示器和时间统计</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-600 mb-2">错误处理组件</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• AIErrorHandler - 完整错误处理</li>
                <li>• AIErrorAlert - 简洁错误提示</li>
                <li>• AIErrorFeedback - 错误反馈</li>
                <li>• 支持6种错误类型</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">状态管理Hook</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• useAIAnalysis - AI分析状态</li>
                <li>• useErrorRecovery - 错误恢复</li>
                <li>• useAnalysisResult - 结果管理</li>
                <li>• 完整生命周期管理</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">结果展示组件</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• AIAnalysisResult - 结果展示</li>
                <li>• AIResultPreview - 详细预览</li>
                <li>• 统计信息和操作按钮</li>
                <li>• 导出和分享功能</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 错误反馈对话框 */}
        <AIErrorFeedback
          error={errorRecovery.error}
          isOpen={showFeedback}
          onSubmit={async (feedbackData) => {
            console.log('提交反馈:', feedbackData);
            // 这里可以调用API提交反馈
          }}
          onCancel={() => setShowFeedback(false)}
        />

        {/* 结果详细预览对话框 */}
        <AIResultPreview
          result={analysisResult.result}
          onClose={analysisResult.hidePreview}
          onCopyCode={(code) => {
            console.log('复制代码:', code);
          }}
          onDownload={() => {
            analysisResult.exportResult('json')
              .then(() => alert('下载成功'))
              .catch(error => alert('下载失败: ' + error.message));
          }}
        />
      </div>
    </div>
  );
};

export default AIAnalysisDemo;
