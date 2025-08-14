import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button, Input } from '../ui';

/**
 * AI分析错误反馈组件
 * 用户可以提交错误反馈和建议
 */
const AIErrorFeedback = ({ 
  error = null,
  onSubmit = null,
  onCancel = null,
  className = '',
  isOpen = false
}) => {
  const [feedback, setFeedback] = useState({
    description: '',
    email: '',
    category: 'bug',
    severity: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'bug', label: '程序错误' },
    { value: 'performance', label: '性能问题' },
    { value: 'ui', label: '界面问题' },
    { value: 'feature', label: '功能建议' },
    { value: 'other', label: '其他' }
  ];

  const severities = [
    { value: 'low', label: '轻微', color: 'text-green-600' },
    { value: 'medium', label: '一般', color: 'text-yellow-600' },
    { value: 'high', label: '严重', color: 'text-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        ...feedback,
        error: error ? {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        } : null,
        timestamp: new Date().toISOString()
      };

      if (onSubmit) {
        await onSubmit(feedbackData);
      }

      setSubmitted(true);
      
      // 2秒后自动关闭
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({
          description: '',
          email: '',
          category: 'bug',
          severity: 'medium'
        });
        onCancel?.();
      }, 2000);

    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className={cn(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        className
      )}>
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            反馈已提交
          </h3>
          <p className="text-gray-600 text-sm">
            感谢您的反馈，我们会尽快处理
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              问题反馈
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            请描述您遇到的问题，我们会尽快修复
          </p>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 问题描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题描述 *
            </label>
            <textarea
              value={feedback.description}
              onChange={(e) => setFeedback(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="请详细描述您遇到的问题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* 问题类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题类型
            </label>
            <select
              value={feedback.category}
              onChange={(e) => setFeedback(prev => ({ 
                ...prev, 
                category: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* 严重程度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              严重程度
            </label>
            <div className="flex space-x-3">
              {severities.map(severity => (
                <label key={severity.value} className="flex items-center">
                  <input
                    type="radio"
                    name="severity"
                    value={severity.value}
                    checked={feedback.severity === severity.value}
                    onChange={(e) => setFeedback(prev => ({ 
                      ...prev, 
                      severity: e.target.value 
                    }))}
                    className="mr-2"
                  />
                  <span className={cn('text-sm', severity.color)}>
                    {severity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 联系邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系邮箱（可选）
            </label>
            <Input
              type="email"
              value={feedback.email}
              onChange={(e) => setFeedback(prev => ({ 
                ...prev, 
                email: e.target.value 
              }))}
              placeholder="your@email.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              如需回复，请留下您的邮箱
            </p>
          </div>

          {/* 错误信息（如果有） */}
          {error && (
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-xs text-gray-500 mb-1">错误信息：</p>
              <p className="text-xs text-gray-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !feedback.description.trim()}
              className="flex-1"
            >
              {isSubmitting ? '提交中...' : '提交反馈'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIErrorFeedback;
