<template>
  <div class="navbar">
    <div class="left-menu">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/back/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right-menu">
      <div class="right-menu-item" @click="toggleFullScreen">
        <el-icon :size="20">
          <component :is="isFullscreen ? Aim : FullScreen" />
        </el-icon>
      </div>

      <el-dropdown trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="32" :src="'/api' + userInfo?.avatar">
            {{ userInfo?.name?.charAt(0)?.toUpperCase() || userInfo?.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <span class="user-name">{{ userInfo?.name || userInfo?.username }}</span>
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfile">
              <el-icon>
                <User />
              </el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { Expand, Fold, ArrowDown, User, SwitchButton, FullScreen, Aim } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const userInfo = computed(() => userStore.userInfo)
const isFullscreen = ref(false)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// 添加和移除全屏事件监听
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const handleProfile = () => {
  router.push('/back/user/person')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  padding-right: 16px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;

  .left-menu {
    display: flex;
    align-items: center;
    padding-left: 20px;
    height: 100%;

    :deep(.el-breadcrumb) {
      line-height: 60px;

      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          color: #666;
          font-weight: normal;

          &.is-link {
            color: #999;
            font-weight: normal;

            &:hover {
              color: #409EFF;
            }
          }
        }

        &:last-child {
          .el-breadcrumb__inner {
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
  }

  .right-menu {
    display: flex;
    align-items: center;
    gap: 8px;

    .right-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #666;
      border-radius: 4px;
      transition: all 0.3s;
      height: 32px;
      width: 32px;

      &:hover {
        background: #f6f6f6;
        color: #333;
      }
    }

    .avatar-wrapper {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      height: 32px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: #f6f6f6;
      }

      .user-name {
        margin: 0 8px;
        font-size: 14px;
        color: #666;
        line-height: 32px;
      }

      .el-icon {
        color: #999;
        display: flex;
        align-items: center;
      }
    }
  }

  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    height: 40px;

    .el-icon {
      margin-right: 4px;
      display: flex;
      align-items: center;
    }
  }
}
</style>