#!/usr/bin/env node

// 调试新文件识别问题的脚本
const fs = require('fs-extra');
const path = require('path');

async function debugNewFiles() {
  console.log('🔍 开始调试新文件识别问题...\n');
  
  // 检查环境变量
  const contentDir = process.env.CONTENT_DIR || path.join(__dirname, 'content');
  console.log(`📁 内容目录: ${contentDir}`);
  
  // 检查目录是否存在
  const dirExists = await fs.pathExists(contentDir);
  console.log(`📋 内容目录存在: ${dirExists}`);
  
  if (!dirExists) {
    console.log('❌ 内容目录不存在，请检查配置');
    return;
  }
  
  // 列出所有分类
  try {
    const items = await fs.readdir(contentDir, { withFileTypes: true });
    const categories = items.filter(item => item.isDirectory()).map(item => item.name);
    console.log(`📂 找到分类: ${categories.join(', ')}\n`);
    
    // 检查每个分类下的作品
    for (const category of categories) {
      console.log(`🔍 检查分类: ${category}`);
      const categoryPath = path.join(contentDir, category);
      
      try {
        const categoryItems = await fs.readdir(categoryPath, { withFileTypes: true });
        const works = categoryItems.filter(item => item.isDirectory()).map(item => item.name);
        console.log(`   📁 作品: ${works.join(', ')}`);
        
        // 检查每个作品的.md文件
        for (const work of works) {
          const workPath = path.join(categoryPath, work);
          const markdownFile = path.join(workPath, '作品介绍.md');
          
          console.log(`   🔍 检查作品: ${work}`);
          console.log(`      📄 Markdown文件: ${markdownFile}`);
          
          const exists = await fs.pathExists(markdownFile);
          console.log(`      📋 文件存在: ${exists}`);
          
          if (exists) {
            try {
              const stats = await fs.stat(markdownFile);
              console.log(`      📊 文件信息:`);
              console.log(`         大小: ${stats.size} 字节`);
              console.log(`         修改时间: ${stats.mtime}`);
              console.log(`         权限: ${stats.mode.toString(8)}`);
              console.log(`         UID: ${stats.uid}, GID: ${stats.gid}`);
              
              // 尝试读取文件
              const content = await fs.readFile(markdownFile, 'utf-8');
              console.log(`         ✅ 读取成功，内容长度: ${content.length} 字符`);
              console.log(`         📝 前100字符: ${content.substring(0, 100)}...`);
              
            } catch (error) {
              console.log(`         ❌ 读取失败: ${error.message}`);
              console.log(`         🔍 错误代码: ${error.code}`);
            }
          } else {
            // 列出作品目录内容
            try {
              const workItems = await fs.readdir(workPath);
              console.log(`      📂 目录内容: ${workItems.join(', ')}`);
            } catch (error) {
              console.log(`      ❌ 无法读取目录: ${error.message}`);
            }
          }
          console.log('');
        }
      } catch (error) {
        console.log(`   ❌ 无法读取分类目录: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ 无法读取内容目录: ${error.message}`);
  }
  
  console.log('🎉 调试完成！');
}

// 运行调试
debugNewFiles().catch(console.error);
