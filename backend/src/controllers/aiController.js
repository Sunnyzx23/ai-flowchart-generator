import aiService from '../services/aiService.js';
import { fileParserService } from '../services/fileParserService.js';

/**
 * AI分析控制器
 */
export const aiController = {
  /**
   * 健康检查 - 检查AI服务连接状态
   */
  async healthCheck(req, res) {
    try {
      const isConnected = await aiService.checkConnection();
      
      res.json({
        success: true,
        data: {
          status: isConnected ? 'connected' : 'disconnected',
          service: 'OpenRouter API',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('AI健康检查失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'AI服务健康检查失败',
          details: error.message
        }
      });
    }
  },

  /**
   * 获取可用模型列表
   */
  async getModels(req, res) {
    try {
      const models = await aiService.getAvailableModels();
      
      res.json({
        success: true,
        data: {
          models: models.slice(0, 20), // 限制返回前20个模型
          count: models.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('获取模型列表失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '获取AI模型列表失败',
          details: error.message
        }
      });
    }
  },

  /**
   * 分析需求并生成流程图
   */
  async analyzeRequirement(req, res) {
    try {
      const { requirement, productType, implementType, source } = req.body;

      // 输入验证
      if (!requirement || requirement.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: {
            message: '需求描述不能少于10个字符',
            field: 'requirement'
          }
        });
      }

      if (!productType) {
        return res.status(400).json({
          success: false,
          error: {
            message: '请选择产品形态',
            field: 'productType'
          }
        });
      }

      if (!implementType) {
        return res.status(400).json({
          success: false,
          error: {
            message: '请选择实现方式',
            field: 'implementType'
          }
        });
      }

      console.log('[AI Controller] 开始分析需求:', {
        requirement: requirement.substring(0, 100) + '...',
        productType,
        implementType,
        source: source || 'text'
      });

      // 记录开始时间，放在try-catch外部以便在catch中使用
      const startTime = Date.now();
      
      try {
        // 调用AI服务进行分析
        const result = await aiService.analyzeFlowchart(requirement, productType, implementType);
        const endTime = Date.now();

        console.log(`[AI Controller] 分析完成，耗时: ${endTime - startTime}ms`);

        res.json({
          success: true,
          data: {
            mermaidCode: result,
            analysis: {
              requirement: requirement.substring(0, 200) + (requirement.length > 200 ? '...' : ''),
              productType,
              implementType,
              source: source || 'text'
            },
            metadata: {
              generatedAt: new Date().toISOString(),
              processingTime: endTime - startTime,
              model: 'deepseek-chat' // 更新为DeepSeek模型
            }
          }
        });
        
      } catch (error) {
        console.error('[AI Controller] 需求分析失败:', error);
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.log(`[AI Controller] 请求失败，耗时: ${processingTime}ms`);
        
        // 根据错误类型提供不同的错误信息
        let errorMessage = 'AI服务调用失败';
        let suggestion = '请稍后重试';
        
        if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.message?.includes('aborted')) {
          errorMessage = 'DeepSeek API网络连接失败';
          suggestion = '网络连接被重置，请检查网络环境或稍后重试';
        } else if (error.response?.status === 401) {
          errorMessage = 'API密钥认证失败';
          suggestion = '请检查DeepSeek API密钥是否正确';
        } else if (error.response?.status === 429) {
          errorMessage = 'API请求频率限制';
          suggestion = '请求过于频繁，请稍后重试';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'API请求超时';
          suggestion = '请求超时，请检查网络连接或稍后重试';
        }
        
        res.status(500).json({
          success: false,
          error: {
            message: errorMessage,
            type: 'ai_service_error',
            timestamp: new Date().toISOString(),
            details: {
              suggestion: suggestion,
              errorCode: error.code || 'UNKNOWN',
              processingTime: processingTime,
              testCommand: 'node test-simple-deepseek.js'
            }
          }
        });
      }
    } catch (outerError) {
      // 处理外层try-catch的错误（如参数验证错误等）
      console.error('[AI Controller] 外层错误:', outerError);
      res.status(500).json({
        success: false,
        error: {
          message: '服务器内部错误',
          type: 'server_error',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  /**
   * 分析上传的文件并生成流程图
   */
  async analyzeFile(req, res) {
    try {
      const { productType, implementType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            message: '请上传文件',
            field: 'file'
          }
        });
      }

      console.log('[AI Controller] 开始分析文件:', {
        filename: file.originalname,
        size: file.size,
        productType,
        implementType
      });

      // 解析文件内容
      const requirement = await fileParserService.parseFile(file);
      
      if (!requirement || requirement.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: {
            message: '文件内容过短，无法进行有效分析',
            details: '解析后的文本内容不足10个字符'
          }
        });
      }

      // 调用AI服务进行分析
      const startTime = Date.now();
      const result = await aiService.analyzeFlowchart(requirement, productType, implementType);
      const endTime = Date.now();

      console.log(`[AI Controller] 文件分析完成，耗时: ${endTime - startTime}ms`);

      res.json({
        success: true,
        data: {
          mermaidCode: result,
          analysis: {
            requirement: requirement.substring(0, 200) + (requirement.length > 200 ? '...' : ''),
            productType,
            implementType,
            source: 'file',
            filename: file.originalname
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            processingTime: endTime - startTime,
            fileSize: file.size,
            model: 'anthropic/claude-3.5-sonnet'
          }
        }
      });
    } catch (error) {
      console.error('[AI Controller] 文件分析失败:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'AI文件分析服务暂时不可用',
          type: 'ai_file_analysis_error',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  /**
   * 快速分析接口（使用简化Prompt）
   */
  async quickAnalyze(req, res) {
    try {
      const { requirement, productType, implementType } = req.body;

      // 输入验证
      if (!requirement || requirement.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: {
            message: '需求描述不能少于5个字符',
            field: 'requirement'
          }
        });
      }

      console.log('[AI Controller] 开始快速分析:', {
        requirement: requirement.substring(0, 50) + '...',
        productType: productType || 'web',
        implementType: implementType || 'uncertain'
      });

      const startTime = Date.now();
      const result = await aiService.quickAnalyze(
        requirement,
        productType || 'web',
        implementType || 'uncertain'
      );
      const endTime = Date.now();

      res.json({
        success: true,
        data: {
          mermaidCode: result,
          analysis: {
            requirement: requirement.substring(0, 200) + (requirement.length > 200 ? '...' : ''),
            productType: productType || 'web',
            implementType: implementType || 'uncertain',
            source: 'quick_analysis'
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            processingTime: endTime - startTime,
            model: 'anthropic/claude-3.5-sonnet',
            promptType: 'simplified'
          }
        }
      });
    } catch (error) {
      console.error('[AI Controller] 快速分析失败:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'AI快速分析服务暂时不可用',
          type: 'ai_quick_analysis_error',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  /**
   * 智能分析接口（使用7维度分析引擎）
   */
  async intelligentAnalyze(req, res) {
    try {
      const { requirement, productType, implementType } = req.body;

      // 输入验证
      if (!requirement || requirement.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: {
            message: '需求描述不能少于10个字符',
            field: 'requirement'
          }
        });
      }

      console.log('[AI Controller] 开始智能分析:', {
        requirement: requirement.substring(0, 100) + '...',
        productType: productType || 'web',
        implementType: implementType || 'uncertain'
      });

      const startTime = Date.now();
      const result = await aiService.intelligentAnalyze(
        requirement,
        productType || 'web',
        implementType || 'uncertain'
      );
      const endTime = Date.now();

      res.json({
        success: true,
        data: {
          mermaidCode: result,
          analysis: {
            requirement: requirement.substring(0, 200) + (requirement.length > 200 ? '...' : ''),
            productType: productType || 'web',
            implementType: implementType || 'uncertain',
            source: 'intelligent_analysis'
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            processingTime: endTime - startTime,
            model: 'anthropic/claude-3.5-sonnet',
            promptType: 'intelligent_7d_analysis'
          }
        }
      });
    } catch (error) {
      console.error('[AI Controller] 智能分析失败:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'AI智能分析服务暂时不可用',
          type: 'ai_intelligent_analysis_error',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  /**
   * 测试AI服务调用
   */
  async testGeneration(req, res) {
    try {
      const { prompt, model } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: {
            message: '请提供测试提示词',
            field: 'prompt'
          }
        });
      }

      const result = await aiService.generateText(prompt, { model });

      res.json({
        success: true,
        data: {
          result,
          prompt: prompt.substring(0, 100) + '...',
          model: model || 'default',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[AI Controller] 测试生成失败:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'AI测试调用失败',
          type: 'ai_test_error'
        }
      });
    }
  }
};