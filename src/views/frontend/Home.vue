<template>
  <div class="home-container">
    <!-- 顶部搜索栏 -->
    <!-- <div class="search-header">
      <div class="glass-container">
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索你感兴趣的图书..."
            class="search-input"
            prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
</el-input>

<div class="user-actions" v-if="isLoggedIn">
  <el-dropdown trigger="click">
    <div class="avatar-container">
      <el-avatar :src="'/api'+userStore.userInfo?.avatar || '/avatar-placeholder.png'" :size="40"></el-avatar>
      <span class="welcome-text">欢迎，{{ userStore.userInfo?.name }}</span>
    </div>
    <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user/center')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/borrow')">我的借阅</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/favorites')">我的收藏</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
  </el-dropdown>
</div>
<div class="auth-buttons" v-else>
  <el-button type="primary" @click="$router.push('/login')">登录</el-button>
  <el-button @click="$router.push('/register')">注册</el-button>
</div>
</div>
</div>
</div> -->

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 大型展示区 -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">图书室借阅管理系统</h1>
          <p class="hero-subtitle">探索知识的海洋，发现阅读的乐趣</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="primary-action" @click="$router.push('/book/list')">
              <el-icon>
                <Collection />
              </el-icon>
              浏览图书
            </el-button>
            <el-button size="large" class="secondary-action" @click="$router.push('/ranking')">
              <el-icon>
                <StarFilled />
              </el-icon>
              热门榜单
            </el-button>
          </div>
        </div>

        <!-- 统计数据卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon>
                <Reading />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.bookCount || 0 }}</div>
              <div class="stat-label">馆藏图书</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon>
                <Folder />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.categoryCount || 0 }}</div>
              <div class="stat-label">图书分类</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon>
                <Paperclip />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.borrowCount || 0 }}</div>
              <div class="stat-label">借阅次数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon>
                <User />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.userCount || 0 }}</div>
              <div class="stat-label">注册用户</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图书分类区 -->
      <div class="categories-section">
        <div class="section-title">
          <h2>图书分类</h2>
          <router-link to="/book/list" class="view-all">
            查看全部 <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
        </div>

        <div class="categories-wrapper" v-if="!categoriesLoading">
          <div class="category-card" v-for="category in categories" :key="category.id"
            @click="navigateToCategory(category.id)">
            <div class="category-icon">
              <el-icon>
                <Folder />
              </el-icon>
            </div>
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <span class="category-count">{{ category.bookCount }}本图书</span>
            </div>
            <el-icon class="category-arrow">
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <div class="loading-skeleton" v-else>
          <el-skeleton :rows="1" animated />
        </div>
      </div>

      <!-- 热门图书展示区 -->
      <div class="featured-books">
        <div class="section-title">
          <h2>热门图书</h2>
          <router-link to="/book/list?sort=borrowedCount" class="view-all">
            查看全部 <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
        </div>

        <div class="books-carousel" v-if="!hotBooksLoading">
          <el-carousel :autoplay="true" trigger="click" :interval="5000" arrow="always" type="card" height="320px">
            <el-carousel-item v-for="chunk in hotBooksChunks" :key="chunk[0].id">
              <div class="carousel-books">
                <div v-for="book in chunk" :key="book.id" class="carousel-book" @click="viewBookDetail(book.id)">
                  <div class="book-cover">
                    <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" :alt="book.title" />
                    <div class="borrow-status" :class="{ 'available': book.status === 1 }">
                      {{ book.status === 1 ? '可借阅' : '已借出' }}
                    </div>
                  </div>
                  <div class="book-info">
                    <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                    <p class="book-author" v-if="book.author">{{ book.author }}</p>
                    <div class="book-meta">
                      <span class="book-borrow-count">
                        <el-icon>
                          <Reading />
                        </el-icon> {{ book.borrowedCount || 0 }}
                      </span>
                      <el-rate v-if="book.avgScore" v-model="book.avgScore" disabled :max="5" :allow-half="true"
                        text-color="#ff9900" class="book-rate" />
                    </div>
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="loading-skeleton" v-else>
          <el-skeleton :rows="2" animated />
        </div>
      </div>

      <!-- 个性化推荐区 -->
      <div class="recommendations-section" v-if="isLoggedIn">
        <div class="section-title">
          <h2>为您推荐</h2>
          <span class="recommendation-description">根据您的阅读喜好，为您精选的图书</span>
        </div>

        <div v-if="recommendationsLoading" class="loading-skeleton">
          <el-skeleton :rows="2" animated>
            <template #template>
              <div class="recommendation-skeleton">
                <el-skeleton-item v-for="i in 5" :key="i" variant="image" class="recommendation-card-skeleton" />
              </div>
            </template>
          </el-skeleton>
        </div>

        <div v-else-if="recommendations.length === 0" class="empty-recommendations">
          <el-empty description="暂无推荐图书" :image-size="150" />
        </div>

        <div v-else class="recommendation-cards">
          <div v-for="item in recommendations.slice(0, 5)" :key="item.bookId" class="recommendation-card"
            @click="viewBookDetail(item.bookId)">
            <div class="recommendation-cover">
              <img :src="item.coverUrl ? ('/api' + item.coverUrl) : defaultCover" :alt="item.title" />
              <div class="recommendation-badge" :class="getRecommendationTypeClass(item.recommendationType)">
                {{ item.recommendationTypeDesc }}
              </div>
            </div>
            <div class="recommendation-info">
              <h4 class="recommendation-title">{{ item.title }}</h4>
              <p class="recommendation-author">{{ item.author }}</p>
              <div class="recommendation-rating">
                <el-rate v-model="item.avgScore" disabled :max="5" :allow-half="true"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']" class="rating-stars" />
                <span class="rating-value">{{ item.avgScore.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="view-more-recommendations">
          <el-button type="primary" plain @click="$router.push('/all-recommendations')">
            查看更多推荐 <el-icon>
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>
      </div>

      <!-- 登录提示区 -->
      <div class="login-prompt-section" v-else>
        <div class="login-prompt-card">
          <h2>登录获取个性化推荐</h2>
          <p>登录后系统将根据您的阅读历史和兴趣为您推荐图书</p>
          <el-button type="primary" size="large" @click="$router.push('/login')">立即登录</el-button>
        </div>
      </div>
    </div>

    <!-- 底部浮动操作按钮 -->
    <div class="floating-action-button">
      <el-tooltip content="返回顶部" placement="left" :show-after="500">
        <el-button circle type="primary" class="back-to-top" @click="scrollToTop"
          :style="{ opacity: showBackToTop ? 1 : 0 }">
          <el-icon>
            <Top />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import {
  ArrowRight,
  Folder,
  Collection,
  StarFilled,
  Reading,
  User,
  Top,
  Search,
  Paperclip
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";

const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);

const defaultCover =
  "https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif";

// 搜索相关
const searchQuery = ref("");
const handleSearch = () => {
  if (!searchQuery.value.trim()) return;
  router.push({
    path: "/book/list",
    query: { keyword: searchQuery.value.trim() }
  });
};

// 统计数据
const stats = ref({
  bookCount: 0,
  categoryCount: 0,
  borrowCount: 0,
  userCount: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await request.get('/system/stats')
    stats.value = res || {
      bookCount: 0,
      categoryCount: 0,
      borrowCount: 0,
      userCount: 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 设置模拟数据
    stats.value = {
      bookCount: 256,
      categoryCount: 12,
      borrowCount: 384,
      userCount: 128
    }
  }
}

// 分类数据
const categories = ref([]);
const categoriesLoading = ref(false);

// 获取分类数据
const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    await request.get("/book/category/with-books?limit=6", null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        categories.value = (res || []).slice(0, 6);
      },
    });
  } catch (error) {
    console.error("获取分类数据失败:", error);
  } finally {
    categoriesLoading.value = false;
  }
};

