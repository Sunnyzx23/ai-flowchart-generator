/**
 * 流程图主题配置
 * 定义不同类型流程图的样式主题
 */

// 基础主题配置
export const flowchartThemes = {
  // 默认主题 - 专业蓝色
  default: {
    name: '默认',
    description: '专业蓝色主题，适合商务场景',
    config: {
      theme: 'default',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#2563eb',
        lineColor: '#6b7280',
        sectionBkgColor: '#f8fafc',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e5e7eb',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#fafafa',
        // 节点样式
        cScale0: '#3b82f6', // 开始节点
        cScale1: '#10b981', // 处理节点
        cScale2: '#f59e0b', // 判断节点
        cScale3: '#ef4444', // 异常节点
        cScale4: '#8b5cf6', // 结束节点
        // 文字样式
        labelTextColor: '#1f2937',
        nodeTextColor: '#ffffff',
        edgeLabelBackground: '#ffffff'
      }
    }
  },

  // 深色主题 - 现代黑色
  dark: {
    name: '深色',
    description: '深色主题，适合夜间使用',
    config: {
      theme: 'dark',
      themeVariables: {
        primaryColor: '#60a5fa',
        primaryTextColor: '#f9fafb',
        primaryBorderColor: '#3b82f6',
        lineColor: '#9ca3af',
        sectionBkgColor: '#374151',
        altSectionBkgColor: '#1f2937',
        gridColor: '#4b5563',
        secondaryColor: '#374151',
        tertiaryColor: '#111827',
        // 节点样式
        cScale0: '#60a5fa', // 开始节点
        cScale1: '#34d399', // 处理节点
        cScale2: '#fbbf24', // 判断节点
        cScale3: '#f87171', // 异常节点
        cScale4: '#a78bfa', // 结束节点
        // 文字样式
        labelTextColor: '#f9fafb',
        nodeTextColor: '#1f2937',
        edgeLabelBackground: '#374151'
      }
    }
  },

  // 森林主题 - 自然绿色
  forest: {
    name: '森林',
    description: '绿色自然主题，清新舒适',
    config: {
      theme: 'forest',
      themeVariables: {
        primaryColor: '#10b981',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#059669',
        lineColor: '#6b7280',
        sectionBkgColor: '#ecfdf5',
        altSectionBkgColor: '#ffffff',
        gridColor: '#d1fae5',
        secondaryColor: '#f0fdf4',
        tertiaryColor: '#fafafa',
        // 节点样式
        cScale0: '#10b981', // 开始节点
        cScale1: '#3b82f6', // 处理节点
        cScale2: '#f59e0b', // 判断节点
        cScale3: '#ef4444', // 异常节点
        cScale4: '#8b5cf6', // 结束节点
        // 文字样式
        labelTextColor: '#1f2937',
        nodeTextColor: '#ffffff',
        edgeLabelBackground: '#ffffff'
      }
    }
  },

  // 中性主题 - 简约灰色
  neutral: {
    name: '中性',
    description: '简约灰色主题，低调专业',
    config: {
      theme: 'neutral',
      themeVariables: {
        primaryColor: '#6b7280',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#4b5563',
        lineColor: '#9ca3af',
        sectionBkgColor: '#f9fafb',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e5e7eb',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#fafafa',
        // 节点样式
        cScale0: '#6b7280', // 开始节点
        cScale1: '#4b5563', // 处理节点
        cScale2: '#f59e0b', // 判断节点
        cScale3: '#ef4444', // 异常节点
        cScale4: '#374151', // 结束节点
        // 文字样式
        labelTextColor: '#1f2937',
        nodeTextColor: '#ffffff',
        edgeLabelBackground: '#ffffff'
      }
    }
  },

  // 商务主题 - 正式蓝色
  business: {
    name: '商务',
    description: '正式商务主题，适合企业环境',
    config: {
      theme: 'default',
      themeVariables: {
        primaryColor: '#1e40af',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#64748b',
        sectionBkgColor: '#f1f5f9',
        altSectionBkgColor: '#ffffff',
        gridColor: '#cbd5e1',
        secondaryColor: '#e2e8f0',
        tertiaryColor: '#f8fafc',
        // 节点样式
        cScale0: '#1e40af', // 开始节点
        cScale1: '#0f766e', // 处理节点
        cScale2: '#ca8a04', // 判断节点
        cScale3: '#dc2626', // 异常节点
        cScale4: '#7c3aed', // 结束节点
        // 文字样式
        labelTextColor: '#1f2937',
        nodeTextColor: '#ffffff',
        edgeLabelBackground: '#ffffff'
      }
    }
  }
};

