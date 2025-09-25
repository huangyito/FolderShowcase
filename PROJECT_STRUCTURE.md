# FolderShowcase 项目结构说明

## 📁 项目目录结构

```
FolderShowcase/                  # 主项目目录（代码仓库）
├── client/                      # 前端 Vue.js 应用
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── App.vue             # 主应用组件
│   │   ├── main.js             # 入口文件
│   │   ├── api.js              # API 接口
│   │   └── style.css           # 全局样式
│   ├── package.json
│   └── vite.config.js
├── src/                        # 后端 Node.js 应用
│   ├── scanner.js              # 文件扫描器
│   └── parser.js               # Markdown 解析器
├── docker-compose.yml          # Docker 编排配置
├── Dockerfile                  # Docker 镜像配置
├── nginx.conf                  # Nginx 配置
├── server.js                   # 服务器入口
├── package.json                # 项目依赖
├── env.example                 # 环境变量示例
├── deploy.sh                   # 部署脚本
├── README.md                   # 项目说明
└── .gitignore                  # Git 忽略文件

FolderShowcase-content/          # 作品内容目录（独立管理）
├── 摄影作品/
│   ├── 2024春游/
│   │   ├── 01.樱花.jpg
│   │   ├── 02.湖景.jpg
│   │   └── 作品介绍.md
│   └── 城市夜景/
│       ├── 01.夜景1.jpg
│       └── 作品介绍.md
├── 设计作品/
│   └── 品牌设计/
│       ├── 01.标志设计.jpg
│       └── 作品介绍.md
└── README.md                   # 内容文件夹说明
```

## 🔄 部署流程

### 1. 代码仓库
- **FilePortfolio/** 包含所有网站代码
- 推送到 GitHub/GitLab 等代码仓库
- 支持版本控制和协作开发

### 2. 内容管理
- **FilePortfolio-content/** 包含所有作品文件
- 可以放在群晖 NAS 的共享文件夹中
- 通过 Docker 卷挂载到容器

### 3. Docker 部署
```bash
# 在群晖上克隆代码
git clone <repo-url> /volume1/docker/foldershowcase/FolderShowcase

# 配置环境变量
cd /volume1/docker/foldershowcase/FolderShowcase
cp env.example .env
# 编辑 .env 设置 CONTENT_HOST_PATH

# 准备内容文件夹
mkdir -p /volume1/docker/foldershowcase/content
# 将作品文件复制到 content 目录

# 部署运行
./deploy.sh
```

## ⚙️ 环境变量配置

### 开发环境
```bash
CONTENT_DIR=./content
PORT=1995
NODE_ENV=development
```

### 生产环境
```bash
CONTENT_HOST_PATH=/volume1/docker/portfolio/content
PORT=1995
NODE_ENV=production
```

## 🐳 Docker 卷挂载

```yaml
volumes:
  - ${CONTENT_HOST_PATH:-/volume1/docker/portfolio/content}:/app/content:ro
```

- **主机路径**：`/volume1/docker/foldershowcase/content`
- **容器路径**：`/app/content`
- **权限**：只读（`:ro`）

## 📋 维护说明

### 更新网站代码
```bash
cd /volume1/docker/foldershowcase/FolderShowcase
git pull
docker-compose build
docker-compose up -d
```

### 更新作品内容
- 直接修改 `/volume1/docker/foldershowcase/content/` 中的文件
- 网站会自动检测变化并更新

### 备份
- **代码**：通过 Git 仓库备份
- **内容**：备份 `/volume1/docker/foldershowcase/content/` 目录
