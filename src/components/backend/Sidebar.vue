<template>
  <div class="sidebar-container">
    <div class="logo">
      <div class="logo-icon">
        <el-icon>
          <component :is="'Reading'" />
        </el-icon>
      </div>
      <span class="logo-text">图书室借阅管理系统</span>
    </div>
    <div class="menu-wrapper">
      <el-menu :default-active="activeMenu" mode="vertical" class="sidebar-menu" text-color="#37474F"
        active-text-color="#FFFFFF" unique-opened router>
        <!-- 静态菜单 -->
        <el-menu-item index="/back/dashboard">
          <el-icon>
            <component :is="'Odometer'" />
          </el-icon>
          <template #title>控制台</template>
        </el-menu-item>

        <el-sub-menu index="/back/book">
          <template #title>
            <el-icon>
              <component :is="'Reading'" />
            </el-icon>
            <span>图书管理</span>
          </template>
          <el-menu-item index="/back/book/management">
            <el-icon>
              <component :is="'List'" />
            </el-icon>
            <template #title>图书列表</template>
          </el-menu-item>
          <el-menu-item index="/back/book/category">
            <el-icon>
              <component :is="'Folder'" />
            </el-icon>
            <template #title>分类管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/back/user-management">
          <el-icon>
            <component :is="'User'" />
          </el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="/back/borrow/management">
          <el-icon>
            <component :is="'Document'" />
          </el-icon>
          <template #title>借阅管理</template>
        </el-menu-item>

        <el-menu-item index="/back/comment/management">
          <el-icon>
            <component :is="'ChatDotRound'" />
          </el-icon>
          <template #title>评论管理</template>
        </el-menu-item>

        <el-menu-item index="/back/system/config">
          <el-icon>
            <component :is="'Setting'" />
          </el-icon>
          <template #title>系统配置</template>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Odometer, Reading, List, Folder, User, Document, ChatDotRound, Star, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 确保元素刷新
onMounted(() => {
  // 强制更新一下DOM，解决可能的初始化问题
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 300)
})
</script>

<style lang="scss" scoped>
// 定义全局变量 - 浅色主题
$primary-color: #4F9DFB;
$primary-light: #E3F2FD;
$primary-dark: #247ADB;
$text-primary: #37474F;
$text-secondary: #607D8B;
$background-light: #FFFFFF;
$background-medium: #F5F7FA;
$background-dark: #ECEFF1;
$border-color: #E0E0E0;
$border-radius: 12px;
$box-shadow-light: 0 4px 6px rgba(0, 0, 0, 0.03);
$box-shadow-medium: 0 6px 16px rgba(0, 0, 0, 0.06);
$transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 磨砂玻璃效果混入
@mixin glass-effect {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-container {
  height: 100vh;
  background: linear-gradient(180deg, $background-light 0%, $background-medium 100%);
  display: flex;
  flex-direction: column;
  width: 250px;
  transition: $transition-normal;
  position: relative;
  overflow: hidden;
  box-shadow: $box-shadow-medium;
  border-right: 1px solid $border-color;

  // 背景装饰元素
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    z-index: 0;
  }

  &::before {
    width: 300px;
    height: 300px;
    bottom: -150px;
    right: -150px;
    background: radial-gradient(circle, rgba($primary-light, 0.5) 0%, transparent 70%);
    opacity: 0.4;
  }

  &::after {
    width: 200px;
    height: 200px;
    top: 20%;
    left: -100px;
    background: radial-gradient(circle, rgba($primary-light, 0.5) 0%, transparent 70%);
    opacity: 0.3;
  }

  .logo {
    height: 70px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    overflow: hidden;
    transition: $transition-normal;
    position: relative;
    z-index: 2;
    @include glass-effect;

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      border-radius: 10px;
      margin-right: 12px;
      box-shadow: 0 4px 8px rgba($primary-dark, 0.2);
      transition: $transition-normal;
      flex-shrink: 0;

      :deep(.el-icon) {
        font-size: 22px;
        color: white;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }
    }

    .logo-text {
      color: $text-primary;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      transition: $transition-normal;
      background: linear-gradient(to right, $primary-dark, $primary-color);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 1px;
    }
  }

  .menu-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
    padding: 10px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba($text-secondary, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  :deep(.sidebar-menu) {
    border: none;
    background: transparent;
    transition: $transition-normal;
    width: 100% !important;

    .el-menu-item,
    .el-sub-menu__title {
      height: 50px;
      line-height: 50px;
      color: $text-primary;
      background: transparent;
      transition: $transition-normal;
      margin: 4px 10px;
      border-radius: 8px;

      .el-icon {
        margin-right: 8px;
        width: 24px;
        text-align: center;
        color: inherit;
        font-size: 18px;
        transition: $transition-normal;
      }

      span {
        transition: $transition-normal;
      }

      &:hover {
        background: rgba($primary-light, 0.5) !important;
        color: $primary-dark;
      }
    }

    .el-menu-item.is-active {
      background: linear-gradient(120deg, $primary-color, $primary-dark) !important;
      color: white !important;
      box-shadow: 0 4px 10px rgba($primary-dark, 0.3);
    }

    .el-sub-menu {
      &.is-opened {
        >.el-sub-menu__title {
          color: $primary-dark;
          background: rgba($primary-light, 0.3) !important;
        }
      }

      .el-menu {
        background: $background-medium;
        padding: 5px;
        border-radius: 8px;
        margin: 0 10px;

        .el-menu-item {
          background: transparent;
          margin: 4px 0;
          height: 44px;
          line-height: 44px;
          border-radius: 6px;

          &:hover {
            background: rgba($primary-light, 0.5) !important;
          }

          &.is-active {
            background: linear-gradient(120deg, $primary-color, $primary-dark) !important;
          }
        }
      }
    }

    // 折叠状态下的样式
    &.el-menu--collapse {
      width: 64px !important;

      .el-sub-menu,
      .el-menu-item {
        justify-content: center;
        padding: 0 20px !important;
      }

      .el-sub-menu__title {
        padding: 0 !important;
        display: flex;
        justify-content: center;

        .el-icon {
          margin: 0 !important;
          width: auto !important;
          font-size: 18px !important;
        }
      }

      .el-menu-item {
        padding: 0 !important;
        display: flex;
        justify-content: center;

        .el-icon {
          margin: 0 !important;
          width: auto !important;
          font-size: 18px !important;
        }
      }
    }
  }

  span {
    vertical-align: middle;
    font-size: 14px;
    letter-spacing: 0.3px;
  }
}

// 折叠状态下弹出的菜单
:deep(.el-menu--popup) {
  background: $background-light;
  border-radius: 8px;
  padding: 5px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  .el-menu-item {
    height: 44px;
    line-height: 44px;
    border-radius: 6px;
    color: $text-primary;
    transition: $transition-normal;

    &:hover {
      background: rgba($primary-light, 0.5) !important;
      color: $primary-dark;
    }

    &.is-active {
      background: linear-gradient(120deg, $primary-color, $primary-dark) !important;
      color: white !important;
      box-shadow: 0 4px 10px rgba($primary-dark, 0.3);
    }

    .el-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      margin-right: 5px;
    }
  }
}
</style>