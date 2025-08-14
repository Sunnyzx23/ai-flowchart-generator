import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 配置环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'AI流程图生成工具后端API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/health'
  });
});

// API基础路由
app.get('/api', (req, res) => {
  res.json({
    name: 'AI流程图生成工具API',
    version: '1.0.0',
    description: '提供AI流程图生成相关的API服务',
    endpoints: {
      upload: '/api/upload - 文件上传服务（开发中）',
      ai: '/api/ai - AI分析服务（开发中）',
      health: '/health - 健康检查'
    },
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '路径不存在',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.statusCode || 500).json({
    error: err.message || '服务器内部错误',
    timestamp: new Date().toISOString(),
    path: req.url
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

export default app;
