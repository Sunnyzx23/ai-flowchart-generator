import dotenv from 'dotenv';

dotenv.config();

const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS配置
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // OpenRouter配置
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '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',
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
    backupModel: process.env.BACKUP_MODEL || 'openai/gpt-4',
    timeout: parseInt(process.env.AI_TIMEOUT) || 30000
  },
  
  // 应用配置
  app: {
    name: 'AI流程图生成工具',
    url: process.env.APP_URL || 'http://localhost:3001'
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    tempDir: process.env.TEMP_DIR || 'temp',
    allowedTypes: ['.txt', '.md', '.pdf', '.docx', '.doc']
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // AI配置
  ai: {
    maxRetries: 3,
    timeout: 30000, // 30秒
    maxContentLength: 5000 // 最大内容长度
  }
};

export default config;
export { config };
