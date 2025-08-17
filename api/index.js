import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 配置环境变量
dotenv.config();

// 导入路由
import apiRoutes from '../backend/src/routes/api.js';
import uploadRoutes from '../backend/src/routes/upload.js';
import aiRoutes from '../backend/src/routes/ai.js';
import analysisRoutes from '../backend/src/routes/analysis.js';
import flowchartRoutes from '../backend/src/routes/flowchart.js';
import flowchartRenderRoutes from '../backend/src/routes/flowchartRender.js';
import exportRoutes from '../backend/src/routes/export.js';

// 导入中间件
import { errorHandler } from '../backend/src/middleware/errorHandler.js';

const app = express();

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true, // 在Vercel上允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/flowchart', flowchartRoutes);
app.use('/api/flowchart-render', flowchartRenderRoutes);
app.use('/api/export', exportRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 对于Vercel，导出app而不是启动服务器
export default app;
