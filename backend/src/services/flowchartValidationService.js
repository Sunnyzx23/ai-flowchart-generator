import { v4 as uuidv4 } from 'uuid';

/**
 * 流程图数据验证服务
 * 处理Mermaid代码的接收、验证和格式化
 */
class FlowchartValidationService {
  constructor() {
    // Mermaid语法模式
    this.syntaxPatterns = {
      // 流程图类型检测
      flowchartTypes: {
        flowchart: /^flowchart\s+(TD|TB|BT|RL|LR|DT)/m,
        graph: /^graph\s+(TD|TB|BT|RL|LR|DT)/m,
        gitgraph: /^gitgraph/m,
        sequenceDiagram: /^sequenceDiagram/m,
        classDiagram: /^classDiagram/m,
        stateDiagram: /^stateDiagram/m,
        erDiagram: /^erDiagram/m,
        journey: /^journey/m,
        gantt: /^gantt/m,
        pie: /^pie/m
      },
      
      // 节点模式
      nodes: {
        rectangle: /\w+\[.*?\]/g,
        roundedRectangle: /\w+\(.*?\)/g,
        circle: /\w+\(\(.*?\)\)/g,
        diamond: /\w+\{.*?\}/g,
        hexagon: /\w+\{\{.*?\}\}/g,
        parallelogram: /\w+\[\/.*?\/\]/g,
        trapezoid: /\w+\[\\.*?\\]/g
      },
      
      // 连接模式
      connections: {
        arrow: /-->/g,
        line: /---/g,
        dotted: /\.-\./g,
        thick: /==>/g,
        invisible: /~~~~/g
      },
      
      // 样式模式
      styles: {
        style: /style\s+\w+\s+.*$/gm,
        classDef: /classDef\s+\w+\s+.*$/gm,
        class: /class\s+[\w,]+\s+\w+$/gm
      },
      
      // 标签模式
      labels: /\|.*?\|/g,
      
      // 注释模式
      comments: /%%.*$/gm,
      
      // 子图模式
      subgraphs: /subgraph\s+.*?\s+end/gs
    };

    // 验证错误类型
    this.errorTypes = {
      SYNTAX_ERROR: 'SYNTAX_ERROR',
      INVALID_TYPE: 'INVALID_TYPE',
      MISSING_NODES: 'MISSING_NODES',
      INVALID_CONNECTIONS: 'INVALID_CONNECTIONS',
      MALFORMED_SYNTAX: 'MALFORMED_SYNTAX',
      EMPTY_CONTENT: 'EMPTY_CONTENT',
      TOO_LARGE: 'TOO_LARGE',
      UNSUPPORTED_FEATURES: 'UNSUPPORTED_FEATURES'
    };

    // 配置限制
    this.limits = {
      maxCodeLength: 50000, // 最大代码长度
      maxNodes: 500,        // 最大节点数
      maxConnections: 1000, // 最大连接数
      maxSubgraphs: 50      // 最大子图数
    };
  }

  /**
   * 验证流程图数据
   * @param {Object} data - 流程图数据
   * @returns {Object} 验证结果
   */
  async validateFlowchartData(data) {
    const validationId = uuidv4();
    const startTime = Date.now();

    try {
      // 基础数据验证
      const basicValidation = this.validateBasicData(data);
      if (!basicValidation.isValid) {
        return this.createValidationResult(validationId, false, basicValidation.errors, null, startTime);
      }

      const { code, type, metadata = {} } = data;

      // Mermaid语法验证
      const syntaxValidation = await this.validateMermaidSyntax(code);
      if (!syntaxValidation.isValid) {
        return this.createValidationResult(validationId, false, syntaxValidation.errors, null, startTime);
      }

      // 流程图类型验证
      const typeValidation = this.validateFlowchartType(code, type);
      if (!typeValidation.isValid) {
        return this.createValidationResult(validationId, false, typeValidation.errors, null, startTime);
      }

      // 内容完整性验证
      const contentValidation = this.validateContent(code);
      if (!contentValidation.isValid) {
        return this.createValidationResult(validationId, false, contentValidation.errors, null, startTime);
      }

      // 数据清理和标准化
      const cleanedData = this.cleanAndNormalizeData(code, type, metadata);

      // 生成统计信息
      const stats = this.generateStats(cleanedData.code);

      return this.createValidationResult(
        validationId, 
        true, 
        [], 
        {
          ...cleanedData,
          stats,
          validationInfo: {
            detectedType: typeValidation.detectedType,
            features: contentValidation.features,
            complexity: this.calculateComplexity(stats)
          }
        }, 
        startTime
      );

    } catch (error) {
      return this.createValidationResult(
        validationId, 
        false, 
        [{
          type: this.errorTypes.SYNTAX_ERROR,
          message: '验证过程中发生错误',
          details: error.message
        }], 
        null, 
        startTime
      );
    }
  }

