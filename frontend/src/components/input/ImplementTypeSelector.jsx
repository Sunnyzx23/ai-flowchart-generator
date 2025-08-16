import React from 'react';
import { cn } from '../../utils/cn';

const ImplementTypeSelector = ({ value, onChange, error }) => {
  const implementTypes = [
    {
      id: 'ai',
      name: 'AI能力实现',
      icon: '🤖'
    },
    {
      id: 'traditional',
      name: '传统功能实现',
      icon: '⚙️'
    },
    {
      id: 'unknown',
      name: '不确定',
      icon: '🤔'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {implementTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={cn(
              'p-3 border-2 rounded-lg text-center transition-all duration-200',
              'hover:border-primary-300 hover:bg-primary-50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              value === type.id
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : error 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white'
            )}
            onClick={() => onChange(type.id)}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xl">{type.icon}</span>
              <h3 className={cn(
                'font-medium text-sm',
                value === type.id ? 'text-primary-700' : 'text-gray-900'
              )}>
                {type.name}
              </h3>
            </div>
          </button>
        ))}
      </div>
      
      {/* 选择建议 */}
      {!value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>选择建议：</strong>
          </p>
          <ul className="text-sm text-blue-600 mt-2 space-y-1">
            <li>• <strong>AI能力实现</strong>：功能需要智能分析、内容生成、模式识别等AI技术</li>
            <li>• <strong>传统功能实现</strong>：功能主要是数据处理、界面交互、业务逻辑等</li>
            <li>• <strong>不确定</strong>：让AI根据需求特点推荐最适合的实现方案</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImplementTypeSelector;
