import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import mermaidGenerator from './mermaidGenerator.js';
import errorRetryService from './errorRetryService.js';

/**
 * AI服务 - DeepSeek API集成 + Prompt组装
 */
class AIService {
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.baseURL = config.deepseek.baseURL || 'https://api.deepseek.com/v1';
    this.defaultModel = config.deepseek.defaultModel || 'deepseek-chat';
    this.timeout = config.deepseek.timeout || 45000; // 45秒超时，给DeepSeek更多时间
    
    // 加载prompt配置
    this.promptConfig = this.loadPromptConfig();
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.app.url || 'http://localhost:3001'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[AI Service] 发起AI调用: ${config.data ? JSON.stringify(config.data).substring(0, 200) : 'No data'}...`);
        return config;
      },
      (error) => {
        console.error('[AI Service] 请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[AI Service] AI调用成功: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[AI Service] AI调用失败:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 加载Prompt配置文件
   * @returns {Object} prompt配置对象
   */
  loadPromptConfig() {
    try {
      // 优先尝试加载简化版本
      const simpleConfigPath = path.join(process.cwd(), 'config', 'prompt-simple.json');
      if (fs.existsSync(simpleConfigPath)) {
        const configData = fs.readFileSync(simpleConfigPath, 'utf8');
        const config = JSON.parse(configData);
        console.log(`[AI Service] 加载简化Prompt配置成功，版本: ${config.version}`);
        return config;
      }
      
      // 回退到完整版本
      const configPath = path.join(process.cwd(), 'config', 'prompt.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      console.log(`[AI Service] 加载Prompt配置成功，版本: ${config.version}`);
      return config;
    } catch (error) {
      console.error('[AI Service] 加载Prompt配置失败:', error);
      // 返回默认配置
      return this.getDefaultPromptConfig();
    }
  }

  /**
   * 获取默认Prompt配置（兜底方案）
   * @returns {Object} 默认配置
   */
  getDefaultPromptConfig() {
    return {
      systemRole: "你是资深的产品架构师，专门负责将用户需求转化为清晰的业务流程图。",
      analysisFramework: {
        instruction: "请全面分析用户需求：",
        dimensions: [
          { name: "功能分析", description: "分析核心功能和用户操作" },
          { name: "业务逻辑", description: "梳理主要业务处理流程" },
          { name: "异常处理", description: "完善错误处理和异常恢复" }
        ]
      },
      outputFormat: {
        instruction: "生成标准的Mermaid流程图",
        requirements: ["使用flowchart TD语法", "确保语法正确"]
      }
    };
  }

  /**
   * 重新加载Prompt配置（热更新）
   */
  reloadPromptConfig() {
    this.promptConfig = this.loadPromptConfig();
    console.log('[AI Service] Prompt配置已重新加载');
  }

  /**
   * 组装完整的Prompt
   * @param {string} requirement - 用户需求
   * @param {string} productType - 产品类型
   * @param {string} implementType - 实现方式
   * @returns {string} 组装好的prompt
   */
  buildPrompt(requirement, productType = 'web', implementType = 'uncertain') {
    const config = this.promptConfig;
    
    // 如果是简化版本配置，使用简化模板
    if (config.template) {
      return config.template
        .replace('{requirement}', requirement)
        .replace('{productType}', productType)
        .replace('{implementType}', implementType);
    }
    
    // 原有的完整版本逻辑
    const productContext = config.productTypeContext?.[productType];
    const productFocus = productContext ? productContext.focus : '';
    const considerations = productContext ? productContext.considerations.join('、') : '';
    
    // 检测特定业务场景
    const isWpsTranslation = requirement.toLowerCase().includes('wps') && 
                           (requirement.includes('翻译') || requirement.includes('translation'));
    
    let scenarioGuidance = '';
    if (isWpsTranslation && config.businessScenarios?.wps_translation) {
      const scenario = config.businessScenarios.wps_translation;
      scenarioGuidance = `

【业务场景参考】：
核心流程应包含：${scenario.keyFlows.join(' → ')}
商业逻辑要点：${scenario.businessLogic.join('、')}`;
    }

    // 构建智能分析prompt
    const prompt = `${config.systemRole}

【用户需求】：${requirement}
【产品类型】：${productType}${productFocus ? ` - ${productFocus}` : ''}
【实现方式】：${implementType}
${productContext ? `【技术考虑】：${considerations}` : ''}${scenarioGuidance}

【智能分析任务】：
你需要基于以上简单需求描述，主动进行深度业务分析：

1. **场景理解**：深入理解业务场景，识别关键角色、核心功能和使用环境
2. **流程推断**：基于行业经验和产品逻辑，推断出完整的业务流程  
3. **关键节点识别**：识别权限验证、付费节点、AI调用、异常处理等关键业务节点
4. **商业逻辑分析**：分析商业化机会、用户付费意愿、会员权益等商业逻辑
5. **用户体验优化**：考虑用户操作便利性、反馈及时性、错误恢复等体验要素

【输出要求】：
${config.outputFormat.requirements.map(req => `• ${req}`).join('\n')}

【质量标准】：
${config.qualityStandards.map(std => `• ${std}`).join('\n')}

【重要提醒】：
${config.examplePrompt}

请基于以上分析，生成具有实际业务价值的专业流程图，使用标准Mermaid语法。`;

    return prompt;
  }

  /**
   * 调用AI模型进行文本生成（带重试机制）
   * @param {string} prompt - 提示词
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} AI生成的内容
   */
  async generateText(prompt, options = {}) {
    // 使用错误重试服务执行AI调用
    return await errorRetryService.executeWithRetry(async () => {
      const requestData = {
        model: options.model || this.defaultModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 0.9,
        stream: false
      };

      const startTime = Date.now();
      const response = await this.client.post('/chat/completions', requestData);
      const endTime = Date.now();

      console.log(`[AI Service] 调用耗时: ${endTime - startTime}ms`);

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('AI响应格式无效');
      }

      const content = response.data.choices[0].message.content;
      
      // 验证AI响应的完整性
      const validation = errorRetryService.validateAIResponse(content);
      if (!validation.isValid) {
        throw new Error(`AI响应验证失败: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('[AI Service] AI响应警告:', validation.warnings);
      }
      
      // 记录使用统计
      this.logUsage({
        model: requestData.model,
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
        responseTime: endTime - startTime
      });

      return content;
    }, {
      maxRetries: options.maxRetries || 3,
      baseDelay: options.baseDelay || 1000
    });
  }

  /**
   * 流程图分析专用调用 - 核心方法
   * @param {string} requirement - 需求描述
   * @param {string} productType - 产品形态
   * @param {string} implementType - 实现方式
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} Mermaid流程图代码
   */
  async analyzeFlowchart(requirement, productType, implementType, options = {}) {
    try {
      console.log('[AI Service] 开始流程图分析:', {
        requirement: requirement.substring(0, 100) + '...',
        productType,
        implementType
      });

      // 组装prompt
      const prompt = this.buildPrompt(requirement, productType, implementType);
      
      console.log('[AI Service] Prompt组装完成，长度:', prompt.length);

      // 调用AI生成流程图
      const result = await this.generateText(prompt, {
        temperature: 0.3, // 更低的temperature确保输出稳定
        maxTokens: 4000, // 增加token限制支持更复杂的流程图
        ...options
      });

      console.log('[AI Service] 流程图分析完成');
      
      // 提取和优化Mermaid代码
      const mermaidCode = mermaidGenerator.extractMermaidCode(result);
      const optimizedCode = mermaidGenerator.optimizeCode(mermaidCode);
      
      // 验证代码语法
      const validation = mermaidGenerator.validateSyntax(optimizedCode);
      
      console.log('[AI Service] Mermaid代码处理:', {
        extracted: mermaidCode.length > 0,
        optimized: optimizedCode.length,
        valid: validation.isValid,
        warnings: validation.warnings.length,
        errors: validation.errors.length
      });
      
      return {
        rawResponse: result,
        mermaidCode: optimizedCode,
        validation: validation,
        metadata: {
          model: this.defaultModel,
          timestamp: new Date().toISOString(),
          processed: true
        }
      };
    } catch (error) {
      console.error('[AI Service] 流程图分析失败:', error);
      
      // 检查是否应该使用降级方案
      if (this.shouldUseFallback(error)) {
        console.warn('[AI Service] 启用降级方案');
        return errorRetryService.createFallback('ai_analysis', {
          requirement,
          productType,
          implementType
        });
      }
      
      throw error;
    }
  }

  /**
   * 快速分析（简化版）
   * @param {string} requirement - 需求描述
   * @param {string} productType - 产品形态
   * @param {string} implementType - 实现方式
   * @returns {Promise<string>} 流程图结果
   */
  async quickAnalyze(requirement, productType, implementType) {
    return await this.analyzeFlowchart(requirement, productType, implementType, {
      temperature: 0.5,
      maxTokens: 2000
    });
  }

  /**
   * 智能分析（完整版）
   * @param {string} requirement - 需求描述
   * @param {string} productType - 产品形态
   * @param {string} implementType - 实现方式
   * @returns {Promise<string>} 智能分析的流程图结果
   */
  async intelligentAnalyze(requirement, productType, implementType) {
    return await this.analyzeFlowchart(requirement, productType, implementType, {
      temperature: 0.2, // 更低的temperature确保结果稳定
      maxTokens: 5000 // 更多tokens支持复杂分析
    });
  }

  /**
   * 检查API连接状态
   * @returns {Promise<boolean>} 连接是否正常
   */
  async checkConnection() {
    try {
      const response = await this.client.get('/models');
      return response.status === 200;
    } catch (error) {
      console.error('[AI Service] 连接检查失败:', error);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   * @returns {Promise<Array>} 模型列表
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data?.data || [];
    } catch (error) {
      console.error('[AI Service] 获取模型列表失败:', error);
      return [];
    }
  }

  /**
   * 判断是否应该使用降级方案
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否使用降级方案
   */
  shouldUseFallback(error) {
    // 如果是经过重试服务增强的错误，检查错误类型
    if (error.errorType) {
      const fallbackErrorTypes = ['auth_error', 'rate_limit_error'];
      return fallbackErrorTypes.includes(error.errorType);
    }
    
    // 检查原始错误
    if (error.response) {
      const status = error.response.status;
      // 认证错误或频率限制错误使用降级方案
      return status === 401 || status === 403 || status === 429;
    }
    
    return false;
  }

  /**
   * 获取错误统计信息
   * @returns {Object} 错误统计
   */
  getErrorStats() {
    return errorRetryService.getErrorStats();
  }

  /**
   * 重置错误统计
   */
  resetErrorStats() {
    errorRetryService.resetErrorStats();
  }

  /**
   * 获取当前Prompt配置（用于调试）
   * @returns {Object} 当前配置
   */
  getCurrentPromptConfig() {
    return {
      version: this.promptConfig.version,
      lastUpdated: this.promptConfig.lastUpdated,
      dimensionsCount: this.promptConfig.analysisFramework?.dimensions?.length || 0,
      requirementsCount: this.promptConfig.outputFormat?.requirements?.length || 0,
      errorStats: this.getErrorStats()
    };
  }

  /**
   * 记录使用统计
   * @param {Object} usage - 使用统计数据
   */
  logUsage(usage) {
    console.log('[AI Service] 使用统计:', {
      model: usage.model,
      tokens: `${usage.promptTokens} + ${usage.completionTokens} = ${usage.totalTokens}`,
      responseTime: `${usage.responseTime}ms`,
      timestamp: new Date().toISOString()
    });

    // 这里可以添加到数据库或监控系统
    // TODO: 实现使用统计持久化
  }

  /**
   * 错误处理
   * @param {Error} error - 原始错误
   * @returns {Error} 处理后的错误
   */
  handleError(error) {
    if (error.response) {
      // API错误响应
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          return new Error('AI服务认证失败，请检查API密钥配置');
        case 429:
          return new Error('AI服务调用频率超限，请稍后重试');
        case 500:
        case 502:
        case 503:
          return new Error('AI服务暂时不可用，请稍后重试');
        default:
          return new Error(`AI服务错误 (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error('AI服务调用超时，请稍后重试');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('无法连接到AI服务，请检查网络连接');
    } else {
      return new Error(`AI服务调用失败: ${error.message}`);
    }
  }
}

// 导出单例
export const aiService = new AIService();
export default aiService;