// 热门图书
const hotBooks = ref([]);
const hotBooksLoading = ref(false);
const hotBooksChunks = computed(() => {
  const result = [];
  const chunkSize = 3; // 每个轮播页显示3本书
  for (let i = 0; i < hotBooks.value.length; i += chunkSize) {
    result.push(hotBooks.value.slice(i, i + chunkSize));
  }
  return result;
});

// 获取热门图书
const fetchHotBooks = async () => {
  hotBooksLoading.value = true;
  try {
    await request.get("/book/hot?limit=12", null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        hotBooks.value = (res || []).map(book => ({
          ...book,
          avgScore: book.avgScore || 0,
          status: Math.random() > 0.3 ? 1 : 0 // 模拟借阅状态，实际应从API获取
        }));
      },
    });
  } catch (error) {
    console.error("获取热门图书失败:", error);
  } finally {
    hotBooksLoading.value = false;
  }
};

// 个性化推荐
const recommendations = ref([]);
const recommendationsLoading = ref(false);

// 获取个性化推荐
const fetchRecommendations = async () => {
  if (!isLoggedIn.value) return;

  const userId = userStore.userInfo?.id;
  if (!userId) return;

  recommendationsLoading.value = true;
  try {
    await request.get(`/recommendation/hybrid?userId=${userId}&limit=10`, null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        recommendations.value = (res || []).map(item => ({
          ...item,
          avgScore: item.avgScore || 3.5 // 默认评分
        }));
      },
    });
  } catch (error) {
    console.error("获取推荐图书失败:", error);
  } finally {
    recommendationsLoading.value = false;
  }
};

