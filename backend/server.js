import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 配置环境变量
dotenv.config();

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入路由
import apiRoutes from './src/routes/api.js';
import uploadRoutes from './src/routes/upload.js';
import aiRoutes from './src/routes/ai.js';
import analysisRoutes from './src/routes/analysis.js';
import flowchartRoutes from './src/routes/flowchart.js';
import flowchartRenderRoutes from './src/routes/flowchartRender.js';
import exportRoutes from './src/routes/export.js';

// 导入中间件
import { errorHandler } from './src/middleware/errorHandler.js';
import { requestLogger } from './src/middleware/requestLogger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/flowchart', flowchartRoutes);
app.use('/api/v1/flowchart', flowchartRenderRoutes);
app.use('/api/v1/export', exportRoutes);

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

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '路径不存在',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use(errorHandler);

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