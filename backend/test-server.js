import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 基础中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI流程图生成工具后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'AI流程图生成工具后端API',
    version: '1.0.0',
    status: 'running'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});
