<template>
  <div class="work">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      加载中...
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadWork" class="btn">重试</button>
    </div>

    <div v-else-if="work" class="work-detail">
      <!-- 作品头部 -->
      <div class="work-header">
        <div class="container">
          <h1 class="work-title">{{ work.title }}</h1>
          <div class="work-meta">
            <span class="category">{{ work.category }}</span>
            <span class="separator">•</span>
            <span class="work-name">{{ work.name }}</span>
          </div>
        </div>
      </div>

      <!-- 作品内容 -->
      <div class="work-content">
        <!-- 如果有 Markdown 内容，显示解析后的 HTML -->
        <div v-if="work.hasMarkdown" class="markdown-content" v-html="work.parsedContent.html"></div>
        
        <!-- 如果没有 Markdown 内容，显示媒体文件 -->
        <div v-else class="media-gallery">
          <div v-for="(media, index) in work.mediaFiles" :key="index" class="media-item">
            <img 
              v-if="media.type === 'image'" 
              :src="`/content${media.path}`" 
              :alt="media.name"
              class="gallery-image"
            />
            <video 
              v-else-if="media.type === 'video'" 
              :src="`/content${media.path}`" 
              :alt="media.name"
              class="gallery-video"
              controls
              muted
              loop
              playsinline
            />
          </div>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="work-navigation">
        <div class="container">
          <div class="nav-buttons">
            <router-link to="/" class="btn btn-secondary">
              ← 返回首页
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

export default {
  name: 'Work',
  setup() {
    const route = useRoute()
    const work = ref(null)
    const loading = ref(true)
    const error = ref('')

    const categoryName = computed(() => {
      return decodeURIComponent(route.params.category)
    })

    const workName = computed(() => {
      return decodeURIComponent(route.params.work)
    })

    const loadWork = async () => {
      try {
        loading.value = true
        error.value = ''
        const data = await api.getWorkDetail(categoryName.value, workName.value)
        work.value = data
        
        // 设置页面标题
        updatePageTitle()
        
        // 等待DOM更新后设置视频自动播放
        await nextTick()
        setupVideoAutoplay()
      } catch (err) {
        error.value = '加载作品失败'
        console.error('加载作品失败:', err)
      } finally {
        loading.value = false
      }
    }

    // 更新页面标题
    const updatePageTitle = () => {
      if (work.value) {
        const siteName = document.title.split(' - ')[0] || '作品集'
        document.title = `${work.value.title} - ${siteName}`
      }
    }

    // 设置视频自动播放功能
    const setupVideoAutoplay = () => {
      const videos = document.querySelectorAll('.markdown-content video')
      
      videos.forEach(video => {
        // 移除默认的controls属性
        video.removeAttribute('controls')
        
        // 设置视频属性
        video.muted = true
        video.loop = true
        video.playsInline = true
        
        // 创建Intersection Observer来监听视频是否在视口中
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // 视频进入视口时播放
              video.play().catch(e => {
                console.log('视频自动播放失败:', e)
              })
            } else {
              // 视频离开视口时暂停
              video.pause()
            }
          })
        }, {
          threshold: 0.5 // 当视频50%可见时触发
        })
        
        observer.observe(video)
        
        // 点击视频时播放/暂停
        video.addEventListener('click', () => {
          if (video.paused) {
            video.play()
          } else {
            video.pause()
          }
        })
      })
    }

    onMounted(() => {
      loadWork()
    })

    return {
      work,
      loading,
      error,
      loadWork
    }
  }
}
</script>

<style scoped>
/* 基础布局 */
.work-detail {
  min-height: 100vh;
  background: white;
  overflow-x: hidden;
}

.work-header {
  background: #fafafa;
  padding: 80px 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.work-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c2c2c;
  letter-spacing: -1px;
  line-height: 1.1;
}

.work-meta {
  font-size: 18px;
  color: #666;
  font-weight: 400;
}

.category {
  font-weight: 600;
}

.separator {
  margin: 0 15px;
}

.work-content {
  padding: 80px 0;
  background: white;
}

/* Work.vue 使用全局统一的 .markdown-content 样式 */

/* 图片样式 - 实现 Behance 效果，图片间无间距 */
.markdown-content img {
  display: block !important;
  width: 100vw !important;
  height: auto !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  object-fit: contain !important;
  max-width: none !important;
  max-height: none !important;
  box-sizing: border-box !important;
}

/* 视频样式 - 实现 Behance 效果，视频间无间距 */
.markdown-content video {
  display: block !important;
  width: 100vw !important;
  height: auto !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  object-fit: contain !important;
  max-width: none !important;
  max-height: none !important;
  background: #000 !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
}

/* 视频悬停时显示控件 */
.markdown-content video:hover {
  cursor: pointer !important;
}

/* 隐藏视频默认控件 */
.markdown-content video::-webkit-media-controls {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-panel {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-play-button {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-timeline {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-current-time-display {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-time-remaining-display {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-mute-button {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-volume-slider {
  display: none !important;
}

.markdown-content video::-webkit-media-controls-fullscreen-button {
  display: none !important;
}

/* Work.vue 特有的代码样式 */
.markdown-content code {
  background: #f1f3f4;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 16px;
  color: #e83e8c;
}

.markdown-content pre {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 40px 0;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.markdown-content pre code {
  background: none;
  padding: 0;
  color: #333;
  font-size: 16px;
}

/* 媒体画廊样式 */
.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.media-item {
  width: 100%;
  margin: 0;
}

.gallery-image,
.gallery-video {
  width: 100vw !important;
  height: auto !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  object-fit: contain !important;
  max-width: none !important;
  max-height: none !important;
  box-sizing: border-box !important;
  display: block !important;
}

.gallery-video {
  background: #000 !important;
  cursor: pointer !important;
}

/* 导航按钮 */
.work-navigation {
  background: #f8f9fa;
  padding: 60px 0;
  border-top: 1px solid #eee;
  margin-top: 80px;
}

.nav-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* 错误状态 */
.error {
  text-align: center;
  padding: 80px 20px;
  color: #dc3545;
}

.error p {
  font-size: 18px;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .work-title {
    font-size: 36px;
  }
  
  .work-meta {
    font-size: 16px;
  }
  
  .work-content {
    padding: 40px 0;
  }
  
  .work-header {
    padding: 60px 0;
  }
  
  .markdown-content img,
  .markdown-content video {
    margin: 30px 0;
  }
  
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .markdown-content h1 {
    font-size: 28px;
  }
  
  .markdown-content h2 {
    font-size: 24px;
  }
  
  .markdown-content h3 {
    font-size: 20px;
  }
  
  .markdown-content img,
  .markdown-content video {
    margin: 20px 0;
  }
}
</style>