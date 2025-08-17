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
  
  // 简单响应，确认API工作
  return res.status(200).json({
    success: true,
    message: 'AI Analysis API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    body: req.body,
    data: {
      note: '这是简化版本，用于测试API基本功能'
    }
  });
}