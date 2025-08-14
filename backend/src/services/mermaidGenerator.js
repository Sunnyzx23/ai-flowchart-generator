/**
 * Mermaid代码生成和格式化服务
 */
class MermaidGenerator {
  constructor() {
    // 节点类型定义
    this.nodeTypes = {
      start: { shape: 'round', prefix: '([', suffix: '])' },
      end: { shape: 'round', prefix: '([', suffix: '])' },
      process: { shape: 'rect', prefix: '[', suffix: ']' },
      decision: { shape: 'diamond', prefix: '{', suffix: '}' },
      ai: { shape: 'rect', prefix: '[', suffix: ']' },
      payment: { shape: 'diamond', prefix: '{', suffix: '}' },
      error: { shape: 'rect', prefix: '[', suffix: ']' },
      api: { shape: 'rect', prefix: '[', suffix: ']' },
      database: { shape: 'cylinder', prefix: '[(', suffix: ')]' },
      external: { shape: 'stadium', prefix: '([', suffix: '])' }
    };

    // 样式配置
    this.styles = {
      start: 'fill:#e1f5fe,stroke:#01579b,stroke-width:2px',
      end: 'fill:#f3e5f5,stroke:#4a148c,stroke-width:2px',
      process: 'fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px',
      decision: 'fill:#fff3e0,stroke:#ef6c00,stroke-width:2px',
      ai: 'fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,stroke-dasharray: 5 5',
      payment: 'fill:#fce4ec,stroke:#c2185b,stroke-width:2px',
      error: 'fill:#ffebee,stroke:#d32f2f,stroke-width:2px',
      api: 'fill:#f1f8e9,stroke:#558b2f,stroke-width:2px',
      database: 'fill:#f9fbe7,stroke:#827717,stroke-width:2px',
      external: 'fill:#fafafa,stroke:#616161,stroke-width:2px'
    };

    // 连接线样式
    this.linkStyles = {
      normal: 'stroke:#333,stroke-width:2px',
      success: 'stroke:#4caf50,stroke-width:2px',
      error: 'stroke:#f44336,stroke-width:2px',
      condition: 'stroke:#ff9800,stroke-width:2px',
      ai: 'stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5'
    };
  }

  /**
   * 生成完整的Mermaid流程图代码
   * @param {Object} flowData - 流程图数据
   * @param {Object} options - 生成选项
   * @returns {string} Mermaid代码
   */
  generateFlowchart(flowData, options = {}) {
    try {
      const {
        direction = 'TD', // Top Down
        theme = 'default',
        includeStyles = true
      } = options;

      let mermaidCode = '';
      
      // 1. 图表定义
      mermaidCode += `flowchart ${direction}\n`;
      
      // 2. 生成节点定义
      const nodes = this.generateNodes(flowData.nodes || []);
      mermaidCode += nodes + '\n';
      
      // 3. 生成连接线
      const links = this.generateLinks(flowData.links || []);
      mermaidCode += links + '\n';
      
      // 4. 生成样式（如果需要）
      if (includeStyles) {
        const styles = this.generateStyles(flowData.nodes || []);
        mermaidCode += styles;
      }

      return this.formatCode(mermaidCode);
    } catch (error) {
      console.error('[Mermaid Generator] 生成流程图失败:', error);
      throw new Error(`流程图生成失败: ${error.message}`);
    }
  }

  /**
   * 生成节点定义
   * @param {Array} nodes - 节点数组
   * @returns {string} 节点定义代码
   */
  generateNodes(nodes) {
    return nodes.map(node => {
      const { id, label, type = 'process' } = node;
      const nodeType = this.nodeTypes[type] || this.nodeTypes.process;
      
      // 清理和格式化标签
      const cleanLabel = this.cleanLabel(label);
      
      // 生成节点定义
      return `    ${id}${nodeType.prefix}${cleanLabel}${nodeType.suffix}`;
    }).join('\n');
  }

  /**
   * 生成连接线定义
   * @param {Array} links - 连接线数组
   * @returns {string} 连接线定义代码
   */
  generateLinks(links) {
    return links.map(link => {
      const { from, to, label, type = 'normal' } = link;
      
      // 选择连接线样式
      const arrow = this.getArrowStyle(type);
      
      if (label) {
        const cleanLabel = this.cleanLabel(label);
        return `    ${from} ${arrow}|${cleanLabel}| ${to}`;
      } else {
        return `    ${from} ${arrow} ${to}`;
      }
    }).join('\n');
  }

  /**
   * 生成样式定义
   * @param {Array} nodes - 节点数组
   * @returns {string} 样式定义代码
   */
  generateStyles(nodes) {
    const styleGroups = {};
    
    // 按类型分组节点
    nodes.forEach(node => {
      const type = node.type || 'process';
      if (!styleGroups[type]) {
        styleGroups[type] = [];
      }
      styleGroups[type].push(node.id);
    });

    // 生成样式代码
    let styleCode = '\n    %% 样式定义\n';
    Object.entries(styleGroups).forEach(([type, nodeIds]) => {
      const style = this.styles[type] || this.styles.process;
      nodeIds.forEach(nodeId => {
        styleCode += `    style ${nodeId} ${style}\n`;
      });
    });

    return styleCode;
  }

  /**
   * 获取箭头样式
   * @param {string} type - 连接类型
   * @returns {string} 箭头样式
   */
  getArrowStyle(type) {
    switch (type) {
      case 'success':
        return '-->';
      case 'error':
        return '-->';
      case 'condition':
        return '-->';
      case 'ai':
        return '-..->';
      default:
        return '-->';
    }
  }

