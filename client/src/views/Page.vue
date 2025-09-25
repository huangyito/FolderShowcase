<template>
  <div class="page-detail">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ page.title }}</h1>
      </div>
    </div>
    <div class="page-content">
      <div class="container">
        <div v-if="page.parsedContent" v-html="page.parsedContent.html" class="markdown-content"></div>
        <div v-else class="empty">
          <p>页面内容为空。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

export default {
  name: 'Page',
  setup() {
    const route = useRoute()
    const page = ref(null)
    const loading = ref(true)
    const error = ref('')

    const loadPage = async (pageName) => {
      try {
        loading.value = true
        error.value = ''
        const data = await api.getPage(pageName)
        page.value = data
      } catch (err) {
        error.value = '加载页面失败'
        console.error('加载页面失败:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadPage(route.params.pageName)
    })

    watch(() => route.params.pageName, (newPageName) => {
      loadPage(newPageName)
    })

    return {
      page,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.page-detail {
  min-height: 100vh;
  background: #fff;
}

.page-header {
  background: #fafafa;
  padding: 80px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c2c2c;
  letter-spacing: -1px;
  line-height: 1.1;
}

.page-content {
  padding: 80px 0;
  background: #fff;
}

.markdown-content {
  margin: 0 auto;
  max-width: 800px;
  padding: 0 40px;
  line-height: 1.8;
  color: #666;
  font-size: 16px;
}

.markdown-content p {
  margin-bottom: 20px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 30px;
  margin-bottom: 15px;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 20px;
  padding-left: 20px;
}

.markdown-content li {
  margin-bottom: 8px;
}

.markdown-content blockquote {
  margin: 20px 0;
  padding: 15px 20px;
  border-left: 4px solid #e0e0e0;
  background-color: #f9f9f9;
  font-style: italic;
}

.markdown-content hr {
  margin: 30px 0;
  border: none;
  height: 1px;
  background-color: #e0e0e0;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 36px;
  }
  .page-content {
    padding: 40px 0;
  }
  .markdown-content {
    padding: 0 20px;
  }
}
</style>
