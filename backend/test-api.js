/**
 * DeepSeek API测试脚本
 * 用于验证API密钥是否有效
 */

import dotenv from 'dotenv';
import axios from 'axios';

// 加载环境变量
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key_here';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

async function testDeepSeekAPI() {
  console.log('🔍 测试DeepSeek API连接...');
  console.log('API Key:', DEEPSEEK_API_KEY.substring(0, 10) + '...');
  console.log('Base URL:', DEEPSEEK_BASE_URL);
  
  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '请简单回复"测试成功"'
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ API调用成功！');
    console.log('响应:', response.data.choices[0].message.content);
    console.log('模型:', response.data.model);
    console.log('Token使用:', response.data.usage);
    
    return true;
  } catch (error) {
    console.error('❌ API调用失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n🔑 API密钥问题：');
        console.error('1. 请确保API密钥正确');
        console.error('2. 检查密钥是否有足够的余额');
        console.error('3. 确认密钥有访问所选模型的权限');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🌐 网络连接问题：');
      console.error('无法连接到DeepSeek服务器');
    } else {
      console.error('其他错误:', error.message);
    }
    
    return false;
  }
}

// 提供配置指导
function showConfigGuide() {
  console.log('\n📋 API密钥配置指南：');
  console.log('1. 访问 https://platform.deepseek.com/ 注册账户');
  console.log('2. 在账户设置中生成API密钥');
  console.log('3. 创建 backend/.env 文件，添加：');
  console.log('   DEEPSEEK_API_KEY=你的实际API密钥');
  console.log('4. 重启后端服务');
}

// 运行测试
async function main() {
  console.log('🚀 DeepSeek API 测试工具\n');
  
  if (DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
    console.log('⚠️  检测到默认API密钥，需要配置真实密钥');
    showConfigGuide();
    return;
  }
  
  const success = await testDeepSeekAPI();
  
  if (!success) {
    console.log('\n');
    showConfigGuide();
  }
}

main().catch(console.error);