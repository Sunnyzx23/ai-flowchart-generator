// 健康检查API - 用于验证Vercel Functions是否正常工作
export default function handler(req, res) {
  // 【6.6节】标准CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 【6.6节】处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 支持GET和POST方法
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
  }
  
  res.status(200).json({ 
    success: true,
    message: 'Hello from Vercel API!',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}