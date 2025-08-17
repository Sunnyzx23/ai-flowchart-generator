// AI分析API - 简化版本，先确保基本功能工作
export default function handler(req, res) {
  // 使用与hello.js相同的CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 记录请求方法用于调试
  console.log('收到请求方法:', req.method);
  console.log('请求头:', req.headers);
  
  // 验证POST方法
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      receivedMethod: req.method,
      expectedMethod: 'POST',
      debug: 'This is the simplified version for debugging'
    });
  }
  
  // 返回前端期望的数据结构（模拟数据）
  const mockMermaidCode = `flowchart TD
    A[开始] --> B[用户输入需求]
    B --> C[AI分析需求]
    C --> D[生成流程图]
    D --> E[显示结果]
    E --> F[结束]`;

  return res.status(200).json({
    success: true,
    mermaidCode: mockMermaidCode,
    fullResponse: `这是AI分析的完整响应。生成的Mermaid代码如下：\n\n${mockMermaidCode}`,
    debug: {
      message: 'API测试版本 - 使用模拟数据',
      method: req.method,
      timestamp: new Date().toISOString(),
      body: req.body
    }
  });
}