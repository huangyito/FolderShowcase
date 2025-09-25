const fs = require('fs-extra');
const path = require('path');
const { MarkdownParser } = require('./parser');

class PortfolioScanner {
  constructor(contentDir) {
    this.contentDir = contentDir;
    this.parser = new MarkdownParser();
    this.ensureContentDir();
  }

  // 确保内容目录存在
  async ensureContentDir() {
    try {
      await fs.ensureDir(this.contentDir);
    } catch (error) {
      console.error('创建内容目录失败:', error);
    }
  }

  // 获取所有分类
  async getCategories() {
    try {
      const items = await fs.readdir(this.contentDir, { withFileTypes: true });
      const categories = [];

      for (const item of items) {
        if (item.isDirectory()) {
          const categoryPath = path.join(this.contentDir, item.name);
          const works = await this.getWorksByCategory(item.name);
          
          categories.push({
            name: item.name,
            path: categoryPath,
            workCount: works.length,
            coverImage: works.length > 0 ? works[0].coverImage : null
          });
        }
      }

      return categories.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('扫描分类失败:', error);
      return [];
    }
  }

  // 获取分类下的所有作品
  async getWorksByCategory(categoryName) {
    try {
      const categoryPath = path.join(this.contentDir, categoryName);
      const items = await fs.readdir(categoryPath, { withFileTypes: true });
      const works = [];

      for (const item of items) {
        if (item.isDirectory()) {
          const workPath = path.join(categoryPath, item.name);
          const workInfo = await this.getWorkInfo(categoryName, item.name, workPath);
          if (workInfo) {
            works.push(workInfo);
          }
        }
      }

      return works.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error(`扫描分类 ${categoryName} 的作品失败:`, error);
      return [];
    }
  }

  // 获取作品基本信息
  async getWorkInfo(category, workName, workPath) {
    try {
      const markdownFile = path.join(workPath, '作品介绍.md');
      let title = workName; // 默认使用文件夹名称作为标题
      let content = '';

      // 检查是否存在 Markdown 文件
      if (await fs.pathExists(markdownFile)) {
        // 读取 Markdown 文件的第一行作为标题
        content = await fs.readFile(markdownFile, 'utf-8');
        title = this.extractTitle(content);
      }

      // 查找封面图片
      const coverImage = await this.findCoverImage(workPath);

      return {
        category,
        name: workName,
        title,
        path: workPath,
        coverImage,
        relativePath: path.relative(this.contentDir, workPath),
        hasMarkdown: await fs.pathExists(markdownFile),
        content: content
      };
    } catch (error) {
      console.error(`获取作品 ${workName} 信息失败:`, error);
      return null;
    }
  }

  // 获取作品详情
  async getWorkDetail(category, workName) {
    try {
      const workPath = path.join(this.contentDir, category, workName);
      const markdownFile = path.join(workPath, '作品介绍.md');

      let title = workName; // 默认使用文件夹名称作为标题
      let content = '';
      let parsedContent = null;

      // 检查是否存在 Markdown 文件
      if (await fs.pathExists(markdownFile)) {
        content = await fs.readFile(markdownFile, 'utf-8');
        title = this.extractTitle(content);
        // 解析 Markdown 内容
        parsedContent = await this.parser.parseMarkdown(content, workPath);
      } else {
        // 没有 Markdown 文件时，创建一个简单的 HTML 结构
        parsedContent = {
          html: `<h1>${workName}</h1><p>这是一个作品展示页面。</p>`,
          metadata: {}
        };
      }

      // 获取作品目录下的所有媒体文件
      const mediaFiles = await this.getMediaFiles(workPath);

      return {
        category,
        name: workName,
        title,
        content,
        parsedContent,
        workPath,
        mediaFiles,
        relativePath: path.relative(this.contentDir, workPath),
        hasMarkdown: await fs.pathExists(markdownFile)
      };
    } catch (error) {
      console.error(`获取作品 ${workName} 详情失败:`, error);
      return null;
    }
  }

  // 获取所有作品
  async getAllWorks() {
    try {
      const categories = await this.getCategories();
      const allWorks = [];

      for (const category of categories) {
        const works = await this.getWorksByCategory(category.name);
        allWorks.push(...works);
      }

      return allWorks;
    } catch (error) {
      console.error('获取所有作品失败:', error);
      return [];
    }
  }

  // 获取推荐作品（带有#推荐标签的作品）
  async getRecommendedWorks() {
    try {
      const allCategories = await this.getCategories();
      const recommendedWorks = [];

      for (const category of allCategories) {
        const works = await this.getWorksByCategory(category.name);
        
        for (const work of works) {
          // 检查作品是否包含#推荐标签
          if (await this.hasRecommendedTag(work.path)) {
            recommendedWorks.push(work);
          }
        }
      }

      return recommendedWorks;
    } catch (error) {
      console.error('获取推荐作品失败:', error);
      return [];
    }
  }

  // 检查作品是否包含#推荐标签
  async hasRecommendedTag(workPath) {
    try {
      const markdownFile = path.join(workPath, '作品介绍.md');
      
      if (!await fs.pathExists(markdownFile)) {
        return false;
      }

      const content = await fs.readFile(markdownFile, 'utf-8');
      
      // 检查是否包含推荐标签（支持引用格式 > #推荐标签 或 > #其他标签 #推荐）
      return content.includes('> #推荐标签') || content.includes('> # 推荐标签') || 
             (content.includes('>') && content.includes('#推荐')) || 
             content.includes('#推荐') || content.includes('# 推荐');
    } catch (error) {
      console.error('检查推荐标签失败:', error);
      return false;
    }
  }

  // 提取 Markdown 标题
  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    return '未命名作品';
  }

  // 查找封面图片
  async findCoverImage(workPath) {
    try {
      const items = await fs.readdir(workPath);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      for (const item of items) {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          return path.join(workPath, item).replace(this.contentDir, '');
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 获取媒体文件列表
  async getMediaFiles(workPath) {
    try {
      const items = await fs.readdir(workPath);
      const mediaFiles = [];
      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'];

      for (const item of items) {
        const ext = path.extname(item).toLowerCase();
        if (mediaExtensions.includes(ext)) {
          mediaFiles.push({
            name: item,
            path: path.join(workPath, item).replace(this.contentDir, ''),
            type: this.getMediaType(ext)
          });
        }
      }

      return mediaFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('获取媒体文件失败:', error);
      return [];
    }
  }

  // 获取媒体类型
  getMediaType(extension) {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.mov', '.avi'];
    
    if (imageExts.includes(extension)) {
      return 'image';
    } else if (videoExts.includes(extension)) {
      return 'video';
    }
    return 'unknown';
  }
}

module.exports = { PortfolioScanner };
