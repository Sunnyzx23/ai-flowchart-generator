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

    // 内嵌完整V1版本提示词配置（智能业务分析版本）
    const promptConfig = {
      version: "2.0",
      lastUpdated: "2025-08-18", 
      description: "AI流程图生成工具 - 智能业务分析版本",
      systemRole: `你是资深的产品架构师和业务流程专家。你的任务是基于用户的简单需求描述，主动进行深度业务分析，推断出完整的业务流程，并生成专业的流程图。你要成为用户的业务分析助手，而不是要求用户提供所有细节。

工作原则：
- 主动推断完整业务流程，不要求用户提供所有细节
- 重点关注用户角色、权限管理、商业化节点、异常处理、用户体验优化
- 生成的流程图必须对产品经理有实际指导价值，能帮助开发团队理解业务逻辑
- 体现真实的用户使用场景和痛点，包含可执行的商业化策略建议
- 避免空洞的通用流程模板，节点命名要具体明确
- 矩形节点[操作]用于用户动作和系统处理，菱形节点{判断条件}，包括状态检查、条件判断、用户选择、结果判断等仅用于需要根据条件进行分支判断的场景，每个菱形节点必须有至少2个分支

产品形态特殊考虑：
- 桌面客户端：多功能触发入口，本地文件处理、系统集成、离线能力、多窗口协调
- Web应用：跨浏览器兼容、网络延迟、页面刷新、响应式设计
- 移动App：触屏交互、网络不稳定、电量优化、屏幕适配
- 插件扩展：宿主应用限制、权限约束、轻量化设计、快速响应`,
      
      template: "【需求】：{requirement}\n【产品类型】：{productType}\n【实现方式】：{implementType}\n\n基于用户提供的简单需求，你需要主动进行以下智能分析：\n\n1. 场景理解：深入理解业务场景，识别关键角色、核心功能和使用环境\n2. 流程推断：基于行业经验和产品逻辑，推断出完整的业务流程\n3. 关键节点识别：识别权限验证、付费节点、AI调用、异常处理等关键业务节点\n4. 商业逻辑分析：分析商业化机会、用户付费意愿、会员权益等商业逻辑\n5. 用户体验优化：考虑用户操作便利性、反馈及时性、错误恢复等体验要素\n\n生成具有实际业务价值的专业流程图，要求：\n- 体现具体业务场景的真实流程，不是通用模板\n- 包含关键的商业化节点和用户决策点，对AI服务需要根据具体功能特点分析试用策略：分析功能的核心价值单位、用户价值感知点、合理的试用限制方式和最佳的试用判断时机，体现登录态→会员态→试用策略→功能权限的完整判断层次\n- 显示具体的功能模块和数据流转\n- 体现用户的实际操作路径和选择\n- 包含有意义的异常处理和降级方案\n- 节点命名要具体，避免'处理'、'验证'等通用词汇\n- 使用标准Mermaid flowchart TD语法，确保可渲染\n\n生成具体的业务流程，例如：用户登录 → 权限验证 → 功能选择 → 参数配置 → 核心处理 → 结果展示 → 用户确认 → 保存/分享，避免使用'开始→分析→处理→结束'等通用模板。\n\n**重要语法要求**：\n- 节点ID必须英文字母开头：A, B1, userCheck（不能用中文）\n- 一行一个连接：A --> B（不要写 A --> 中文 B --> C）\n- 节点文本简洁：[用户登录]（不超过15字符）\n\n**输出格式要求**：\n请严格按照以下格式输出，分为两个部分：\n\n## 业务流程分析\n\n[详细的业务逻辑分析、关键节点说明、商业化建议]\n\n## 流程图代码\n\n```mermaid\nflowchart TD\n[标准的Mermaid代码]\n```\n\n**语法要求**：\n- 节点ID英文开头：A, B1, userCheck\n- 连接线标签用管道符：A -->|标签| B\n- 节点文本简洁：[用户登录]（≤15字符）\n- 只在代码块内输出纯净语法\n\n严格按格式输出，业务分析和代码必须分离。"
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