// 获取推荐类型对应的样式类名
const getRecommendationTypeClass = (type) => {
  switch (type) {
    case 1: return 'badge-user-cf';
    case 2: return 'badge-item-cf';
    case 3: return 'badge-content';
    case 4: return 'badge-hot';
    case 5: return 'badge-new';
    case 6: return 'badge-similar';
    default: return '';
  }
};

// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/detail/${bookId}`);
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  ElMessage.success("退出登录成功");
  router.push("/login");
};

// 返回顶部功能
const showBackToTop = ref(false);

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 跳转到指定分类的图书列表
const navigateToCategory = (categoryId) => {
  router.push({
    path: '/book/list',
    query: { categoryId: categoryId }
  });
};

onMounted(() => {
  fetchStats();
  fetchCategories();
  fetchHotBooks();
  fetchRecommendations();

  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
// 全局变量
$primary-color: #4F9DFB;
$primary-light: #E3F2FD;
$primary-dark: #247ADB;
$primary-gradient: linear-gradient(135deg, #409EFF, #7262fd);
$accent-color: #FF9800;
$text-primary: #37474F;
$text-secondary: #607D8B;
$background-light: #F5F7FA;
$background-medium: #ECEFF1;
$background-dark: #CFD8DC;
$success-color: #66BB6A;
$warning-color: #FFA726;
$error-color: #EF5350;
$border-radius: 12px;
$box-shadow-light: 0 3px 5px rgba(0, 0, 0, 0.05);
$box-shadow-medium: 0 8px 16px rgba(0, 0, 0, 0.08);
$box-shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.12);
$transition-fast: all 0.2s ease;
$transition-normal: all 0.3s ease;
$transition-slow: all 0.5s ease;

// 全局样式
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F7FA 0%, #E4ECF7 100%);
  position: relative;
  padding-bottom: 60px;
}

// 磨砂玻璃效果混入
@mixin glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

// 卡片混入
@mixin card {
  background: white;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  transition: $transition-normal;
  overflow: hidden;

  &:hover {
    box-shadow: $box-shadow-medium;
    transform: translateY(-3px);
  }
}

// 搜索头部
.search-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 15px 0;

  .glass-container {
    @include glass-effect;
    max-width: 1280px;
    margin: 0 auto;
    padding: 15px 25px;
    border-radius: $border-radius;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    .search-input {
      flex: 1;
      max-width: 700px;

      :deep(.el-input__wrapper) {
        border-radius: 50px;
        padding-left: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: $transition-fast;

        &:hover,
        &:focus-within {
          box-shadow: 0 4px 12px rgba(79, 157, 251, 0.15);
        }
      }

      :deep(.el-input__inner) {
        font-size: 15px;
        height: 44px;
      }

      :deep(.el-input-group__append) {
        border-top-right-radius: 50px;
        border-bottom-right-radius: 50px;
        padding: 0;
        background-color: transparent;
        border-color: transparent;
      }

      :deep(.el-button) {
        height: 44px;
        width: 44px;
        border-radius: 50%;
        color: white;
        padding: 0;
        margin: 0 4px;
        background: linear-gradient(45deg, $primary-color, $primary-dark);
        border: none;
        box-shadow: 0 3px 6px rgba(79, 157, 251, 0.2);
        transition: $transition-normal;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 12px rgba(79, 157, 251, 0.3);
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }

    .user-actions {
      .avatar-container {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 50px;
        transition: $transition-fast;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .welcome-text {
          margin-left: 10px;
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
        }
      }
    }

    .auth-buttons {
      display: flex;
      gap: 10px;
    }
  }
}

// 主内容区域
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

// 英雄区域
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 30px 0 50px;
  position: relative;

  .hero-content {
    max-width: 700px;
    margin-bottom: 40px;

    .hero-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 15px;
      background: linear-gradient(45deg, $primary-color, $primary-dark);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 5px 15px rgba(79, 157, 251, 0.2);
    }

    .hero-subtitle {
      font-size: 20px;
      color: $text-secondary;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 15px;

      .primary-action,
      .secondary-action {
        min-width: 150px;
        height: 48px;
        font-size: 16px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: $transition-normal;

        .el-icon {
          font-size: 18px;
        }
      }

      .primary-action {
        background: linear-gradient(45deg, $primary-color, $primary-dark);
        border: none;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(79, 157, 251, 0.3);
        }
      }

      .secondary-action {
        border: 2px solid $primary-color;
        color: $primary-color;

        &:hover {
          background-color: rgba(79, 157, 251, 0.1);
          transform: translateY(-2px);
        }
      }
    }
  }
}

