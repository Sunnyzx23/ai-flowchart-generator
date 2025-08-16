/**
 * Draw.io集成服务
 * 处理与Draw.io编辑器的跳转和数据传递
 */

class DrawioService {
  constructor() {
    this.baseUrl = 'https://app.diagrams.net/';
    this.defaultParams = {
      lightbox: '1',
      edit: '_blank'
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

    console.log('准备打开Draw.io，Mermaid代码:', mermaidCode);
    
    // 经过测试，Draw.io的URL参数导入有限制，直接使用基础URL更可靠
    // 我们将依赖postMessage通信和用户指导来实现导入
    return `${this.baseUrl}`;
  }

  /**
   * 通过高级方法与Draw.io通信
   * @param {Window} drawioWindow - Draw.io窗口引用
   * @param {string} mermaidCode - Mermaid代码
   */
  setupDrawioIntegration(drawioWindow, mermaidCode) {
    if (!drawioWindow || !mermaidCode) return;

    let attemptCount = 0;
    const maxAttempts = 8; // 8秒尝试时间
    
    // 等待Draw.io加载完成并尝试多种通信方式
    const integrationInterval = setInterval(() => {
      try {
        if (drawioWindow.closed) {
          clearInterval(integrationInterval);
          return;
        }

        attemptCount++;
        console.log(`Draw.io集成尝试 ${attemptCount}/${maxAttempts}`);

        // 方法1: 尝试标准的Draw.io消息格式
        const standardMessage = {
          event: 'init'
        };
        drawioWindow.postMessage(JSON.stringify(standardMessage), 'https://app.diagrams.net');

        // 方法2: 尝试Mermaid导入消息
        const mermaidMessage = {
          action: 'load',
          autosave: 1,
          xml: this.createSimpleDrawioXML(mermaidCode)
        };
        drawioWindow.postMessage(JSON.stringify(mermaidMessage), 'https://app.diagrams.net');

        // 方法3: 尝试直接执行脚本（如果同源）
        try {
          if (drawioWindow.document) {
            console.log('尝试直接脚本注入...');
            this.injectMermaidScript(drawioWindow, mermaidCode);
          }
        } catch (crossOriginError) {
          // 跨域限制，这是正常的
          console.log('跨域限制，无法直接注入脚本');
        }

        // 达到最大尝试次数
        if (attemptCount >= maxAttempts) {
          clearInterval(integrationInterval);
          console.log('自动导入尝试完成，显示用户指导');
          
          // 显示用户指导
          setTimeout(() => {
            if (!drawioWindow.closed) {
              this.showDrawioInstructions(mermaidCode);
            }
          }, 500);
        }

      } catch (error) {
        console.warn(`Draw.io通信尝试 ${attemptCount} 失败:`, error);
      }
    }, 1000);

    // 监听来自Draw.io的消息
    const messageListener = (event) => {
      if (event.origin !== 'https://app.diagrams.net') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('收到Draw.io消息:', data);
        
        if (data.event === 'init' || data.event === 'configure') {
          console.log('Draw.io已初始化，尝试加载Mermaid');
          // Draw.io已准备就绪，尝试加载内容
          const loadMessage = {
            action: 'load',
            xml: this.createSimpleDrawioXML(mermaidCode)
          };
          drawioWindow.postMessage(JSON.stringify(loadMessage), 'https://app.diagrams.net');
        }
      } catch (parseError) {
        console.log('消息解析失败:', parseError);
      }
    };

    window.addEventListener('message', messageListener);
    
    // 清理监听器
    setTimeout(() => {
      window.removeEventListener('message', messageListener);
    }, 10000);
  }

