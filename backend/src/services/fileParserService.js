import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export const fileParserService = {
  /**
   * 根据文件类型解析文件内容
   */
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
    } catch (error) {
      console.error('文件解析错误:', error);
      throw new Error(`文件解析失败: ${error.message}`);
    }
  },

  /**
   * 解析文本文件
   */
  async parseTxtFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.cleanContent(content);
    } catch (error) {
      throw new Error(`文本文件读取失败: ${error.message}`);
    }
  },

  /**
   * 解析Markdown文件
   */
  async parseMarkdownFile(filePath) {
    try {
      const markdownContent = fs.readFileSync(filePath, 'utf8');
      // 将Markdown转换为纯文本，保留结构
      const tokens = md.parse(markdownContent, {});
      let content = '';
      
      tokens.forEach(token => {
        if (token.type === 'heading_open') {
          content += '\n'.repeat(parseInt(token.tag.charAt(1)) - 1) + '# ';
        } else if (token.type === 'inline') {
          content += token.content + '\n';
        } else if (token.type === 'paragraph_open') {
          content += '\n';
        }
      });
      
      return this.cleanContent(content || markdownContent);
    } catch (error) {
      throw new Error(`Markdown文件解析失败: ${error.message}`);
    }
  },

  /**
   * 解析PDF文件 - 临时简化版本
   */
  async parsePdfFile(filePath) {
    try {
      // 临时返回提示信息，待PDF解析库稳定后再实现
      return '暂不支持PDF文件解析，请使用文本文件或Word文档。PDF功能将在后续版本中提供。';
    } catch (error) {
      throw new Error(`PDF文件解析失败: ${error.message}`);
    }
  },

  /**
   * 解析Word文档
   */
  async parseDocxFile(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.cleanContent(result.value);
    } catch (error) {
      throw new Error(`Word文档解析失败: ${error.message}`);
    }
  },

  /**
   * 清理和格式化内容
   */
  cleanContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('无效的文件内容');
    }

    return content
      .replace(/\r\n/g, '\n')           // 统一换行符
      .replace(/\r/g, '\n')             // 统一换行符
      .replace(/\n{3,}/g, '\n\n')       // 合并多余的空行
      .replace(/[ \t]+/g, ' ')          // 合并多余的空格
      .trim();                          // 去除首尾空白
  },

  /**
   * 验证文件内容长度
   */
  validateContentLength(content, maxLength = 5000) {
    if (content.length > maxLength) {
      console.warn(`文件内容过长: ${content.length} 字符，将截取前 ${maxLength} 字符`);
      return content.substring(0, maxLength) + '...[内容已截取]';
    }
    return content;
  }
};
