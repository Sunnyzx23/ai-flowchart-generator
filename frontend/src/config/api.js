// API配置
const API_CONFIG = {
  // 根据环境自动选择API基础URL
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? '' // 生产环境使用相对路径，指向同域名的API
    : 'http://localhost:3001', // 开发环境使用本地后端API
  
  // API端点
  ENDPOINTS: {
    // 文件上传
    UPLOAD_FILE: '/api/upload/file',
    
    // AI分析 - 注意：我们的Vercel API是 /api/ai-analysis，不是 /api/v1/analysis/create
    AI_ANALYSIS: '/api/ai-analysis',
    
    // 导出功能
    EXPORT: '/api/file-export',
    
    // 测试端点
    HEALTH: '/api/hello'
  }
};

// 获取完整的API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 导出配置
export default API_CONFIG;
