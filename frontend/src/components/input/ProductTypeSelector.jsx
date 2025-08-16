import React from 'react';
import { cn } from '../../utils/cn';

const ProductTypeSelector = ({ value, onChange, error }) => {
  const productTypes = [
    {
      id: 'web',
      name: 'Web端应用',
      icon: '🌐'
    },
    {
      id: 'plugin',
      name: '插件端应用',
      icon: '🔌'
    },
    {
      id: 'desktop',
      name: '桌面端应用',
      icon: '💻'
    },
    {
      id: 'mobile',
      name: '移动端应用',
      icon: '📱'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {productTypes.map((type) => (
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
  );
};

export default ProductTypeSelector;