// 节点类型样式配置
export const nodeStyles = {
  // 开始/结束节点 - 圆角矩形
  start: {
    shape: 'rounded',
    style: 'fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b',
    class: 'start-node'
  },
  end: {
    shape: 'rounded',
    style: 'fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#2e7d32',
    class: 'end-node'
  },

  // 处理节点 - 矩形
  process: {
    shape: 'rect',
    style: 'fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#7b1fa2',
    class: 'process-node'
  },

  // 判断节点 - 菱形
  decision: {
    shape: 'diamond',
    style: 'fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#ef6c00',
    class: 'decision-node'
  },

  // 异常节点 - 矩形（红色）
  error: {
    shape: 'rect',
    style: 'fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#c62828',
    class: 'error-node'
  },

  // 数据节点 - 平行四边形
  data: {
    shape: 'parallelogram',
    style: 'fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#3f51b5',
    class: 'data-node'
  },

  // 子流程节点 - 双边框矩形
  subprocess: {
    shape: 'rect',
    style: 'fill:#f1f8e9,stroke:#689f38,stroke-width:3px,color:#689f38',
    class: 'subprocess-node'
  }
};

// 连线样式配置
export const edgeStyles = {
  // 正常流程线
  normal: {
    style: 'stroke:#666,stroke-width:2px',
    class: 'normal-edge'
  },

  // 条件分支线（是）
  yes: {
    style: 'stroke:#4caf50,stroke-width:2px',
    class: 'yes-edge',
    label: '是'
  },

  // 条件分支线（否）
  no: {
    style: 'stroke:#f44336,stroke-width:2px',
    class: 'no-edge',
    label: '否'
  },

  // 异常处理线
  error: {
    style: 'stroke:#ff5722,stroke-width:2px,stroke-dasharray:5,5',
    class: 'error-edge',
    label: '异常'
  },

  // 成功路径线
  success: {
    style: 'stroke:#4caf50,stroke-width:3px',
    class: 'success-edge',
    label: '成功'
  },

  // 失败路径线
  failure: {
    style: 'stroke:#f44336,stroke-width:3px,stroke-dasharray:3,3',
    class: 'failure-edge',
    label: '失败'
  }
};

// 流程图类型配置
export const flowchartTypes = {
  // 标准流程图
  flowchart: {
    name: '标准流程图',
    syntax: 'flowchart TD',
    description: '自上而下的标准业务流程图',
    direction: 'TD', // Top Down
    nodeSpacing: 50,
    rankSpacing: 80
  },

  // 横向流程图
  horizontal: {
    name: '横向流程图',
    syntax: 'flowchart LR',
    description: '从左到右的横向流程图',
    direction: 'LR', // Left Right
    nodeSpacing: 80,
    rankSpacing: 50
  },

  // 决策树
  decision_tree: {
    name: '决策树',
    syntax: 'graph TD',
    description: '决策分析树状结构',
    direction: 'TD',
    nodeSpacing: 60,
    rankSpacing: 100
  },

  // 简单图表
  simple: {
    name: '简单图表',
    syntax: 'graph LR',
    description: '简单的关系图表',
    direction: 'LR',
    nodeSpacing: 40,
    rankSpacing: 60
  }
};

// 获取主题配置
export const getThemeConfig = (themeName) => {
  return flowchartThemes[themeName] || flowchartThemes.default;
};

// 获取节点样式
export const getNodeStyle = (nodeType) => {
  return nodeStyles[nodeType] || nodeStyles.process;
};

// 获取连线样式
export const getEdgeStyle = (edgeType) => {
  return edgeStyles[edgeType] || edgeStyles.normal;
};

// 生成样式化的Mermaid代码
export const applyStylesToCode = (code, theme = 'default') => {
  const themeConfig = getThemeConfig(theme);
  let styledCode = code;

  // 添加主题样式类
  const styleDefinitions = [
    '%%{init: {"theme": "' + themeConfig.config.theme + '", "themeVariables": ' + JSON.stringify(themeConfig.config.themeVariables) + '}}%%'
  ];

  // 如果代码中没有样式定义，添加默认样式
  if (!styledCode.includes('style ') && !styledCode.includes('classDef ')) {
    // 添加常用节点样式
    const commonStyles = [
      'style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px',
      'style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px',
      'style C fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px',
      'style D fill:#ffebee,stroke:#c62828,stroke-width:2px',
      'style E fill:#fff3e0,stroke:#ef6c00,stroke-width:2px'
    ];
    
    styledCode += '\n\n' + commonStyles.join('\n');
  }

  return styleDefinitions.join('\n') + '\n\n' + styledCode;
};

// 验证流程图类型
export const detectFlowchartType = (code) => {
  if (code.includes('flowchart TD') || code.includes('flowchart TB')) {
    return 'flowchart';
  } else if (code.includes('flowchart LR') || code.includes('flowchart RL')) {
    return 'horizontal';
  } else if (code.includes('graph TD') || code.includes('graph TB')) {
    return 'decision_tree';
  } else if (code.includes('graph LR') || code.includes('graph RL')) {
    return 'simple';
  }
  return 'flowchart'; // 默认类型
};
