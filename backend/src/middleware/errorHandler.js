/**
 * 全局错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 默认错误状态码
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '请求参数验证失败';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超过限制';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = '不支持的文件类型';
  }

  // 开发环境返回详细错误信息
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.url
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
