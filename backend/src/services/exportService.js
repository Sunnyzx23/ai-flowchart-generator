import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 导出服务
 * 处理流程图的PNG和PDF导出功能
 * 
 * 注意：这是一个简化的实现，实际生产环境中需要使用puppeteer或类似工具
 */
class ExportService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.supportedFormats = ['png', 'pdf', 'svg'];
    this.defaultOptions = {
      width: 1200,
      height: 800,
      quality: 90,
      backgroundColor: '#ffffff'
    };
    
    this.initTempDirectory();
  }

  /**
   * 初始化临时目录
   */
  async initTempDirectory() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      // 目录不存在，创建它
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * 验证Mermaid代码
   * @param {string} mermaidCode - Mermaid源码
   * @returns {Object} 验证结果
   */
  validateMermaidCode(mermaidCode) {
    if (!mermaidCode || typeof mermaidCode !== 'string') {
      return {
        isValid: false,
        error: 'Mermaid代码不能为空'
      };
    }

    const trimmedCode = mermaidCode.trim();
    if (trimmedCode.length === 0) {
      return {
        isValid: false,
        error: 'Mermaid代码不能为空'
      };
    }

    // 检查基本语法
    const mermaidKeywords = [
      'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'
    ];

    const hasValidSyntax = mermaidKeywords.some(keyword => 
      trimmedCode.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasValidSyntax) {
      return {
        isValid: false,
        error: '无法识别的Mermaid图表类型'
      };
    }

    return {
      isValid: true,
      type: this.detectMermaidType(trimmedCode),
      nodeCount: this.countNodes(trimmedCode),
      connectionCount: this.countConnections(trimmedCode)
    };
  }

  /**
   * 检测Mermaid图表类型
   * @param {string} code - Mermaid代码
   * @returns {string} 图表类型
   */
  detectMermaidType(code) {
    const lowerCode = code.toLowerCase();
    
    if (lowerCode.includes('flowchart')) return 'flowchart';
    if (lowerCode.includes('graph')) return 'graph';
    if (lowerCode.includes('sequencediagram')) return 'sequence';
    if (lowerCode.includes('classdiagram')) return 'class';
    if (lowerCode.includes('statediagram')) return 'state';
    if (lowerCode.includes('erdiagram')) return 'er';
    if (lowerCode.includes('journey')) return 'journey';
    if (lowerCode.includes('gantt')) return 'gantt';
    if (lowerCode.includes('pie')) return 'pie';
    
    return 'unknown';
  }

  /**
   * 计算节点数量
   * @param {string} code - Mermaid代码
   * @returns {number} 节点数量
   */
  countNodes(code) {
    // 简单的节点计数，匹配 [文本] 或 (文本) 或 {文本} 等格式
    const nodePatterns = [
      /\w+\[.*?\]/g,  // A[文本]
      /\w+\(.*?\)/g,  // A(文本)
      /\w+\{.*?\}/g,  // A{文本}
      /\w+>.*?]/g     // A>文本]
    ];

    let totalNodes = 0;
    nodePatterns.forEach(pattern => {
      const matches = code.match(pattern) || [];
      totalNodes += matches.length;
    });

    return totalNodes;
  }

  /**
   * 计算连接数量
   * @param {string} code - Mermaid代码
   * @returns {number} 连接数量
   */
  countConnections(code) {
    // 匹配各种连接符号
    const connectionPatterns = [
      /-->/g,    // -->
      /--->/g,   // --->
      /==>/g,    // ==>
      /-.>/g,    // -.>
      /~>/g      // ~>
    ];

    let totalConnections = 0;
    connectionPatterns.forEach(pattern => {
      const matches = code.match(pattern) || [];
      totalConnections += matches.length;
    });

    return totalConnections;
  }

  /**
   * 生成HTML模板用于渲染
   * @param {string} mermaidCode - Mermaid代码
   * @param {Object} options - 渲染选项
   * @returns {string} HTML模板
   */
  generateHtmlTemplate(mermaidCode, options = {}) {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid Export</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${finalOptions.backgroundColor};
            font-family: 'Arial', sans-serif;
        }
        
        .mermaid-container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .mermaid {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    <div class="mermaid-container">
        <div class="mermaid">
${mermaidCode}
        </div>
    </div>
    
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * 导出为PNG格式（模拟实现）
   * @param {string} mermaidCode - Mermaid代码
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  async exportToPNG(mermaidCode, options = {}) {
    try {
      // 验证代码
      const validation = this.validateMermaidCode(mermaidCode);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const finalOptions = { ...this.defaultOptions, ...options };
      const exportId = uuidv4();
      const fileName = `flowchart_${exportId}.png`;
      const filePath = path.join(this.tempDir, fileName);

      // 生成HTML模板
      const htmlContent = this.generateHtmlTemplate(mermaidCode, finalOptions);
      const htmlPath = path.join(this.tempDir, `${exportId}.html`);
      
      // 保存HTML文件
      await fs.writeFile(htmlPath, htmlContent, 'utf8');

      // 模拟PNG生成过程
      // 实际实现中，这里会使用puppeteer或类似工具来渲染HTML并截图
      const mockPngData = Buffer.from('mock-png-data-' + exportId);
      await fs.writeFile(filePath, mockPngData);

      // 清理HTML文件
      setTimeout(async () => {
        try {
          await fs.unlink(htmlPath);
        } catch (error) {
          console.warn('清理HTML文件失败:', error);
        }
      }, 5000);

      return {
        success: true,
        format: 'png',
        fileName,
        filePath,
        fileSize: mockPngData.length,
        exportId,
        metadata: {
          width: finalOptions.width,
          height: finalOptions.height,
          quality: finalOptions.quality,
          ...validation
        }
      };

    } catch (error) {
      console.error('PNG导出失败:', error);
      return {
        success: false,
        format: 'png',
        error: error.message || 'PNG导出失败'
      };
    }
  }

  /**
   * 导出为PDF格式（模拟实现）
   * @param {string} mermaidCode - Mermaid代码
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  async exportToPDF(mermaidCode, options = {}) {
    try {
      // 验证代码
      const validation = this.validateMermaidCode(mermaidCode);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const finalOptions = { ...this.defaultOptions, ...options };
      const exportId = uuidv4();
      const fileName = `flowchart_${exportId}.pdf`;
      const filePath = path.join(this.tempDir, fileName);

      // 生成HTML模板
      const htmlContent = this.generateHtmlTemplate(mermaidCode, finalOptions);

      // 模拟PDF生成过程
      // 实际实现中，这里会使用puppeteer来生成PDF
      const mockPdfData = Buffer.from('mock-pdf-data-' + exportId);
      await fs.writeFile(filePath, mockPdfData);

      return {
        success: true,
        format: 'pdf',
        fileName,
        filePath,
        fileSize: mockPdfData.length,
        exportId,
        metadata: {
          width: finalOptions.width,
          height: finalOptions.height,
          ...validation
        }
      };

    } catch (error) {
      console.error('PDF导出失败:', error);
      return {
        success: false,
        format: 'pdf',
        error: error.message || 'PDF导出失败'
      };
    }
  }

  /**
   * 统一导出接口
   * @param {string} mermaidCode - Mermaid代码
   * @param {string} format - 导出格式
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  async exportFlowchart(mermaidCode, format, options = {}) {
    if (!this.supportedFormats.includes(format)) {
      return {
        success: false,
        error: `不支持的导出格式: ${format}，支持的格式: ${this.supportedFormats.join(', ')}`
      };
    }

    switch (format) {
      case 'png':
        return await this.exportToPNG(mermaidCode, options);
      case 'pdf':
        return await this.exportToPDF(mermaidCode, options);
      case 'svg':
        return await this.exportToSVG(mermaidCode, options);
      default:
        return {
          success: false,
          error: `未实现的导出格式: ${format}`
        };
    }
  }

  /**
   * 导出为SVG格式（模拟实现）
   * @param {string} mermaidCode - Mermaid代码
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  async exportToSVG(mermaidCode, options = {}) {
    try {
      const validation = this.validateMermaidCode(mermaidCode);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const exportId = uuidv4();
      const fileName = `flowchart_${exportId}.svg`;
      const filePath = path.join(this.tempDir, fileName);

      // 模拟SVG内容
      const mockSvgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16">
    Mock SVG Export - ${validation.type}
  </text>
  <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#666">
    Nodes: ${validation.nodeCount}, Connections: ${validation.connectionCount}
  </text>
</svg>`;

      await fs.writeFile(filePath, mockSvgContent, 'utf8');

      return {
        success: true,
        format: 'svg',
        fileName,
        filePath,
        fileSize: Buffer.byteLength(mockSvgContent, 'utf8'),
        exportId,
        metadata: validation
      };

    } catch (error) {
      console.error('SVG导出失败:', error);
      return {
        success: false,
        format: 'svg',
        error: error.message || 'SVG导出失败'
      };
    }
  }

  /**
   * 清理临时文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>} 是否成功
   */
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.warn('清理文件失败:', error);
      return false;
    }
  }

  /**
   * 获取导出统计信息
   * @returns {Object} 统计信息
   */
  getExportStats() {
    return {
      supportedFormats: this.supportedFormats,
      defaultOptions: this.defaultOptions,
      tempDirectory: this.tempDir
    };
  }
}

export default new ExportService();
