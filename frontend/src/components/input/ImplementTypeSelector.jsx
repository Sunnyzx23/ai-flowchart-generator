import React from 'react';
import { cn } from '../../utils/cn';

const ImplementTypeSelector = ({ value, onChange, error }) => {
  const implementTypes = [
    {
      id: 'ai',
      name: 'AI能力实现',
      description: '需要集成人工智能技术',
      icon: '🤖',
      features: ['智能分析', 'AI模型调用', '结果处理', '降级方案'],
      examples: 'AI写作、智能推荐、内容生成、语音识别等'
    },
    {
      id: 'traditional',
      name: '传统功能实现',
      description: '使用传统技术方案',
      icon: '⚙️',
      features: ['常规逻辑', '数据处理', '界面交互', '状态管理'],
      examples: '表单提交、数据查询、文件操作、用户管理等'
    },
    {
      id: 'unknown',
      name: '不确定',
      description: 'AI分析建议最佳实现方式',
      icon: '🤔',
      features: ['智能分析', '方案推荐', '技术选型', '实现建议'],
      examples: 'AI会根据需求特点推荐最适合的技术实现方案'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4">
        {implementTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={cn(
              'p-4 border-2 rounded-lg text-left transition-all duration-200',
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
            <div className="flex items-start space-x-4">
              <span className="text-2xl flex-shrink-0">{type.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(
                    'font-medium',
                    value === type.id ? 'text-primary-700' : 'text-gray-900'
                  )}>
                    {type.name}
                  </h3>
                  {value === type.id && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                
                <p className={cn(
                  'text-sm mb-3',
                  value === type.id ? 'text-primary-600' : 'text-gray-600'
                )}>
                  {type.description}
                </p>

                {/* 特性标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {type.features.map((feature) => (
                    <span
                      key={feature}
                      className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        value === type.id 
                          ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 示例说明 */}
                <p className={cn(
                  'text-xs italic',
                  value === type.id ? 'text-primary-500' : 'text-gray-400'
                )}>
                  <strong>适用场景：</strong>{type.examples}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 选择提示 */}
      {!value && !error && (
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

      {/* 选择确认 */}
      {value && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ 已选择：<strong>{implementTypes.find(t => t.id === value)?.name}</strong>
          </p>
          <p className="text-sm text-green-600 mt-1">
            AI将基于此实现方式设计相应的技术流程和处理逻辑
          </p>
        </div>
      )}
    </div>
  );
};

export default ImplementTypeSelector;
