import exportService from '../services/exportService.js';
import path from 'path';

/**
 * 导出控制器
 * 处理流程图导出相关的API请求
 */
export const exportController = {
  /**
   * 获取API文档
   */
  getApiDocs: (req, res) => {
    const docs = {
      title: 'M005 导出API文档',
      version: '1.0.0',
      description: 'AI流程图生成工具 - 导出功能API',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/export',
          description: '导出流程图为指定格式',
          parameters: {
            body: {
              mermaidCode: 'string (required) - Mermaid源码',
              format: 'string (required) - 导出格式: png, pdf, svg',
              options: 'object (optional) - 导出选项'
            }
          },
          response: {
            success: 'boolean - 操作是否成功',
            format: 'string - 导出格式',
            fileName: 'string - 文件名',
            downloadUrl: 'string - 下载链接',
            metadata: 'object - 元数据信息'
          }
        },
        {
          method: 'GET',
          path: '/api/v1/export/download/:fileName',
          description: '下载导出的文件',
          parameters: {
            params: {
              fileName: 'string (required) - 文件名'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/v1/export/formats',
          description: '获取支持的导出格式',
          response: {
            formats: 'array - 支持的格式列表'
          }
        }
      ]
    };

    res.json({
      success: true,
      data: docs
    });
  },

  /**
   * 获取健康状态
   */
  getHealthStatus: (req, res) => {
    const stats = exportService.getExportStats();
    
    res.json({
      success: true,
      status: 'healthy',
      service: 'export-api',
      timestamp: new Date().toISOString(),
      stats
    });
  },

  /**
   * 获取支持的导出格式
   */
  getSupportedFormats: (req, res) => {
    const stats = exportService.getExportStats();
    
    res.json({
      success: true,
      data: {
        formats: stats.supportedFormats.map(format => ({
          name: format,
          label: format.toUpperCase(),
          description: `导出为${format.toUpperCase()}格式`,
          mimeType: this.getMimeType(format)
        })),
        defaultOptions: stats.defaultOptions
      }
    });
  },

  /**
   * 导出流程图
   */
  exportFlowchart: async (req, res) => {
    try {
      const { mermaidCode, format, options = {} } = req.body;

      // 验证必需参数
      if (!mermaidCode) {
        return res.status(400).json({
          success: false,
          error: 'mermaidCode参数是必需的'
        });
      }

      if (!format) {
        return res.status(400).json({
          success: false,
          error: 'format参数是必需的'
        });
      }

      // 执行导出
      const result = await exportService.exportFlowchart(mermaidCode, format, options);

      if (!result.success) {
        return res.status(422).json({
          success: false,
          error: result.error,
          format
        });
      }

      // 生成下载URL
      const downloadUrl = `/api/v1/export/download/${result.fileName}`;

      res.json({
        success: true,
        data: {
          format: result.format,
          fileName: result.fileName,
          fileSize: result.fileSize,
          downloadUrl,
          exportId: result.exportId,
          metadata: result.metadata,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('导出流程图失败:', error);
      res.status(500).json({
        success: false,
        error: '导出过程中发生内部错误'
      });
    }
  },

  /**
   * 下载导出的文件
   */
  downloadFile: async (req, res) => {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          error: '文件名参数是必需的'
        });
      }

      // 安全检查：防止路径遍历攻击
      const safeName = path.basename(fileName);
      if (safeName !== fileName) {
        return res.status(400).json({
          success: false,
          error: '无效的文件名'
        });
      }

      const filePath = path.join(exportService.tempDir, safeName);

      // 检查文件是否存在
      try {
        await import('fs/promises').then(fs => fs.access(filePath));
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: '文件不存在或已过期'
        });
      }

      // 设置响应头
      const getFormatFromFileName = (fileName) => {
        const ext = path.extname(fileName).toLowerCase().slice(1);
        return ext || 'unknown';
      };
      
      const getMimeType = (format) => {
        const mimeTypes = {
          png: 'image/png',
          pdf: 'application/pdf',
          svg: 'image/svg+xml'
        };
        return mimeTypes[format] || 'application/octet-stream';
      };
      
      const format = getFormatFromFileName(fileName);
      const mimeType = getMimeType(format);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');

      // 发送文件
      res.sendFile(filePath, (error) => {
        if (error) {
          console.error('文件下载失败:', error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: '文件下载失败'
            });
          }
        } else {
          // 下载完成后清理文件
          setTimeout(() => {
            exportService.cleanupFile(filePath);
          }, 5000);
        }
      });

    } catch (error) {
      console.error('文件下载处理失败:', error);
      res.status(500).json({
        success: false,
        error: '文件下载处理失败'
      });
    }
  },

  /**
   * 批量导出
   */
  batchExport: async (req, res) => {
    try {
      const { flowcharts, format, options = {} } = req.body;

      if (!Array.isArray(flowcharts) || flowcharts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'flowcharts参数必须是非空数组'
        });
      }

      if (!format) {
        return res.status(400).json({
          success: false,
          error: 'format参数是必需的'
        });
      }

      const results = [];
      const errors = [];

      // 并行处理所有导出任务
      const exportPromises = flowcharts.map(async (flowchart, index) => {
        try {
          const result = await exportService.exportFlowchart(
            flowchart.mermaidCode || flowchart.code,
            format,
            { ...options, ...flowchart.options }
          );

          if (result.success) {
            return {
              index,
              success: true,
              fileName: result.fileName,
              downloadUrl: `/api/v1/export/download/${result.fileName}`,
              metadata: result.metadata
            };
          } else {
            return {
              index,
              success: false,
              error: result.error
            };
          }
        } catch (error) {
          return {
            index,
            success: false,
            error: error.message
          };
        }
      });

      const exportResults = await Promise.all(exportPromises);

      // 分离成功和失败的结果
      exportResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      });

      res.json({
        success: errors.length === 0,
        data: {
          total: flowcharts.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors,
          format,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('批量导出失败:', error);
      res.status(500).json({
        success: false,
        error: '批量导出过程中发生内部错误'
      });
    }
  },

  /**
   * 获取MIME类型
   * @param {string} format - 文件格式
   * @returns {string} MIME类型
   */
  getMimeType(format) {
    const mimeTypes = {
      png: 'image/png',
      pdf: 'application/pdf',
      svg: 'image/svg+xml'
    };
    return mimeTypes[format] || 'application/octet-stream';
  },

  /**
   * 从文件名获取格式
   * @param {string} fileName - 文件名
   * @returns {string} 格式
   */
  getFormatFromFileName(fileName) {
    const ext = path.extname(fileName).toLowerCase().slice(1);
    return ext || 'unknown';
  }
};
