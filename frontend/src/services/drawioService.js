/**
 * Draw.io集成服务
 * 处理与Draw.io编辑器的跳转和数据传递
 */

class DrawioService {
  constructor() {
    this.baseUrl = 'https://app.diagrams.net/';
    this.defaultParams = {
      lightbox: '1',
      edit: '_blank',
      format: 'mermaid'
    };
  }

  /**
   * 验证Mermaid代码
   * @param {string} mermaidCode - Mermaid源码
   * @returns {boolean} 是否有效
   */
  validateMermaidCode(mermaidCode) {
    if (!mermaidCode || typeof mermaidCode !== 'string') {
      return false;
    }

    const trimmedCode = mermaidCode.trim();
    if (trimmedCode.length === 0) {
      return false;
    }

    // 检查是否包含基本的Mermaid语法
    const mermaidKeywords = [
      'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'
    ];

    const hasValidSyntax = mermaidKeywords.some(keyword => 
      trimmedCode.toLowerCase().includes(keyword.toLowerCase())
    );

    return hasValidSyntax;
  }

  /**
   * 构建Draw.io URL
   * @param {string} mermaidCode - Mermaid源码
   * @param {Object} options - 额外选项
   * @returns {string} 完整的Draw.io URL
   */
  buildDrawioUrl(mermaidCode, options = {}) {
    if (!this.validateMermaidCode(mermaidCode)) {
      throw new Error('无效的Mermaid代码');
    }

    // 合并参数
    const params = {
      ...this.defaultParams,
      ...options
    };

    // 编码Mermaid代码
    const encodedCode = encodeURIComponent(mermaidCode);
    params.data = encodedCode;

    // 构建URL参数
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });

    return `${this.baseUrl}?${searchParams.toString()}`;
  }

  /**
   * 检测浏览器兼容性
   * @returns {Object} 兼容性信息
   */
  checkBrowserCompatibility() {
    const userAgent = navigator.userAgent.toLowerCase();
    const compatibility = {
      supportsPopup: true,
      browserName: 'unknown',
      version: 'unknown',
      warnings: []
    };

    // 检测浏览器类型
    if (userAgent.includes('chrome')) {
      compatibility.browserName = 'chrome';
    } else if (userAgent.includes('firefox')) {
      compatibility.browserName = 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      compatibility.browserName = 'safari';
    } else if (userAgent.includes('edge')) {
      compatibility.browserName = 'edge';
    }

    // 检查弹窗阻止
    try {
      const testWindow = window.open('', '_blank', 'width=1,height=1');
      if (testWindow) {
        testWindow.close();
      } else {
        compatibility.supportsPopup = false;
        compatibility.warnings.push('浏览器可能阻止了弹窗，请检查弹窗设置');
      }
    } catch (error) {
      compatibility.supportsPopup = false;
      compatibility.warnings.push('无法打开新窗口');
    }

    return compatibility;
  }

  /**
   * 打开Draw.io编辑器
   * @param {string} mermaidCode - Mermaid源码
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 操作结果
   */
  async openDrawioEditor(mermaidCode, options = {}) {
    try {
      // 验证输入
      if (!this.validateMermaidCode(mermaidCode)) {
        throw new Error('请提供有效的Mermaid流程图代码');
      }

      // 检查浏览器兼容性
      const compatibility = this.checkBrowserCompatibility();
      
      // 构建URL
      const drawioUrl = this.buildDrawioUrl(mermaidCode, options);

      // 配置新窗口参数
      const windowFeatures = {
        width: options.width || 1200,
        height: options.height || 800,
        scrollbars: 'yes',
        resizable: 'yes',
        status: 'yes',
        toolbar: 'no',
        menubar: 'no',
        location: 'yes'
      };

      const featuresString = Object.entries(windowFeatures)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

      // 打开新窗口
      const newWindow = window.open(drawioUrl, '_blank', featuresString);

      if (!newWindow) {
        throw new Error('无法打开Draw.io编辑器，请检查浏览器弹窗设置');
      }

      // 检查窗口是否被阻止
      setTimeout(() => {
        if (newWindow.closed) {
          console.warn('Draw.io窗口可能被用户关闭或浏览器阻止');
        }
      }, 1000);

      return {
        success: true,
        message: 'Draw.io编辑器已打开',
        url: drawioUrl,
        window: newWindow,
        compatibility
      };

    } catch (error) {
      console.error('Draw.io跳转失败:', error);
      
      return {
        success: false,
        message: error.message || 'Draw.io跳转失败',
        error: error,
        fallbackUrl: this.buildDrawioUrl(mermaidCode, options)
      };
    }
  }

  /**
   * 获取Draw.io支持的格式
   * @returns {Array} 支持的格式列表
   */
  getSupportedFormats() {
    return [
      {
        name: 'mermaid',
        label: 'Mermaid',
        description: '支持流程图、时序图等多种图表类型',
        supported: true
      },
      {
        name: 'drawio',
        label: 'Draw.io XML',
        description: 'Draw.io原生格式',
        supported: true
      },
      {
        name: 'svg',
        label: 'SVG',
        description: '矢量图形格式',
        supported: true
      }
    ];
  }

  /**
   * 生成Draw.io使用指南
   * @returns {Object} 使用指南
   */
  getUsageGuide() {
    return {
      title: 'Draw.io使用指南',
      steps: [
        {
          step: 1,
          title: '点击"Draw.io编辑"按钮',
          description: '确保流程图数据已加载完成'
        },
        {
          step: 2,
          title: '等待编辑器打开',
          description: '新窗口将自动打开Draw.io编辑器'
        },
        {
          step: 3,
          title: '开始编辑',
          description: '在Draw.io中编辑和美化您的流程图'
        },
        {
          step: 4,
          title: '保存和导出',
          description: '使用Draw.io的保存和导出功能'
        }
      ],
      troubleshooting: [
        {
          problem: '无法打开新窗口',
          solution: '请检查浏览器弹窗阻止设置，允许本站点打开弹窗'
        },
        {
          problem: 'Draw.io无法解析流程图',
          solution: '请确保Mermaid代码语法正确，可以先在预览中验证'
        },
        {
          problem: '编辑器加载缓慢',
          solution: '这是正常现象，Draw.io需要加载完整的编辑环境'
        }
      ]
    };
  }
}

// 创建单例实例
const drawioService = new DrawioService();

export default drawioService;
