/**
 * DeepSeek API连接测试脚本
 * 测试DeepSeek API的连接性和基本功能
 */

import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'deepseek-chat';

console.log('🧪 DeepSeek API连接测试');
console.log('='.repeat(50));

async function testDeepSeekConnection() {
  console.log('\n📋 配置信息:');
  console.log(`API Key: ${DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 10) + '...' : '❌ 未配置'}`);
  console.log(`Base URL: ${DEEPSEEK_BASE_URL}`);
  console.log(`Model: ${DEFAULT_MODEL}`);
  console.log('');

  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误: 未找到DEEPSEEK_API_KEY环境变量');
    console.log('请在.env文件中配置：DEEPSEEK_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    console.log('🔄 测试API连接...');
    
    const client = axios.create({
      baseURL: DEEPSEEK_BASE_URL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // 测试简单的对话请求
    const testMessage = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "user",
          content: "你好，请简单介绍一下你自己，并告诉我你是否可以生成Mermaid流程图代码？"
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    };

    console.log('📤 发送测试请求...');
    const startTime = Date.now();
    
    const response = await client.post('/chat/completions', testMessage);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n✅ API连接成功！');
    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📊 状态码: ${response.status}`);
    console.log(`🤖 模型: ${response.data.model || DEFAULT_MODEL}`);
    
    if (response.data.choices && response.data.choices[0]) {
      const aiResponse = response.data.choices[0].message.content;
      console.log('\n🤖 AI响应:');
      console.log('-'.repeat(40));
      console.log(aiResponse);
      console.log('-'.repeat(40));
    }

    if (response.data.usage) {
      console.log('\n📈 Token使用统计:');
      console.log(`输入tokens: ${response.data.usage.prompt_tokens || 0}`);
      console.log(`输出tokens: ${response.data.usage.completion_tokens || 0}`);
      console.log(`总tokens: ${response.data.usage.total_tokens || 0}`);
    }

    console.log('\n🎉 DeepSeek API配置正确！系统可以正常工作。');
    
  } catch (error) {
    console.error('\n❌ API连接失败:');
    
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error(`错误信息: ${error.response.data?.error?.message || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.error('\n🔑 认证失败建议:');
        console.error('1. 检查API密钥是否正确');
        console.error('2. 确认API密钥是否有效且未过期');
        console.error('3. 访问 https://platform.deepseek.com 检查账户状态');
      } else if (error.response.status === 429) {
        console.error('\n⏱️  请求频率限制:');
        console.error('请稍后重试，或检查您的使用配额');
      }
    } else if (error.request) {
      console.error('网络连接错误:', error.message);
      console.error('\n🌐 网络问题建议:');
      console.error('1. 检查网络连接');
      console.error('2. 确认防火墙设置');
      console.error('3. 尝试使用代理或VPN');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    process.exit(1);
  }
}

// 测试模型列表功能
async function testAvailableModels() {
  console.log('\n🔍 测试可用模型...');
  
  try {
    const client = axios.create({
      baseURL: DEEPSEEK_BASE_URL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await client.get('/models');
    
    if (response.data && response.data.data) {
      console.log('\n📋 可用模型:');
      response.data.data.forEach(model => {
        if (model.id.includes('deepseek')) {
          console.log(`  • ${model.id}`);
        }
      });
    }
  } catch (error) {
    console.log('⚠️  无法获取模型列表（这是正常的，某些API不提供此功能）');
  }
}

// 运行测试
async function runTests() {
  try {
    await testDeepSeekConnection();
    await testAvailableModels();
    
    console.log('\n✨ 所有测试完成！');
    console.log('现在可以启动后端服务: npm start');
    
  } catch (error) {
    console.error('\n💥 测试过程中出现意外错误:', error.message);
    process.exit(1);
  }
}

runTests();
