// 【2.3节】增强版Mermaid代码清理和修复函数
function cleanMermaidCode(mermaidCode) {
  console.log('开始清理Mermaid代码，原始长度:', mermaidCode.length);
  
  try {
    let cleaned = mermaidCode
      // 第一步：预处理 - 先处理最严重的语法错误
      .replace(/\|{2,}/g, ' ')  // 所有多个管道符都替换为空格
      .replace(/#{2,}/g, '#')   // 多个#符号简化为单个
      .replace(/\*{2,}/g, '*')  // 多个*符号简化为单个
      
      // 第二步：修复节点语法 - 彻底清理节点内的特殊字符
      .replace(/\[([^\]]*)\]/g, (match, content) => {
        // 清理方括号节点内容
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
        
        // 如果内容过长，截断
        const shortContent = cleanContent.length > 30 
          ? cleanContent.substring(0, 25) + '...' 
          : cleanContent;
          
        return shortContent ? `[${shortContent}]` : '[步骤]';
      })
      .replace(/\{([^}]*)\}/g, (match, content) => {
        // 清理花括号节点内容
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
        
        const shortContent = cleanContent.length > 30 
          ? cleanContent.substring(0, 25) + '...' 
          : cleanContent;
          
        return shortContent ? `{${shortContent}}` : '{条件}';
      })
      .replace(/\(\(([^)]*)\)\)/g, (match, content) => {
        // 清理双括号节点内容
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
        
        const shortContent = cleanContent.length > 30 
          ? cleanContent.substring(0, 25) + '...' 
          : cleanContent;
          
        return shortContent ? `((${shortContent}))` : '((开始))';
      })
      .replace(/\(([^)]*)\)/g, (match, content) => {
        // 清理圆括号节点内容
        const cleanContent = content
          .replace(/\|+/g, ' ')           // 移除所有管道符
          .replace(/#+/g, '')             // 移除井号
          .replace(/\*+/g, '')            // 移除星号
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 只保留字母数字中文和空格
          .replace(/\s+/g, ' ')           // 合并多个空格
          .trim();
        
        const shortContent = cleanContent.length > 30 
          ? cleanContent.substring(0, 25) + '...' 
          : cleanContent;
          
        return shortContent ? `(${shortContent})` : '(流程)';
      })
      
      // 第三步：彻底修复连接符 - 处理所有可能的连接符组合
      .replace(/={2,}>{1,}/g, ' --> ')    // ===>>> 等转为 -->
      .replace(/={2,}/g, ' --> ')         // == 等转为 -->
      .replace(/-{3,}>/g, ' --> ')        // -----> 等转为 -->
      .replace(/-{3,}/g, ' --- ')         // ------ 等转为 ---
      .replace(/>{2,}/g, ' --> ')         // >> 等转为 -->
      .replace(/\s*-->\s*/g, ' --> ')     // 标准化箭头连接
      .replace(/\s*---\s*/g, ' --- ')     // 标准化线条连接
      .replace(/\s*-\.-\s*/g, ' -.- ')    // 标准化虚线连接
      
      // 第四步：清理残留的特殊字符和修复语法错误
      .replace(/\s*\|\s*-+\s*>/g, ' --> ')  // |---> 转为 -->
      .replace(/\s*\|\s*=+\s*>/g, ' --> ')  // |===> 转为 -->
      .replace(/\s*\|\s*/g, ' ')            // 清理剩余的独立管道符
      
      // 第五步：修复连接符后可能出现的问题
      .replace(/-->\s*>+/g, ' --> ')        // --> >> 转为 -->
      .replace(/---\s*-+/g, ' --- ')        // --- -- 转为 ---
      .replace(/=+\s*>+/g, ' --> ')         // = > 转为 -->
      
      // 第五点五步：修复subgraph和注释语法
      .replace(/subgraph\s+([^{}\n]+)/g, (match, title) => {
        // 清理subgraph标题，移除特殊字符
        const cleanTitle = title
          .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return cleanTitle ? `subgraph ${cleanTitle}` : 'subgraph 流程';
      })
      // 简单修复：只处理最常见的问题
      // 1. 修复节点ID连在一起：AB[文本]P --> AB[文本] P
      .replace(/([A-Za-z0-9_]+\[[^\]]*\])([A-Za-z0-9_]+)/g, '$1\n$2')
      // 2. 修复连接线标签语法错误：A --> 标签 B --> A -->|标签| B
      .replace(/(-->|---)\s+([^\s\-\>\|A-Za-z0-9_\[\{\(]+)\s+([A-Za-z0-9_]+)/g, '$1|$2| $3')
      // 3. 修复连接线标签语法错误：A --> 标签 B[文本] --> A -->|标签| B[文本]  
      .replace(/(-->|---)\s+([^\s\-\>\|A-Za-z0-9_\[\{\(]+)\s+([A-Za-z0-9_]+\[[^\]]*\])/g, '$1|$2| $3')
      // 4. 修复连接线标签语法错误：A --> 标签 B{文本} --> A -->|标签| B{文本}
      .replace(/(-->|---)\s+([^\s\-\>\|A-Za-z0-9_\[\{\(]+)\s+([A-Za-z0-9_]+\{[^}]*\})/g, '$1|$2| $3')
      // 5. 移除连接中剩余的非法字符：A --> 中文 B 变为 A --> B（作为备用）
      .replace(/(-->|---)\s+[\u4e00-\u9fff\s]+([A-Za-z0-9_]+)/g, '$1 $2')
      // 移除或转换非法的文本内容
      .replace(/^#[^%]/gm, '%% ')          // 将#注释转为%%注释
      .replace(/^\d+\.\s*/gm, '%% ')       // 将数字列表转为注释
      .replace(/^\*\s*/gm, '%% ')          // 将星号列表转为注释
      .replace(/^-\s*/gm, '%% ')           // 将短横线列表转为注释
      
      // 第六步：清理空行和格式化
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // 确保每行不超过150个字符
        if (line.length > 150) {
          return line.substring(0, 130) + '...';
        }
        return line;
      })
      .join('\n')
      
      // 第七步：最终的语法修复
      .replace(/\s{2,}/g, ' ')              // 合并多个空格
      .replace(/\n\s*\n/g, '\n');          // 移除空行

    // 第八步：最终验证和修复
    if (!cleaned.includes('flowchart')) {
      cleaned = 'flowchart TD\n' + cleaned;
    }
    
    // 确保至少有一个有效的节点连接
    if (!cleaned.includes('-->') && !cleaned.includes('---')) {
      console.warn('警告：清理后的代码可能缺少节点连接');
      // 添加一个简单的连接
      cleaned = cleaned + '\nA --> B';
    }

    console.log('Mermaid代码清理完成，清理后长度:', cleaned.length);
    return cleaned;
    
  } catch (error) {
    console.error('Mermaid代码清理失败:', error);
    // 返回一个最简单的备用流程图
    return `flowchart TD
    A[开始] --> B[处理中]
    B --> C[结束]`;
  }
}

// AI分析API - 使用安全的配置读取方式
export default async function handler(req, res) {
  // 标准CORS设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed. Use POST.' 
    });
  }

  try {
    // 【6.8节】正确解析请求体 - 解决400 Bad Request
    let requestBody;
    try {
      requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return res.status(400).json({
        success: false,
        error: '请求数据格式错误，请检查JSON格式',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

    // 验证请求体存在
    if (!requestBody) {
      return res.status(400).json({
        success: false,
        error: '请求体不能为空'
      });
    }

    const { requirement, productType = '通用', implementType = '通用' } = requestBody;

    // 【6.8节】完善字段验证
    if (!requirement || typeof requirement !== 'string' || requirement.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '需求描述不能为空',
        received: typeof requirement
      });
    }

    if (requirement.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: '需求描述至少需要10个字符',
        current: requirement.trim().length
      });
    }

    // 环境变量验证
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API Key未配置');
      return res.status(500).json({
        success: false,
        error: '服务配置错误，请联系管理员'
      });
    }

    // 内嵌v2.4版本提示词配置（平衡实用版本）
    const promptConfig = {
      version: "2.4",
      lastUpdated: "2025-08-19",
      description: "AI流程图生成工具 - 平衡实用版本",
      systemRole: `你是资深的产品架构师和业务流程专家。基于用户简单需求，主动进行业务分析，推断完整流程，生成专业流程图。你是业务分析助手，不要求用户提供所有细节。

核心原则：
- 主动推断完整业务流程，重点关注用户角色、权限管理、商业化节点、异常处理
- 输出对产品经理和开发团队有实际指导价值
- 节点命名具体明确，避免空洞词语
- 结合产品形态：桌面端（本地处理）、Web（网络延迟）、移动App（弱网优化）、插件（轻量化）`,
      
      template: "【需求】：{requirement}\n【产品类型】：{productType}\n【实现方式】：{implementType}\n\n请按以下结构输出：\n\n## 业务流程分析\n- 场景理解（结合{productType}特点）\n- 完整流程说明（用户角色、系统动作、数据流转）\n- 关键节点说明（权限验证、核心功能、商业化节点）\n- 异常处理（网络失败、API超时、权限不足的降级方案）\n\n## 商业化策略\n- 收费点设计：识别核心收费环节和价值点\n- 权限层次：登录态→试用态→付费态的逻辑设计\n- 用户转化：试用策略和付费触发时机\n\n## 用户体验优化\n- 操作流畅性、错误恢复、性能优化建议\n\n## 流程图代码\n严格按Mermaid flowchart TD规范：\n- 节点ID英文开头：A, B1, loginCheck\n- 节点文本≤15字符：A[用户登录]\n- 矩形[]操作，菱形{}判断，判断必须≥2分支\n- 标注分支：-->|是| -->|否|\n\n```mermaid\nflowchart TD\nA[用户登录] --> B{权限检查}\nB -->|通过| C[执行功能]\nB -->|失败| D[跳转登录]\nC --> E{网络状态}\nE -->|正常| F[返回结果]\nE -->|异常| G[离线模式]\n```"
    };
    
    console.log(`使用内嵌提示词配置: ${promptConfig.version} - ${promptConfig.description}`);
    console.log('开始AI分析，需求:', requirement.substring(0, 100) + '...');

    // 使用配置文件中的专业提示词
    const systemPrompt = promptConfig.systemRole;
    
    // 根据模板构建用户提示词
    const userPrompt = promptConfig.template
      .replace('{requirement}', requirement)
      .replace('{productType}', productType)
      .replace('{implementType}', implementType);

    console.log('系统提示词:', systemPrompt);
    console.log('用户提示词:', userPrompt.substring(0, 200) + '...');

    // 调用DeepSeek API
    const apiResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEFAULT_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('DeepSeek API错误:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      throw new Error(`DeepSeek API调用失败: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();

    if (!apiData.choices || !apiData.choices[0] || !apiData.choices[0].message) {
      console.error('DeepSeek API响应格式异常:', apiData);
      throw new Error('AI服务响应格式异常');
    }

    const fullResponse = apiData.choices[0].message.content.trim();
    
    // 【方案二】优先提取mermaid代码块，分离解释和代码
    const mermaidMatch = fullResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    let mermaidCode;
    
    if (mermaidMatch && mermaidMatch[1]) {
      // 找到了mermaid代码块，使用代码块内容
      mermaidCode = mermaidMatch[1].trim();
      console.log('✅ 成功提取mermaid代码块');
    } else {
      // 没找到代码块，使用传统方式清理
      console.log('⚠️ 未找到mermaid代码块，使用传统清理方式');
      mermaidCode = fullResponse
        .replace(/```mermaid\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^mermaid\n?/g, '')
        .trim();
    }

    // 确保代码符合配置要求
    if (!mermaidCode.toLowerCase().includes('flowchart')) {
      mermaidCode = `flowchart TD\n${mermaidCode}`;
    }

    // 【2.3节】Mermaid语法错误修复和清理
    mermaidCode = cleanMermaidCode(mermaidCode);

    // 基本验证
    if (!mermaidCode.includes('-->') && !mermaidCode.includes('---')) {
      console.warn('生成的流程图可能不符合Mermaid语法标准');
    }

    // 统计生成的流程图复杂度
    const nodeCount = (mermaidCode.match(/\[.*?\]|\{.*?\}|\(\(.*?\)\)/g) || []).length;
    const connectionCount = (mermaidCode.match(/-->/g) || []).length;
    
    console.log(`AI分析完成 - 节点数: ${nodeCount}, 连接数: ${connectionCount}`);

    // 返回标准化响应
    return res.status(200).json({
      success: true,
      mermaidCode: mermaidCode,
      fullResponse: fullResponse,
      hasCodeBlock: !!mermaidMatch, // 标识是否成功提取了代码块
      metadata: {
        requirement: requirement.substring(0, 200) + (requirement.length > 200 ? '...' : ''),
        productType,
        implementType,
        promptVersion: promptConfig.version,
        promptDescription: promptConfig.description,
        generatedAt: new Date().toISOString(),
        model: apiData.model || 'deepseek-chat',
        usage: apiData.usage,
        complexity: {
          nodeCount,
          connectionCount
        }
      }
    });

  } catch (error) {
    console.error('AI分析处理错误:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 分类错误处理（基于BUG-FIXES-SUMMARY.md经验）
    if (error.message.includes('DeepSeek API')) {
      return res.status(503).json({
        success: false,
        error: 'AI服务暂时不可用，请稍后重试',
        details: error.message
      });
    }

    if (error.message.includes('生成的流程图代码格式异常')) {
      return res.status(422).json({
        success: false,
        error: 'AI生成的流程图格式有误，请重新尝试',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: '服务器处理错误，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}