import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';

/**
 * AI分析结果预览组件
 * 提供详细的分析结果预览和交互功能
 */
const AIResultPreview = ({ 
  result = null,
  onClose = null,
  onCopyCode = null,
  onDownload = null,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // 复制代码到剪贴板
  const handleCopyCode = async () => {
    if (result.mermaid && onCopyCode) {
      try {
        await navigator.clipboard.writeText(result.mermaid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopyCode(result.mermaid);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const tabs = [
    { key: 'summary', label: '分析摘要', icon: '📋' },
    { key: 'dimensions', label: '维度分析', icon: '🎯' },
    { key: 'mermaid', label: 'Mermaid代码', icon: '💻' },
    { key: 'insights', label: '分析洞察', icon: '💡' }
  ];

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">分析结果详情</h2>
            <p className="text-sm text-gray-600 mt-1">
              完整的AI分析结果和业务流程方案
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 分析摘要 */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">产品类型:</span>
                      <span className="font-medium">{result.analysis?.productType || '未指定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">实现方式:</span>
                      <span className="font-medium">{result.analysis?.implementType || '未指定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">复杂度:</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        result.analysis?.complexity === 'low' && 'bg-green-100 text-green-800',
                        result.analysis?.complexity === 'medium' && 'bg-yellow-100 text-yellow-800',
                        result.analysis?.complexity === 'high' && 'bg-red-100 text-red-800'
                      )}>
                        {result.analysis?.complexity === 'low' ? '简单' : 
                         result.analysis?.complexity === 'medium' ? '中等' : '复杂'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">统计信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">分析维度:</span>
                      <span className="font-medium">{result.analysis?.dimensions?.length || 7}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">流程节点:</span>
                      <span className="font-medium">{result.mermaid?.match(/\w+\[.*?\]/g)?.length || 0}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">连接关系:</span>
                      <span className="font-medium">{result.mermaid?.match(/-->/g)?.length || 0}个</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 需求摘要 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">需求摘要</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {result.analysis?.summary || result.requirement || '暂无摘要信息'}
                  </p>
                </div>
              </div>

              {/* 关键特性 */}
              {result.analysis?.features && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">关键特性</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.analysis.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 维度分析 */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">7维度分析结果</h3>
              {result.analysis?.dimensions ? (
                <div className="grid grid-cols-1 gap-4">
                  {result.analysis.dimensions.map((dimension, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium mr-3">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-gray-900">{dimension.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm ml-9">
                        {dimension.description || dimension.analysis || '已完成分析'}
                      </p>
                      {dimension.keyPoints && (
                        <ul className="mt-2 ml-9 space-y-1">
                          {dimension.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-xs text-gray-500 flex items-start">
                              <span className="mr-1">-</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无维度分析数据
                </div>
              )}
            </div>
          )}

          {/* Mermaid代码 */}
          {activeTab === 'mermaid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Mermaid流程图代码</h3>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  disabled={!result.mermaid}
                >
                  {copied ? '已复制!' : '复制代码'}
                </Button>
              </div>
              
              {result.mermaid ? (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {result.mermaid}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无Mermaid代码
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>💡 提示: 复制上述代码可以在Mermaid编辑器中直接使用</p>
              </div>
            </div>
          )}

          {/* 分析洞察 */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 mb-4">AI分析洞察</h3>
              
              {/* 优势分析 */}
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ 优势与亮点</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• 业务流程清晰，逻辑完整</li>
                    <li>• 覆盖了主要的用户场景</li>
                    <li>• 包含了必要的异常处理机制</li>
                  </ul>
                </div>
              </div>

              {/* 风险提醒 */}
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">⚠️ 注意事项</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• 建议在开发前进行详细的技术调研</li>
                    <li>• 需要考虑系统的可扩展性设计</li>
                    <li>• 注意数据安全和隐私保护</li>
                  </ul>
                </div>
              </div>

              {/* 改进建议 */}
              <div>
                <h4 className="font-medium text-blue-700 mb-2">💡 优化建议</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• 可以考虑添加更多的用户反馈机制</li>
                    <li>• 建议实现分阶段的功能发布</li>
                    <li>• 可以集成更多的第三方服务</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            分析完成时间: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            {onDownload && (
              <Button onClick={onDownload} variant="outline">
                <span className="mr-2">💾</span>
                下载报告
              </Button>
            )}
            <Button onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResultPreview;
