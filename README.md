# FolderShowcase

基于文件夹结构的个人作品展示平台，通过文件夹组织和 Markdown 文件自动生成网站内容。

## ✨ 项目特点

- 📁 **文件系统驱动**：通过文件夹结构自动生成网站
- 📝 **Markdown 内容管理**：使用 Markdown 文件管理作品描述
- 🖼️ **多媒体支持**：支持图片、视频等多种格式
- 🏷️ **智能排序**：通过 Markdown 内容控制展示顺序
- 🐳 **Docker 部署**：一键部署到群晖 NAS
- 🔧 **灵活配置**：支持环境变量配置内容文件夹
- 📱 **响应式设计**：美观的移动端友好界面

## 文件结构

```
作品库/
├── 摄影作品/
│   ├── 2024春游/
│   │   ├── 01.樱花.jpg
│   │   ├── 02.湖景.jpg
│   │   ├── 03.夕阳.jpg
│   │   ├── 04.延时视频.mp4
│   │   └── 作品介绍.md
│   └── 城市夜景/
│       ├── 01.夜景1.jpg
│       ├── 02.夜景2.jpg
│       └── 作品介绍.md
├── 设计作品/
│   └── 品牌设计/
│       ├── 01.标志设计.jpg
│       ├── 02.应用界面.jpg
│       └── 作品介绍.md
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <your-repo-url> FolderShowcase
cd FolderShowcase
```

### 2. 配置环境
```bash
# 复制环境配置文件
cp env.example .env

# 编辑配置文件，设置你的内容文件夹路径
nano .env
```

### 3. 准备作品内容
将你的作品文件放入配置的内容文件夹中，例如：
```
/volume1/docker/foldershowcase/content/
├── 摄影作品/
│   ├── 2024春游/
│   │   ├── 01.樱花.jpg
│   │   ├── 02.湖景.jpg
│   │   └── 作品介绍.md
│   └── 城市夜景/
│       ├── 01.夜景1.jpg
│       └── 作品介绍.md
└── 设计作品/
    └── 品牌设计/
        ├── 01.标志设计.jpg
        └── 作品介绍.md
```

### 4. 部署运行
```bash
# 使用部署脚本（推荐）
./deploy.sh

# 或手动部署
docker-compose up -d
```

### 5. 访问网站
打开浏览器访问：`http://your-nas-ip:3000`

## ⚙️ 配置说明

### 环境变量配置

在 `.env` 文件中配置以下参数：

```bash
# 作品内容文件夹路径（主机路径）
CONTENT_HOST_PATH=/volume1/docker/foldershowcase/content

# 服务器端口
PORT=3000

# 运行环境
NODE_ENV=production
```

### 群晖 NAS 配置

1. **创建共享文件夹**：
   - 在群晖 DSM 中创建共享文件夹 `foldershowcase`
   - 在 `foldershowcase` 下创建 `content` 子文件夹

2. **设置权限**：
   - 确保 Docker 容器有读取权限
   - 建议设置用户组权限为 `docker`

3. **文件路径示例**：
   ```
   /volume1/docker/foldershowcase/content/  # 群晖路径
   /app/content/                            # 容器内路径
   ```

## 🛠️ 技术栈

- **后端**：Node.js + Express
- **前端**：Vue.js 3 + Vite
- **内容解析**：Markdown-it + 自定义解析器
- **部署**：Docker + Nginx
- **内容管理**：文件系统 + Markdown

## 📋 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新服务
docker-compose pull && docker-compose up -d
```

