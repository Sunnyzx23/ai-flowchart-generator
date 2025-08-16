/**
 * DeepSeek API配置检查脚本
 * 验证环境变量配置是否正确
 */

import dotenv from 'dotenv';
import { config } from './src/config/config.js';

// 加载环境变量
dotenv.config();

console.log('🔧 DeepSeek API配置检查\n');
console.log('==================================================');

// 检查环境变量
console.log('📋 环境变量检查:');
const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = process.env.DEEPSEEK_BASE_URL;
const defaultModel = process.env.DEFAULT_MODEL;

console.log(`DEEPSEEK_API_KEY: ${apiKey ? apiKey.substring(0, 15) + '...' : '❌ 未设置'}`);
console.log(`DEEPSEEK_BASE_URL: ${baseUrl || '❌ 未设置'}`);
console.log(`DEFAULT_MODEL: ${defaultModel || '❌ 未设置'}`);

console.log('\n==================================================');

// 验证API密钥格式
console.log('🔑 API密钥验证:');
if (!apiKey) {
  console.log('❌ API密钥未设置');
} else if (apiKey === 'your_deepseek_api_key_here') {
  console.log('❌ API密钥为默认值，需要替换为真实密钥');
} else if (apiKey.startsWith('sk-')) {
  console.log('✅ DeepSeek API密钥格式正确');
} else {
  console.log('⚠️ API密钥格式可能不正确');
}

console.log('\n==================================================');

// 检查配置对象
console.log('⚙️ 配置对象检查:');
try {
  console.log('✅ 配置文件加载成功');
  console.log(`应用名称: ${config.app.name}`);
  console.log(`服务端口: ${config.port}`);
  console.log(`前端地址: ${config.frontendUrl}`);
  console.log(`配置中的API密钥: ${config.deepseek.apiKey ? config.deepseek.apiKey.substring(0, 15) + '...' : '❌ 未加载'}`);
  console.log(`配置中的模型: ${config.deepseek.defaultModel}`);
  console.log(`配置中的Base URL: ${config.deepseek.baseURL}`);
  
  if (config.deepseek.apiKey === 'your_deepseek_api_key_here') {
    console.log('❌ 配置中的API密钥为默认值');
  } else if (config.deepseek.apiKey === apiKey) {
    console.log('✅ 环境变量与配置一致');
  } else {
    console.log('⚠️ 环境变量与配置不一致');
  }
} catch (error) {
  console.log('❌ 配置文件加载失败:', error.message);
}

console.log('\n==================================================');

// 给出建议
console.log('💡 配置建议:');

if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
  console.log('❌ 需要配置有效的DeepSeek API密钥');
  console.log('1. 访问 https://platform.deepseek.com/ 注册账户');
  console.log('2. 获取API密钥');
  console.log('3. 在 .env 文件中设置:');
  console.log('   DEEPSEEK_API_KEY=sk-你的真实密钥');
} else {
  console.log('✅ API密钥配置正确');
  console.log('可以运行: npm run dev 启动服务');
}

console.log('\n📄 示例 .env 文件内容:');
console.log(`# DeepSeek API配置
DEEPSEEK_API_KEY=你的真实API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEFAULT_MODEL=deepseek-chat
BACKUP_MODEL=deepseek-coder

# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`);