// AI分析API - 先确保基本功能，再逐步添加AI
export default async function handler(req, res) {
  // 保持简单CORS设置
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
      receivedMethod: req.method
    });
  }

  try {
    // 调试信息：检查请求体
    console.log('请求体原始数据:', req.body);
    console.log('请求头:', req.headers);
    
    // 安全解析请求体
    let requestData = {};
    
    if (req.body) {
      if (typeof req.body === 'string') {
        try {
          requestData = JSON.parse(req.body);
        } catch (e) {
          console.error('JSON解析错误:', e);
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON format'
          });
        }
      } else {
        requestData = req.body;
      }
    }
    
    const { requirements, productType, implementType } = requestData;
    
    console.log('解析后的数据:', { requirements, productType, implementType });

    // 基本验证
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: '需求描述不能为空'
      });
    }

    // 生成基于需求的动态流程图（不调用AI，避免复杂性）
    const dynamicMermaidCode = `flowchart TD
    A[开始: ${requirements.substring(0, 20)}...] --> B[需求分析]
    B --> C{产品类型: ${productType || '通用'}}
    C --> D[方案设计]
    D --> E{实现方式: ${implementType || '通用'}}
    E --> F[开发实施]
    F --> G[测试验证]
    G --> H[部署上线]
    H --> I[结束]`;

    return res.status(200).json({
      success: true,
      mermaidCode: dynamicMermaidCode,
      fullResponse: `基于需求"${requirements}"生成的流程图，产品类型：${productType || '通用'}，实现方式：${implementType || '通用'}`,
      debug: {
        receivedData: requestData,
        timestamp: new Date().toISOString(),
        note: '当前为测试版本，使用动态模板而非AI生成'
      }
    });

  } catch (error) {
    console.error('处理错误:', error);
    
    return res.status(500).json({
      success: false,
      error: '服务器处理错误',
      details: error.message,
      debug: {
        timestamp: new Date().toISOString()
      }
    });
  }
}