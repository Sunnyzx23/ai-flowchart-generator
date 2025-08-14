import React, { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { cn } from '../../utils/cn';

/**
 * 导出操作面板组件
 * 提供PNG、PDF、源码复制、Draw.io跳转四个核心功能
 */
const ExportPanel = ({ 
  flowchartData = null, 
  mermaidCode = '', 
  title = '流程图导出',
  onExportPNG = () => {},
  onExportPDF = () => {},
  onCopySource = () => {},
  onOpenDrawio = () => {},
  className = ''
}) => {
  const [loadingStates, setLoadingStates] = useState({
    png: false,
    pdf: false,
    copy: false,
    drawio: false
  });

  const [copySuccess, setCopySuccess] = useState(false);

  // 检查是否有可导出的数据
  const hasFlowchartData = flowchartData && mermaidCode;
  const isDisabled = !hasFlowchartData;

  // 处理导出PNG
  const handleExportPNG = async () => {
    if (isDisabled) return;
    
    setLoadingStates(prev => ({ ...prev, png: true }));
    try {
      await onExportPNG(flowchartData, mermaidCode);
    } catch (error) {
      console.error('PNG导出失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, png: false }));
    }
  };

  // 处理导出PDF
  const handleExportPDF = async () => {
    if (isDisabled) return;
    
    setLoadingStates(prev => ({ ...prev, pdf: true }));
    try {
      await onExportPDF(flowchartData, mermaidCode);
    } catch (error) {
      console.error('PDF导出失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, pdf: false }));
    }
  };

  // 处理源码复制
  const handleCopySource = async () => {
    if (isDisabled) return;
    
    setLoadingStates(prev => ({ ...prev, copy: true }));
    setCopySuccess(false);
    
    try {
      await onCopySource(mermaidCode);
      setCopySuccess(true);
      
      // 3秒后重置成功状态
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('源码复制失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, copy: false }));
    }
  };

  // 处理Draw.io跳转
  const handleOpenDrawio = async () => {
    if (isDisabled) return;
    
    setLoadingStates(prev => ({ ...prev, drawio: true }));
    try {
      await onOpenDrawio(mermaidCode);
    } catch (error) {
      console.error('Draw.io跳转失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, drawio: false }));
    }
  };

  // 按钮配置
  const exportButtons = [
    {
      id: 'png',
      label: 'PNG导出',
      icon: '🖼️',
      description: '导出为PNG图片',
      onClick: handleExportPNG,
      loading: loadingStates.png,
      variant: 'default',
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      id: 'pdf',
      label: 'PDF导出',
      icon: '📄',
      description: '导出为PDF文档',
      onClick: handleExportPDF,
      loading: loadingStates.pdf,
      variant: 'default',
      className: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      id: 'copy',
      label: copySuccess ? '已复制' : '复制源码',
      icon: copySuccess ? '✅' : '📋',
      description: '复制Mermaid源码',
      onClick: handleCopySource,
      loading: loadingStates.copy,
      variant: 'outline',
      className: copySuccess 
        ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100' 
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
    },
    {
      id: 'drawio',
      label: 'Draw.io编辑',
      icon: '✏️',
      description: '在Draw.io中编辑',
      onClick: handleOpenDrawio,
      loading: loadingStates.drawio,
      variant: 'outline',
      className: 'border-purple-300 text-purple-700 hover:bg-purple-50'
    }
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-xl">📤</span>
          <span>{title}</span>
        </CardTitle>
        {!hasFlowchartData && (
          <p className="text-sm text-gray-500">
            请先生成流程图后再进行导出操作
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* 桌面端布局：2x2网格 */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          {exportButtons.map((button) => (
            <ExportButton
              key={button.id}
              {...button}
              disabled={isDisabled}
            />
          ))}
        </div>

        {/* 移动端布局：垂直排列 */}
        <div className="md:hidden space-y-3">
          {exportButtons.map((button) => (
            <ExportButton
              key={button.id}
              {...button}
              disabled={isDisabled}
              fullWidth
            />
          ))}
        </div>

        {/* 状态信息 */}
        {hasFlowchartData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>流程图数据:</span>
                <span className="text-green-600">✓ 已就绪</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>源码长度:</span>
                <span>{mermaidCode.length} 字符</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 导出按钮子组件
 */
const ExportButton = ({ 
  id, 
  label, 
  icon, 
  description, 
  onClick, 
  loading = false, 
  disabled = false,
  variant = 'default',
  className = '',
  fullWidth = false 
}) => {
  return (
    <Button
      variant={variant}
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex flex-col items-center space-y-2 h-auto py-4 px-6 transition-all duration-200',
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">处理中...</span>
        </div>
      ) : (
        <>
          <span className="text-2xl">{icon}</span>
          <div className="text-center">
            <div className="font-medium">{label}</div>
            <div className="text-xs opacity-80">{description}</div>
          </div>
        </>
      )}
    </Button>
  );
};

export default ExportPanel;
