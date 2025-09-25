import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求失败:', error)
    return Promise.reject(error)
  }
)

export default {
  // 获取所有分类
  getCategories() {
    return api.get('/categories')
  },

  // 获取分类下的作品
  getWorksByCategory(category) {
    return api.get(`/categories/${encodeURIComponent(category)}/works`)
  },

  // 获取作品详情
  getWorkDetail(category, work) {
    return api.get(`/categories/${encodeURIComponent(category)}/works/${encodeURIComponent(work)}`)
  },

  // 搜索作品
  searchWorks(query) {
    return api.get('/works', {
      params: { search: query }
    })
  },

  // 获取推荐作品（带有#推荐标签的作品）
  getRecommendedWorks() {
    return api.get('/works/recommended')
  },

  // 获取首页配置
  getHomeConfig() {
    return api.get('/home')
  },

  // 获取导航页面
  getNavPages() {
    return api.get('/nav-pages')
  },

  // 获取特定页面
  getPage(pageName) {
    return api.get(`/pages/${encodeURIComponent(pageName)}`)
  }
}