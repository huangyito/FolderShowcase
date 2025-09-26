<template>
  <div class="home">
    <!-- Hero Section - 动态内容 -->
    <div v-if="homeConfig && homeConfig.hasConfig" class="hero">
      <div class="container">
        <div v-html="homeConfig.parsedContent.html"></div>
      </div>
    </div>

    <!-- 推荐作品网格 - 全宽布局 -->
    <div class="works-grid">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        加载中...
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadRecommendedWorks" class="btn">重试</button>
      </div>

      <div v-else class="full-width-grid">
        <div 
          v-for="work in recommendedWorks" 
          :key="`${work.category}-${work.name}`"
          class="full-width-card work-card"
          @click="goToWork(work.category, work.name)"
        >
          <!-- 有封面图片的作品 -->
          <div v-if="work.coverImage" class="card-image-container">
            <img :src="`/content${work.coverImage}`" :alt="work.title" class="card-image" />
            <div class="card-overlay">
              <div class="overlay-content">
                <h3 class="overlay-title">{{ work.title }}</h3>
                <p class="overlay-description">{{ work.category }}</p>
              </div>
            </div>
          </div>
          
          <!-- 纯文本作品（只有.md文件） -->
          <div v-else class="card-text-container">
            <div class="text-card-content">
              <div class="text-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="text-card-title">{{ work.title }}</h3>
              <p class="text-card-category">{{ work.category }}</p>
              <div class="text-card-description">
                <span class="text-card-type">文档</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const recommendedWorks = ref([])
    const homeConfig = ref(null)
    const loading = ref(true)
    const error = ref('')

    const loadRecommendedWorks = async () => {
      try {
        loading.value = true
        error.value = ''
        const data = await api.getRecommendedWorks()
        recommendedWorks.value = data
      } catch (err) {
        error.value = '加载推荐作品失败'
        console.error('加载推荐作品失败:', err)
      } finally {
        loading.value = false
      }
    }

    const loadHomeConfig = async () => {
      try {
        const data = await api.getHomeConfig()
        homeConfig.value = data
        // 设置页面标题
        updatePageTitle()
      } catch (err) {
        console.error('加载首页配置失败:', err)
      }
    }

    // 更新页面标题
    const updatePageTitle = () => {
      const siteName = document.title.split(' - ')[0] || '作品集'
      document.title = siteName
    }

    const goToWork = (categoryName, workName) => {
      router.push(`/work/${encodeURIComponent(categoryName)}/${encodeURIComponent(workName)}`)
    }

    onMounted(() => {
      loadRecommendedWorks()
      loadHomeConfig()
    })

    return {
      recommendedWorks,
      homeConfig,
      loading,
      error,
      loadRecommendedWorks,
      goToWork
    }
  }
}
</script>

<style scoped>
/* 参考 smirapdesigns.com 的首页设计 */
.hero {
  background: #fafafa;
  padding: 50px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.hero h1 {
  font-size: 72px;
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

/* 首页 Hero 区域特殊样式 */
.hero :deep(h1) {
  font-size: 72px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c2c2c;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero :deep(p) {
  margin-bottom: 20px;
}

.works-grid {
  padding: 0;
}

.work-card {
  position: relative;
  overflow: hidden;
}

.work-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.work-card:hover::before {
  opacity: 1;
}

.work-card .card-content {
  position: relative;
  z-index: 2;
}

/* 纯文本卡片样式 */
.card-text-container {
  height: 400px;
  width: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.card-text-container:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-2px);
}

.text-card-content {
  text-align: center;
  padding: 40px;
  max-width: 80%;
}

.text-card-icon {
  color: #6c757d;
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.card-text-container:hover .text-card-icon {
  color: #495057;
}

.text-card-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 12px;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.card-text-container:hover .text-card-title {
  color: #1a1a1a;
}

.text-card-category {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 16px;
  font-weight: 500;
}

.text-card-description {
  margin-top: 20px;
}

.text-card-type {
  display: inline-block;
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.card-text-container:hover .text-card-type {
  background: rgba(108, 117, 125, 0.2);
  color: #495057;
}

.error {
  text-align: center;
  padding: 80px 40px;
  color: #dc3545;
}

.error p {
  margin-bottom: 30px;
  font-size: 18px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero {
    padding: 80px 0 60px 0;
  }
  
  .hero h1 {
    font-size: 42px;
  }
  
  .hero p {
    font-size: 18px;
  }
  
  .works-grid {
    padding: 60px 0;
  }
  
  .card-text-container {
    height: 300px;
  }
  
  .text-card-content {
    padding: 30px 20px;
  }
  
  .text-card-title {
    font-size: 20px;
  }
  
  .text-card-category {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 36px;
  }
  
  .hero p {
    font-size: 16px;
  }
}
</style>