  /**
   * 创建简单的Draw.io XML格式
   * @param {string} mermaidCode - Mermaid代码
   * @returns {string} 简化的XML格式
   */
  createSimpleDrawioXML(mermaidCode) {
    // 创建一个包含Mermaid代码的简单文本框
    const escapedCode = mermaidCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    return `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}">
  <diagram name="Mermaid Flow" id="mermaid-flow">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="mermaid-text" value="${escapedCode}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;rounded=0;fontSize=12;fontFamily=monospace;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="400" height="200" as="geometry"/>
        </mxCell>
        <mxCell id="instruction" value="请复制上面的Mermaid代码，然后使用：插入 → 高级 → Mermaid" style="text;html=1;strokeColor=#d6b656;fillColor=#fff2cc;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=1;" vertex="1" parent="1">
          <mxGeometry x="40" y="260" width="400" height="60" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }

  /**
   * 尝试脚本注入（仅同源时可用）
   * @param {Window} drawioWindow - Draw.io窗口
   * @param {string} mermaidCode - Mermaid代码
   */
  injectMermaidScript(drawioWindow, mermaidCode) {
    // 这个方法由于跨域限制通常不会成功，但值得尝试
    const script = drawioWindow.document.createElement('script');
    script.textContent = `
      console.log('尝试自动导入Mermaid代码...');
      // 这里可以添加直接操作Draw.io DOM的代码
      // 但由于跨域限制，通常无法执行
    `;
    drawioWindow.document.head.appendChild(script);
  }

  /**
   * 显示Draw.io使用指导
   * @param {string} mermaidCode - Mermaid代码
   */
  showDrawioInstructions(mermaidCode) {
    // 创建一个更美观的通知，而不是使用alert
    if (typeof window !== 'undefined' && window.parent) {
      // 尝试向父窗口发送消息来显示指导
      const message = {
        type: 'DRAWIO_INSTRUCTIONS',
        data: {
          title: '🎯 Draw.io导入指导',
          instructions: [
            '📋 Mermaid代码已自动复制到剪贴板！',
            '',
            '🚀 推荐方法（快速）：',
            '1️⃣ 在Draw.io中按 Ctrl+Shift+I (Mac用户按 Cmd+Shift+I)',
            '2️⃣ 在弹出的对话框中选择 "Mermaid" 格式',
            '3️⃣ 粘贴代码 (Ctrl+V) 并点击 "导入"',
            '',
            '📝 备选方法（传统）：',
            '1️⃣ 点击左侧工具栏的 "+" 按钮',
            '2️⃣ 选择 "更多图形" → "Mermaid"',
            '3️⃣ 粘贴代码并点击 "插入"',
            '',
            '💡 提示：代码已自动复制，直接粘贴即可使用！'
          ]
        }
      };
      
      try {
        window.parent.postMessage(message, '*');
      } catch (error) {
        // 如果无法发送消息，回退到alert
        this.fallbackAlert();
      }
    } else {
      this.fallbackAlert();
    }
  }
  
  /**
   * 回退的alert方法
   */
  fallbackAlert() {
    const instructions = `🎯 Draw.io导入指导

📋 Mermaid代码已复制到剪贴板！

🚀 推荐方法：
按 Ctrl+Shift+I → 选择Mermaid → 粘贴代码

📝 备选方法：
点击"+"按钮 → 更多图形 → Mermaid → 粘贴代码

💡 代码已自动复制，直接粘贴即可！`;
    
    alert(instructions);
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

      // 自动复制Mermaid代码到剪贴板
      try {
        await navigator.clipboard.writeText(mermaidCode);
        console.log('Mermaid代码已复制到剪贴板');
      } catch (error) {
        console.warn('无法自动复制到剪贴板:', error);
      }

      // 打开新窗口
      const newWindow = window.open(drawioUrl, '_blank', featuresString);

      if (!newWindow) {
        throw new Error('无法打开Draw.io编辑器，请检查浏览器弹窗设置');
      }

      // 尝试自动化集成
      this.setupDrawioIntegration(newWindow, mermaidCode);

      return {
        success: true,
        message: 'Draw.io编辑器已打开，正在尝试自动导入...',
        url: drawioUrl,
        window: newWindow,
        compatibility,
        autoImport: true,
        hasAutoImportUrl: false, // 不再使用URL参数导入
        fallbackInstructions: {
          quickMethod: '按 Ctrl+Shift+I → 选择Mermaid → 粘贴代码',
          traditionalMethod: '点击"+"按钮 → 更多图形 → Mermaid → 粘贴代码'
        }
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
          description: '确保流程图数据已加载完成，系统会自动复制Mermaid代码'
        },
        {
          step: 2,
          title: '等待编辑器打开',
          description: '新窗口将自动打开Draw.io编辑器'
        },
        {
          step: 3,
          title: '导入Mermaid图表',
          description: '在Draw.io中：插入 → 高级 → Mermaid → 粘贴代码 → 插入'
        },
        {
          step: 4,
          title: '编辑和导出',
          description: '在Draw.io中编辑美化后，使用其导出功能保存'
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
