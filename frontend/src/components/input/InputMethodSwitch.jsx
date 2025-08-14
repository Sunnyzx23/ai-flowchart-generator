import React from 'react';
import { cn } from '../../utils/cn';

const InputMethodSwitch = ({ value, onChange }) => {
  const options = [
    {
      id: 'text',
      label: '直接输入文本',
      description: '在文本框中直接输入需求描述',
      icon: '📝'
    },
    {
      id: 'file',
      label: '上传需求文档',
      description: '支持 .txt、.md、.pdf、.docx 格式',
      icon: '📄'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={cn(
            'p-4 border-2 rounded-lg text-left transition-all duration-200',
            'hover:border-primary-300 hover:bg-primary-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            value === option.id
              ? 'border-primary-500 bg-primary-50 shadow-sm'
              : 'border-gray-200 bg-white'
          )}
          onClick={() => onChange(option.id)}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{option.icon}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  'font-medium',
                  value === option.id ? 'text-primary-700' : 'text-gray-900'
                )}>
                  {option.label}
                </h3>
                {value === option.id && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
              <p className={cn(
                'text-sm mt-1',
                value === option.id ? 'text-primary-600' : 'text-gray-500'
              )}>
                {option.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default InputMethodSwitch;
