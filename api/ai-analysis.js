// AI分析API - 完整版本，集成DeepSeek AI
export default async function handler(req, res) {
  // 保持与hello.js相同的简单CORS设置（已验证工作）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 验证POST方法
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      receivedMethod: req.method,
      expectedMethod: 'POST'
    });
  }

  try {
    // 解析请求数据
    const { requirements, productType, implementType } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: '需求描述不能为空'
      });
    }

    // 检查环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'DeepSeek API Key未配置'
      });
    }

    console.log('开始AI分析，需求:', requirements);

    // 调用DeepSeek API
    const apiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.DEFAULT_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的业务流程分析师。请根据用户的需求描述，生成详细的Mermaid流程图。

产品类型：${productType || '通用'}
实现方式：${implementType || '通用'}

请直接返回Mermaid代码，格式如下：
flowchart TD
    A[步骤1] --> B[步骤2]
    B --> C[步骤3]

要求：
1. 使用flowchart TD格式
2. 节点名称要清晰明确
3. 包含主要的业务流程步骤
4. 考虑异常处理和分支逻辑
5. 只返回Mermaid代码，不要包含其他说明文字`
          },
          {
            role: 'user',
            content: requirements
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('DeepSeek API错误:', apiResponse.status, errorText);
      throw new Error(`DeepSeek API调用失败: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('DeepSeek API响应格式异常');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('AI响应:', aiResponse);
    
    // 提取并清理Mermaid代码
    let mermaidCode = aiResponse.trim();
    
    // 移除可能的markdown代码块标记
    mermaidCode = mermaidCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
    
    // 确保以flowchart开头
    if (!mermaidCode.includes('flowchart')) {
      mermaidCode = `flowchart TD\n${mermaidCode}`;
    }

    console.log('处理后的Mermaid代码:', mermaidCode);

    // 返回前端期望的数据结构
    return res.status(200).json({
      success: true,
      mermaidCode: mermaidCode.trim(),
      fullResponse: aiResponse,
      debug: {
        requirements,
        productType,
        implementType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI分析处理错误:', error);
    
    // 如果AI调用失败，返回基础的流程图作为后备
    const fallbackMermaidCode = `flowchart TD
    A[开始: ${req.body?.requirements || '用户需求'}] --> B[需求分析]
    B --> C[方案设计]
    C --> D[实施执行]
    D --> E[测试验证]
    E --> F[部署上线]
    F --> G[结束]`;

    return res.status(200).json({
      success: true,
      mermaidCode: fallbackMermaidCode,
      fullResponse: `AI分析遇到问题，返回基础流程图。错误：${error.message}`,
      debug: {
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      }
    });
  }
}