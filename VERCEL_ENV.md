# Vercel环境变量配置

在Vercel控制台中需要设置以下环境变量：

## 必需的环境变量

### DeepSeek API配置
- `DEEPSEEK_API_KEY`:sk-894ae1e978ce45239084604440efd1f5
- `DEEPSEEK_BASE_URL`: https://api.deepseek.com/v1

### 应用配置
- `NODE_ENV`: production
- `DEFAULT_MODEL`: deepseek-chat
- `BACKUP_MODEL`: deepseek-coder

### 文件处理配置
- `MAX_FILE_SIZE`: 10485760
- `UPLOAD_DIR`: /tmp/uploads
- `TEMP_DIR`: /tmp/temp
- `LOG_LEVEL`: info

## 设置步骤

1. 登录Vercel控制台
2. 选择您的项目
3. 进入Settings > Environment Variables
4. 添加上述环境变量
5. 重新部署项目

## 注意事项

- `DEEPSEEK_API_KEY`是必需的，没有它应用无法正常工作
- 文件上传目录使用`/tmp`因为Vercel Functions是无状态的
- `FRONTEND_URL`会由Vercel自动设置
