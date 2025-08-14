import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui';
import { flowchartThemes, nodeStyles, edgeStyles, flowchartTypes } from './FlowchartThemes';

/**
 * 流程图样式编辑器组件
 * 允许用户自定义流程图的样式和主题
 */
const FlowchartStyleEditor = ({
  currentTheme = 'default',
  currentType = 'flowchart',
  onThemeChange = null,
  onTypeChange = null,
  onStyleApply = null,
  className = '',
  isOpen = false,
  onClose = null
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedType, setSelectedType] = useState(currentType);
  const [customStyles, setCustomStyles] = useState({
    nodeSpacing: 50,
    rankSpacing: 80,
    fontSize: 14,
    fontFamily: 'system-ui'
  });

  if (!isOpen) return null;

  // 应用样式
  const handleApplyStyles = () => {
    onThemeChange?.(selectedTheme);
    onTypeChange?.(selectedType);
    onStyleApply?.(customStyles);
    onClose?.();
  };

  // 重置样式
  const handleReset = () => {
    setSelectedTheme('default');
    setSelectedType('flowchart');
    setCustomStyles({
      nodeSpacing: 50,
      rankSpacing: 80,
      fontSize: 14,
      fontFamily: 'system-ui'
    });
  };

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">流程图样式编辑器</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 主题选择 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">选择主题</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(flowchartThemes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    selectedTheme === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{theme.name}</h4>
                    {selectedTheme === key && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                  
                  {/* 主题颜色预览 */}
                  <div className="flex space-x-2 mt-3">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.config.themeVariables.primaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.config.themeVariables.cScale1 || theme.config.themeVariables.secondaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.config.themeVariables.cScale2 || theme.config.themeVariables.tertiaryColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 流程图类型选择 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">流程图类型</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(flowchartTypes).map(([key, type]) => (
                <div
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    selectedType === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{type.name}</h4>
                    {selectedType === key && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {type.syntax}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* 自定义样式设置 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">自定义设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  节点间距
                </label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={customStyles.nodeSpacing}
                  onChange={(e) => setCustomStyles(prev => ({
                    ...prev,
                    nodeSpacing: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {customStyles.nodeSpacing}px
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  层级间距
                </label>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={customStyles.rankSpacing}
                  onChange={(e) => setCustomStyles(prev => ({
                    ...prev,
                    rankSpacing: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {customStyles.rankSpacing}px
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体大小
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={customStyles.fontSize}
                  onChange={(e) => setCustomStyles(prev => ({
                    ...prev,
                    fontSize: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {customStyles.fontSize}px
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体族
                </label>
                <select
                  value={customStyles.fontFamily}
                  onChange={(e) => setCustomStyles(prev => ({
                    ...prev,
                    fontFamily: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system-ui">System UI</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>
          </div>

          {/* 节点样式预览 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">节点样式预览</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(nodeStyles).map(([key, style]) => (
                <div key={key} className="text-center">
                  <div className="w-16 h-10 mx-auto mb-2 border rounded flex items-center justify-center text-xs font-medium"
                       style={{ backgroundColor: style.style.match(/fill:(#[^,;]+)/)?.[1] || '#f3f4f6' }}>
                    {key}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            onClick={handleReset}
            variant="outline"
          >
            重置默认
          </Button>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
            >
              取消
            </Button>
            <Button
              onClick={handleApplyStyles}
              className="bg-blue-600 hover:bg-blue-700"
            >
              应用样式
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartStyleEditor;
