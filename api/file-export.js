// 导出API - 用于生成PNG/PDF等格式的流程图
export default function handler(req, res) {
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

    if (!requestBody) {
      return res.status(400).json({
        success: false,
        error: '请求体不能为空'
      });
    }

    const { mermaidCode, format = 'png', options = {} } = requestBody;

    if (!mermaidCode || typeof mermaidCode !== 'string' || mermaidCode.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Mermaid代码不能为空',
        received: typeof mermaidCode
      });
    }

    // 目前暂时返回错误，因为在Vercel环境中生成图片比较复杂
    // 需要使用外部服务或者客户端生成
    return res.status(501).json({ 
      error: '导出功能暂未实现',
      message: '请使用客户端导出功能或复制代码到其他工具中'
    });

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ 
      error: '导出失败',
      details: error.message 
    });
  }
}
