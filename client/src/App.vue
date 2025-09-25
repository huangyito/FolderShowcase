<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo">
          <router-link to="/">作品集</router-link>
        </h1>
        <nav class="nav">
          <div class="nav-item dropdown">
            <router-link to="/" class="nav-link dropdown-toggle">作品</router-link>
            <div class="dropdown-menu">
              <router-link to="/" class="dropdown-item">全部作品</router-link>
              <router-link 
                v-for="category in categories" 
                :key="category.name"
                :to="`/category/${encodeURIComponent(category.name)}`" 
                class="dropdown-item"
              >
                {{ category.name }}
              </router-link>
            </div>
          </div>
          <router-link 
            v-for="page in navPages" 
            :key="page.name"
            :to="`/page/${encodeURIComponent(page.name)}`" 
            class="nav-link"
          >
            {{ page.title }}
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 作品集. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const categories = ref([])
    const navPages = ref([])
    const loading = ref(true)

    const search = () => {
      if (searchQuery.value.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
      }
    }

    const loadCategories = async () => {
      try {
        loading.value = true
        const data = await api.getCategories()
        categories.value = data
      } catch (error) {
        console.error('加载分类失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadNavPages = async () => {
      try {
        const data = await api.getNavPages()
        navPages.value = data
      } catch (error) {
        console.error('加载导航页面失败:', error)
      }
    }

    onMounted(() => {
      loadCategories()
      loadNavPages()
    })

    return {
      searchQuery,
      search,
      categories,
      navPages,
      loading
    }
  }
}
</script>

<style scoped>
/* 参考 smirapdesigns.com 的导航栏设计 */
.header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo a {
  text-decoration: none;
  color: #2c2c2c;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;
}

.logo a:hover {
  color: #666;
}

.nav {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #2c2c2c;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #2c2c2c;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* 下拉菜单样式 */
.nav-item {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-5px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 12px 20px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #2c2c2c;
}

.dropdown-item.router-link-active {
  background: #f0f0f0;
  color: #2c2c2c;
  font-weight: 500;
}

.main {
  min-height: 100vh;
  padding-top: 70px;
}

.footer {
  background: #f8f9fa;
  color: #666;
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
}

.footer p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 20px;
    height: 60px;
  }
  
  .logo a {
    font-size: 24px;
  }
  
  .nav {
    gap: 20px;
  }
  
  .main {
    padding-top: 60px;
  }
}

@media (max-width: 480px) {
  .nav {
    display: none;
  }
}
</style>