const MarkdownIt = require('markdown-it');
const markdownItAttrs = require('markdown-it-attrs');

class MarkdownParser {
  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: false, // 禁用自动链接化，我们手动处理
      typographer: true,
      breaks: true // 启用换行符转换为 <br>
    }).use(markdownItAttrs);

    // 自定义链接渲染器
    this.md.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
      const token = tokens[idx];
      const href = token.attrGet('href');
      
      // 如果是外部链接，渲染为卡片
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // 获取链接文本
        const textToken = tokens[idx + 1];
        const linkText = textToken && textToken.type === 'text' ? textToken.content : href;
        
        // 如果链接文本与 URL 相同，使用更友好的显示名称
        let displayText = linkText;
        if (linkText === href) {
          // 从 URL 中提取域名或路径作为显示文本
          try {
            const url = new URL(href);
            displayText = url.hostname.replace('www.', '');
          } catch (e) {
            displayText = href;
          }
        }
        
        return `<div class="link-card" onclick="window.open('${href}', '_blank')">
                  <div class="link-card-content">
                    <div class="link-card-title">${displayText}</div>
                    <div class="link-card-url">${href}</div>
                    <div class="link-card-arrow">→</div>
                  </div>
                </div>`;
      }
      
      // 内部链接保持原样
      return `<a href="${href}">`;
    };

    this.md.renderer.rules.link_close = (tokens, idx, options, env, renderer) => {
      const token = tokens[idx];
      const openToken = tokens[idx - 2]; // 找到对应的 link_open token
      const href = openToken ? openToken.attrGet('href') : '';
      
      // 如果是外部链接，已经在 link_open 中完全处理了，这里返回空字符串
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        return '';
      }
      
      // 内部链接保持原样
      return '</a>';
    };

    // 自定义文本渲染器，跳过外部链接的文本
    this.md.renderer.rules.text = (tokens, idx, options, env, renderer) => {
      const token = tokens[idx];
      const content = token.content;
      
      // 检查是否在外部链接内部
      let inExternalLink = false;
      for (let i = idx - 1; i >= 0; i--) {
        const prevToken = tokens[i];
        if (prevToken.type === 'link_open') {
          const href = prevToken.attrGet('href');
          if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            inExternalLink = true;
            break;
          }
        }
        if (prevToken.type === 'link_close') {
          break;
        }
      }
      
      // 如果在外部链接内部，不渲染文本（因为已经在 link_open 中处理了）
      if (inExternalLink) {
        return '';
      }
      
      return content;
    };
  }

  // 处理 URL 链接，将纯 URL 转换为 Markdown 链接格式
  processUrlLinks(content) {
    // URL 正则表达式，匹配 http:// 和 https:// 开头的链接
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    
    return content.replace(urlRegex, (url) => {
      // 从 URL 中提取友好的显示名称
      try {
        const urlObj = new URL(url);
        const displayName = urlObj.hostname.replace('www.', '');
        return `[${displayName}](${url})`;
      } catch (e) {
        return `[${url}](${url})`;
      }
    });
  }

  // 处理空行，将空行转换为 <br> 标签
  processBlankLines(content) {
    // 处理单个空行：将段落间的单个空行转换为 <br>
    content = content.replace(/\n\s*\n/g, '\n\n<br>\n\n');
    
    // 处理多个连续空行：将多个连续的空行转换为多个 <br> 标签
    content = content.replace(/\n\s*\n\s*\n+/g, (match) => {
      const emptyLines = match.split('\n').filter(line => line.trim() === '').length;
      if (emptyLines >= 2) {
        return '\n\n' + '<br>'.repeat(emptyLines - 1) + '\n\n';
      }
      return match;
    });
    
    return content;
  }

  // 解析 Markdown 内容
  async parseMarkdown(content, workPath) {
    try {
      // 处理图片和视频链接，转换为相对路径
      let processedContent = this.processMediaLinks(content, workPath);
      
      // 手动处理 URL 链接，将纯 URL 转换为 Markdown 链接格式
      processedContent = this.processUrlLinks(processedContent);
      
      // 处理空行，将多个连续空行转换为 <br> 标签
      processedContent = this.processBlankLines(processedContent);
      
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
