# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建前端
RUN cd client && npm ci && npm run build

# 创建内容目录（用于挂载外部内容）
RUN mkdir -p /app/content

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fileportfolio -u 1001

# 设置目录权限
RUN chown -R fileportfolio:nodejs /app
USER fileportfolio

# 暴露端口
EXPOSE 1995

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=1995
ENV CONTENT_DIR=/app/content

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1995/api/categories', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["npm", "start"]

