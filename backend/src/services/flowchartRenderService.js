import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';

/**
 * 流程图渲染服务
 * 提供流程图渲染优化、缓存管理和API数据格式化功能
 */
class FlowchartRenderService {
  constructor() {
    // 渲染缓存 - 简单的内存缓存
    this.renderCache = new Map();
    this.maxCacheSize = 1000;
    this.cacheExpiry = 30 * 60 * 1000; // 30分钟

    // 渲染配置
    this.renderConfig = {
      defaultTheme: 'default',
      supportedFormats: ['svg', 'png', 'json'],
      maxRenderSize: { width: 4000, height: 4000 },
      renderTimeout: 10000, // 10秒
      compressionLevel: 0.8
    };

    // 渲染统计
    this.stats = {
      totalRenders: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      averageRenderTime: 0
    };

    // 定期清理缓存
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000); // 5分钟清理一次
  }

  /**
   * 渲染流程图
   * @param {Object} flowchartData - 验证过的流程图数据
   * @param {Object} options - 渲染选项
   * @returns {Object} 渲染结果
   */
  async renderFlowchart(flowchartData, options = {}) {
    const renderId = uuidv4();
    const startTime = Date.now();

    try {
      // 解析渲染选项
      const renderOptions = this.parseRenderOptions(options);
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey(flowchartData, renderOptions);
      
      // 检查缓存
      const cachedResult = this.getCachedRender(cacheKey);
      if (cachedResult) {
        this.stats.cacheHits++;
        return this.createRenderResult(renderId, true, null, cachedResult, startTime, true);
      }

      this.stats.cacheMisses++;

      // 执行渲染
      const renderResult = await this.performRender(flowchartData, renderOptions);
      
      // 缓存结果
      this.cacheRenderResult(cacheKey, renderResult);
      
      // 更新统计
      this.updateStats(startTime);

      return this.createRenderResult(renderId, true, null, renderResult, startTime, false);

    } catch (error) {
      this.stats.errors++;
      console.error(`[FlowchartRenderService] 渲染失败 (${renderId}):`, error);
      
      return this.createRenderResult(
        renderId, 
        false, 
        {
          type: 'RENDER_ERROR',
          message: '流程图渲染失败',
          details: error.message
        }, 
        null, 
        startTime, 
        false
      );
    }
  }

  /**
   * 批量渲染流程图
   * @param {Array} flowchartDataList - 流程图数据列表
   * @param {Object} options - 渲染选项
   * @returns {Object} 批量渲染结果
   */
  async batchRenderFlowcharts(flowchartDataList, options = {}) {
    const batchId = uuidv4();
    const startTime = Date.now();

    try {
      // 限制批量大小
      if (flowchartDataList.length > 20) {
        throw new Error('批量渲染数量不能超过20个');
      }

      // 并行渲染
      const renderPromises = flowchartDataList.map((flowchartData, index) =>
        this.renderFlowchart(flowchartData, {
          ...options,
          batchIndex: index,
          batchId
        }).catch(error => ({
          success: false,
          error: {
            type: 'RENDER_ERROR',
            message: '单个渲染失败',
            details: error.message
          },
          renderId: `batch-error-${index}`
        }))
      );

      const results = await Promise.all(renderPromises);

      // 统计结果
      const stats = {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        cached: results.filter(r => r.cached).length
      };

      return {
        batchId,
        success: true,
        results,
        stats,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`[FlowchartRenderService] 批量渲染失败 (${batchId}):`, error);
      
      return {
        batchId,
        success: false,
        error: {
          type: 'BATCH_RENDER_ERROR',
          message: '批量渲染失败',
          details: error.message
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取流程图渲染信息
   * @param {string} flowchartId - 流程图ID
   * @returns {Object} 流程图信息
   */
  async getFlowchartInfo(flowchartId) {
    try {
      // 这里应该从数据库或存储中获取流程图信息
      // 目前使用模拟数据
      const flowchartInfo = {
        id: flowchartId,
        title: `流程图 ${flowchartId}`,
        type: 'flowchart',
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          nodeCount: 0,
          connectionCount: 0,
          complexity: 'unknown'
        },
        renderOptions: this.renderConfig
      };

      return {
        success: true,
        data: flowchartInfo
      };

    } catch (error) {
      console.error(`[FlowchartRenderService] 获取流程图信息失败:`, error);
      
      return {
        success: false,
        error: {
          type: 'INFO_ERROR',
          message: '获取流程图信息失败',
          details: error.message
        }
      };
    }
  }

  /**
   * 执行实际渲染
   * @private
   */
  async performRender(flowchartData, options) {
    const { code, type, theme, format, size } = options;

    // 构建渲染数据
    const renderData = {
      id: uuidv4(),
      code: flowchartData.code,
      type: flowchartData.validationInfo?.detectedType || type || 'flowchart',
      theme: theme || this.renderConfig.defaultTheme,
      format: format || 'json',
      size: size || { width: 800, height: 600 },
      timestamp: new Date().toISOString()
    };

    // 根据格式生成不同的输出
    switch (renderData.format) {
      case 'svg':
        return this.generateSVGOutput(renderData, flowchartData);
      case 'png':
        return this.generatePNGOutput(renderData, flowchartData);
      case 'json':
      default:
        return this.generateJSONOutput(renderData, flowchartData);
    }
  }

  /**
   * 生成JSON格式输出
   * @private
   */
  generateJSONOutput(renderData, flowchartData) {
    return {
      id: renderData.id,
      type: renderData.type,
      theme: renderData.theme,
      format: 'json',
      data: {
        code: renderData.code,
        cleanedCode: flowchartData.code,
        nodes: this.extractRenderNodes(flowchartData),
        connections: this.extractRenderConnections(flowchartData),
        layout: this.calculateLayout(flowchartData),
        styles: this.generateStyles(renderData.theme, renderData.type)
      },
      metadata: {
        ...flowchartData.stats,
        renderTime: new Date().toISOString(),
        renderId: renderData.id,
        cacheKey: null
      },
      config: {
        theme: renderData.theme,
        size: renderData.size,
        responsive: true,
        interactive: true
      }
    };
  }

  /**
   * 生成SVG格式输出
   * @private
   */
  generateSVGOutput(renderData, flowchartData) {
    // 模拟SVG生成
    const svgContent = this.generateMockSVG(renderData, flowchartData);
    
    return {
      id: renderData.id,
      type: renderData.type,
      theme: renderData.theme,
      format: 'svg',
      data: {
        svg: svgContent,
        width: renderData.size.width,
        height: renderData.size.height,
        viewBox: `0 0 ${renderData.size.width} ${renderData.size.height}`
      },
      metadata: {
        ...flowchartData.stats,
        renderTime: new Date().toISOString(),
        renderId: renderData.id,
        size: svgContent.length
      }
    };
  }

  /**
   * 生成PNG格式输出
   * @private
   */
  generatePNGOutput(renderData, flowchartData) {
    // 模拟PNG生成
    const pngData = this.generateMockPNG(renderData, flowchartData);
    
    return {
      id: renderData.id,
      type: renderData.type,
      theme: renderData.theme,
      format: 'png',
      data: {
        base64: pngData.base64,
        buffer: pngData.buffer,
        width: renderData.size.width,
        height: renderData.size.height,
        size: pngData.size
      },
      metadata: {
        ...flowchartData.stats,
        renderTime: new Date().toISOString(),
        renderId: renderData.id,
        compression: this.renderConfig.compressionLevel
      }
    };
  }

  /**
   * 解析渲染选项
   * @private
   */
  parseRenderOptions(options) {
    return {
      theme: options.theme || this.renderConfig.defaultTheme,
      format: options.format || 'json',
      size: {
        width: Math.min(options.width || 800, this.renderConfig.maxRenderSize.width),
        height: Math.min(options.height || 600, this.renderConfig.maxRenderSize.height)
      },
      quality: options.quality || this.renderConfig.compressionLevel,
      responsive: options.responsive !== false,
      interactive: options.interactive !== false
    };
  }

  /**
   * 生成缓存键
   * @private
   */
  generateCacheKey(flowchartData, options) {
    const keyData = {
      code: flowchartData.code,
      theme: options.theme,
      format: options.format,
      size: options.size
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64').slice(0, 32);
  }

  /**
   * 获取缓存的渲染结果
   * @private
   */
  getCachedRender(cacheKey) {
    const cached = this.renderCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    
    if (cached) {
      this.renderCache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * 缓存渲染结果
   * @private
   */
  cacheRenderResult(cacheKey, renderResult) {
    // 检查缓存大小限制
    if (this.renderCache.size >= this.maxCacheSize) {
      // 删除最旧的缓存项
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }

    this.renderCache.set(cacheKey, {
      data: renderResult,
      timestamp: Date.now()
    });
  }

  /**
   * 清理过期缓存
   * @private
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.renderCache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.renderCache.delete(key);
      }
    }
  }

  /**
   * 更新统计信息
   * @private
   */
  updateStats(startTime) {
    const renderTime = Date.now() - startTime;
    this.stats.totalRenders++;
    this.stats.averageRenderTime = 
      (this.stats.averageRenderTime * (this.stats.totalRenders - 1) + renderTime) / 
      this.stats.totalRenders;
  }

  /**
   * 创建渲染结果
   * @private
   */
  createRenderResult(renderId, success, error, data, startTime, cached) {
    return {
      renderId,
      success,
      error,
      data,
      cached,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 辅助方法 - 提取渲染节点
   * @private
   */
  extractRenderNodes(flowchartData) {
    // 简化的节点提取，实际应该更复杂
    return flowchartData.stats ? Array.from({ length: flowchartData.stats.nodeCount }, (_, i) => ({
      id: `node_${i}`,
      type: 'rectangle',
      label: `节点 ${i + 1}`,
      position: { x: 100 + i * 150, y: 100 },
      size: { width: 120, height: 60 }
    })) : [];
  }

  /**
   * 辅助方法 - 提取渲染连接
   * @private
   */
  extractRenderConnections(flowchartData) {
    // 简化的连接提取
    return flowchartData.stats ? Array.from({ length: flowchartData.stats.connectionCount }, (_, i) => ({
      id: `connection_${i}`,
      from: `node_${i}`,
      to: `node_${i + 1}`,
      type: 'arrow',
      label: ''
    })) : [];
  }

  /**
   * 辅助方法 - 计算布局
   * @private
   */
  calculateLayout(flowchartData) {
    return {
      direction: 'TD',
      spacing: { node: 50, rank: 80 },
      alignment: 'center',
      bounds: { width: 800, height: 600 }
    };
  }

  /**
   * 辅助方法 - 生成样式
   * @private
   */
  generateStyles(theme, type) {
    return {
      theme,
      nodeStyles: {
        default: { fill: '#f9f9f9', stroke: '#333', strokeWidth: 2 }
      },
      edgeStyles: {
        default: { stroke: '#333', strokeWidth: 1 }
      },
      fontFamily: 'Arial, sans-serif',
      fontSize: 14
    };
  }

  /**
   * 辅助方法 - 生成模拟SVG
   * @private
   */
  generateMockSVG(renderData, flowchartData) {
    const { width, height } = renderData.size;
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="50" width="100" height="60" fill="#f0f0f0" stroke="#333" stroke-width="2" rx="5"/>
      <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="14">流程图</text>
      <text x="100" y="${height - 20}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
        渲染时间: ${new Date().toLocaleTimeString()}
      </text>
    </svg>`;
  }

  /**
   * 辅助方法 - 生成模拟PNG
   * @private
   */
  generateMockPNG(renderData, flowchartData) {
    // 模拟PNG数据
    const mockBuffer = Buffer.from('mock-png-data');
    return {
      buffer: mockBuffer,
      base64: mockBuffer.toString('base64'),
      size: mockBuffer.length
    };
  }

  /**
   * 获取渲染统计
   */
  getRenderStats() {
    return {
      ...this.stats,
      cacheSize: this.renderCache.size,
      cacheHitRate: this.stats.totalRenders > 0 ? 
        (this.stats.cacheHits / this.stats.totalRenders * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * 清理缓存
   */
  clearCache() {
    const clearedCount = this.renderCache.size;
    this.renderCache.clear();
    return { clearedCount };
  }
}

export default new FlowchartRenderService();
