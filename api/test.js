// 简单测试API
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Test API works!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
