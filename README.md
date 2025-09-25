# FolderShowcase

基于文件夹结构的个人作品展示平台，通过文件夹组织和 Markdown 文件自动生成网站内容。

## ✨ 项目特点

- 📁 **文件系统驱动**：通过文件夹结构自动生成网站
- 📝 **Markdown 内容管理**：使用 Markdown 文件管理作品描述
- 🏠 **动态首页配置**：通过 `home/home.md` 自定义首页内容
- 🧭 **动态导航栏**：根据 `home` 文件夹下的子文件夹自动生成导航按钮
- 🔗 **链接卡片**：外部链接自动渲染为美观的网页卡片
- 🖼️ **多媒体支持**：支持图片、视频等多种格式
- 🏷️ **智能排序**：通过 Markdown 内容控制展示顺序
- 🐳 **Docker 部署**：一键部署到群晖 NAS
- 🔧 **灵活配置**：支持环境变量配置内容文件夹
- 📱 **响应式设计**：美观的移动端友好界面

## 文件结构

```
作品库/
├── home/                           # 首页和导航页面配置
│   ├── home.md                     # 首页内容配置
│   ├── 关于/                       # 导航页面文件夹
│   │   └── 关于.md                 # 页面内容（标题：关于/联系）
│   └── 下载/                       # 导航页面文件夹
│       └── 下载.md                 # 页面内容（标题：下载）
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

### 方式一：Docker 部署（推荐）

```bash
# 拉取最新镜像
docker pull your-username/foldershowcase:latest

# 运行容器
docker run -d \
  --name foldershowcase \
  -p 1995:1995 \
  -v /path/to/your/content:/app/content:ro \
  your-username/foldershowcase:latest
```

### 方式二：源码部署

#### 1. 克隆项目
```bash
git clone <your-repo-url> FolderShowcase
cd FolderShowcase
```

#### 2. 配置环境
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
├── home/                           # 首页和导航页面配置
│   ├── home.md                     # 首页内容（可选）
│   ├── 关于/                       # 导航页面
│   │   └── 关于.md                 # 页面内容
│   └── 下载/                       # 导航页面
│       └── 下载.md                 # 页面内容
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
打开浏览器访问：`http://your-nas-ip:1995`

## ⚙️ 配置说明

### 首页和导航页面配置

#### 首页配置
- **文件位置**：`home/home.md`
- **功能**：自定义首页顶部内容
- **规则**：
  - 如果存在 `home.md` 文件，首页会显示其内容
  - 如果不存在，首页只显示作品卡片
  - 支持完整的 Markdown 语法

#### 导航页面配置
- **文件夹位置**：`home/` 下的子文件夹
- **功能**：自动生成导航栏按钮
- **规则**：
  - 每个子文件夹对应一个导航按钮
  - 按钮文字使用文件夹名称
  - 页面内容来自文件夹中的 `.md` 文件

#### 链接卡片功能
- **外部链接**：自动渲染为美观的网页卡片
- **内部链接**：保持传统的蓝色下划线样式
- **卡片特性**：
  - 显示链接标题和 URL
  - 悬浮效果和点击动画
  - 响应式设计，移动端友好
  - 点击在新标签页打开

#### 配置示例
```
home/
├── home.md                     # 首页内容
├── 关于/                       # 导航页面（按钮文字：关于）
│   └── 关于.md                 # 页面内容
├── 下载/                       # 导航页面（按钮文字：下载）
│   └── 下载.md                 # 页面内容
└── 商店/                       # 导航页面（按钮文字：商店）
    └── 商店.md                 # 页面内容
```

### 环境变量配置

在 `.env` 文件中配置以下参数：

```bash
# 作品内容文件夹路径（主机路径）
CONTENT_HOST_PATH=/volume1/docker/foldershowcase/content

# 服务器端口
PORT=1995

# 运行环境
NODE_ENV=production
```

### 内容路径配置详解

**路径要求**：
- ✅ 可以使用任何群晖共享文件夹路径
- ✅ 支持用户目录和系统目录（有权限的）
- ✅ 支持嵌套目录结构
- ❌ 确保路径存在且有读取权限

