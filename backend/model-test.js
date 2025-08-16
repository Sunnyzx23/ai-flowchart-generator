/**
 * DeepSeek模型测试脚本
 * 测试不同模型的响应和性能
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

// 测试的模型列表
const MODELS_TO_TEST = [
  'deepseek-chat',
  'deepseek-coder'
];

// 测试用例
const TEST_CASES = [
  {
    name: '简单对话',
    messages: [
      { role: 'user', content: '你好，请简单介绍一下你自己。' }
    ]
  },
  {
    name: '代码生成',
    messages: [
      { role: 'user', content: '请写一个JavaScript函数，用于计算数组的平均值。' }
    ]
  },
  {
    name: '逻辑推理',
    messages: [
      { role: 'user', content: '如果今天是星期一，明天是什么？请解释你的推理过程。' }
    ]
  }
];

/**
 * 测试单个模型
 */
async function testModel(modelName, testCase) {
  console.log(`\n🧪 测试模型: ${modelName}`);
  console.log(`📝 测试用例: ${testCase.name}`);
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: modelName,
      messages: testCase.messages,
      max_tokens: 200,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ 调用成功');
    console.log(`⏱️ 响应时间: ${responseTime}ms`);
    console.log(`🤖 回复: ${response.data.choices[0].message.content.substring(0, 100)}...`);
    
    if (response.data.usage) {
      console.log(`📊 Token使用: ${JSON.stringify(response.data.usage)}`);
    }
    
    return {
      success: true,
      model: modelName,
      testCase: testCase.name,
      responseTime,
      usage: response.data.usage,
      response: response.data.choices[0].message.content
    };
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`❌ 调用失败 (${responseTime}ms)`);
    console.log(`错误: ${error.message}`);
    
    if (error.response) {
      console.log(`状态码: ${error.response.status}`);
      console.log(`错误详情: ${JSON.stringify(error.response.data)}`);
    }
    
    return {
      success: false,
      model: modelName,
      testCase: testCase.name,
      responseTime,
      error: error.message
    };
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 DeepSeek模型测试开始\n');
  console.log('==================================================');
  
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
    console.log('❌ 请先配置有效的DEEPSEEK_API_KEY');
    console.log('1. 访问 https://platform.deepseek.com/ 获取API密钥');
    console.log('2. 在 .env 文件中设置: DEEPSEEK_API_KEY=你的密钥');
    return;
  }
  
  const results = [];
  
  // 测试每个模型的每个用例
  for (const model of MODELS_TO_TEST) {
    console.log(`\n📋 开始测试模型: ${model}`);
    console.log('--------------------------------------------------');
    
    for (const testCase of TEST_CASES) {
      const result = await testModel(model, testCase);
      results.push(result);
      
      // 在测试之间稍作停顿，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 输出测试总结
  console.log('\n==================================================');
  console.log('📊 测试总结');
  console.log('==================================================');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`总测试数: ${totalCount}`);
  console.log(`成功数: ${successCount}`);
  console.log(`失败数: ${totalCount - successCount}`);
  console.log(`成功率: ${Math.round((successCount / totalCount) * 100)}%`);
  
  // 按模型分组统计
  const modelStats = {};
  results.forEach(result => {
    if (!modelStats[result.model]) {
      modelStats[result.model] = { success: 0, total: 0, avgTime: 0 };
    }
    modelStats[result.model].total++;
    if (result.success) {
      modelStats[result.model].success++;
      modelStats[result.model].avgTime += result.responseTime;
    }
  });
  
  console.log('\n📈 各模型表现:');
  Object.entries(modelStats).forEach(([model, stats]) => {
    const successRate = Math.round((stats.success / stats.total) * 100);
    const avgTime = stats.success > 0 ? Math.round(stats.avgTime / stats.success) : 0;
    console.log(`${model}: ${successRate}% 成功率, 平均响应时间 ${avgTime}ms`);
  });
  
  // 显示失败的测试
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n❌ 失败的测试:');
    failures.forEach(failure => {
      console.log(`- ${failure.model} - ${failure.testCase}: ${failure.error}`);
    });
  }
}

// 运行测试
runAllTests().catch(console.error);