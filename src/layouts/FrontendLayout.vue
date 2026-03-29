<template>
  <el-container class="frontend-layout">
    <!-- 使用el-header实现顶部导航栏 -->
    <el-header class="header" height="64px">
      <div class="header-container">
        <div class="logo">
          <router-link to="/">
            <el-icon class="logo-icon">
              <Reading />
            </el-icon>
            <span class="logo-text">图书室借阅管理系统</span>
          </router-link>
        </div>
        <nav class="main-nav">
          <router-link to="/" exact class="nav-item">
            <el-icon class="nav-icon">
              <HomeFilled />
            </el-icon>
            <span>
              首页
            </span>
          </router-link>
          <router-link to="/book/list" class="nav-item">
            <el-icon class="nav-icon">
              <Menu />
            </el-icon>
            <span>图书</span>
          </router-link>
        </nav>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <!-- 添加借阅提醒图标 -->
            <el-badge :value="allNotifications.length" :hidden="allNotifications.length === 0"
              class="notification-badge">
              <el-popover placement="bottom" :width="320" trigger="click" @show="loadAllNotifications">
                <template #reference>
                  <el-button class="notification-btn" :type="allNotifications.length > 0 ? 'primary' : 'info'" circle>
                    <el-icon>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-icon>
                  </el-button>
                </template>

                <div class="notification-header">
                  <h3>借阅提醒</h3>
                </div>

                <el-divider />

                <div class="notification-list" v-if="allNotifications.length > 0">
                  <!-- 已逾期的借阅 -->
                  <template v-if="overdueNotifications.length > 0">
                    <div class="notification-category overdue">已逾期</div>
                    <div v-for="item in overdueNotifications" :key="item.id" class="notification-item overdue-item">
                      <el-avatar :size="40" :src="item.coverUrl ? ('/api' + item.coverUrl) : ''" class="book-avatar">
                        {{ item.bookTitle ? item.bookTitle[0] : '书' }}
                      </el-avatar>
                      <div class="notification-content">
                        <div class="notification-title">《{{ item.bookTitle }}》已逾期</div>
                        <div class="notification-info">
                          应还日期: {{ formatDate(item.planReturnTime) }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- 即将到期的借阅 -->
                  <template v-if="expiryNotifications.length > 0">
                    <div class="notification-category expiry">即将到期</div>
                    <div v-for="item in expiryNotifications" :key="item.id" class="notification-item">
                      <el-avatar :size="40" :src="item.coverUrl ? ('/api' + item.coverUrl) : ''" class="book-avatar">
                        {{ item.bookTitle ? item.bookTitle[0] : '书' }}
                      </el-avatar>
                      <div class="notification-content">
                        <div class="notification-title">《{{ item.bookTitle }}》即将到期</div>
                        <div class="notification-info">
                          应还日期: {{ formatDate(item.planReturnTime) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>

                <div v-else class="notification-empty">
                  <el-empty description="暂无借阅提醒" :image-size="60" />
                </div>

                <template v-if="allNotifications.length > 0">
                  <el-divider />
                  <div class="notification-footer">
                    <router-link to="/user/borrow">
                      <el-button type="primary" size="small">查看全部借阅</el-button>
                    </router-link>
                  </div>
                </template>
              </el-popover>
            </el-badge>

            <el-dropdown trigger="click" @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="36" :src="userInfo?.avatar ? ('/api' + userInfo.avatar) : ''" class="user-avatar"
                  shape="circle">
                  {{ getAvatarText() }}
                </el-avatar>

              </span>
              <template #dropdown>
                <div class="drop-top" @click="handleCommand('profile')">
                  <div class="top-item">
                    <el-avatar :size="36" :src="userInfo?.avatar ? ('/api' + userInfo.avatar) : ''" class="user-avatar"
                      shape="circle">
                    </el-avatar>
                  </div>
                  <div class="top-item">
                    <span class="username">{{ userInfo?.name || userInfo?.username }}</span>
                  </div>
                </div>
                <el-dropdown-menu>
                  <el-dropdown-item command="borrow">
                    <el-icon>
                      <Notebook />
                    </el-icon>我的借阅
                  </el-dropdown-item>
                  <el-dropdown-item command="collection">
                    <el-icon>
                      <Star />
                    </el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item command="comment">
                    <el-icon>
                      <ChatDotRound />
                    </el-icon>我的评论
                  </el-dropdown-item>
                  <el-dropdown-item v-if="isAdmin" command="admin" divided>
                    <el-icon>
                      <Setting />
                    </el-icon>进入后台
                  </el-dropdown-item>
                  <el-dropdown-item :divided="!isAdmin" command="logout">
                    <el-icon>
                      <SwitchButton />
                    </el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">
              <el-button plain>去登录</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- 简化的页脚 -->
    <el-footer class="footer" height="auto">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-item">
            <div class="foot-title">
              联系我们
            </div>
            <div>
              <div>详细地址: 广东省茂名市茂南区官渡街道官渡二路139号</div>
              <div>邮政编码: 525000</div>
              <div>咨询电话: 0668-1234567</div>
              <div>咨询建议: gy@edu.com</div>
            </div>
          </div>
          <div class="footer-item">
            <div class="foot-title">
              关注我们</div>
            <div>
              <div class="foot-Code">
                <div class="code-item">
                  <img class="footer-img" src="@/assets/images/wechatCode.png" alt="官方微信平台">
                  <span>官方微信平台</span>
                </div>
                <div class="code-item">
                  <img class="footer-img" src="@/assets/images/weiboCode.png" alt="官方微博">
                  <span>官方微博</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-footer>
    <AiFloatButton />
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import AiFloatButton from '@/components/AiFloatButton.vue'
import {
  Reading,
  HomeFilled,
  Menu,
  StarFilled,
  Notebook,
  Star,
  ChatDotRound,
  SwitchButton,
  Setting,
  BellFilled
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.roleType === 'ADMIN')
const expiryNotifications = computed(() => userStore.expiryNotifications)
const overdueNotifications = computed(() => userStore.overdueNotifications)
const allNotifications = computed(() => userStore.allNotifications)

// 获取头像文本（用户名或昵称的第一个字符）
const getAvatarText = () => {
  if (userInfo.value?.name) return userInfo.value.name[0]
  if (userInfo.value?.username) return userInfo.value.username[0]
  return 'U'
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'borrow':
      router.push('/user/borrow')
      break
    case 'collection':
      router.push('/user/collection')
      break
    case 'comment':
      router.push('/user/comment')
      break
    case 'admin':
      router.push('/back/dashboard')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

const loadAllNotifications = () => {
  if (userStore.isLoggedIn) {
    userStore.fetchAllNotifications();
  }
}

const formatDate = (dateTime) => {
  if (!dateTime) return '无';

  const date = new Date(dateTime);

  // 检查日期是否有效
  if (isNaN(date.getTime())) return dateTime;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 组件挂载时，如果用户已登录，获取逾期提醒
onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchAllNotifications();
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #409EFF;
$green-color: rgb(175, 223, 255);
$primary-gradient: linear-gradient(135deg, #409EFF, #70ecb8);
$nav-gradient: linear-gradient(135deg, #f2fffa, #409EFF, #f2fffa);
$background-gradient: linear-gradient(135deg, #d8ecff 0%, #edf6ff 40%, #bcffdd 100%);
$glass-effect: rgba(255, 255, 255, 0.8);
$shadow-light: 0 4px 12px rgba(0, 0, 0, 0.05);
$shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.1);
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 磨砂玻璃效果混入
@mixin glass-morphism {
  background: $glass-effect;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.frontend-layout {
  min-height: 100vh;
  background: $background-gradient;
}

.header {
  @include glass-morphism;
  box-shadow: $shadow-light;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
  height: 70px;
  transition: $transition;

  &:hover {
    box-shadow: $shadow-medium;
  }
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #333;
    transition: $transition;
  }

  .logo-icon {
    font-size: 28px;
    margin-right: 12px;
    color: $primary-color;
    filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
  }

  .logo-text {
    font-size: 22px;
    font-weight: 600;
    background: $primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
}

.main-nav {
  display: flex;
  gap: 32px;

  .nav-item {
    align-items: center;
    text-align: center;
    display: flex;
    justify-content: center;

    .nav-icon {
      font-size: 28px;
      margin-right: 5px;
      color: $green-color;
      filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
    }
  }

  a {
    color: #2c3e50;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    padding: 8px 4px;
    position: relative;
    transition: color $transition;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: $nav-gradient;
      transition: width $transition;
      border-radius: 1px;
    }

    &.router-link-exact-active {
      color: $primary-color;

      .nav-icon {
        color: $primary-color;
        filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.3));
      }

      &::after {
        width: 100%;
      }
    }
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .user-dropdown {
    padding: 8px;
    border-radius: 100%;

    .user-avatar {
      box-shadow: $shadow-light;
      background-color: #fff;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-light;
    }
  }


  .login-btn {
    text-decoration: none;

    .el-button {
      border-radius: 20px;
      padding: 8px 20px;
      font-weight: 500;
      transition: $transition;
      background: $primary-gradient;
      color: #fff;

      &:hover {
        transform: translateY(-1px);
        box-shadow: $shadow-light;
      }
    }
  }
}

.drop-top {
  display: flex;
  flex-direction: column;
  width: 200px;
  justify-content: center;
  margin: 10px;
  border-radius: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-light;
  }

  .top-item {
    background-color: #e8f0ff;
    display: flex;
    justify-content: center;
    padding: 5px;

    .user-avatar {
      border: 2px solid #fff;
      box-shadow: $shadow-light;
      background: #fff;
      color: #fff;
      font-weight: 600;
    }
  }
}

.main-content {
  padding: 24px;
  min-height: calc(100vh - 70px - 200px);
}

.footer {
  background: #F8F9FA;
  color: #6c757d;
  padding: 40px 0 20px;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.footer-item {
  padding: 0 10px;
  width: 450px;
}

.foot-title {
  font-size: 20px;
  font-weight: 500;
  width: 100px;
  margin-bottom: 12px;
  color: #6c757d;
  border-bottom: 2px solid #6c757d;
}


.foot-Code {
  display: flex;

  .code-item {
    padding: 10px;
    display: flex;
    flex-direction: column;

    .footer-img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      margin-bottom: 8px;
      border-radius: 8px;
    }
  }
}

.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .header {
    height: auto;
  }

  .header-container {
    flex-wrap: wrap;
    padding: 12px 20px;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
    margin-top: 12px;
    gap: 20px;

    .nav-item {
      align-items: center;
      text-align: center;
      display: flex;
      justify-content: center;

      .nav-icon {
        font-size: 28px;
        margin-right: 5px;
        color: $primary-color;
        filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
      }
    }

    a {
      font-size: 14px;
    }
  }

  .logo {
    .logo-text {
      font-size: 18px;
    }

    .logo-icon {
      font-size: 24px;
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-dropdown {
      padding: 8px;
      border-radius: 100%;

      .user-avatar {
        box-shadow: $shadow-light;
        background-color: #fff;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-light;
      }
    }
  }

  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.notification-badge {
  margin-right: 16px;
}

.notification-btn {
  transition: $transition;

  &:hover {
    transform: scale(1.1);
  }
}

.notification-header {
  text-align: center;
  padding: 0 0 10px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .book-avatar {
    margin-right: 12px;
    background: $primary-gradient;
    color: #fff;
    font-weight: 600;
  }

  .notification-content {
    flex: 1;

    .notification-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-info {
      font-size: 12px;
      color: #999;
    }
  }
}

.notification-empty {
  padding: 20px 0;
  text-align: center;
}

.notification-footer {
  text-align: center;
  padding: 10px 0 0;
}

.notification-category {
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0;
  padding: 5px 10px;
  color: #333;
  border-radius: 4px;
}

.notification-category.overdue {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.notification-category.expiry {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.overdue-item {
  background-color: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
}

.overdue-item .notification-title {
  color: #F56C6C;
  font-weight: 600;
}

.overdue-item .book-avatar {
  background: linear-gradient(135deg, #F56C6C 0%, #e64a19 100%);
}
</style>