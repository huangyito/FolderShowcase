<template>
  <div class="home">
    <!-- Hero Section - 参考 smirapdesigns.com -->
    <div class="hero">
      <div class="container">
        <h1>Hello! Welcome to my portfolio</h1>
        <p>email</p>
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
          <div v-if="work.coverImage" class="card-image-container">
            <img :src="`/content${work.coverImage}`" :alt="work.title" class="card-image" />
            <div class="card-overlay">
              <div class="overlay-content">
                <h3 class="overlay-title">{{ work.title }}</h3>
                <p class="overlay-description">{{ work.category }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const recommendedWorks = ref([])
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

    const goToWork = (categoryName, workName) => {
      router.push(`/work/${encodeURIComponent(categoryName)}/${encodeURIComponent(workName)}`)
    }

    onMounted(() => {
      loadRecommendedWorks()
    })

    return {
      recommendedWorks,
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