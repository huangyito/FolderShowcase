#!/bin/bash

# FolderShowcase 部署脚本
# 用于在群晖 NAS 上部署作品展示网站

set -e

echo "🚀 开始部署 FolderShowcase..."

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件配置你的内容文件夹路径"
    echo "   默认路径: /volume1/docker/foldershowcase/content"
    read -p "按回车键继续..."
fi

# 加载环境变量
source .env

# 检查内容文件夹是否存在
if [ ! -d "$CONTENT_HOST_PATH" ]; then
    echo "📁 创建内容文件夹: $CONTENT_HOST_PATH"
    mkdir -p "$CONTENT_HOST_PATH"
    echo "⚠️  请将你的作品文件放入: $CONTENT_HOST_PATH"
fi

# 构建和启动容器
echo "🔨 构建 Docker 镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

echo "✅ 部署完成！"
echo "🌐 网站地址: http://your-nas-ip:1995"
echo "📁 内容文件夹: $CONTENT_HOST_PATH"
echo ""
echo "📋 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"