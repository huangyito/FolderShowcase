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

  // 获取所有分类（排除 home 文件夹和系统文件夹）
  async getCategories() {
    try {
      const items = await fs.readdir(this.contentDir, { withFileTypes: true });
      const categories = [];

      for (const item of items) {
        if (item.isDirectory() && this.isValidCategory(item.name)) {
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

  // 检查是否为有效的分类文件夹
  isValidCategory(name) {
    // 排除系统文件夹和特殊文件夹
    const excludeFolders = [
      'home',
      // 群晖 DSM 系统文件夹
      '@eaDir',
      '@Recycle',
      '@tmp',
      '@S2S',
      '@sharesnap',
      // 威联通 QNAP 系统文件夹
      '@Recently-Snapshot',
      // 通用系统文件夹
      '.DS_Store',
      'Thumbs.db',
      '.Trash',
      '.Trash-1000',
      '.recycle',
      'lost+found',
      '.snapshot',
      // 其他常见系统文件夹
      '.AppleDouble',
      '.AppleDB',
      '.AppleDesktop',
      '.fseventsd',
      '.Spotlight-V100',
      '.TemporaryItems',
      '.VolumeIcon.icns',
      '.com.apple.timemachine.donotpresent'
    ];
    
    // 排除以特定前缀开头的文件夹
    const excludePrefixes = [
      '.',
      '@',
      '._',
      '.Apple',
      '.com.apple',
      '@Recently-Snapshot-'
    ];
    
    // 检查是否在排除列表中
    if (excludeFolders.includes(name)) {
      return false;
    }
    
    // 检查是否以排除前缀开头
    for (const prefix of excludePrefixes) {
      if (name.startsWith(prefix)) {
        return false;
      }
    }
    
    return true;
  }

  // 获取首页配置
  async getHomeConfig() {
    try {
      const homePath = path.join(this.contentDir, 'home');
      const homeMdPath = path.join(homePath, 'home.md');
      
      // 检查 home 文件夹和 home.md 文件是否存在
      if (!await fs.pathExists(homePath) || !await fs.pathExists(homeMdPath)) {
        return null;
      }

      // 读取 home.md 文件
      const content = await fs.readFile(homeMdPath, 'utf-8');
      
      // 首页保留一级标题，因为首页没有单独的标题区域
      const parsedContent = await this.parser.parseMarkdown(content, homePath);
      
      return {
        hasConfig: true,
        content: content,
        parsedContent: parsedContent,
        title: this.extractTitle(content)
      };
    } catch (error) {
      console.error('获取首页配置失败:', error);
      return null;
    }
  }

  // 获取导航页面（从 home 文件夹下的子文件夹获取）
  async getNavPages() {
    try {
      const homePath = path.join(this.contentDir, 'home');
      const pages = [];

      // 检查 home 文件夹是否存在
      if (!await fs.pathExists(homePath)) {
        return pages;
      }

      const items = await fs.readdir(homePath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory() && this.isValidWork(item.name)) {
          const pagePath = path.join(homePath, item.name);
          const pageInfo = await this.getPageInfo(item.name, pagePath);
          if (pageInfo) {
            pages.push(pageInfo);
          }
        }
      }

      return pages.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('获取导航页面失败:', error);
      return [];
    }
  }

  // 获取页面信息
  async getPageInfo(pageName, pagePath) {
    try {
      // 查找页面文件夹中的 .md 文件
      const items = await fs.readdir(pagePath, { withFileTypes: true });
      let markdownFile = null;
      
      // 查找 .md 文件
      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.md')) {
          markdownFile = path.join(pagePath, item.name);
          break;
        }
      }

      let title = pageName; // 直接使用文件夹名称作为标题
      let content = '';
      let parsedContent = null;

      // 检查是否存在 Markdown 文件
      if (markdownFile && await fs.pathExists(markdownFile)) {
        content = await fs.readFile(markdownFile, 'utf-8');
        
        // 移除一级标题，避免重复显示
        const contentWithoutTitle = this.removeFirstTitle(content);
        
        // 解析 Markdown 内容（不包含一级标题）
        parsedContent = await this.parser.parseMarkdown(contentWithoutTitle, pagePath);
      } else {
        // 没有 Markdown 文件时，创建一个简单的 HTML 结构
        parsedContent = {
          html: `<p>这是一个页面。</p>`,
          metadata: {}
        };
      }

      return {
        name: pageName,
        title, // 使用文件夹名称作为标题
        content,
        parsedContent,
        path: pagePath,
        relativePath: path.relative(this.contentDir, pagePath),
        hasMarkdown: markdownFile && await fs.pathExists(markdownFile)
      };
    } catch (error) {
      console.error(`获取页面 ${pageName} 信息失败:`, error);
      return null;
    }
  }

  // 移除内容中的第一个一级标题
  removeFirstTitle(content) {
    const lines = content.split('\n');
    let foundFirstTitle = false;
    
    return lines.filter(line => {
      const trimmed = line.trim();
      if (!foundFirstTitle && trimmed.startsWith('# ')) {
        foundFirstTitle = true;
        return false; // 跳过第一个一级标题
      }
      return true;
    }).join('\n');
  }


  // 获取分类下的所有作品
  async getWorksByCategory(categoryName) {
    try {
      const categoryPath = path.join(this.contentDir, categoryName);
      const items = await fs.readdir(categoryPath, { withFileTypes: true });
      const works = [];

      for (const item of items) {
        if (item.isDirectory() && this.isValidWork(item.name)) {
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

  // 检查是否为有效的作品文件夹
  isValidWork(name) {
    // 排除系统文件夹和特殊文件夹
    const excludeFolders = [
      // 群晖 DSM 系统文件夹
      '@eaDir',
      '@Recycle',
      '@tmp',
      '@S2S',
      '@sharesnap',
      // 威联通 QNAP 系统文件夹
      '@Recently-Snapshot',
      // 通用系统文件夹
      '.DS_Store',
      'Thumbs.db',
      '.Trash',
      '.Trash-1000',
      '.recycle',
      'lost+found',
      '.snapshot',
      // 其他常见系统文件夹
      '.AppleDouble',
      '.AppleDB',
      '.AppleDesktop',
      '.fseventsd',
      '.Spotlight-V100',
      '.TemporaryItems',
      '.VolumeIcon.icns',
      '.com.apple.timemachine.donotpresent'
    ];
    
    // 排除以特定前缀开头的文件夹
    const excludePrefixes = [
      '.',
      '@',
      '._',
      '.Apple',
      '.com.apple',
      '@Recently-Snapshot-'
    ];
    
    // 检查是否在排除列表中
    if (excludeFolders.includes(name)) {
      return false;
    }
    
    // 检查是否以排除前缀开头
    for (const prefix of excludePrefixes) {
      if (name.startsWith(prefix)) {
        return false;
      }
    }
    
    return true;
  }

  // 获取作品基本信息
  async getWorkInfo(category, workName, workPath) {
    try {
      let markdownFile = null;
      let title = workName; // 默认使用文件夹名称作为标题
      let content = '';

      console.log(`🔍 扫描作品: ${category}/${workName}`);
      console.log(`📁 工作路径: ${workPath}`);

      // 查找文件夹中的任何.md文件
      try {
        const items = await fs.readdir(workPath, { withFileTypes: true });
        const mdFiles = items.filter(item => item.isFile() && item.name.endsWith('.md'));
        
        if (mdFiles.length > 0) {
          // 优先使用"作品介绍.md"，如果没有则使用第一个找到的.md文件
          const preferredFile = mdFiles.find(file => file.name === '作品介绍.md');
          const selectedFile = preferredFile || mdFiles[0];
          markdownFile = path.join(workPath, selectedFile.name);
          
          console.log(`📄 找到Markdown文件: ${selectedFile.name}`);
          console.log(`📄 完整路径: ${markdownFile}`);
        } else {
          console.log(`⚠️  未找到任何.md文件`);
          console.log(`📂 目录内容:`, items.map(item => item.name));
        }
      } catch (dirError) {
        console.error(`❌ 无法读取目录:`, dirError);
      }
      
      // 如果找到Markdown文件，读取内容
      if (markdownFile && await fs.pathExists(markdownFile)) {
        try {
          content = await fs.readFile(markdownFile, 'utf-8');
          title = this.extractTitle(content);
          console.log(`✅ 成功读取Markdown文件，标题: ${title}`);
        } catch (readError) {
          console.error(`❌ 读取Markdown文件失败:`, readError);
          console.log(`📊 文件信息:`, await this.getFileInfo(markdownFile));
        }
      }

      // 清理标题中的多余空格
      title = title.trim();

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
      let markdownFile = null;

      console.log(`🔍 获取作品详情: ${category}/${workName}`);
      console.log(`📁 工作路径: ${workPath}`);

      let title = workName; // 默认使用文件夹名称作为标题
      let content = '';
      let parsedContent = null;

      // 查找文件夹中的任何.md文件
      try {
        const items = await fs.readdir(workPath, { withFileTypes: true });
        const mdFiles = items.filter(item => item.isFile() && item.name.endsWith('.md'));
        
        if (mdFiles.length > 0) {
          // 优先使用"作品介绍.md"，如果没有则使用第一个找到的.md文件
          const preferredFile = mdFiles.find(file => file.name === '作品介绍.md');
          const selectedFile = preferredFile || mdFiles[0];
          markdownFile = path.join(workPath, selectedFile.name);
          
          console.log(`📄 找到Markdown文件: ${selectedFile.name}`);
          console.log(`📄 完整路径: ${markdownFile}`);
        } else {
          console.log(`⚠️  未找到任何.md文件`);
          console.log(`📂 目录内容:`, items.map(item => item.name));
        }
      } catch (dirError) {
        console.error(`❌ 无法读取目录:`, dirError);
      }
      
      // 如果找到Markdown文件，读取并解析内容
      if (markdownFile && await fs.pathExists(markdownFile)) {
        try {
          content = await fs.readFile(markdownFile, 'utf-8');
          title = this.extractTitle(content);
          console.log(`✅ 成功读取Markdown文件，标题: ${title}`);
          console.log(`📝 文件内容长度: ${content.length} 字符`);
          
          // 移除一级标题，避免重复显示
          const contentWithoutTitle = this.removeFirstTitle(content);
          
          // 解析 Markdown 内容（不包含一级标题）
          parsedContent = await this.parser.parseMarkdown(contentWithoutTitle, workPath);
          console.log(`🎨 Markdown解析完成`);
        } catch (readError) {
          console.error(`❌ 读取Markdown文件失败:`, readError);
          console.log(`📊 文件信息:`, await this.getFileInfo(markdownFile));
          
          // 读取失败时，创建一个简单的 HTML 结构
          parsedContent = {
            html: `<h1>${workName}</h1><p>这是一个作品展示页面。</p>`,
            metadata: {}
          };
        }
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

      // 按标题排序，保持一致的显示顺序
      return recommendedWorks.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('获取推荐作品失败:', error);
      return [];
    }
  }

  // 检查作品是否包含[推荐]标签
  async hasRecommendedTag(workPath) {
    try {
      // 方法1：检查文件夹中是否存在文件名包含 [推荐] 的文件
      const items = await fs.readdir(workPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isFile() && item.name.includes('[推荐]')) {
          return true;
        }
      }
      
      // 方法2：检查 Markdown 文件中的 [推荐] 标签（保持向后兼容）
      const markdownFile = path.join(workPath, '作品介绍.md');
      if (await fs.pathExists(markdownFile)) {
        const content = await fs.readFile(markdownFile, 'utf-8');
        if (content.includes('[推荐]')) {
          return true;
        }
      }
      
      return false;
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
          const relativePath = path.join(workPath, item).replace(this.contentDir, '');
          // URL编码路径，处理中文和特殊字符
          return relativePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
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
          const relativePath = path.join(workPath, item).replace(this.contentDir, '');
          // URL编码路径，处理中文和特殊字符
          const encodedPath = relativePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
          mediaFiles.push({
            name: item,
            path: encodedPath,
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

  // 获取文件详细信息（用于调试）
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mtime: stats.mtime,
        mode: stats.mode.toString(8),
        uid: stats.uid,
        gid: stats.gid
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message,
        code: error.code
      };
    }
  }
}

module.exports = { PortfolioScanner };
