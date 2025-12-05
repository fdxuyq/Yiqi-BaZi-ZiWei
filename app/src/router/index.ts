// 简化的路由配置
import { ref } from 'vue'
import ChartPage from '../views/ChartPage.vue'

// 直接启动到排盘页面
export const currentRoute = ref('/')

export const routes = {
  '/': ChartPage
}

export function navigateTo(path: string) {
  currentRoute.value = path
}

export default {
  currentRoute,
  routes,
  navigateTo
}
