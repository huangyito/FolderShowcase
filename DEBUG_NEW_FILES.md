# 新文件识别问题调试指南

## 问题描述
新拖入的.md文件无法被系统识别，但修改现有.md文件可以正常显示。

## 可能的原因

### 1. 文件权限问题
新拖入的文件可能没有正确的读取权限。

**解决方案：**
```bash
# 在群晖SSH中执行
sudo chown -R 1001:1001 /volume1/docker/foldershowcase/content
sudo chmod -R 755 /volume1/docker/foldershowcase/content
```

### 2. 文件编码问题
新文件可能使用了不同的编码格式（如Windows的GBK编码）。

**检查方法：**
```bash
# 检查文件编码
file -i /path/to/your/file.md
```

**解决方案：**
- 使用UTF-8编码保存文件
- 在文本编辑器中另存为UTF-8格式

### 3. 文件名问题
文件名可能包含特殊字符或空格。

**检查方法：**
- 确保文件名不包含特殊字符
- 避免使用中文标点符号
- 文件名不要以空格开头或结尾

### 4. 容器缓存问题
Docker容器可能没有检测到新文件。

**解决方案：**
```bash
# 重启容器
docker restart foldershowcase

# 或者重新构建容器
docker-compose -f docker-compose.synology.yml down
docker-compose -f docker-compose.synology.yml up -d
```

### 5. 挂载路径问题
文件可能没有正确挂载到容器中。

**检查方法：**
```bash
# 进入容器检查
docker exec -it foldershowcase sh
ls -la /app/content/
```

## 调试步骤

### 步骤1：启用调试日志
现在代码已经添加了详细的调试日志，重新部署后查看容器日志：

```bash
# 查看容器日志
docker logs -f foldershowcase
```

### 步骤2：检查文件系统
```bash
# 检查挂载的目录
ls -la /volume1/docker/foldershowcase/content/

# 检查具体作品目录
ls -la /volume1/docker/foldershowcase/content/产品设计/
```

### 步骤3：测试文件权限
```bash
# 测试读取权限
cat /volume1/docker/foldershowcase/content/产品设计/新作品/作品介绍.md

# 检查文件属性
stat /volume1/docker/foldershowcase/content/产品设计/新作品/作品介绍.md
```

### 步骤4：检查文件编码
```bash
# 检查文件编码
file -i /volume1/docker/foldershowcase/content/产品设计/新作品/作品介绍.md

# 查看文件内容（前几行）
head -5 /volume1/docker/foldershowcase/content/产品设计/新作品/作品介绍.md
```

## 常见解决方案

### 方案1：重新设置权限
```bash
# 停止容器
docker stop foldershowcase

# 设置权限
sudo chown -R 1001:1001 /volume1/docker/foldershowcase/content
sudo chmod -R 755 /volume1/docker/foldershowcase/content

# 重启容器
docker start foldershowcase
```

### 方案2：使用root用户运行容器
修改`docker-compose.synology.yml`：
```yaml
services:
  foldershowcase:
    # ... 其他配置
    user: root  # 添加这一行
```

### 方案3：检查文件编码
确保.md文件使用UTF-8编码保存：
1. 用文本编辑器打开文件
2. 另存为，选择UTF-8编码
3. 重新拖入到群晖

### 方案4：强制刷新
```bash
# 重启整个Docker服务
sudo systemctl restart docker

# 重新部署
docker-compose -f docker-compose.synology.yml down
docker-compose -f docker-compose.synology.yml up -d
```

## 调试工具

### 使用调试脚本
```bash
# 在项目目录中运行
node debug-new-files.js
```

### 查看详细日志
现在系统会输出详细的调试信息，包括：
- 🔍 扫描的作品路径
- 📄 Markdown文件路径
- 📋 文件是否存在
- ✅ 读取成功/失败信息
- 📊 文件详细信息（大小、权限、修改时间等）
- 📂 目录内容列表

## 联系支持
如果以上方法都无法解决问题，请提供：
1. 容器日志输出
2. 文件权限信息
3. 文件编码信息
4. 具体的错误信息
