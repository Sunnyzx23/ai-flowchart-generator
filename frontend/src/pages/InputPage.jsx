import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import RequirementInputForm from '../components/input/RequirementInputForm';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import AIAnalysisProgress from '../components/ai/AIAnalysisProgress';
import AIErrorAlert from '../components/ai/AIErrorAlert';

const InputPage = ({ onNavigate, currentPage, onResult }) => {
  const progressRef = useRef(null);
  const [inputData, setInputData] = useState({
    content: '',
    productType: '',
    implementType: '',
    inputMethod: 'text' // 'text' or 'file'
  });

  // 使用AI分析Hook
  const {
    status,
    progress,
    message,
    result,
    error,
    isLoading,
    isCompleted,
    isError,
    startAnalysis,
    resetAnalysis,
    retryAnalysis
  } = useAIAnalysis();

  const handleInputChange = (newData) => {
    setInputData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (data) => {
    console.log('提交数据:', data);
    
    try {
      // 启动AI分析，用户停留在当前页面看loading
      await startAnalysis({
        requirements: data.content,  // 🔧 修复字段名：requirement -> requirements
        productType: data.productType,
        implementType: data.implementType,
        inputMethod: data.inputMethod
      });
      
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  // 监听loading状态变化，自动滚动到进度条区域
  useEffect(() => {
    if (isLoading) {
      console.log('检测到loading状态，准备滚动到进度条区域');
      
      // 多次尝试滚动，确保成功
      const attemptScroll = (attempt = 1) => {
        if (progressRef.current) {
          console.log(`第${attempt}次尝试滚动到进度条区域`);
          progressRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        } else if (attempt < 5) {
          // 如果ref还没准备好，继续尝试
          console.log(`第${attempt}次尝试失败，progressRef.current为空，将在${100 * attempt}ms后重试`);
          setTimeout(() => attemptScroll(attempt + 1), 100 * attempt);
        } else {
          console.warn('5次尝试后仍无法找到progressRef，尝试备用滚动方法');
          // 备用方法：滚动到页面底部
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // 立即尝试一次，然后延迟尝试
      attemptScroll();
      const scrollTimer = setTimeout(() => attemptScroll(2), 200);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [isLoading]);

  // 监听分析完成事件
  useEffect(() => {
    if (isCompleted && result) {
      console.log('AI分析完成:', result);
      if (onResult) {
        onResult(result);
      }
      // 分析完成后自动跳转到结果页面
      if (onNavigate) {
        onNavigate('result');
      }
    }
  }, [isCompleted, result, onResult, onNavigate]);



  // 重试处理
  const handleRetry = () => {
    retryAnalysis({
      requirements: inputData.content,  // 🔧 修复字段名：requirement -> requirements
      productType: inputData.productType,
      implementType: inputData.implementType,
      inputMethod: inputData.inputMethod
    });
  };

  return (
    <Layout onNavigate={onNavigate} currentPage={currentPage}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            需求输入
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            请输入您的业务需求，选择产品形态和实现方式，AI将为您生成专业的流程图
          </p>
        </div>

        {/* 主要内容卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>业务需求描述</CardTitle>
            <CardDescription>
              支持直接文本输入或上传需求文档（.txt、.md、.pdf、.docx格式）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequirementInputForm
              data={inputData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isSubmitting={isLoading}
            />
          </CardContent>
        </Card>

        {/* AI分析进度显示 */}
        {isLoading && (
          <Card ref={progressRef}>
            <CardContent className="pt-6">
              <AIAnalysisProgress
                status={status}
                progress={progress}
                message={message}
                onCancel={resetAnalysis}
              />
            </CardContent>
          </Card>
        )}

        {/* 错误处理 */}
        {isError && error && (
          <AIErrorAlert
            error={error}
            onRetry={handleRetry}
            onDismiss={resetAnalysis}
          />
        )}


      </div>
    </Layout>
  );
};

export default InputPage;
