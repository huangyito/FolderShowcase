#!/bin/bash

# 本地Docker测试脚本

echo "🚀 开始本地Docker测试..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.local.yml down

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose -f docker-compose.local.yml build

# 启动容器
echo "🚀 启动容器..."
docker-compose -f docker-compose.local.yml up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 10

# 检查容器状态
echo "📊 检查容器状态..."
docker ps | grep foldershowcase-local

# 查看容器日志
echo "📝 查看容器日志..."
docker logs foldershowcase-local

# 测试API
echo "🧪 测试API..."
echo "测试分类列表:"
curl -s http://localhost:1995/api/categories | jq .

echo ""
echo "测试推荐作品:"
curl -s http://localhost:1995/api/works/recommended | jq .

echo ""
echo "测试产品设计分类:"
curl -s http://localhost:1995/api/categories/产品设计/works | jq .

echo ""
echo "🌐 网站地址: http://localhost:1995"
echo "📝 查看实时日志: docker logs -f foldershowcase-local"
echo "🛑 停止容器: docker-compose -f docker-compose.local.yml down"
