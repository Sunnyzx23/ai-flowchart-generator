import { NextRequest, NextResponse } from 'next/server';

// Vercel Functions标准导出格式
export default async function handler(req, res) {
  // 标准CORS设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 设置CORS头
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed. Use POST.' 
    });
  }

  try {
    // Vercel Functions自动解析JSON请求体
    const { requirements, productType = '通用', implementType = '通用' } = req.body || {};

    // 输入验证
    if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '需求描述不能为空'
      });
    }

    // 环境变量验证
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API Key未配置');
      return res.status(500).json({
        success: false,
        error: '服务配置错误，请联系管理员'
      });
    }

    console.log('开始AI分析，需求:', requirements.substring(0, 100) + '...');

    // 构建AI提示词
    const systemPrompt = `你是一个专业的业务流程分析师和Mermaid流程图专家。

任务：根据用户需求生成准确的Mermaid流程图代码。

要求：
1. 仔细分析用户需求，理解业务流程
2. 生成完整、准确的flowchart TD格式的Mermaid代码
3. 包含关键步骤、决策点、异常处理
4. 节点命名清晰，逻辑合理
5. 考虑${productType}产品特点和${implementType}实现方式
6. 直接返回Mermaid代码，不要包含说明文字或代码块标记

示例格式：
flowchart TD
    A[开始] --> B[具体步骤]
    B --> C{判断条件}
    C -->|是| D[处理路径1]
    C -->|否| E[处理路径2]
    D --> F[结束]
    E --> F`;

    const userPrompt = `请为以下需求生成详细的业务流程图：

需求描述：${requirements}
产品类型：${productType}
实现方式：${implementType}

请生成对应的Mermaid flowchart TD代码。`;

    // 调用DeepSeek API
    const apiResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEFAULT_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('DeepSeek API错误:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      throw new Error(`DeepSeek API调用失败: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();

    // 验证API响应格式
    if (!apiData.choices || !apiData.choices[0] || !apiData.choices[0].message) {
      console.error('DeepSeek API响应格式异常:', apiData);
      throw new Error('AI服务响应格式异常');
    }

    let mermaidCode = apiData.choices[0].message.content.trim();
    
    // 清理和标准化Mermaid代码
    mermaidCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^mermaid\n?/g, '')
      .trim();

    // 确保代码以flowchart开头
    if (!mermaidCode.toLowerCase().includes('flowchart')) {
      mermaidCode = `flowchart TD\n${mermaidCode}`;
    }

    // 基本的Mermaid语法验证
    if (!mermaidCode.includes('-->') && !mermaidCode.includes('---')) {
      throw new Error('生成的流程图代码格式异常');
    }

    console.log('AI分析完成，生成流程图节点数:', (mermaidCode.match(/\[.*?\]/g) || []).length);

    // 返回标准化响应
    return res.status(200).json({
      success: true,
      mermaidCode: mermaidCode,
      fullResponse: apiData.choices[0].message.content,
      metadata: {
        requirements: requirements.substring(0, 200) + (requirements.length > 200 ? '...' : ''),
        productType,
        implementType,
        generatedAt: new Date().toISOString(),
        model: apiData.model || 'deepseek-chat',
        usage: apiData.usage
      }
    });

  } catch (error) {
    console.error('AI分析处理错误:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 根据错误类型返回不同的错误信息
    if (error.message.includes('DeepSeek API')) {
      return res.status(503).json({
        success: false,
        error: 'AI服务暂时不可用，请稍后重试',
        details: error.message
      });
    }

    if (error.message.includes('生成的流程图代码格式异常')) {
      return res.status(422).json({
        success: false,
        error: 'AI生成的流程图格式有误，请重新尝试',
        details: error.message
      });
    }

    // 通用错误
    return res.status(500).json({
      success: false,
      error: '服务器处理错误，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}