**配置示例**：
```bash
# 方案1：专门的作品目录
CONTENT_HOST_PATH=/volume1/photo/作品集

# 方案2：用户目录
CONTENT_HOST_PATH=/volume1/homes/admin/作品集

# 方案3：Docker 专用目录（默认）
CONTENT_HOST_PATH=/volume1/docker/foldershowcase/content
```

**路径结构示例**：
```
/volume1/photo/作品集/
├── home/                           # 首页和导航页面配置
│   ├── home.md                     # 首页内容
│   ├── 关于/                       # 导航页面
│   │   └── 关于.md                 # 页面内容
│   └── 下载/                       # 导航页面
│       └── 下载.md                 # 页面内容
├── 摄影作品/
│   ├── 2024春游/
│   │   ├── 01.樱花.jpg
│   │   ├── 02.湖景.jpg
│   │   └── 作品介绍.md
│   └── 城市夜景/
│       ├── 01.夜景1.jpg
│       └── 作品介绍.md
├── 产品设计/
│   └── 竹语香薰/
│       ├── 01.产品图.jpg
│       └── 作品介绍.md
└── 插画作品/
    └── 数字绘画/
        ├── 01.插画1.jpg
        └── 作品介绍.md
```

### 群晖 NAS 配置

1. **创建共享文件夹**：
   - 在群晖 DSM 中创建共享文件夹 `foldershowcase`
   - 在 `foldershowcase` 下创建 `content` 子文件夹

2. **设置权限**：
   - 确保 Docker 容器有读取权限
   - 建议设置用户组权限为 `docker`

3. **文件路径配置**：
   ```
   /volume1/docker/foldershowcase/content/  # 群晖路径（默认）
   /app/content/                            # 容器内路径
   ```
   
   **路径灵活性**：群晖路径可以是任意位置，例如：
   ```bash
   # 推荐路径示例
   /volume1/photo/作品集/                    # 照片文件夹
   /volume1/homes/admin/我的作品/            # 用户目录
   /volume1/web/portfolio/                  # 网站目录
   /volume1/drive/设计作品/                  # 云同步文件夹
   ```
   
   **修改路径方法**：
   ```bash
   # 方法1：修改 .env 文件
   CONTENT_HOST_PATH=/volume1/photo/作品集
   
   # 方法2：部署时指定
   CONTENT_HOST_PATH=/volume1/photo/作品集 ./deploy.sh
   ```

## 🛠️ 技术栈

- **后端**：Node.js + Express
- **前端**：Vue.js 3 + Vite + Vue Router
- **内容解析**：Markdown-it + 自定义解析器
- **部署**：Docker + Nginx
- **内容管理**：文件系统 + Markdown
- **动态配置**：基于文件夹结构的动态页面生成

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

## 🚀 发布和更新

### 自动发布流程

项目使用 GitHub Actions 自动发布到 GitHub 和 Docker Hub：

1. **推送代码到 main 分支** → 自动构建并推送到 Docker Hub
2. **创建 Git 标签** → 自动创建 GitHub Release 并同步到 Docker Hub

### 手动发布

```bash
# 发布新版本（同时发布到 GitHub 和 Docker Hub）
./release.sh v1.0.0

# 或者只发布到 Docker Hub
./publish.sh
```

### 版本管理

- **GitHub Releases**：包含源码和发布说明
- **Docker Hub**：包含 Docker 镜像，支持多标签
- **自动同步**：GitHub Release 创建后自动同步到 Docker Hub

### 用户更新

```bash
# 拉取最新版本
docker pull your-username/foldershowcase:latest

# 停止旧容器
docker stop foldershowcase
docker rm foldershowcase

# 运行新版本
docker run -d \
  --name foldershowcase \
  -p 1995:1995 \
  -v /path/to/your/content:/app/content:ro \
  your-username/foldershowcase:latest
```

## 📚 相关文档

- [Docker 部署指南](DOCKER.md) - 详细的 Docker 使用说明
- [项目结构说明](PROJECT_STRUCTURE.md) - 代码结构说明
- [API 文档](API.md) - 后端 API 接口说明
- [权限问题解决指南](../PERMISSION_FIX.md) - 解决 EACCES 权限错误
- [群晖 NAS 部署指南](../SYNOLOGY.md) - 群晖 NAS 专用部署说明
- [灵活部署指南](../FLEXIBLE_DEPLOYMENT.md) - 支持任意目录映射