  /**
   * 清理标签文本
   * @param {string} label - 原始标签
   * @returns {string} 清理后的标签
   */
  cleanLabel(label) {
    if (!label) return '';
    
    return label
      .replace(/"/g, '&quot;')  // 转义双引号
      .replace(/'/g, '&#39;')   // 转义单引号
      .replace(/\n/g, '<br/>')  // 换行符转换
      .replace(/[{}]/g, '')     // 移除花括号
      .trim();
  }

  /**
   * 格式化Mermaid代码
   * @param {string} code - 原始代码
   * @returns {string} 格式化后的代码
   */
  formatCode(code) {
    return code
      .split('\n')
      .map(line => line.trimRight())  // 移除行尾空格
      .filter(line => line.length > 0 || line.trim() === '') // 保留有意义的空行
      .join('\n')
      .trim();
  }

  /**
   * 验证Mermaid代码语法
   * @param {string} code - Mermaid代码
   * @returns {Object} 验证结果
   */
  validateSyntax(code) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // 基础语法检查
      if (!code || code.trim().length === 0) {
        result.isValid = false;
        result.errors.push('代码为空');
        return result;
      }

      // 检查是否以flowchart开头
      if (!code.trim().startsWith('flowchart')) {
        result.isValid = false;
        result.errors.push('代码必须以flowchart开头');
      }

      // 检查节点定义
      const nodePattern = /^\s*[A-Za-z0-9_]+[\[\(\{][^\[\]\(\)\{\}]*[\]\)\}]/;
      const linkPattern = /^\s*[A-Za-z0-9_]+\s*[-\.]*>\s*[A-Za-z0-9_]+/;
      
      const lines = code.split('\n');
      let hasNodes = false;
      let hasLinks = false;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('%%')) return;
        if (trimmedLine.startsWith('flowchart')) return;
        if (trimmedLine.startsWith('style')) return;

        // 检查节点定义
        if (nodePattern.test(trimmedLine)) {
          hasNodes = true;
          return;
        }

        // 检查连接线定义
        if (linkPattern.test(trimmedLine)) {
          hasLinks = true;
          return;
        }

        // 如果不匹配任何模式，记录警告
        if (trimmedLine.length > 0) {
          result.warnings.push(`第${index + 1}行可能存在语法问题: ${trimmedLine}`);
        }
      });

      if (!hasNodes) {
        result.warnings.push('未检测到节点定义');
      }

      if (!hasLinks) {
        result.warnings.push('未检测到连接线定义');
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`语法验证失败: ${error.message}`);
    }

    return result;
  }

  /**
   * 从AI生成的文本中提取Mermaid代码
   * @param {string} aiResponse - AI响应文本
   * @returns {string} 提取的Mermaid代码
   */
  extractMermaidCode(aiResponse) {
    if (!aiResponse) return '';

    // 尝试提取代码块中的Mermaid代码
    const codeBlockPattern = /```(?:mermaid)?\s*\n([\s\S]*?)\n```/g;
    const matches = codeBlockPattern.exec(aiResponse);
    
    if (matches && matches[1]) {
      return matches[1].trim();
    }

    // 如果没有代码块，尝试查找flowchart开头的内容
    const flowchartPattern = /(flowchart[\s\S]*?)(?=\n\n|\n#|\n-|$)/;
    const flowchartMatch = flowchartPattern.exec(aiResponse);
    
    if (flowchartMatch && flowchartMatch[1]) {
      return flowchartMatch[1].trim();
    }

    // 如果都没找到，返回原文本
    return aiResponse.trim();
  }

  /**
   * 优化Mermaid代码
   * @param {string} code - 原始代码
   * @param {Object} options - 优化选项
   * @returns {string} 优化后的代码
   */
  optimizeCode(code, options = {}) {
    const {
      removeComments = false,
      addStyles = true,
      formatIndentation = true
    } = options;

    let optimizedCode = code;

    // 移除注释
    if (removeComments) {
      optimizedCode = optimizedCode.replace(/^\s*%%.*$/gm, '');
    }

    // 格式化缩进
    if (formatIndentation) {
      optimizedCode = this.formatIndentation(optimizedCode);
    }

    // 移除多余的空行
    optimizedCode = optimizedCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    return optimizedCode.trim();
  }

  /**
   * 格式化缩进
   * @param {string} code - 代码
   * @returns {string} 格式化后的代码
   */
  formatIndentation(code) {
    const lines = code.split('\n');
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      
      // 主要定义不缩进
      if (trimmed.startsWith('flowchart') || trimmed === '') {
        return trimmed;
      }
      
      // 其他内容缩进4个空格
      return trimmed ? `    ${trimmed}` : '';
    });

    return formatted.join('\n');
  }

  /**
   * 生成示例流程图
   * @returns {string} 示例Mermaid代码
   */
  generateExample() {
    const exampleData = {
      nodes: [
        { id: 'A', label: '开始', type: 'start' },
        { id: 'B', label: '用户登录', type: 'process' },
        { id: 'C', label: '验证权限', type: 'decision' },
        { id: 'D', label: 'AI分析', type: 'ai' },
        { id: 'E', label: '生成结果', type: 'process' },
        { id: 'F', label: '结束', type: 'end' },
        { id: 'G', label: '错误处理', type: 'error' }
      ],
      links: [
        { from: 'A', to: 'B', type: 'normal' },
        { from: 'B', to: 'C', type: 'normal' },
        { from: 'C', to: 'D', label: '通过', type: 'success' },
        { from: 'C', to: 'G', label: '失败', type: 'error' },
        { from: 'D', to: 'E', type: 'ai' },
        { from: 'E', to: 'F', type: 'normal' },
        { from: 'G', to: 'F', type: 'normal' }
      ]
    };

    return this.generateFlowchart(exampleData);
  }
}

// 导出单例
export const mermaidGenerator = new MermaidGenerator();
export default mermaidGenerator;
