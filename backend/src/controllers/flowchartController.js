import flowchartValidationService from '../services/flowchartValidationService.js';
import { config } from '../config/config.js';

/**
 * 流程图数据控制器
 * 处理流程图数据的接收、验证和处理
 */
class FlowchartController {
  
  /**
   * 接收和验证流程图数据
   */
  async receiveFlowchartData(req, res) {
    try {
      const { code, type, metadata, source } = req.body;

      // 验证请求数据
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

      // 记录请求信息
      console.log(`[FlowchartController] 接收到流程图数据验证请求:`, {
        codeLength: code.length,
        type,
        source: source || 'unknown',
        timestamp: new Date().toISOString()
      });

      // 执行数据验证
      const validationResult = await flowchartValidationService.validateFlowchartData({
        code,
        type,
        metadata: {
          ...metadata,
          source,
          receivedAt: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });

      // 返回验证结果
      if (validationResult.isValid) {
        res.json({
          success: true,
          data: {
            validationId: validationResult.validationId,
            flowchart: validationResult.data,
            stats: validationResult.data.stats,
            validationInfo: validationResult.data.validationInfo
          },
          processingTime: validationResult.processingTime,
          timestamp: validationResult.timestamp
        });
      } else {
        res.status(422).json({
          success: false,
          error: {
            type: 'VALIDATION_FAILED',
            message: '流程图数据验证失败',
            validationErrors: validationResult.errors
          },
          validationId: validationResult.validationId,
          processingTime: validationResult.processingTime,
          timestamp: validationResult.timestamp
        });
      }

    } catch (error) {
      console.error('[FlowchartController] 处理流程图数据时发生错误:', error);
      
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
   * 批量验证流程图数据
   */
  async batchValidateFlowcharts(req, res) {
    try {
      const { flowcharts } = req.body;

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

      // 限制批量处理数量
      const maxBatchSize = 10;
      if (flowcharts.length > maxBatchSize) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: '批量数据超出限制',
            details: `一次最多处理${maxBatchSize}个流程图`
          },
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[FlowchartController] 接收到批量验证请求: ${flowcharts.length}个流程图`);

      // 并行验证所有流程图
      const validationPromises = flowcharts.map((flowchart, index) => 
        flowchartValidationService.validateFlowchartData({
          ...flowchart,
          metadata: {
            ...flowchart.metadata,
            batchIndex: index,
            receivedAt: new Date().toISOString()
          }
        }).catch(error => ({
          isValid: false,
          errors: [{
            type: 'PROCESSING_ERROR',
            message: '处理过程中发生错误',
            details: error.message
          }],
          validationId: `error-${index}`
        }))
      );

      const results = await Promise.all(validationPromises);

      // 统计结果
      const stats = {
        total: results.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length,
        processingTime: Math.max(...results.map(r => r.processingTime || 0))
      };

      res.json({
        success: true,
        data: {
          results,
          stats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartController] 批量验证时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '批量验证失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取支持的流程图类型
   */
  async getSupportedTypes(req, res) {
    try {
      const supportedTypes = {
        flowchart: {
          name: '流程图',
          description: '标准的流程图，支持各种形状和连接',
          syntax: 'flowchart TD',
          example: 'flowchart TD\n    A[开始] --> B[处理]\n    B --> C[结束]'
        },
        graph: {
          name: '图表',
          description: '通用图表，适用于各种关系图',
          syntax: 'graph TD',
          example: 'graph TD\n    A --> B\n    B --> C'
        },
        sequenceDiagram: {
          name: '时序图',
          description: '显示对象间交互的时序图',
          syntax: 'sequenceDiagram',
          example: 'sequenceDiagram\n    A->>B: Hello\n    B->>A: Hi'
        },
        classDiagram: {
          name: '类图',
          description: 'UML类图，显示类的结构和关系',
          syntax: 'classDiagram',
          example: 'classDiagram\n    class Animal\n    Animal : +name\n    Animal : +makeSound()'
        }
      };

      res.json({
        success: true,
        data: {
          supportedTypes,
          totalTypes: Object.keys(supportedTypes).length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartController] 获取支持类型时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取支持类型失败',
          details: config.app.env === 'development' ? error.message : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 获取验证规则
   */
  async getValidationRules(req, res) {
    try {
      const rules = {
        limits: {
          maxCodeLength: 50000,
          maxNodes: 500,
          maxConnections: 1000,
          maxSubgraphs: 50,
          maxBatchSize: 10
        },
        syntax: {
          supportedNodeTypes: [
            { type: 'rectangle', syntax: 'A[Text]', description: '矩形节点' },
            { type: 'rounded', syntax: 'A(Text)', description: '圆角矩形节点' },
            { type: 'circle', syntax: 'A((Text))', description: '圆形节点' },
            { type: 'diamond', syntax: 'A{Text}', description: '菱形节点' },
            { type: 'hexagon', syntax: 'A{{Text}}', description: '六边形节点' }
          ],
          supportedConnectionTypes: [
            { type: 'arrow', syntax: 'A --> B', description: '箭头连接' },
            { type: 'line', syntax: 'A --- B', description: '直线连接' },
            { type: 'dotted', syntax: 'A -.-> B', description: '虚线连接' },
            { type: 'thick', syntax: 'A ==> B', description: '粗线连接' }
          ]
        },
        validation: {
          required: ['code'],
          optional: ['type', 'metadata'],
          errorTypes: [
            'SYNTAX_ERROR',
            'INVALID_TYPE',
            'MISSING_NODES',
            'INVALID_CONNECTIONS',
            'MALFORMED_SYNTAX',
            'EMPTY_CONTENT',
            'TOO_LARGE',
            'UNSUPPORTED_FEATURES'
          ]
        }
      };

      res.json({
        success: true,
        data: rules,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartController] 获取验证规则时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: '获取验证规则失败',
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
      // 简单的健康检查
      const testCode = 'flowchart TD\n    A[Test] --> B[OK]';
      const testResult = await flowchartValidationService.validateFlowchartData({
        code: testCode,
        type: 'flowchart'
      });

      const isHealthy = testResult.isValid;

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'flowchart-validation',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        testResult: {
          isValid: testResult.isValid,
          processingTime: testResult.processingTime
        }
      });

    } catch (error) {
      console.error('[FlowchartController] 健康检查失败:', error);
      
      res.status(503).json({
        success: false,
        service: 'flowchart-validation',
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
        title: '流程图数据验证API',
        version: '1.0.0',
        description: '用于接收、验证和处理流程图数据的API接口',
        endpoints: {
          'POST /api/flowchart/validate': {
            description: '验证单个流程图数据',
            requestBody: {
              code: 'string (required) - Mermaid代码',
              type: 'string (optional) - 流程图类型',
              metadata: 'object (optional) - 元数据',
              source: 'string (optional) - 数据来源'
            },
            responses: {
              200: '验证成功',
              422: '验证失败',
              400: '请求参数错误',
              500: '服务器错误'
            }
          },
          'POST /api/flowchart/batch-validate': {
            description: '批量验证流程图数据',
            requestBody: {
              flowcharts: 'array (required) - 流程图数据数组'
            },
            responses: {
              200: '批量验证完成',
              400: '请求参数错误',
              500: '服务器错误'
            }
          },
          'GET /api/flowchart/types': {
            description: '获取支持的流程图类型',
            responses: {
              200: '成功获取支持的类型'
            }
          },
          'GET /api/flowchart/rules': {
            description: '获取验证规则',
            responses: {
              200: '成功获取验证规则'
            }
          },
          'GET /api/flowchart/health': {
            description: '健康检查',
            responses: {
              200: '服务健康',
              503: '服务不健康'
            }
          }
        },
        examples: {
          validateRequest: {
            code: 'flowchart TD\n    A[开始] --> B[处理]\n    B --> C[结束]',
            type: 'flowchart',
            metadata: { title: '示例流程图' },
            source: 'ai-analysis'
          },
          batchValidateRequest: {
            flowcharts: [
              {
                code: 'flowchart TD\n    A --> B',
                type: 'flowchart'
              },
              {
                code: 'graph LR\n    X --> Y',
                type: 'graph'
              }
            ]
          }
        }
      };

      res.json({
        success: true,
        data: docs,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[FlowchartController] 获取API文档时发生错误:', error);
      
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

export const flowchartController = new FlowchartController();
