const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { PortfolioScanner } = require('./src/scanner');
const { MarkdownParser } = require('./src/parser');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, 'content');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use('/content', express.static(CONTENT_DIR));

// 初始化扫描器和解析器
const scanner = new PortfolioScanner(CONTENT_DIR);
const parser = new MarkdownParser();

// API 路由

// 获取所有分类
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await scanner.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取分类下的所有作品
app.get('/api/categories/:category/works', async (req, res) => {
  try {
    const { category } = req.params;
    const works = await scanner.getWorksByCategory(category);
    res.json(works);
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({ error: '获取作品列表失败' });
  }
});

// 获取具体作品详情
app.get('/api/categories/:category/works/:work', async (req, res) => {
  try {
    const { category, work } = req.params;
    const workDetail = await scanner.getWorkDetail(category, work);
    
    if (!workDetail) {
      return res.status(404).json({ error: '作品不存在' });
    }

    // 解析 Markdown 内容
    const parsedContent = await parser.parseMarkdown(workDetail.content, workDetail.workPath);
    
    res.json({
      ...workDetail,
      parsedContent
    });
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({ error: '获取作品详情失败' });
  }
});

// 获取推荐作品（带有#推荐标签的作品）
app.get('/api/works/recommended', async (req, res) => {
  try {
    const recommendedWorks = await scanner.getRecommendedWorks();
    res.json(recommendedWorks);
  } catch (error) {
    console.error('获取推荐作品失败:', error);
    res.status(500).json({ error: '获取推荐作品失败' });
  }
});

// 获取所有作品（用于搜索）
app.get('/api/works', async (req, res) => {
  try {
    const { search } = req.query;
    const allWorks = await scanner.getAllWorks();
    
    let filteredWorks = allWorks;
    if (search) {
      filteredWorks = allWorks.filter(work => 
        work.title.toLowerCase().includes(search.toLowerCase()) ||
        work.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredWorks);
  } catch (error) {
    console.error('获取所有作品失败:', error);
    res.status(500).json({ error: '获取所有作品失败' });
  }
});

// 首页路由 - 返回 Vue 应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`作品分享网站运行在 http://localhost:${PORT}`);
  console.log(`内容目录: ${CONTENT_DIR}`);
});

module.exports = app;