  /**
   * 基础数据验证
   */
  validateBasicData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push({
        type: this.errorTypes.INVALID_TYPE,
        message: '数据格式无效',
        details: '数据必须是一个对象'
      });
      return { isValid: false, errors };
    }

    if (!data.code || typeof data.code !== 'string') {
      errors.push({
        type: this.errorTypes.EMPTY_CONTENT,
        message: 'Mermaid代码不能为空',
        details: 'code字段必须是非空字符串'
      });
    }

    if (data.code && data.code.length > this.limits.maxCodeLength) {
      errors.push({
        type: this.errorTypes.TOO_LARGE,
        message: '代码长度超出限制',
        details: `代码长度不能超过${this.limits.maxCodeLength}字符`
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Mermaid语法验证
   */
  async validateMermaidSyntax(code) {
    const errors = [];

    try {
      // 基础语法检查
      const basicSyntaxCheck = this.checkBasicSyntax(code);
      if (!basicSyntaxCheck.isValid) {
        errors.push(...basicSyntaxCheck.errors);
      }

      // 括号匹配检查
      const bracketCheck = this.checkBracketMatching(code);
      if (!bracketCheck.isValid) {
        errors.push(...bracketCheck.errors);
      }

      // 节点和连接验证
      const structureCheck = this.checkStructure(code);
      if (!structureCheck.isValid) {
        errors.push(...structureCheck.errors);
      }

      return { isValid: errors.length === 0, errors };

    } catch (error) {
      errors.push({
        type: this.errorTypes.SYNTAX_ERROR,
        message: 'Mermaid语法验证失败',
        details: error.message
      });
      return { isValid: false, errors };
    }
  }

  /**
   * 流程图类型验证
   */
  validateFlowchartType(code, expectedType) {
    const errors = [];
    let detectedType = null;

    // 检测流程图类型
    for (const [type, pattern] of Object.entries(this.syntaxPatterns.flowchartTypes)) {
      if (pattern.test(code)) {
        detectedType = type;
        break;
      }
    }

    if (!detectedType) {
      errors.push({
        type: this.errorTypes.INVALID_TYPE,
        message: '无法识别流程图类型',
        details: '代码必须以有效的Mermaid图表类型开头'
      });
      return { isValid: false, errors, detectedType };
    }

    // 如果指定了期望类型，验证是否匹配
    if (expectedType && expectedType !== detectedType) {
      errors.push({
        type: this.errorTypes.INVALID_TYPE,
        message: '流程图类型不匹配',
        details: `期望类型: ${expectedType}, 检测到: ${detectedType}`
      });
    }

    return { isValid: errors.length === 0, errors, detectedType };
  }

  /**
   * 内容完整性验证
   */
  validateContent(code) {
    const errors = [];
    const features = {
      hasNodes: false,
      hasConnections: false,
      hasLabels: false,
      hasStyles: false,
      hasSubgraphs: false
    };

    // 检查节点
    const nodeMatches = this.extractNodes(code);
    features.hasNodes = nodeMatches.length > 0;
    
    if (nodeMatches.length === 0) {
      errors.push({
        type: this.errorTypes.MISSING_NODES,
        message: '流程图缺少节点',
        details: '至少需要定义一个节点'
      });
    } else if (nodeMatches.length > this.limits.maxNodes) {
      errors.push({
        type: this.errorTypes.TOO_LARGE,
        message: '节点数量超出限制',
        details: `节点数量不能超过${this.limits.maxNodes}个`
      });
    }

    // 检查连接
    const connectionMatches = this.extractConnections(code);
    features.hasConnections = connectionMatches.length > 0;
    
    if (connectionMatches.length > this.limits.maxConnections) {
      errors.push({
        type: this.errorTypes.TOO_LARGE,
        message: '连接数量超出限制',
        details: `连接数量不能超过${this.limits.maxConnections}个`
      });
    }

    // 检查其他特性
    features.hasLabels = this.syntaxPatterns.labels.test(code);
    features.hasStyles = this.syntaxPatterns.styles.style.test(code) || 
                        this.syntaxPatterns.styles.classDef.test(code);
    features.hasSubgraphs = this.syntaxPatterns.subgraphs.test(code);

    return { isValid: errors.length === 0, errors, features };
  }

  /**
   * 基础语法检查
   */
  checkBasicSyntax(code) {
    const errors = [];

    // 检查是否包含明显的无效字符（更宽松的检查）
    const invalidChars = /[^\w\s\[\](){}<>|\/\\.,;:'"=\-~!@#$%^&*+?\n\r\u4e00-\u9fff]/g;
    const invalidMatches = code.match(invalidChars);
    if (invalidMatches) {
      // 过滤掉常见的有效字符
      const reallyInvalid = invalidMatches.filter(char => 
        !['\n', '\r', ' ', '\t'].includes(char)
      );
      if (reallyInvalid.length > 0) {
        errors.push({
          type: this.errorTypes.MALFORMED_SYNTAX,
          message: '包含无效字符',
          details: `发现无效字符: ${[...new Set(reallyInvalid)].join(', ')}`
        });
      }
    }

    // 简化行结构检查
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && trimmedLine.length > 1000) { // 只检查过长的行
        errors.push({
          type: this.errorTypes.MALFORMED_SYNTAX,
          message: `第${index + 1}行过长`,
          details: `行长度: ${trimmedLine.length} 字符`
        });
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 括号匹配检查
   */
  checkBracketMatching(code) {
    const errors = [];
    const brackets = {
      '[': ']',
      '(': ')',
      '{': '}',
      '{{': '}}',
      '((': '))'
    };

    const stack = [];
    const chars = code.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const nextChar = chars[i + 1];
      const twoChar = char + nextChar;
      
      // 检查双字符括号
      if (brackets[twoChar]) {
        stack.push({ bracket: twoChar, pos: i });
        i++; // 跳过下一个字符
        continue;
      }
      
      // 检查单字符括号
      if (brackets[char]) {
        stack.push({ bracket: char, pos: i });
      } else if (Object.values(brackets).includes(char)) {
        // 找到闭合括号
        const lastOpen = stack.pop();
        if (!lastOpen || brackets[lastOpen.bracket] !== char) {
          errors.push({
            type: this.errorTypes.MALFORMED_SYNTAX,
            message: '括号不匹配',
            details: `位置${i}处的'${char}'没有匹配的开括号`
          });
        }
      }
    }

    // 检查未闭合的括号
    stack.forEach(item => {
      errors.push({
        type: this.errorTypes.MALFORMED_SYNTAX,
        message: '括号未闭合',
        details: `位置${item.pos}处的'${item.bracket}'没有闭合`
      });
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 结构检查
   */
  checkStructure(code) {
    const errors = [];

    // 检查节点定义
    const nodes = this.extractNodes(code);
    const nodeIds = new Set();
    
    nodes.forEach(node => {
      if (nodeIds.has(node.id)) {
        errors.push({
          type: this.errorTypes.MALFORMED_SYNTAX,
          message: '重复的节点ID',
          details: `节点ID '${node.id}' 重复定义`
        });
      }
      nodeIds.add(node.id);
    });

    // 简化连接检查 - 只检查连接语法，不验证节点引用
    const connections = this.extractConnections(code);
    if (connections.length === 0 && nodes.length > 1) {
      // 只有在有多个节点但没有连接时才报错
      errors.push({
        type: this.errorTypes.INVALID_CONNECTIONS,
        message: '缺少节点连接',
        details: '多个节点之间缺少连接关系'
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 数据清理和标准化
   */
  cleanAndNormalizeData(code, type, metadata) {
    // 清理代码
    let cleanedCode = code
      .replace(/\r\n/g, '\n')           // 统一换行符
      .replace(/\t/g, '  ')             // 制表符转空格
      .replace(/\s+$/gm, '')            // 移除行尾空格
      .replace(/^\s*\n/gm, '')          // 移除空行
      .trim();                          // 移除首尾空格

    // 标准化缩进
    cleanedCode = this.normalizeIndentation(cleanedCode);

    return {
      code: cleanedCode,
      type: type || this.detectType(cleanedCode),
      metadata: {
        ...metadata,
        cleanedAt: new Date().toISOString(),
        originalLength: code.length,
        cleanedLength: cleanedCode.length
      }
    };
  }

  /**
   * 生成统计信息
   */
  generateStats(code) {
    const nodes = this.extractNodes(code);
    const connections = this.extractConnections(code);
    const lines = code.split('\n').filter(line => line.trim());
    
    return {
      codeLength: code.length,
      lineCount: lines.length,
      nodeCount: nodes.length,
      connectionCount: connections.length,
      hasStyles: this.syntaxPatterns.styles.style.test(code),
      hasSubgraphs: this.syntaxPatterns.subgraphs.test(code),
      hasLabels: this.syntaxPatterns.labels.test(code),
      complexity: this.calculateComplexity({
        nodeCount: nodes.length,
        connectionCount: connections.length
      })
    };
  }

  /**
   * 计算复杂度
   */
  calculateComplexity(stats) {
    const { nodeCount = 0, connectionCount = 0 } = stats;
    
    // 简单的复杂度计算公式
    const complexity = nodeCount + connectionCount * 0.5;
    
    if (complexity <= 10) return 'simple';
    if (complexity <= 30) return 'medium';
    if (complexity <= 100) return 'complex';
    return 'very_complex';
  }

  /**
   * 提取节点
   */
  extractNodes(code) {
    const nodes = [];
    const allPatterns = Object.values(this.syntaxPatterns.nodes);
    
    allPatterns.forEach(pattern => {
      const matches = [...code.matchAll(pattern)];
      matches.forEach(match => {
        const nodeStr = match[0];
        const id = nodeStr.split(/[\[\({]/)[0];
        const label = nodeStr.match(/[\[\({](.*)[\]\)}]/)?.[1] || id;
        
        nodes.push({
          id: id.trim(),
          label: label.trim(),
          type: this.getNodeType(nodeStr),
          raw: nodeStr
        });
      });
    });

    return nodes;
  }

  /**
   * 提取连接
   */
  extractConnections(code) {
    const connections = [];
    
    // 使用正则表达式直接匹配所有连接模式
    const connectionPatterns = [
      /(\w+)\s*-->\s*(\w+)/g,  // 箭头连接
      /(\w+)\s*---\s*(\w+)/g,  // 直线连接  
      /(\w+)\s*==>\s*(\w+)/g,  // 粗线连接
      /(\w+)\s*\.-\.\s*(\w+)/g // 虚线连接
    ];

    connectionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        connections.push({
          from: match[1],
          to: match[2],
          type: this.getConnectionType(match[0])
        });
      }
    });

    return connections;
  }

  /**
   * 辅助方法
   */
  isValidLine(line) {
    // 检查是否是有效的Mermaid行
    if (line.startsWith('%%')) return true; // 注释
    if (line.match(/^(flowchart|graph|sequenceDiagram|classDiagram)/)) return true; // 图表类型
    if (line.match(/^\s*\w+/)) return true; // 节点或连接
    if (line.match(/^(style|classDef|class)/)) return true; // 样式
    if (line.match(/^(subgraph|end)/)) return true; // 子图
    return false;
  }

  isConnectionLine(line) {
    return Object.values(this.syntaxPatterns.connections).some(pattern => 
      pattern.test(line)
    );
  }

  parseConnectionLine(line) {
    // 简化的连接解析
    const parts = line.split(/-->|---|==>/);
    if (parts.length >= 2) {
      return {
        from: parts[0].trim(),
        to: parts[1].trim(),
        type: line.includes('-->') ? 'arrow' : 
              line.includes('==>') ? 'thick' : 'line'
      };
    }
    return null;
  }

  getNodeType(nodeStr) {
    if (nodeStr.includes('[') && nodeStr.includes(']')) return 'rectangle';
    if (nodeStr.includes('(') && nodeStr.includes(')')) return 'rounded';
    if (nodeStr.includes('{') && nodeStr.includes('}')) return 'diamond';
    return 'unknown';
  }

  getConnectionType(connectionStr) {
    if (connectionStr.includes('-->')) return 'arrow';
    if (connectionStr.includes('==>')) return 'thick';
    if (connectionStr.includes('---')) return 'line';
    if (connectionStr.includes('.-.')) return 'dotted';
    return 'unknown';
  }

  detectType(code) {
    for (const [type, pattern] of Object.entries(this.syntaxPatterns.flowchartTypes)) {
      if (pattern.test(code)) {
        return type;
      }
    }
    return 'unknown';
  }

  normalizeIndentation(code) {
    const lines = code.split('\n');
    const normalizedLines = lines.map(line => {
      // 简单的缩进标准化，保持相对缩进
      return line.replace(/^\s*/, match => '  '.repeat(Math.floor(match.length / 2)));
    });
    return normalizedLines.join('\n');
  }

  /**
   * 创建验证结果
   */
  createValidationResult(id, isValid, errors, data, startTime) {
    return {
      validationId: id,
      isValid,
      errors,
      data,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };
  }
}

export default new FlowchartValidationService();