// 统计卡片
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 0 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .stat-card {
    @include card;
    display: flex;
    align-items: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      margin-right: 20px;
      transition: $transition-normal;

      .el-icon {
        font-size: 30px;
        transition: $transition-normal;
      }
    }

    .stat-content {
      flex: 1;

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .stat-label {
        font-size: 15px;
        color: $text-secondary;
        font-weight: 500;
      }
    }

    &:nth-child(1) {
      .stat-icon {
        background-color: rgba(64, 158, 255, 0.1);

        .el-icon {
          color: #409eff;
        }
      }
    }

    &:nth-child(2) {
      .stat-icon {
        background-color: rgba(103, 194, 58, 0.1);

        .el-icon {
          color: #67c23a;
        }
      }
    }

    &:nth-child(3) {
      .stat-icon {
        background-color: rgba(230, 162, 60, 0.1);

        .el-icon {
          color: #e6a23c;
        }
      }
    }

    &:nth-child(4) {
      .stat-icon {
        background-color: rgba(245, 108, 108, 0.1);

        .el-icon {
          color: #f56c6c;
        }
      }
    }

    &:hover {
      transform: translateY(-5px);

      .stat-icon {
        transform: scale(1.1);
      }
    }
  }
}

// 通用区域标题
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    position: relative;
    padding-left: 16px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: linear-gradient(to bottom, $primary-color, $primary-dark);
      border-radius: 4px;
    }
  }

  .view-all {
    display: flex;
    align-items: center;
    color: $primary-color;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: $transition-fast;

    .el-icon {
      margin-left: 5px;
      transition: $transition-fast;
    }

    &:hover {
      color: $primary-dark;

      .el-icon {
        transform: translateX(4px);
      }
    }
  }

  .recommendation-description {
    font-size: 15px;
    color: $text-secondary;
    margin-left: 15px;
  }
}

// 加载占位符
.loading-skeleton {
  padding: 20px;
  border-radius: $border-radius;
  background-color: white;
  box-shadow: $box-shadow-light;
}

// 分类卡片区域
.categories-section {
  .categories-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .category-card {
    @include card;
    display: flex;
    align-items: center;
    padding: 20px;
    cursor: pointer;

    .category-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background-color: $primary-light;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .el-icon {
        font-size: 24px;
        color: $primary-color;
      }
    }

    .category-info {
      flex: 1;

      .category-name {
        font-size: 18px;
        font-weight: 500;
        color: $text-primary;
        margin: 0 0 5px;
      }

      .category-count {
        font-size: 14px;
        color: $text-secondary;
      }
    }

    .category-arrow {
      font-size: 18px;
      color: $text-secondary;
      transition: $transition-fast;
    }

    &:hover {
      .category-arrow {
        transform: translateX(5px);
        color: $primary-color;
      }
    }
  }
}

// 热门图书区域
.featured-books {
  .books-carousel {
    margin: 0 auto;

    :deep(.el-carousel__container) {
      height: 320px;
    }

    :deep(.el-carousel__item) {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    :deep(.el-carousel__arrow) {
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: $primary-color;

      &:hover {
        background-color: white;
      }
    }

    .carousel-books {
      display: flex;
      justify-content: center;
      gap: 20px;
      height: 100%;
      width: 100%;
      padding: 10px;
    }

    .carousel-book {
      @include card;
      width: 180px;
      height: 100%;
      cursor: pointer;

      .book-cover {
        position: relative;
        height: 230px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: $transition-normal;
        }

        .borrow-status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
          background-color: $error-color;

          &.available {
            background-color: $success-color;
          }
        }
      }

      .book-info {
        padding: 12px;

        .book-title {
          font-size: 15px;
          font-weight: 500;
          color: $text-primary;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-author {
          font-size: 13px;
          color: $text-secondary;
          margin: 0 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .book-borrow-count {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: $text-secondary;

            .el-icon {
              margin-right: 4px;
              font-size: 14px;
            }
          }

          .book-rate {
            font-size: 12px;
          }
        }
      }

      &:hover {
        .book-cover img {
          transform: scale(1.05);
        }
      }
    }
  }
}

