import flowchartRenderService from '../services/flowchartRenderService.js';
import flowchartValidationService from '../services/flowchartValidationService.js';
import { config } from '../config/config.js';

/**
 * 流程图渲染控制器
 * 处理流程图渲染相关的API请求
 */
class FlowchartRenderController {

  /**
   * 渲染单个流程图
   */
  async renderFlowchart(req, res) {
    try {
      const { code, type, theme, format, width, height, quality } = req.body;

      // 验证必需参数
      if (!code) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Mermaid代码不能为空',
            details: 'code字段是必需的'
          },
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[FlowchartRenderController] 接收到渲染请求:`, {
        codeLength: code.length,
        type,
        theme,
        format,
        size: { width, height }
      });

      // 先验证流程图数据
      const validationResult = await flowchartValidationService.validateFlowchartData({
        code,
        type,
        metadata: {
          source: 'render-request',
          timestamp: new Date().toISOString()
        }
      });

      if (!validationResult.isValid) {
        return res.status(422).json({
          success: false,
          error: {
            type: 'VALIDATION_FAILED',
            message: '流程图数据验证失败',
            validationErrors: validationResult.errors
          },
          validationId: validationResult.validationId,
          timestamp: new Date().toISOString()
        });
      }

      // 执行渲染
      const renderResult = await flowchartRenderService.renderFlowchart(
        validationResult.data,
        {
          theme,
          format,
          width,
          height,
          quality
        }
      );

      if (renderResult.success) {
        res.json({
          success: true,
          data: {
            renderId: renderResult.renderId,
            flowchart: renderResult.data,
            cached: renderResult.cached,
            validation: {
              validationId: validationResult.validationId,
              stats: validationResult.data.stats
            }
          },
          processingTime: renderResult.processingTime,
          timestamp: renderResult.timestamp
        });
      } else {
        res.status(500).json({
          success: false,
          error: renderResult.error,
          renderId: renderResult.renderId,
          processingTime: renderResult.processingTime,
          timestamp: renderResult.timestamp
        });
      }

    } catch (error) {
      console.error('[FlowchartRenderController] 渲染流程图时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '服务器内部错误',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 批量渲染流程图
   */
  async batchRenderFlowcharts(req, res) {
    try {
      const { flowcharts, options = {} } = req.body;

      if (!Array.isArray(flowcharts) || flowcharts.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: '批量数据格式无效',
            details: 'flowcharts字段必须是非空数组'
          },
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[FlowchartRenderController] 接收到批量渲染请求: ${flowcharts.length}个流程图`);

      // 先批量验证
      const validationPromises = flowcharts.map(flowchart =>
        flowchartValidationService.validateFlowchartData({
          ...flowchart,
          metadata: {
            ...flowchart.metadata,
            source: 'batch-render-request',
            timestamp: new Date().toISOString()
          }
        })
      );

      const validationResults = await Promise.all(validationPromises);

