/**
 * 剪贴板服务
 * 处理文本复制到剪贴板的功能，包含降级方案
 */

class ClipboardService {
  constructor() {
    this.isSecureContext = window.isSecureContext;
    this.hasClipboardAPI = !!(navigator.clipboard && navigator.clipboard.writeText);
  }

  /**
   * 检查剪贴板API可用性
   * @returns {Object} 可用性信息
   */
  checkAvailability() {
    return {
      isSecureContext: this.isSecureContext,
      hasClipboardAPI: this.hasClipboardAPI,
      canUseModernAPI: this.isSecureContext && this.hasClipboardAPI,
      fallbackAvailable: document.queryCommandSupported && document.queryCommandSupported('copy')
    };
  }

  /**
   * 使用现代Clipboard API复制文本
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  async copyWithClipboardAPI(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API复制失败:', error);
      return false;
    }
  }

  /**
   * 使用降级方案复制文本
   * @param {string} text - 要复制的文本
   * @returns {boolean} 是否成功
   */
  copyWithFallback(text) {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 设置样式使其不可见
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      
      // 添加到DOM
      document.body.appendChild(textArea);
      
      // 选择文本
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // 执行复制命令
      const successful = document.execCommand('copy');
      
      // 清理
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.warn('降级方案复制失败:', error);
      return false;
    }
  }

  /**
   * 复制文本到剪贴板（自动选择最佳方法）
   * @param {string} text - 要复制的文本
   * @returns {Promise<Object>} 复制结果
   */
  async copyText(text) {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        message: '无效的文本内容',
        method: 'none'
      };
    }

    const availability = this.checkAvailability();

    // 尝试使用现代Clipboard API
    if (availability.canUseModernAPI) {
      const success = await this.copyWithClipboardAPI(text);
      if (success) {
        return {
          success: true,
          message: '内容已复制到剪贴板',
          method: 'clipboard-api',
          textLength: text.length
        };
      }
    }

    // 降级到传统方法
    if (availability.fallbackAvailable) {
      const success = this.copyWithFallback(text);
      if (success) {
        return {
          success: true,
          message: '内容已复制到剪贴板（兼容模式）',
          method: 'fallback',
          textLength: text.length
        };
      }
    }

    // 都失败了
    return {
      success: false,
      message: '复制失败，请手动选择和复制文本',
      method: 'manual',
      availability,
      fallbackText: text
    };
  }

  /**
   * 复制Mermaid源码
   * @param {string} mermaidCode - Mermaid代码
   * @returns {Promise<Object>} 复制结果
   */
  async copyMermaidCode(mermaidCode) {
    if (!mermaidCode) {
      return {
        success: false,
        message: '没有可复制的流程图代码'
      };
    }

    // 添加注释头部
    const timestamp = new Date().toLocaleString();
    const header = `// AI流程图生成工具 - Mermaid代码\n// 生成时间: ${timestamp}\n// 使用方法: 将此代码粘贴到Mermaid编辑器中\n\n`;
    
    const fullCode = header + mermaidCode.trim();

    const result = await this.copyText(fullCode);
    
    if (result.success) {
      return {
        ...result,
        message: 'Mermaid源码已复制到剪贴板',
        codeLength: mermaidCode.length,
        fullLength: fullCode.length
      };
    }

    return result;
  }

  /**
   * 获取浏览器兼容性信息
   * @returns {Object} 兼容性信息
   */
  getBrowserCompatibility() {
    const userAgent = navigator.userAgent.toLowerCase();
    const availability = this.checkAvailability();

    let browserInfo = {
      name: 'unknown',
      supportsClipboard: availability.canUseModernAPI,
      supportsFallback: availability.fallbackAvailable,
      isSecure: this.isSecureContext
    };

    // 检测浏览器
    if (userAgent.includes('chrome')) {
      browserInfo.name = 'Chrome';
      browserInfo.notes = '完全支持剪贴板功能';
    } else if (userAgent.includes('firefox')) {
      browserInfo.name = 'Firefox';
      browserInfo.notes = 'HTTPS环境下支持现代API';
    } else if (userAgent.includes('safari')) {
      browserInfo.name = 'Safari';
      browserInfo.notes = '可能需要用户交互才能复制';
    } else if (userAgent.includes('edge')) {
      browserInfo.name = 'Edge';
      browserInfo.notes = '完全支持剪贴板功能';
    }

    // 添加警告
    const warnings = [];
    if (!this.isSecureContext) {
      warnings.push('非HTTPS环境，无法使用现代剪贴板API');
    }
    if (!availability.canUseModernAPI && !availability.fallbackAvailable) {
      warnings.push('浏览器不支持自动复制功能');
    }

    browserInfo.warnings = warnings;
    return browserInfo;
  }

  /**
   * 生成使用指南
   * @returns {Object} 使用指南
   */
  getUsageGuide() {
    const compatibility = this.getBrowserCompatibility();

    return {
      title: '剪贴板功能使用指南',
      compatibility,
      tips: [
        {
          title: '现代浏览器',
          description: 'Chrome、Firefox、Edge等现代浏览器在HTTPS环境下支持一键复制'
        },
        {
          title: 'Safari浏览器',
          description: '可能需要用户手动点击允许访问剪贴板'
        },
        {
          title: 'HTTP环境',
          description: '非HTTPS环境下会使用兼容模式，功能可能受限'
        },
        {
          title: '手动复制',
          description: '如果自动复制失败，可以手动选择文本进行复制'
        }
      ],
      troubleshooting: [
        {
          problem: '复制功能不工作',
          solution: '确保使用HTTPS访问，或尝试手动选择复制'
        },
        {
          problem: '权限被拒绝',
          solution: '浏览器可能阻止了剪贴板访问，请检查权限设置'
        },
        {
          problem: '复制内容不完整',
          solution: '检查文本长度限制，大文本可能被截断'
        }
      ]
    };
  }
}

// 创建单例实例
const clipboardService = new ClipboardService();

export default clipboardService;
