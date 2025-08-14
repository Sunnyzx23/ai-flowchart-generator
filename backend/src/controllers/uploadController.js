import { fileParserService } from '../services/fileParserService.js';
import fs from 'fs';
import path from 'path';

export const uploadController = {
  /**
   * 处理文件上传和解析
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: '未找到上传的文件',
          timestamp: new Date().toISOString()
        });
      }

      const { productType, implementType } = req.body;
      
      // 验证必要参数
      if (!productType || !implementType) {
        return res.status(400).json({
          error: '缺少必要参数: productType 和 implementType',
          timestamp: new Date().toISOString()
        });
      }

      console.log('📄 开始处理文件:', {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        productType,
        implementType
      });

      // 解析文件内容
      const content = await fileParserService.parseFile(req.file);
      
      // 清理临时文件
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError.message);
      }

      // 返回解析结果
      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          content: content,
          contentLength: content.length,
          productType,
          implementType,
          parsedAt: new Date().toISOString()
        },
        message: '文件解析成功'
      });

    } catch (error) {
      console.error('文件上传处理错误:', error);
      
      // 清理可能存在的临时文件
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn('清理临时文件失败:', cleanupError.message);
        }
      }
      
      next(error);
    }
  }
};
