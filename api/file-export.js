// 导出API - 用于生成PNG/PDF等格式的流程图
module.exports = (req, res) => {
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
    const { mermaidCode, format, options } = req.body;

    if (!mermaidCode) {
      return res.status(400).json({ error: 'Mermaid代码不能为空' });
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
