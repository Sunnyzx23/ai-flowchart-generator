import express from 'express';

const router = express.Router();

// API信息端点
router.get('/', (req, res) => {
  res.json({
    name: 'AI流程图生成工具API',
    version: '1.0.0',
    description: '提供AI流程图生成相关的API服务',
    endpoints: {
      upload: '/api/upload - 文件上传服务',
      ai: '/api/ai - AI分析服务',
      health: '/health - 健康检查'
    },
    timestamp: new Date().toISOString()
  });
});

// API文档端点
router.get('/docs', (req, res) => {
  res.json({
    title: 'AI流程图生成工具 API 文档',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/upload/file',
        method: 'POST',
        description: '上传文件并解析内容',
        parameters: {
          file: '文件对象 (支持 .txt, .md, .pdf, .docx)',
          productType: '产品形态 (web/plugin/desktop/mobile)',
          implementType: '实现方式 (ai/traditional/unknown)'
        }
      },
      {
        path: '/api/ai/analyze',
        method: 'POST',
        description: 'AI分析需求并生成流程图',
        parameters: {
          content: '需求内容文本',
          productType: '产品形态',
          implementType: '实现方式'
        }
      },
      {
        path: '/api/ai/generate-mermaid',
        method: 'POST',
        description: '生成Mermaid流程图代码',
        parameters: {
          analysis: 'AI分析结果'
        }
      }
    ]
  });
});

export default router;
