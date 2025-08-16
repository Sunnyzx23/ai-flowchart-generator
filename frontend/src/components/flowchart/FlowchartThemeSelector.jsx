import React, { useState } from 'react';
import { Button } from '../ui';

/**
 * 流程图主题选择器
 */
const FlowchartThemeSelector = ({ onThemeChange, currentTheme = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'default',
      name: '默认主题',
      description: '清新蓝色，适合商务场景',
      preview: '#e1f5fe',
      config: {
        theme: 'base',
        themeVariables: {
          primaryColor: '#e1f5fe',
          primaryTextColor: '#1a365d',
          primaryBorderColor: '#0ea5e9',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#64748b',
          arrowheadColor: '#475569',
          background: '#ffffff',
          mainBkg: '#f8fafc',
          secondBkg: '#e2e8f0',
          tertiaryBkg: '#f1f5f9',
          textColor: '#1e293b',
          titleColor: '#0f172a',
          nodeBorder: '#cbd5e1',
          tertiaryColor: '#dcfce7',
          tertiaryBorderColor: '#16a34a',
          tertiaryTextColor: '#15803d'
        }
      }
    },
    {
      id: 'forest',
      name: '森林主题',
      description: '绿色自然，环保清新',
      preview: '#dcfce7',
      config: {
        theme: 'forest',
        themeVariables: {
          primaryColor: '#dcfce7',
          primaryTextColor: '#14532d',
          primaryBorderColor: '#16a34a',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#16a34a',
          arrowheadColor: '#15803d',
          background: '#ffffff',
          mainBkg: '#f0fdf4',
          secondBkg: '#dcfce7',
          tertiaryBkg: '#bbf7d0',
          textColor: '#14532d',
          titleColor: '#052e16',
          nodeBorder: '#16a34a',
          tertiaryColor: '#fef3c7',
          tertiaryBorderColor: '#f59e0b',
          tertiaryTextColor: '#92400e'
        }
      }
    },
    {
      id: 'dark',
      name: '深色主题',
      description: '深色优雅，护眼舒适',
      preview: '#374151',
      config: {
        theme: 'dark',
        themeVariables: {
          primaryColor: '#374151',
          primaryTextColor: '#f9fafb',
          primaryBorderColor: '#6b7280',
          cScale0: '#fbbf24',
          cScale1: '#f59e0b',
          cScale2: '#d97706',
          lineColor: '#9ca3af',
          arrowheadColor: '#d1d5db',
          background: '#1f2937',
          mainBkg: '#374151',
          secondBkg: '#4b5563',
          tertiaryBkg: '#6b7280',
          textColor: '#f9fafb',
          titleColor: '#ffffff',
          nodeBorder: '#6b7280',
          tertiaryColor: '#065f46',
          tertiaryBorderColor: '#10b981',
          tertiaryTextColor: '#d1fae5'
        }
      }
    },
    {
      id: 'neutral',
      name: '中性主题',
      description: '灰色简约，专业稳重',
      preview: '#f3f4f6',
      config: {
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#f3f4f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#6b7280',
          cScale0: '#fef3c7',
          cScale1: '#fbbf24',
          cScale2: '#f59e0b',
          lineColor: '#6b7280',
          arrowheadColor: '#4b5563',
          background: '#ffffff',
          mainBkg: '#f9fafb',
          secondBkg: '#f3f4f6',
          tertiaryBkg: '#e5e7eb',
          textColor: '#1f2937',
          titleColor: '#111827',
          nodeBorder: '#d1d5db',
          tertiaryColor: '#ddd6fe',
          tertiaryBorderColor: '#8b5cf6',
          tertiaryTextColor: '#5b21b6'
        }
      }
    }
  ];

  const handleThemeSelect = (theme) => {
    onThemeChange?.(theme);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        title="更换主题"
      >
        <div 
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: currentThemeData.preview }}
        />
        <span className="hidden sm:inline">{currentThemeData.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 主题选择面板 */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">选择主题</h3>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: theme.preview }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {theme.name}
                          {currentTheme === theme.id && (
                            <span className="ml-2 text-blue-600">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {theme.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FlowchartThemeSelector;