// 个性化推荐区域
.recommendations-section {
  margin-bottom: 20px;

  .recommendation-cards {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 10px 0;
    margin: 0 -10px;

    /* 隐藏滚动条但保留滚动功能 */
    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: $background-light;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: $background-dark;
      border-radius: 10px;

      &:hover {
        background: $text-secondary;
      }
    }
  }

  .recommendation-card {
    @include card;
    min-width: 220px;
    cursor: pointer;
    flex: 0 0 auto;

    .recommendation-cover {
      position: relative;
      height: 280px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: $transition-normal;
      }

      .recommendation-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: white;
        background-color: $accent-color;

        &.badge-user-cf {
          background-color: #4FC3F7;
        }

        &.badge-item-cf {
          background-color: #66BB6A;
        }

        &.badge-content {
          background-color: #9575CD;
        }

        &.badge-hot {
          background-color: #EF5350;
        }

        &.badge-new {
          background-color: #FFA726;
        }

        &.badge-similar {
          background-color: #7E57C2;
        }
      }
    }

    .recommendation-info {
      padding: 15px;

      .recommendation-title {
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
        margin: 0 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .recommendation-author {
        font-size: 14px;
        color: $text-secondary;
        margin: 0 0 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .recommendation-rating {
        display: flex;
        align-items: center;

        .rating-stars {
          margin-right: 8px;
        }

        .rating-value {
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
        }
      }
    }

    &:hover {
      .recommendation-cover img {
        transform: scale(1.05);
      }
    }
  }

  .view-more-recommendations {
    display: flex;
    justify-content: center;
    margin-top: 25px;

    .el-button {
      font-size: 15px;
      padding: 12px 25px;
      border-radius: 50px;

      .el-icon {
        margin-left: 5px;
        transition: $transition-fast;
      }

      &:hover {
        .el-icon {
          transform: translateX(4px);
        }
      }
    }
  }

  .recommendation-skeleton {
    display: flex;
    gap: 20px;
    padding: 10px 0;

    .recommendation-card-skeleton {
      width: 220px;
      height: 320px;
      flex: 0 0 auto;
    }
  }
}

// 登录提示区域
.login-prompt-section {
  .login-prompt-card {
    @include glass-effect;
    text-align: center;
    padding: 40px 20px;
    border-radius: $border-radius;

    h2 {
      font-size: 24px;
      color: $text-primary;
      margin-bottom: 15px;
    }

    p {
      font-size: 16px;
      color: $text-secondary;
      margin-bottom: 25px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .el-button {
      min-width: 150px;
      height: 44px;
      font-size: 16px;
      border-radius: 50px;
      background: linear-gradient(45deg, $primary-color, $primary-dark);
      border: none;
      transition: $transition-normal;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(79, 157, 251, 0.3);
      }
    }
  }
}

// 返回顶部按钮
.floating-action-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 90;

  .back-to-top {
    width: 50px;
    height: 50px;
    background: linear-gradient(45deg, $primary-color, $primary-dark);
    border: none;
    box-shadow: 0 5px 15px rgba(79, 157, 251, 0.3);
    transition: $transition-normal;
    opacity: 0;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(79, 157, 251, 0.4);
    }

    .el-icon {
      font-size: 20px;
    }
  }
}

// 空状态
.empty-recommendations {
  background-color: white;
  border-radius: $border-radius;
  padding: 30px;
  text-align: center;
  box-shadow: $box-shadow-light;
}

// 响应式设计
@media (max-width: 992px) {
  .hero-section .hero-content .hero-title {
    font-size: 36px;
  }

  .stats-cards {
    flex-wrap: wrap;

    .stat-card {
      min-width: 150px;
    }
  }

  .categories-section .categories-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-header .search-wrapper {
    flex-direction: column;
    align-items: stretch;

    .search-input {
      max-width: 100%;
    }

    .user-actions,
    .auth-buttons {
      align-self: flex-end;
    }
  }

  .stats-cards {
    flex-direction: column;

    .stat-card {
      max-width: 100%;
    }
  }

  .hero-section .hero-content {
    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 18px;
    }

    .hero-actions {
      flex-direction: column;
      width: 100%;

      .primary-action,
      .secondary-action {
        width: 100%;
      }
    }
  }

  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .recommendation-description {
      margin-left: 0;
      margin-top: 5px;
    }
  }

  .featured-books .books-carousel .carousel-books {
    padding: 0;
  }

  .categories-section .categories-wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-section .hero-content .hero-title {
    font-size: 28px;
  }

  .featured-books .books-carousel :deep(.el-carousel__item) {
    transform: none !important;
  }

  .floating-action-button {
    bottom: 20px;
    right: 20px;

    .back-to-top {
      width: 45px;
      height: 45px;
    }
  }
}
</style>





.