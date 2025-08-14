import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui';

/**
 * AI分析结果展示组件
 * 展示分析完成后的结果信息和操作选项
 */
const AIAnalysisResult = ({ 
  result = null,
  analysisTime = 0,
  onGenerateFlowchart = null,
  onReAnalyze = null,
  onExport = null,
  className = '',
  showAnimation = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 入场动画
  useEffect(() => {
    if (result && showAnimation) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else if (result) {
      setIsVisible(true);
    }
  }, [result, showAnimation]);

  if (!result) return null;

  // 格式化时间
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 获取分析统计信息
  const getAnalysisStats = () => {
    return {
      dimensions: result.analysis?.dimensions?.length || 7,
      nodes: result.mermaid?.match(/\w+\[.*?\]/g)?.length || 0,
      connections: result.mermaid?.match(/-->/g)?.length || 0,
      complexity: result.analysis?.complexity || 'medium'
    };
  };

  const stats = getAnalysisStats();

  return (
    <div className={cn(
      'w-full max-w-4xl mx-auto transition-all duration-500 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      className
    )}>
      {/* 成功状态标题 */}
      <div className="text-center mb-6">
        <div className={cn(
          'inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 transition-all duration-300',
          isVisible ? 'scale-100' : 'scale-0'
        )}>
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI分析完成
        </h2>
        <p className="text-gray-600">
          已成功分析您的需求并生成业务流程方案
        </p>
      </div>

      {/* 统计信息卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{formatTime(analysisTime)}</div>
            <div className="text-sm text-gray-500">分析耗时</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.dimensions}</div>
            <div className="text-sm text-gray-500">分析维度</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.nodes}</div>
            <div className="text-sm text-gray-500">流程节点</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.connections}</div>
            <div className="text-sm text-gray-500">连接关系</div>
          </CardContent>
        </Card>
      </div>

      {/* 分析结果摘要 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>分析摘要</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails ? '收起详情' : '查看详情'}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 基础摘要 */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">需求类型</h4>
              <p className="text-gray-600 text-sm">
                {result.analysis?.productType || '未指定'} - {result.analysis?.implementType || '未指定'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-1">复杂度评估</h4>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  stats.complexity === 'low' && 'bg-green-100 text-green-800',
                  stats.complexity === 'medium' && 'bg-yellow-100 text-yellow-800',
                  stats.complexity === 'high' && 'bg-red-100 text-red-800'
                )}>
                  {stats.complexity === 'low' ? '简单' : 
                   stats.complexity === 'medium' ? '中等' : '复杂'}
                </span>
                <span className="text-gray-500 text-sm">
                  预计开发周期: {stats.complexity === 'low' ? '1-2周' : 
                                stats.complexity === 'medium' ? '2-4周' : '4-8周'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">核心功能点</h4>
              <p className="text-gray-600 text-sm">
                {result.analysis?.summary || '已识别主要业务流程和关键节点'}
              </p>
            </div>
          </div>

          {/* 详细信息 */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t space-y-4">
              {/* 7维度分析结果 */}
              {result.analysis?.dimensions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">7维度分析结果</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.analysis.dimensions.map((dimension, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {dimension.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {dimension.description || '已完成分析'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mermaid代码预览 */}
              {result.mermaid && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">流程图代码预览</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <pre>{result.mermaid.substring(0, 300)}...</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 生成流程图 */}
        <Button 
          size="lg" 
          onClick={onGenerateFlowchart}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <span className="mr-2">📊</span>
          生成流程图
        </Button>

        {/* 重新分析 */}
        <Button 
          size="lg" 
          variant="outline"
          onClick={onReAnalyze}
        >
          <span className="mr-2">🔄</span>
          重新分析
        </Button>

        {/* 导出选项 */}
        <div className="relative">
          <Button 
            size="lg" 
            variant="outline"
            onClick={onExport}
            className="w-full"
          >
            <span className="mr-2">💾</span>
            导出结果
          </Button>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          点击"生成流程图"查看可视化结果，或选择导出保存分析结果
        </p>
      </div>
    </div>
  );
};

export default AIAnalysisResult;
