import React from 'react';
import { cn } from '../../utils/cn';

const TextInputArea = ({ value, onChange, error }) => {
  const maxLength = 5000;
  const minLength = 10;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getCharacterCountColor = () => {
    const length = value.length;
    if (length < minLength) return 'text-red-500';
    if (length > maxLength * 0.9) return 'text-orange-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-3">
      {/* 文本输入框 */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="请详细描述您的业务需求，例如：
• 功能描述：用户在WPS文档中使用AI写作助手功能
• 触发场景：用户点击工具栏的AI写作按钮
• 预期结果：生成符合用户要求的文档内容
• 特殊要求：需要支持多种写作风格选择

建议提供越详细的描述，生成的流程图越准确..."
          className={cn(
            'w-full h-40 p-4 border rounded-lg resize-none',
            'placeholder:text-gray-400 placeholder:text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-200',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
          )}
        />
        
        {/* 字符计数 */}
        <div className="absolute bottom-3 right-3 text-xs">
          <span className={getCharacterCountColor()}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* 输入提示和状态 */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          {/* 最小字符提示 */}
          <div className={cn(
            'flex items-center space-x-1',
            value.length >= minLength ? 'text-green-600' : 'text-gray-500'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              value.length >= minLength ? 'bg-green-500' : 'bg-gray-300'
            )}></span>
            <span>至少{minLength}个字符</span>
          </div>

          {/* 建议字符提示 */}
          <div className={cn(
            'flex items-center space-x-1',
            value.length >= 50 ? 'text-green-600' : 'text-gray-500'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              value.length >= 50 ? 'bg-green-500' : 'bg-gray-300'
            )}></span>
            <span>建议50字以上</span>
          </div>
        </div>

        {/* 输入长度状态 */}
        {value.length > 0 && (
          <div className="text-xs text-gray-500">
            {value.length < minLength && (
              <span className="text-red-500">
                还需 {minLength - value.length} 个字符
              </span>
            )}
            {value.length >= minLength && value.length < 50 && (
              <span className="text-orange-500">
                建议再补充 {50 - value.length} 个字符
              </span>
            )}
            {value.length >= 50 && (
              <span className="text-green-500">
                描述充分 ✓
              </span>
            )}
          </div>
        )}
      </div>

      {/* 写作建议 */}
      {value.length === 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💡 写作建议
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 详细描述功能的使用场景和触发条件</li>
            <li>• 说明用户操作步骤和系统响应</li>
            <li>• 包含异常情况和错误处理要求</li>
            <li>• 提及相关的权限和商业化逻辑</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TextInputArea;
