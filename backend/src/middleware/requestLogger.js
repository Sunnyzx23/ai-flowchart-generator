/**
 * 请求日志中间件
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求开始
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`📤 ${req.method} ${req.url} ${statusColor} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
