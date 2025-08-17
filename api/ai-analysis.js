// 【2.3节】Mermaid代码清理和修复函数
function cleanMermaidCode(mermaidCode) {
  console.log('开始清理Mermaid代码，原始长度:', mermaidCode.length);
  
  const cleaned = mermaidCode
    // 移除可能导致解析错误的特殊字符
    .replace(/\|{3,}/g, '|')  // 多个|符号简化为单个
    .replace(/--{3,}/g, '--') // 多个-符号简化为双个
    .replace(/={3,}/g, '==') // 多个=符号简化为双个
    
    // 修复节点语法 - 确保括号配对正确
    .replace(/\(\(([^)]+)\)\)/g, '(($1))') // 确保双括号节点格式正确
    .replace(/\{([^}]+)\}/g, '{$1}') // 确保花括号节点格式正确
    
    // 处理长文本 - 截断过长的节点标签
    .replace(/\[([^\]]{40,})\]/g, (match, text) => {
      const shortText = text.substring(0, 30).trim();
      return `[${shortText}...]`;
    })
    .replace(/\(([^)]{40,})\)/g, (match, text) => {
      const shortText = text.substring(0, 30).trim();
      return `(${shortText}...)`;
    })
    
    // 清理连接符号
    .replace(/\s*-->\s*/g, ' --> ') // 标准化箭头连接
    .replace(/\s*---\s*/g, ' --- ') // 标准化线条连接
    
    // 移除空行和多余空格
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    
    // 移除可能导致语法错误的特殊字符序列
    .replace(/\|\s*-{3,}\s*\|/g, '|---|') // 修复表格式语法
    .replace(/\s*\|\s*\|\s*/g, ' | '); // 修复多重管道符号

  console.log('Mermaid代码清理完成，清理后长度:', cleaned.length);
  return cleaned;
}

// AI分析API - 使用安全的配置读取方式
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
    // 【6.8节】正确解析请求体 - 解决400 Bad Request
    let requestBody;
    try {
      requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return res.status(400).json({
        success: false,
        error: '请求数据格式错误，请检查JSON格式',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

    // 验证请求体存在
    if (!requestBody) {
      return res.status(400).json({
        success: false,
        error: '请求体不能为空'
      });
    }

    const { requirements, productType = '通用', implementType = '通用' } = requestBody;

    // 【6.8节】完善字段验证
    if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '需求描述不能为空',
        received: typeof requirements
      });
    }

    if (requirements.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: '需求描述至少需要10个字符',
        current: requirements.trim().length
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

    // 内嵌简化版提示词配置（避免import JSON文件问题）
    const promptConfig = {
      version: "2.1-simple",
      description: "AI流程图生成工具 - 简化版本，解决网络连接问题",
      systemRole: "你是专业的业务流程分析师。基于用户需求，生成实用的业务流程图。",
      template: `【需求】：{requirement}
【产品类型】：{productType}
【实现方式】：{implementType}

请生成具体的业务流程图，要求：
1. 包含关键业务节点和决策点
2. 体现用户实际操作路径
3. 包含权限验证、付费节点等商业逻辑
4. 使用标准Mermaid flowchart TD语法
5. 节点命名要具体明确，使用中文描述
6. 优化视觉效果：使用不同形状区分不同类型的节点

节点形状规范：
- 起始/结束：使用圆角矩形 [文本]
- 操作步骤：使用矩形 [文本]
- 决策判断：使用菱形 {文本}
- 重要提示：使用圆形 ((文本))
- 数据处理：使用梯形 [/文本/]

直接输出Mermaid代码，格式如下：
\`\`\`mermaid
flowchart TD
    A[开始] --> B[具体操作]
    B --> C{决策点}
    C -->|是| D[处理结果]
    C -->|否| E[替代方案]
    D --> F((完成))
\`\`\``
    };
    
    console.log(`使用内嵌提示词配置: ${promptConfig.version} - ${promptConfig.description}`);
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
    
    // 清理和提取Mermaid代码
    mermaidCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^mermaid\n?/g, '')
      .trim();

    // 确保代码符合配置要求
    if (!mermaidCode.toLowerCase().includes('flowchart')) {
      mermaidCode = `flowchart TD\n${mermaidCode}`;
    }

    // 【2.3节】Mermaid语法错误修复和清理
    mermaidCode = cleanMermaidCode(mermaidCode);

    // 基本验证
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

    // 分类错误处理（基于BUG-FIXES-SUMMARY.md经验）
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