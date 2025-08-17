// AI分析API - 使用专业提示词配置
import promptSimple from './config/prompt-simple.json';
import promptFull from './config/prompt.json';

export default async function handler(req, res) {
  // 标准CORS设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed. Use POST.' 
    });
  }

  try {
    const { requirements, productType = '通用', implementType = '通用' } = req.body || {};

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

    // 选择提示词配置（优先使用简化版本以提高稳定性）
    const promptConfig = promptSimple;
    
    console.log(`使用提示词配置: ${promptConfig.version} - ${promptConfig.description}`);
    console.log('开始AI分析，需求:', requirements.substring(0, 100) + '...');

    // 使用配置文件中的专业提示词
    const systemPrompt = promptConfig.systemRole;
    
    // 根据模板构建用户提示词
    const userPrompt = promptConfig.template
      .replace('{requirement}', requirements)
      .replace('{productType}', productType)
      .replace('{implementType}', implementType);

    console.log('系统提示词:', systemPrompt);
    console.log('用户提示词:', userPrompt.substring(0, 200) + '...');

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

    if (!apiData.choices || !apiData.choices[0] || !apiData.choices[0].message) {
      console.error('DeepSeek API响应格式异常:', apiData);
      throw new Error('AI服务响应格式异常');
    }

    let mermaidCode = apiData.choices[0].message.content.trim();
    const fullResponse = mermaidCode;
    
    // 清理和提取Mermaid代码（根据配置文件的输出要求）
    mermaidCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^mermaid\n?/g, '')
      .trim();

    // 确保代码符合配置文件中的输出要求
    if (!mermaidCode.toLowerCase().includes('flowchart')) {
      mermaidCode = `flowchart TD\n${mermaidCode}`;
    }

    // 根据配置文件进行基本验证
    if (!mermaidCode.includes('-->') && !mermaidCode.includes('---')) {
      console.warn('生成的流程图可能不符合Mermaid语法标准');
    }

    // 统计生成的流程图复杂度
    const nodeCount = (mermaidCode.match(/\[.*?\]|\{.*?\}|\(\(.*?\)\)/g) || []).length;
    const connectionCount = (mermaidCode.match(/-->/g) || []).length;
    
    console.log(`AI分析完成 - 节点数: ${nodeCount}, 连接数: ${connectionCount}`);

    // 返回标准化响应
    return res.status(200).json({
      success: true,
      mermaidCode: mermaidCode,
      fullResponse: fullResponse,
      metadata: {
        requirements: requirements.substring(0, 200) + (requirements.length > 200 ? '...' : ''),
        productType,
        implementType,
        promptVersion: promptConfig.version,
        promptDescription: promptConfig.description,
        generatedAt: new Date().toISOString(),
        model: apiData.model || 'deepseek-chat',
        usage: apiData.usage,
        complexity: {
          nodeCount,
          connectionCount
        }
      }
    });

  } catch (error) {
    console.error('AI分析处理错误:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 分类错误处理
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

    return res.status(500).json({
      success: false,
      error: '服务器处理错误，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}