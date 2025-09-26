<template>
  <div class="category">
    <div class="category-header">
      <div class="container">
        <h1>{{ categoryName }}</h1>
        <p>{{ works.length }} 个作品</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      加载中...
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadWorks" class="btn">重试</button>
    </div>

    <div v-else-if="works.length === 0" class="empty">
      <p>该分类下暂无作品</p>
      <router-link to="/" class="btn">返回首页</router-link>
    </div>

    <div v-else class="works-grid">
      <div class="full-width-grid">
        <div 
          v-for="work in works" 
          :key="work.name"
          class="full-width-card work-card"
          @click="goToWork(work.name)"
        >
          <!-- 有封面图片的作品 -->
          <div v-if="work.coverImage" class="card-image-container">
            <img :src="`/content${work.coverImage}`" :alt="work.title" class="card-image" />
            <div class="card-overlay">
              <div class="overlay-content">
                <h3 class="overlay-title">{{ work.title }}</h3>
                <p class="overlay-description">{{ work.name }}</p>
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
              <p class="text-card-category">{{ work.name }}</p>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

export default {
  name: 'Category',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const works = ref([])
    const loading = ref(true)
    const error = ref('')

    const categoryName = computed(() => {
      return decodeURIComponent(route.params.name)
    })

    const loadWorks = async () => {
      try {
        loading.value = true
        error.value = ''
        const data = await api.getWorksByCategory(categoryName.value)
        works.value = data || []
        // 设置页面标题
        updatePageTitle()
      } catch (err) {
        error.value = '加载作品失败'
        console.error('加载作品失败:', err)
        works.value = []
      } finally {
        loading.value = false
      }
    }

    // 更新页面标题
    const updatePageTitle = () => {
      const siteName = document.title.split(' - ')[0] || '作品集'
      document.title = `${categoryName.value} - ${siteName}`
    }

    const goToWork = (workName) => {
      router.push(`/work/${encodeURIComponent(categoryName.value)}/${encodeURIComponent(workName)}`)
    }

    onMounted(() => {
      loadWorks()
    })

    // 监听路由变化，重新加载作品
    watch(() => route.params.name, () => {
      loadWorks()
    })

    return {
      categoryName,
      works,
      loading,
      error,
      loadWorks,
      goToWork
    }
  }
}
</script>

<style scoped>
/* 参考 smirapdesigns.com 的分类页设计 */
.category-header {
  background: #fafafa;
  padding: 100px 0 80px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.category-header h1 {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c2c2c;
  letter-spacing: -1px;
  line-height: 1.1;
}

.category-header p {
  font-size: 20px;
  color: #666;
  font-weight: 400;
}

.works-grid {
  padding: 80px 0;
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

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #666;
  max-width: 1200px;
  margin: 0 auto;
}

.empty p {
  font-size: 18px;
  margin-bottom: 20px;
}

.error {
  text-align: center;
  padding: 80px 40px;
  color: #dc3545;
  max-width: 1200px;
  margin: 0 auto;
}

.error p {
  margin-bottom: 30px;
  font-size: 18px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-header h1 {
    font-size: 42px;
  }
  
  .category-header p {
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
  .category-header h1 {
    font-size: 36px;
  }
  
  .category-header p {
    font-size: 16px;
  }
}
</style>