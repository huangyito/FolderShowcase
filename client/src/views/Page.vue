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
        // 设置页面标题
        updatePageTitle()
      } catch (err) {
        error.value = '加载页面失败'
        console.error('加载页面失败:', err)
      } finally {
        loading.value = false
      }
    }

    // 更新页面标题
    const updatePageTitle = () => {
      if (page.value) {
        const siteName = document.title.split(' - ')[0] || '作品集'
        document.title = `${page.value.title} - ${siteName}`
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

/* Page.vue 使用全局统一的 .markdown-content 样式 */

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
