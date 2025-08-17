import axios from 'axios';

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requirements, productType, implementType } = req.body;

    if (!requirements) {
      return res.status(400).json({ error: '需求描述不能为空' });
    }

    // 调用DeepSeek API
    const response = await axios.post(
      process.env.DEEPSEEK_BASE_URL + '/chat/completions',
      {
        model: process.env.DEFAULT_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的业务流程分析师。请根据用户的需求描述，生成详细的业务流程图。

产品类型：${productType || '通用'}
实现方式：${implementType || '通用'}

请按照以下格式返回Mermaid流程图代码：

\`\`\`mermaid
flowchart TD
    A[开始] --> B[步骤1]
    B --> C[步骤2]
    C --> D[结束]
\`\`\`

要求：
1. 使用flowchart TD格式
2. 节点名称要清晰明确
3. 包含主要的业务流程步骤
4. 考虑异常处理和分支逻辑`
          },
          {
            role: 'user',
            content: requirements
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    // 提取Mermaid代码
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    const mermaidCode = mermaidMatch ? mermaidMatch[1] : aiResponse;

    res.status(200).json({
      success: true,
      mermaidCode: mermaidCode.trim(),
      fullResponse: aiResponse
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      error: 'AI分析失败',
      details: error.message 
    });
  }
}
