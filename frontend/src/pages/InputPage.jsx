import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import RequirementInputForm from '../components/input/RequirementInputForm';

const InputPage = ({ onNavigate, currentPage, onResult }) => {
  const [inputData, setInputData] = useState({
    content: '',
    productType: '',
    implementType: '',
    inputMethod: 'text' // 'text' or 'file'
  });

  const handleInputChange = (newData) => {
    setInputData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (data) => {
    console.log('提交数据:', data);
    
    try {
      // 调用AI分析API
      const response = await fetch('http://localhost:3001/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirement: data.content,
          productType: data.productType,
          implementType: data.implementType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI分析结果:', result);

      if (result.success) {
        // 成功后跳转到结果页面
        if (onResult) {
          onResult(result);
        } else {
          alert('流程图生成成功！请查看控制台了解详情');
        }
      } else {
        throw new Error(result.error?.message || '分析失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败: ' + error.message);
    }
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
            />
          </CardContent>
        </Card>


      </div>
    </Layout>
  );
};

export default InputPage;
