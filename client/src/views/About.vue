<template>
  <div class="about">
    <div class="hero">
      <div class="container">
        <h1>About/Contact</h1>
        <p>欢迎来到我的作品集</p>
      </div>
    </div>

    <div class="content">
      <div class="container">
        <div class="text-content">
          <h2>关于我</h2>
          <p>这是一个基于文件系统的个人作品分享平台，通过简单的文件夹结构来管理作品。</p>
          
          <h2>联系方式</h2>
          <p>email: your-email@example.com</p>
          
          <h2>技术栈</h2>
          <ul>
            <li>Vue.js 3</li>
            <li>Node.js</li>
            <li>Express</li>
            <li>Markdown</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.hero {
  background: #fafafa;
  padding: 100px 0 80px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.hero h1 {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c2c2c;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero p {
  font-size: 20px;
  color: #666;
  font-weight: 400;
}

.content {
  padding: 80px 0;
  background: white;
}

.text-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.text-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin: 40px 0 20px 0;
  color: #2c2c2c;
}

.text-content p {
  margin-bottom: 20px;
}

.text-content ul {
  margin: 20px 0;
  padding-left: 30px;
}

.text-content li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 42px;
  }
  
  .hero p {
    font-size: 18px;
  }
  
  .text-content h2 {
    font-size: 28px;
  }
}
</style>

