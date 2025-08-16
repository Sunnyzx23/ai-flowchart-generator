import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { cn } from '../../utils/cn';
import InputMethodSwitch from './InputMethodSwitch';
import TextInputArea from './TextInputArea';
import FileUploadArea from './FileUploadArea';
import ProductTypeSelector from './ProductTypeSelector';
import ImplementTypeSelector from './ImplementTypeSelector';

const RequirementInputForm = ({ data, onChange, onSubmit, isSubmitting: externalIsSubmitting }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 使用外部传入的loading状态，如果有的话
  const submitLoading = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;

  // 验证表单数据
  const validateForm = () => {
    const newErrors = {};

    // 验证需求内容
    if (!data.content || data.content.trim().length < 10) {
      newErrors.content = '需求描述不能少于10个字符';
    }

    // 验证产品形态
    if (!data.productType) {
      newErrors.productType = '请选择产品形态';
    }

    // 验证实现方式
    if (!data.implementType) {
      newErrors.implementType = '请选择实现方式';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入方法切换
  const handleInputMethodChange = (method) => {
    onChange({ 
      inputMethod: method,
      content: '' // 切换时清空内容
    });
    setErrors({}); // 清空错误
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 如果没有外部loading状态管理，使用内部状态
    if (externalIsSubmitting === undefined) {
      setIsSubmitting(true);
    }
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('提交失败:', error);
      setErrors({ submit: '提交失败，请重试' });
    } finally {
      if (externalIsSubmitting === undefined) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 输入方式切换 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          输入方式
        </label>
        <InputMethodSwitch
          value={data.inputMethod}
          onChange={handleInputMethodChange}
        />
      </div>

      {/* 需求内容输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          需求描述 <span className="text-red-500">*</span>
        </label>
        
        {data.inputMethod === 'text' ? (
          <TextInputArea
            value={data.content}
            onChange={(content) => onChange({ content })}
            error={errors.content}
          />
        ) : (
          <FileUploadArea
            onFileContent={(content, filename) => onChange({ 
              content, 
              filename 
            })}
            error={errors.content}
          />
        )}
        
        {errors.content && (
          <p className="mt-2 text-sm text-red-600">
            {errors.content}
          </p>
        )}
      </div>

      {/* 产品形态选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          目标产品形态 <span className="text-red-500">*</span>
        </label>
        <ProductTypeSelector
          value={data.productType}
          onChange={(productType) => onChange({ productType })}
          error={errors.productType}
        />
        {errors.productType && (
          <p className="mt-2 text-sm text-red-600">
            {errors.productType}
          </p>
        )}
      </div>

      {/* 实现方式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          实现方式 <span className="text-red-500">*</span>
        </label>
        <ImplementTypeSelector
          value={data.implementType}
          onChange={(implementType) => onChange({ implementType })}
          error={errors.implementType}
        />
        {errors.implementType && (
          <p className="mt-2 text-sm text-red-600">
            {errors.implementType}
          </p>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            onChange({
              content: '',
              productType: '',
              implementType: '',
              filename: ''
            });
            setErrors({});
          }}
        >
          重置
        </Button>
        <Button
          type="submit"
          loading={submitLoading}
          disabled={submitLoading}
        >
          {submitLoading ? '生成中...' : '生成流程图'}
        </Button>
      </div>

      {/* 提交错误提示 */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {errors.submit}
          </p>
        </div>
      )}
    </form>
  );
};

export default RequirementInputForm;
