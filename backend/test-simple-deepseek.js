/**
 * 简单的DeepSeek API测试
 * 使用更短的请求测试连接稳定性
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

async function testSimpleRequest() {
  console.log('🧪 简单DeepSeek API测试');
  console.log('='.repeat(40));

  try {
    const client = axios.create({
      baseURL: DEEPSEEK_BASE_URL,
      timeout: 60000, // 60秒超时
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Flowchart-Tool/1.0',
        'Accept': 'application/json'
      }
    });

    // 简单的测试请求
    const testMessage = {
      model: 'deepseek-chat',
      messages: [
        {
          role: "user",
          content: "请生成一个简单的登录流程的Mermaid流程图代码，包含用户输入、验证、成功/失败处理。"
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      stream: false
    };

    console.log('📤 发送简单测试请求...');
    const startTime = Date.now();
    
    const response = await client.post('/chat/completions', testMessage);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ 请求成功！耗时: ${duration}ms`);
    
    if (response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message.content;
      console.log('\n🤖 AI响应:');
      console.log('-'.repeat(40));
      console.log(content);
      console.log('-'.repeat(40));
      
      // 检查是否包含Mermaid代码
      const hasMermaid = content.includes('flowchart') || content.includes('graph');
      console.log(`\n📊 Mermaid检查: ${hasMermaid ? '✅ 包含' : '❌ 缺失'}`);
    }

    if (response.data.usage) {
      console.log('\n📈 Token使用:');
      console.log(`输入: ${response.data.usage.prompt_tokens}`);
      console.log(`输出: ${response.data.usage.completion_tokens}`);
      console.log(`总计: ${response.data.usage.total_tokens}`);
    }

    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:');
    
    if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
      console.error('网络连接被重置或超时');
      console.error('可能原因:');
      console.error('1. 网络不稳定');
      console.error('2. 防火墙阻止连接');
      console.error('3. DeepSeek服务器负载过高');
      console.error('4. 需要使用代理');
    } else if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error(`错误: ${error.response.data?.error?.message || error.response.statusText}`);
    } else {
      console.error(`网络错误: ${error.message}`);
    }
    
    return false;
  }
}

async function testWithRetry() {
  console.log('\n🔄 带重试的测试...');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n尝试 ${i}/3:`);
    
    const success = await testSimpleRequest();
    if (success) {
      console.log('\n🎉 测试成功！');
      return true;
    }
    
    if (i < 3) {
      console.log('等待5秒后重试...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n💥 所有重试都失败了');
  return false;
}

// 运行测试
testWithRetry().then(success => {
  if (success) {
    console.log('\n✨ DeepSeek API连接正常！');
    process.exit(0);
  } else {
    console.log('\n❌ DeepSeek API连接有问题，请检查网络或API密钥');
    process.exit(1);
  }
});
