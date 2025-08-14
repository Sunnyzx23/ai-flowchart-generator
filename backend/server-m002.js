import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const md = new MarkdownIt();

// 基础中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.txt', '.md', '.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}. 支持的格式: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 文件解析服务
const fileParserService = {
  // 解析文本文件
  async parseTxtFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.cleanContent(content);
    } catch (error) {
      throw new Error(`文本文件读取失败: ${error.message}`);
    }
  },

  // 解析Markdown文件
  async parseMarkdownFile(filePath) {
    try {
      const markdownContent = fs.readFileSync(filePath, 'utf8');
      // 简单处理：直接返回markdown内容，保留格式
      return this.cleanContent(markdownContent);
    } catch (error) {
      throw new Error(`Markdown文件解析失败: ${error.message}`);
    }
  },

  // 解析PDF文件（简化版）
  async parsePdfFile(filePath) {
    // 临时返回提示信息
    return '暂不支持PDF文件解析，请使用文本文件或Word文档。PDF功能将在后续版本中提供。';
  },

  // 解析Word文档
  async parseDocxFile(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.cleanContent(result.value);
    } catch (error) {
      throw new Error(`Word文档解析失败: ${error.message}`);
    }
  },

  // 清理内容
  cleanContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('无效的文件内容');
    }

    return content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  },

  // 根据文件类型解析
  async parseFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filePath = file.path;
    
    try {
      switch (ext) {
        case '.txt':
          return await this.parseTxtFile(filePath);
        case '.md':
          return await this.parseMarkdownFile(filePath);
        case '.pdf':
          return await this.parsePdfFile(filePath);
        case '.docx':
        case '.doc':
          return await this.parseDocxFile(filePath);
        default:
          throw new Error(`不支持的文件类型: ${ext}`);
      }
    } finally {
      // 清理临时文件
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError.message);
      }
    }
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI流程图生成工具后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0-m002'
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'AI流程图生成工具后端API - M002版本',
    version: '1.0.0-m002',
    endpoints: {
      health: '/health',
      upload: '/api/upload/file',
      uploadTest: '/api/upload/test'
    }
  });
});

// API路由
app.get('/api', (req, res) => {
  res.json({
    name: 'AI流程图生成工具API - M002',
    version: '1.0.0-m002',
    description: '支持文件上传和解析的API服务',
    endpoints: {
      upload: 'POST /api/upload/file - 文件上传和解析',
      uploadTest: 'GET /api/upload/test - 上传功能测试'
    }
  });
});

// 文件上传测试端点
app.get('/api/upload/test', (req, res) => {
  res.json({
    message: '文件上传服务正常',
    maxFileSize: '10MB',
    supportedTypes: ['.txt', '.md', '.pdf', '.docx'],
    timestamp: new Date().toISOString()
  });
});

// 文件上传和解析接口
app.post('/api/upload/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未找到上传的文件',
        timestamp: new Date().toISOString()
      });
    }

    const { productType, implementType } = req.body;
    
    console.log('📄 开始处理文件:', {
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      productType,
      implementType
    });

    // 解析文件内容
    const content = await fileParserService.parseFile(req.file);
    
    // 验证内容长度
    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        error: '文件内容过短，需求描述不能少于10个字符',
        timestamp: new Date().toISOString()
      });
    }

    // 返回解析结果
    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        content: content,
        contentLength: content.length,
        productType: productType || '',
        implementType: implementType || '',
        parsedAt: new Date().toISOString()
      },
      message: '文件解析成功'
    });

  } catch (error) {
    console.error('文件上传处理错误:', error);
    
    // 清理可能存在的临时文件
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || '文件处理失败',
      timestamp: new Date().toISOString()
    });
  }
});

// 需求分析接口（为M003准备）
app.post('/api/analyze', async (req, res) => {
  try {
    const { content, productType, implementType } = req.body;
    
    // 基础验证
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: '需求内容不能少于10个字符'
      });
    }

    if (!productType || !implementType) {
      return res.status(400).json({
        success: false,
        error: '请选择产品形态和实现方式'
      });
    }

    console.log('🤖 开始需求分析:', {
      contentLength: content.length,
      productType,
      implementType
    });

    // 临时返回模拟数据（M003阶段会实现真实的AI分析）
    res.json({
      success: true,
      data: {
        analysis: '基于需求的详细分析结果（M003阶段将实现真实AI分析）',
        mermaidCode: `flowchart TD
    A[用户触发功能] --> B{检查登录状态}
    B -->|已登录| C[验证用户权限]
    B -->|未登录| D[跳转登录页面]
    C -->|有权限| E[执行核心业务逻辑]
    C -->|无权限| F[显示权限不足提示]
    E --> G[返回处理结果]
    F --> H[引导用户升级]
    D --> I[登录成功后回到原流程]`,
        analyzedAt: new Date().toISOString()
      },
      message: 'AI分析完成（模拟数据）'
    });

  } catch (error) {
    console.error('需求分析错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '分析失败',
      timestamp: new Date().toISOString()
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  let statusCode = 500;
  let message = '服务器内部错误';

  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超过限制（最大10MB）';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = '不支持的文件类型';
  } else if (error.message) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '路径不存在',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 M002后端服务器已启动: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📁 文件上传: POST http://localhost:${PORT}/api/upload/file`);
  console.log(`🤖 需求分析: POST http://localhost:${PORT}/api/analyze`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

export default app;
