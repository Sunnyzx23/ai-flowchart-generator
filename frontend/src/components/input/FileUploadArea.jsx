import React, { useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { getApiUrl } from '../../config/api.js';

const FileUploadArea = ({ onFileContent, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // 支持的文件类型
  const supportedTypes = ['.txt', '.md', '.pdf', '.docx'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // 验证文件
  const validateFile = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    if (!supportedTypes.includes(fileExtension)) {
      throw new Error(`不支持的文件格式。支持的格式：${supportedTypes.join(', ')}`);
    }
    
    if (file.size > maxFileSize) {
      throw new Error('文件大小超过限制（最大10MB）');
    }
    
    return true;
  };

  // 处理文件上传
  const handleFileUpload = async (file) => {
    try {
      validateFile(file);
      setIsUploading(true);
      
      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productType', 'web'); // 临时值，实际会从表单获取
      formData.append('implementType', 'ai'); // 临时值，实际会从表单获取

      // 调用后端API
      const response = await fetch(getApiUrl('/api/upload/file'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '文件上传失败');
      }

      const result = await response.json();
      
      // 设置上传成功状态
      setUploadedFile({
        name: file.name,
        size: file.size,
        content: result.data.content
      });
      
      // 回调文件内容
      onFileContent(result.data.content, file.name);
      
    } catch (error) {
      console.error('文件上传失败:', error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 拖拽事件处理
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 点击选择文件
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 重新上传
  const handleReUpload = () => {
    setUploadedFile(null);
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* 文件上传区域 */}
      {!uploadedFile ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
            'hover:border-primary-400 hover:bg-primary-50',
            isDragOver 
              ? 'border-primary-500 bg-primary-100' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-gray-50',
            isUploading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
              <p className="text-sm text-gray-600">正在上传和解析文件...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 上传图标 */}
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>

              {/* 上传提示 */}
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  拖拽文件到这里，或者
                  <button
                    type="button"
                    className="ml-1 text-primary-600 hover:text-primary-700 font-medium underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    点击选择文件
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  支持 {supportedTypes.join(', ')} 格式，最大 10MB
                </p>
              </div>

              {/* 文件格式说明 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
                {[
                  { ext: '.txt', desc: '纯文本文件' },
                  { ext: '.md', desc: 'Markdown文档' },
                  { ext: '.pdf', desc: 'PDF文档' },
                  { ext: '.docx', desc: 'Word文档' }
                ].map((type) => (
                  <div key={type.ext} className="text-center">
                    <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {type.ext}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 上传成功显示 */
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800 mb-1">
                文件上传成功
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>文件名：</strong>{uploadedFile.name}</p>
                <p><strong>文件大小：</strong>{formatFileSize(uploadedFile.size)}</p>
                <p><strong>解析内容：</strong>{uploadedFile.content.length} 个字符</p>
              </div>
              
              {/* 内容预览 */}
              {uploadedFile.content && (
                <div className="mt-3 p-3 bg-white border border-green-200 rounded text-sm">
                  <p className="text-green-700 font-medium mb-2">内容预览：</p>
                  <p className="text-gray-700 line-clamp-3">
                    {uploadedFile.content.substring(0, 200)}
                    {uploadedFile.content.length > 200 && '...'}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleReUpload}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              重新上传
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
