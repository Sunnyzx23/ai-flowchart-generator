// 专门的Mermaid修复服务API
// 只在检测到渲染失败时调用

/**
 * 智能Mermaid修复服务
 * 基于错误信息进行针对性修复
 */
class MermaidRepairService {
  
  /**
   * 基于错误类型进行针对性修复
   */
  repairByErrorType(code, errorMessage) {
    console.log('🔧 开始基于错误类型修复:', errorMessage);
    
    let repairedCode = code;
    
    // 1. Parse error 相关修复
    if (errorMessage.includes('Parse error')) {
      repairedCode = this.fixParseErrors(repairedCode, errorMessage);
    }
    
    // 2. NODE_STRING 错误修复
    if (errorMessage.includes('NODE_STRING')) {
      repairedCode = this.fixNodeStringErrors(repairedCode);
    }
    
    // 3. 连接符错误修复
    if (errorMessage.includes('LINK') || errorMessage.includes('ARROW')) {
      repairedCode = this.fixConnectionErrors(repairedCode);
    }
    
    // 4. 通用清理
    repairedCode = this.generalCleanup(repairedCode);
    
    return repairedCode;
  }
  
  /**
   * 修复Parse错误
   */
  fixParseErrors(code, errorMessage) {
    // 提取错误行信息
    const lineMatch = errorMessage.match(/line (\d+)/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : null;
    
    let lines = code.split('\n');
    
    if (lineNumber && lines[lineNumber - 1]) {
      const problemLine = lines[lineNumber - 1];
      console.log('问题行:', problemLine);
      
      // 针对具体问题行进行修复
      lines[lineNumber - 1] = this.fixProblemLine(problemLine);
    }
    
    return lines.join('\n');
  }
  
  /**
   * 修复具体的问题行
   */
  fixProblemLine(line) {
    return line
      // 修复: K --> 每次试用扣减 AB[更新试用计数器]P --> 支付
      .replace(/(\w+)\s*-->\s*([^\w\s\[\]]+)\s+([A-Za-z0-9_]+\[[^\]]*\])([A-Za-z0-9_]*)\s*-->\s*(.+)/g, 
        (match, start, middle, node, suffix, end) => {
          return `${start} --> ${node}\n${suffix || 'NEXT'} --> ${end}`;
        })
      
      // 修复: AB[文本]P --> 其他
      .replace(/([A-Za-z0-9_]+\[[^\]]*\])([A-Za-z0-9_]+)(\s*-->)/g, '$1\n$2$3')
      
      // 移除中文节点ID
      .replace(/(-->|---)\s+([^\sA-Za-z0-9_\[\(\{]+)\s+/g, '$1 ')
      
      // 清理多余空格
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * 修复NODE_STRING错误
   */
  fixNodeStringErrors(code) {
    return code
      // 确保节点ID规范
      .replace(/^([^\sA-Za-z0-9_]+)/gm, 'N')
      // 修复节点定义
      .replace(/([A-Za-z0-9_]+)(\[[^\]]*\])([A-Za-z0-9_]+)/g, '$1$2\n$3')
      // 标准化连接
      .replace(/\s*(-->|---)\s*/g, ' $1 ');
  }
  
  /**
   * 修复连接错误
   */
  fixConnectionErrors(code) {
    return code
      .replace(/={2,}>{1,}/g, ' --> ')
      .replace(/-{3,}>/g, ' --> ')
      .replace(/>{2,}/g, ' --> ')
      .replace(/\s*(-->|---)\s*/g, ' $1 ');
  }
  
  /**
   * 通用清理
   */
  generalCleanup(code) {
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#'))  // 移除注释
      .join('\n')
      .replace(/\s{2,}/g, ' ');
  }
  
  /**
   * 生成备用模板
   */
  generateFallbackTemplate(originalRequirement = '') {
    // 基于原始需求生成简单模板
    if (originalRequirement.includes('登录') || originalRequirement.includes('用户')) {
      return `flowchart TD
    A[用户访问] --> B{登录状态}
    B -->|已登录| C[功能使用]
    B -->|未登录| D[登录页面]
    D --> E[完成登录]
    E --> C
    C --> F[操作完成]`;
    }
    
    if (originalRequirement.includes('付费') || originalRequirement.includes('会员')) {
      return `flowchart TD
    A[功能入口] --> B{会员状态}
    B -->|会员| C[直接使用]
    B -->|非会员| D[试用或付费]
    D --> E[选择方案]
    E --> C
    C --> F[使用完成]`;
    }
    
    // 默认通用模板
    return `flowchart TD
    A[开始] --> B[处理步骤]
    B --> C{条件判断}
    C -->|是| D[处理A]
    C -->|否| E[处理B]
    D --> F[结束]
    E --> F`;
  }
}

// 创建服务实例
const repairService = new MermaidRepairService();

// API端点
export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { mermaidCode, errorMessage, originalRequirement } = req.body;
    
    if (!mermaidCode) {
      return res.status(400).json({ error: 'mermaidCode is required' });
    }
    
    console.log('🔧 收到修复请求:', { 
      codeLength: mermaidCode.length, 
      error: errorMessage?.substring(0, 100) 
    });
    
    let repairedCode;
    let repairMethod;
    
    if (errorMessage) {
      // 基于错误信息进行针对性修复
      repairedCode = repairService.repairByErrorType(mermaidCode, errorMessage);
      repairMethod = 'error-based-repair';
      
      // 如果修复后代码变化不大，可能修复失败，使用备用模板
      if (repairedCode === mermaidCode || repairedCode.length < 50) {
        repairedCode = repairService.generateFallbackTemplate(originalRequirement);
        repairMethod = 'fallback-template';
      }
    } else {
      // 没有错误信息，进行通用修复
      repairedCode = repairService.generalCleanup(mermaidCode);
      repairMethod = 'general-cleanup';
    }
    
    // 确保基本结构
    if (!repairedCode.includes('flowchart')) {
      repairedCode = 'flowchart TD\n' + repairedCode;
    }
    
    return res.status(200).json({
      success: true,
      originalCode: mermaidCode,
      repairedCode: repairedCode,
      repairMethod: repairMethod,
      changes: {
        lengthBefore: mermaidCode.length,
        lengthAfter: repairedCode.length,
        wasModified: repairedCode !== mermaidCode
      }
    });
    
  } catch (error) {
    console.error('修复服务错误:', error);
    
    // 返回最简单的备用方案
    const fallbackCode = repairService.generateFallbackTemplate();
    
    return res.status(200).json({
      success: true,
      originalCode: req.body.mermaidCode || '',
      repairedCode: fallbackCode,
      repairMethod: 'emergency-fallback',
      error: error.message
    });
  }
}


