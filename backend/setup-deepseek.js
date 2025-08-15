/**
 * DeepSeek API配置助手
 * 帮助用户配置DeepSeek API密钥和端点
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 DeepSeek API配置助手\n');

function setupDeepSeekConfig() {
  console.log('📋 DeepSeek API获取步骤：');
  console.log('');
  console.log('1. 🌐 访问 https://platform.deepseek.com/');
  console.log('2. 👤 注册并登录账户');
  console.log('3. 🔑 进入"API Keys"页面');
  console.log('4. ➕ 点击"Create API Key"创建新密钥');
  console.log('5. 📋 复制生成的API密钥（格式：sk-xxxxxxxx...）');
  console.log('');
  
  console.log('💰 关于费用：');
  console.log('- DeepSeek提供免费额度（通常$5-10）');
  console.log('- DeepSeek-Chat约为$0.14/1M tokens（比OpenAI便宜20倍！）');
  console.log('- 生成流程图通常消耗100-500 tokens');
  console.log('- 免费额度可以使用很长时间');
  console.log('');

  console.log('🎯 DeepSeek优势：');
  console.log('- 🇨🇳 中文理解能力强');
  console.log('- 💰 成本极低');
  console.log('- 🚀 响应速度快');
  console.log('- 🧠 推理能力出色');
  console.log('');

  // 生成DeepSeek配置模板
  const deepseekConfig = `# DeepSeek API配置
DEEPSEEK_API_KEY=请替换为您的DeepSeek API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEFAULT_MODEL=deepseek-chat
BACKUP_MODEL=deepseek-coder

# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# 其他配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
TEMP_DIR=temp
LOG_LEVEL=info`;

  const templatePath = path.join(__dirname, '.env.deepseek');
  fs.writeFileSync(templatePath, deepseekConfig);
  
  console.log(`📝 已生成DeepSeek配置模板: ${templatePath}`);
  console.log('');
  
  console.log('🛠️  配置步骤：');
  console.log('');
  console.log('方法1 - 直接替换.env文件：');
  console.log('1. 获取DeepSeek API密钥');
  console.log('2. 编辑 backend/.env 文件');
  console.log('3. 修改以下配置：');
  console.log('   DEEPSEEK_API_KEY=你的DeepSeek密钥');
  console.log('   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1');
  console.log('   DEFAULT_MODEL=deepseek-chat');
  console.log('');
  
  console.log('方法2 - 使用新的配置文件：');
  console.log(`cp ${templatePath} .env`);
  console.log('然后编辑.env文件中的API密钥');
  console.log('');

  console.log('🚀 配置完成后运行：');
  console.log('1. node test-deepseek.js  # 测试DeepSeek API连接');
  console.log('2. npm start  # 启动后端服务');
  console.log('');
  
  console.log('📖 DeepSeek模型选择：');
  console.log('- deepseek-chat: 通用对话模型，适合流程图生成');
  console.log('- deepseek-coder: 代码专用模型，适合技术流程');
  console.log('- deepseek-reasoner: 推理模型，适合复杂业务分析');
}

setupDeepSeekConfig();
