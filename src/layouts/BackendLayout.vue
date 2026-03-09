<template>
  <div class="backend-layout">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <Navbar @logout="handleLogout" />

      <!-- 页面内容 -->
      <div class="content-container">


        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- 页脚 -->
      <div class="footer">
        <p>&copy; {{ currentYear }} 图书室借阅管理系统 - 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '@/components/backend/Sidebar.vue'
import Navbar from '@/components/backend/Navbar.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const currentYear = new Date().getFullYear()

const isAdmin = computed(() => userStore.roleCode === 'ADMIN')

const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.backend-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;

  .sidebar-container {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
  }
}

.main-content {
  flex: 1;
  display: flex;
  height: 100vh;
  flex-direction: column;
  margin-left: 250px;

  .content-container {
    flex: 1;
    padding: 0 20px 20px;
    overflow-y: auto;
    background-color: #f1f4f9;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .footer {
    padding: 15px 20px;
    text-align: center;
    font-size: 14px;
    color: #909399;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
  }
}

// 当侧边栏折叠时调整主内容区域
:deep(.sidebar-container.is-collapsed)+.main-content {
  margin-left: 64px;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>