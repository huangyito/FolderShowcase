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
          <div v-if="work.coverImage" class="card-image-container">
            <img :src="`/content${work.coverImage}`" :alt="work.title" class="card-image" />
            <div class="card-overlay">
              <div class="overlay-content">
                <h3 class="overlay-title">{{ work.title }}</h3>
                <p class="overlay-description">{{ work.name }}</p>
              </div>
            </div>
          </div>
          <div v-else class="card-content">
            <h3>{{ work.title }}</h3>
            <p>{{ work.name }}</p>
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
      } catch (err) {
        error.value = '加载作品失败'
        console.error('加载作品失败:', err)
        works.value = []
      } finally {
        loading.value = false
      }
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