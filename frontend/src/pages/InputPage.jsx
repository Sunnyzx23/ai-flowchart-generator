import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import RequirementInputForm from '../components/input/RequirementInputForm';

const InputPage = () => {
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
    // TODO: 调用API发送数据到后端
  };

  return (
    <Layout>
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

        {/* 使用提示 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              💡 使用提示
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>文本输入</strong>：直接描述您的业务需求，建议不少于10个字</li>
              <li>• <strong>文件上传</strong>：支持拖拽或点击上传，最大文件大小10MB</li>
              <li>• <strong>产品形态</strong>：选择您要设计流程图的目标产品类型</li>
              <li>• <strong>实现方式</strong>：选择功能的技术实现方案，AI会据此优化流程设计</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InputPage;
