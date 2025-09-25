const MarkdownIt = require('markdown-it');
const markdownItAttrs = require('markdown-it-attrs');

class MarkdownParser {
  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    }).use(markdownItAttrs);
  }

  // 解析 Markdown 内容
  async parseMarkdown(content, workPath) {
    try {
      // 处理图片和视频链接，转换为相对路径
      const processedContent = this.processMediaLinks(content, workPath);
      
      // 解析 Markdown
      const html = this.md.render(processedContent);
      
      // 提取元数据
      const metadata = this.extractMetadata(content);
      
      return {
        html,
        metadata,
        rawContent: content
      };
    } catch (error) {
      console.error('解析 Markdown 失败:', error);
      return {
        html: '<p>内容解析失败</p>',
        metadata: {},
        rawContent: content
      };
    }
  }

  // 处理媒体文件链接
  processMediaLinks(content, workPath) {
    // 从workPath中提取分类和作品名称
    const pathParts = workPath.split('/');
    const categoryName = pathParts[pathParts.length - 2];
    const workName = pathParts[pathParts.length - 1];
    
    // 处理图片链接 - 确保路径正确
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // 如果是相对路径，转换为正确的路径
      if (!src.startsWith('http') && !src.startsWith('/')) {
        const relativePath = src.replace(/^\.\//, '');
        // 构建完整的路径：/content/分类/作品/文件名
        return `![${alt}](/content/${categoryName}/${workName}/${relativePath})`;
      }
      return match;
    });

    // 处理视频标签
    content = content.replace(/<video[^>]*>[\s\S]*?<\/video>/g, (match) => {
      return match.replace(/src="([^"]+)"/g, (srcMatch, src) => {
        if (!src.startsWith('http') && !src.startsWith('/')) {
          const relativePath = src.replace(/^\.\//, '');
          // 构建完整的路径：/content/分类/作品/文件名
          return `src="/content/${categoryName}/${workName}/${relativePath}"`;
        }
        return srcMatch;
      });
    });

    return content;
  }

  // 提取元数据
  extractMetadata(content) {
    const metadata = {
      title: '',
      description: '',
      tags: [],
      links: []
    };

    const lines = content.split('\n');
    let inMetadata = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 提取标题
      if (line.startsWith('# ')) {
        metadata.title = line.substring(2).trim();
        continue;
      }

      // 提取描述（第一个段落）
      if (line && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('<') && !metadata.description) {
        metadata.description = line;
        continue;
      }

      // 提取标签
      if (line.startsWith('#')) {
        const tagMatch = line.match(/#([^#\s]+)/g);
        if (tagMatch) {
          metadata.tags.push(...tagMatch.map(tag => tag.substring(1)));
        }
      }

      // 提取链接
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linkMatch) {
        linkMatch.forEach(link => {
          const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            metadata.links.push({
              text: match[1],
              url: match[2]
            });
          }
        });
      }
    }

    return metadata;
  }

  // 提取图片列表
  extractImages(content) {
    const images = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      images.push({
        alt: match[1],
        src: match[2]
      });
    }

    return images;
  }

  // 提取视频列表
  extractVideos(content) {
    const videos = [];
    const videoRegex = /<video[^>]*>[\s\S]*?<\/video>/g;
    let match;

    while ((match = videoRegex.exec(content)) !== null) {
      const srcMatch = match[0].match(/src="([^"]+)"/);
      if (srcMatch) {
        videos.push({
          src: srcMatch[1]
        });
      }
    }

    return videos;
  }
}

module.exports = { MarkdownParser };
