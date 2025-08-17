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

      // 更严格的节点和连接模式
      const nodePattern = /^\s*[A-Za-z0-9_]+[\[\(\{].*?[\]\)\}]/;
      const linkPattern = /^\s*[A-Za-z0-9_]+\s*[-\.=]*>\s*[A-Za-z0-9_]+/;
      const stylePattern = /^\s*style\s+[A-Za-z0-9_]+\s+.+/;
      const commentPattern = /^\s*%%/;
      const flowchartPattern = /^\s*flowchart\s+(TD|TB|BT|RL|LR)/;
      
      const lines = code.split('\n');
      let hasNodes = false;
      let hasLinks = false;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return; // 空行忽略
        
        // 检查各种有效模式
        if (commentPattern.test(trimmedLine)) return; // 注释
        if (flowchartPattern.test(trimmedLine)) return; // flowchart声明
        if (stylePattern.test(trimmedLine)) return; // 样式定义

        // 检查节点定义
        if (nodePattern.test(trimmedLine)) {
          hasNodes = true;
          
          // 检查节点文本是否包含问题字符
          const nodeMatch = trimmedLine.match(/[\[\(\{]([^[\]\(\)\{\}]*?)[\]\)\}]/);
          if (nodeMatch && nodeMatch[1]) {
            const nodeText = nodeMatch[1];
            // 检查未转义的特殊字符
            if (/[[\]{}()]/.test(nodeText) && !nodeText.startsWith('"') && !nodeText.endsWith('"')) {
              result.warnings.push(`第${index + 1}行节点文本可能需要引号包围: ${trimmedLine}`);
            }
          }
          return;
        }

        // 检查连接线定义
        if (linkPattern.test(trimmedLine)) {
          hasLinks = true;
          
          // 检查连接线标签
          const labelMatch = trimmedLine.match(/\|([^|]*?)\|/);
          if (labelMatch && labelMatch[1]) {
            const labelText = labelMatch[1];
            if (/[[\]{}()]/.test(labelText)) {
              result.warnings.push(`第${index + 1}行连接标签可能包含问题字符: ${trimmedLine}`);
            }
          }
          return;
        }

        // 如果不匹配任何模式，记录警告
        if (trimmedLine.length > 0) {
          result.warnings.push(`第${index + 1}行语法不明确: ${trimmedLine}`);
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
      formatIndentation = true,
      fixSpecialChars = true
    } = options;

    let optimizedCode = code;

    // 修复特殊字符问题
    if (fixSpecialChars) {
      optimizedCode = this.fixSpecialCharacters(optimizedCode);
    }

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
   * 修复Mermaid代码中的特殊字符问题
   * @param {string} code - 原始代码
   * @returns {string} 修复后的代码
   */
  fixSpecialCharacters(code) {
    let fixedCode = code;

    // 首先处理整体的问题字符
    fixedCode = fixedCode
      .replace(/[\u201c\u201d]/g, '"') // 替换中文引号为英文引号
      .replace(/[\u2018\u2019]/g, "'") // 替换中文单引号为英文单引号
      .replace(/[\u3001\u3002]/g, ',') // 替换中文标点
      .replace(/[\uff08\uff09]/g, match => match === '\uff08' ? '(' : ')') // 替换全角括号
      .replace(/[\uff1a]/g, ':') // 替换全角冒号
      .replace(/[\uff1f]/g, '?') // 替换全角问号
      .replace(/[\uff01]/g, '!') // 替换全角感叹号
      .replace(/[\u2014\u2013]/g, '-'); // 替换长短横线

    // 修复节点文本中的特殊字符 - 更严格的处理
    fixedCode = fixedCode.replace(/([A-Za-z0-9_]+)(\[|\(|\{)([^\[\]\(\)\{\}]*?)(\]|\)|\})/g, (match, nodeId, openBracket, text, closeBracket) => {
      // 清理节点文本
      let cleanText = text
        .replace(/"/g, '') // 移除双引号
        .replace(/'/g, '') // 移除单引号
        .replace(/[<>]/g, '') // 移除尖括号
        .replace(/[\[\]]/g, '') // 移除方括号
        .replace(/[{}]/g, '') // 移除花括号
        .replace(/\|/g, '') // 移除竖线
        .replace(/\n/g, ' ') // 换行符转空格
        .replace(/\r/g, '') // 移除回车符
        .replace(/\t/g, ' ') // 制表符转空格
        .replace(/\s+/g, ' ') // 多个空格合并为一个
        .trim();

      // 如果文本为空，使用默认文本
      if (!cleanText) {
        cleanText = '步骤';
      }

      // 检查是否需要引号包围 - 更全面的检查
      const needsQuotes = /[()[\]{}|?!:;,\-\+\*\/\\=<>&%$#@~`]/.test(cleanText) || 
                         /\s/.test(cleanText) || // 包含空格
                         /^\d/.test(cleanText); // 以数字开头

      if (needsQuotes) {
        cleanText = `"${cleanText.replace(/"/g, '\\"')}"`;
      }

      return `${nodeId}${openBracket}${cleanText}${closeBracket}`;
    });

    // 修复连接线标签中的特殊字符
    fixedCode = fixedCode.replace(/\|([^|]*?)\|/g, (match, label) => {
      let cleanLabel = label
        .replace(/"/g, '') // 移除双引号
        .replace(/'/g, '') // 移除单引号
        .replace(/[<>]/g, '') // 移除尖括号
        .replace(/[\[\]]/g, '') // 移除方括号
        .replace(/[{}]/g, '') // 移除花括号
        .replace(/\n/g, ' ') // 换行符转空格
        .replace(/\r/g, '') // 移除回车符
        .replace(/\t/g, ' ') // 制表符转空格
        .replace(/\s+/g, ' ') // 多个空格合并为一个
        .trim();

      // 如果标签为空，移除整个标签
      if (!cleanLabel) {
        return '';
      }

      return `|${cleanLabel}|`;
    });

    // 修复样式定义中的问题
    fixedCode = fixedCode.replace(/style\s+([A-Za-z0-9_]+)\s+(.+)/g, (match, nodeId, styleProps) => {
      // 确保样式属性格式正确
      let cleanProps = styleProps
        .replace(/[{}]/g, '') // 移除花括号
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim();
      
      return `style ${nodeId} ${cleanProps}`;
    });

    // 移除空行和多余的空白
    fixedCode = fixedCode
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return fixedCode;
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