      // 过滤出验证成功的流程图
      const validFlowcharts = validationResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.isValid)
        .map(({ result, index }) => ({ 
          data: result.data, 
          originalIndex: index,
          validationId: result.validationId 
        }));

      if (validFlowcharts.length === 0) {
        return res.status(422).json({
          success: false,
          error: {
            type: 'ALL_VALIDATION_FAILED',
            message: '所有流程图验证都失败了',
            validationResults: validationResults.map(r => ({
              isValid: r.isValid,
              errors: r.errors
            }))
          },
          timestamp: new Date().toISOString()
        });
      }

      // 执行批量渲染
      const renderResult = await flowchartRenderService.batchRenderFlowcharts(
        validFlowcharts.map(f => f.data),
        options
      );

      // 合并验证和渲染结果
      const combinedResults = renderResult.results.map((result, index) => ({
        ...result,
        originalIndex: validFlowcharts[index]?.originalIndex,
        validationId: validFlowcharts[index]?.validationId
      }));

      res.json({
        success: renderResult.success,
        data: {
          batchId: renderResult.batchId,
          results: combinedResults,
          stats: {
            ...renderResult.stats,
            validationPassed: validFlowcharts.length,
            validationFailed: flowcharts.length - validFlowcharts.length
          }
        },
        processingTime: renderResult.processingTime,
        timestamp: renderResult.timestamp
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 批量渲染时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '批量渲染失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取流程图信息
   */
  async getFlowchartInfo(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: '流程图ID不能为空',
            details: 'id参数是必需的'
          },
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[FlowchartRenderController] 获取流程图信息: ${id}`);

      const result = await flowchartRenderService.getFlowchartInfo(id);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('[FlowchartRenderController] 获取流程图信息时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取流程图信息失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取渲染配置
   */
  async getRenderConfig(req, res) {
    try {
      const renderConfig = {
        themes: {
          default: '默认主题',
          dark: '深色主题',
          forest: '森林主题',
          neutral: '中性主题',
          business: '商务主题'
        },
        formats: {
          json: { 
            name: 'JSON数据',
            description: '结构化的流程图数据，用于前端渲染',
            mimeType: 'application/json'
          },
          svg: { 
            name: 'SVG矢量图',
            description: '可缩放的矢量图形格式',
            mimeType: 'image/svg+xml'
          },
          png: { 
            name: 'PNG位图',
            description: '便携式网络图形格式',
            mimeType: 'image/png'
          }
        },
        sizes: {
          small: { width: 400, height: 300, description: '小尺寸' },
          medium: { width: 800, height: 600, description: '中等尺寸' },
          large: { width: 1200, height: 900, description: '大尺寸' },
          xlarge: { width: 1600, height: 1200, description: '超大尺寸' }
        },
        limits: {
          maxWidth: 4000,
          maxHeight: 4000,
          maxBatchSize: 20,
          renderTimeout: 10000
        },
        cache: {
          enabled: true,
          expiry: '30分钟',
          maxSize: 1000
        }
      };

      res.json({
        success: true,
        data: renderConfig,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 获取渲染配置时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取渲染配置失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取渲染统计
   */
  async getRenderStats(req, res) {
    try {
      const stats = flowchartRenderService.getRenderStats();

      res.json({
        success: true,
        data: {
          stats,
          serverInfo: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 获取渲染统计时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取渲染统计失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 清理缓存
   */
  async clearCache(req, res) {
    try {
      const result = flowchartRenderService.clearCache();

      console.log(`[FlowchartRenderController] 清理缓存: ${result.clearedCount}个项目`);

      res.json({
        success: true,
        data: {
          message: '缓存清理成功',
          clearedCount: result.clearedCount
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 清理缓存时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '清理缓存失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(req, res) {
    try {
      // 执行简单的渲染测试
      const testCode = 'flowchart TD\n    A[测试] --> B[OK]';
      const validationResult = await flowchartValidationService.validateFlowchartData({
        code: testCode,
        type: 'flowchart'
      });

      let renderHealthy = false;
      let renderTime = 0;

      if (validationResult.isValid) {
        const startTime = Date.now();
        const renderResult = await flowchartRenderService.renderFlowchart(
          validationResult.data,
          { format: 'json', theme: 'default' }
        );
        renderTime = Date.now() - startTime;
        renderHealthy = renderResult.success;
      }

      const isHealthy = validationResult.isValid && renderHealthy;
      const stats = flowchartRenderService.getRenderStats();

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'flowchart-render',
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks: {
          validation: validationResult.isValid,
          rendering: renderHealthy,
          cache: stats.cacheSize !== undefined
        },
        performance: {
          testRenderTime: renderTime,
          averageRenderTime: stats.averageRenderTime,
          cacheHitRate: stats.cacheHitRate
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 健康检查失败:', error);
      
      res.status(503).json({
        success: false,
        service: 'flowchart-render',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取API文档
   */
  async getApiDocs(req, res) {
    try {
      const docs = {
        title: '流程图渲染API',
        version: '1.0.0',
        description: '用于渲染和优化流程图的API接口',
        baseUrl: '/api/v1/flowchart',
        endpoints: {
          'POST /render': {
            description: '渲染单个流程图',
            requestBody: {
              code: 'string (required) - Mermaid代码',
              type: 'string (optional) - 流程图类型',
              theme: 'string (optional) - 主题名称',
              format: 'string (optional) - 输出格式 (json|svg|png)',
              width: 'number (optional) - 输出宽度',
              height: 'number (optional) - 输出高度',
              quality: 'number (optional) - 质量设置 (0-1)'
            },
            responses: {
              200: '渲染成功',
              422: '验证失败',
              400: '请求参数错误',
              500: '服务器错误'
            }
          },
          'POST /batch-render': {
            description: '批量渲染流程图',
            requestBody: {
              flowcharts: 'array (required) - 流程图数据数组',
              options: 'object (optional) - 渲染选项'
            },
            responses: {
              200: '批量渲染完成',
              422: '验证失败',
              400: '请求参数错误',
              500: '服务器错误'
            }
          },
          'GET /:id': {
            description: '获取流程图信息',
            parameters: {
              id: 'string (required) - 流程图ID'
            },
            responses: {
              200: '成功获取信息',
              404: '流程图不存在',
              400: '参数错误'
            }
          },
          'GET /config': {
            description: '获取渲染配置',
            responses: {
              200: '成功获取配置'
            }
          },
          'GET /stats': {
            description: '获取渲染统计',
            responses: {
              200: '成功获取统计信息'
            }
          },
          'POST /clear-cache': {
            description: '清理渲染缓存',
            responses: {
              200: '缓存清理成功'
            }
          },
          'GET /health': {
            description: '健康检查',
            responses: {
              200: '服务健康',
              503: '服务不健康'
            }
          }
        },
        examples: {
          renderRequest: {
            code: 'flowchart TD\n    A[开始] --> B[处理]\n    B --> C[结束]',
            type: 'flowchart',
            theme: 'default',
            format: 'json',
            width: 800,
            height: 600
          },
          batchRenderRequest: {
            flowcharts: [
              {
                code: 'flowchart TD\n    A --> B',
                type: 'flowchart'
              },
              {
                code: 'graph LR\n    X --> Y',
                type: 'graph'
              }
            ],
            options: {
              theme: 'default',
              format: 'json'
            }
          }
        }
      };

      res.json({
        success: true,
        data: docs,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartRenderController] 获取API文档时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取API文档失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const flowchartRenderController = new FlowchartRenderController();
