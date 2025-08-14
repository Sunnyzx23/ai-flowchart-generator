import React from 'react';
import { cn } from '../../utils/cn';

const ProductTypeSelector = ({ value, onChange, error }) => {
  const productTypes = [
    {
      id: 'web',
      name: 'Web端应用',
      description: '浏览器访问的网页应用',
      icon: '🌐',
      examples: '如：在线文档编辑器、管理后台、SaaS平台'
    },
    {
      id: 'plugin',
      name: '插件端应用',
      description: '浏览器插件或编辑器插件',
      icon: '🔌',
      examples: '如：Chrome扩展、VS Code插件、WPS插件'
    },
    {
      id: 'desktop',
      name: '桌面端应用',
      description: 'PC/Mac桌面应用程序',
      icon: '💻',
      examples: '如：WPS Office、Photoshop、客户端软件'
    },
    {
      id: 'mobile',
      name: '移动端应用',
      description: '手机/平板移动应用',
      icon: '📱',
      examples: '如：iOS/Android App、小程序、H5应用'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productTypes.map((type) => (
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
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">{type.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    'font-medium text-sm',
                    value === type.id ? 'text-primary-700' : 'text-gray-900'
                  )}>
                    {type.name}
                  </h3>
                  {value === type.id && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                <p className={cn(
                  'text-xs mt-1',
                  value === type.id ? 'text-primary-600' : 'text-gray-500'
                )}>
                  {type.description}
                </p>
                <p className={cn(
                  'text-xs mt-2 italic',
                  value === type.id ? 'text-primary-500' : 'text-gray-400'
                )}>
                  {type.examples}
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
            💡 <strong>选择提示：</strong>请选择您要设计流程图的目标产品类型，这将影响AI生成的业务逻辑和交互流程
          </p>
        </div>
      )}

      {/* 选择确认 */}
      {value && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ 已选择：<strong>{productTypes.find(t => t.id === value)?.name}</strong> - 
            AI将基于此产品形态优化流程设计
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductTypeSelector;
