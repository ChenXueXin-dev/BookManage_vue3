<template>
  <div class="home-container">

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 大型展示区 -->
      <div class="card-content">

        <!-- 通知公告卡片 -->
        <div class="notice-cards">
          <div class="section-title">
            <h2>通知公告</h2>
          </div>
          <div class="view-all">
          </div>
        </div>

        <!-- 活动公共卡片 -->
        <div class="active-cards">
          <div class="section-title">
            <h2>活动公告</h2>
          </div>
          <div class="view-all">
          </div>
        </div>

        <!-- 统计数据卡片 -->
        <div class="stats-cards">
          <div class="cards-item">
            <div class="stat-card jyzitem">
              <div class="start-title">
                <div class="stat-icon">
                  <el-icon>
                    <View />
                  </el-icon>
                  <div class="stat-label">借阅中</div>
                </div>
              </div>
              <div class="stat-number">{{ stats.bookCount || 0 }}</div>
            </div>
            <div class="stat-card yqitem">
              <div class="start-title ">
                <div class="stat-icon">
                  <el-icon>
                    <Warning />
                  </el-icon>
                  <div class="stat-label">已逾期</div>
                </div>
              </div>
              <div class="stat-number">{{ stats.bookCount || 0 }}</div>
            </div>
          </div>
          <div class="cards-item">
            <div class="stat-card shitem">
              <div class="start-title">
                <div class="stat-icon">
                  <el-icon>
                    <Money />
                  </el-icon>
                  <div class="stat-label">待审核</div>
                </div>
              </div>
              <div class="stat-number">{{ stats.borrowCount || 0 }}</div>
            </div>
            <div class="stat-card zjyitem">
              <div class="start-title">
                <div class="stat-icon">
                  <el-icon>
                    <Discount />
                  </el-icon>
                  <div class="stat-label">总借阅次数</div>
                </div>
              </div>
              <div class="stat-number">{{ stats.borrowCount || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行区域 -->
      <div class="ranking-books">
        <div class="ranking-content">
          <!-- 新书榜单 -->
          <div class="ranking-block">
            <div class="section-header">
              <h2>新书榜单</h2>
              <router-link to="/book/list?orderBy=createTime" class="more-link">
                更多 <el-icon>
                  <ArrowRight />
                </el-icon>
              </router-link>
            </div>

            <div v-if="newBooksLoading" class="loading-container">
              <el-skeleton :rows="10" animated />
            </div>

            <div v-else class="ranking-list">
              <div class="ranking-title">
                <span>排名</span>
                <span>书名</span>
                <span>上架时间</span>
              </div>
              <div v-for="(book, index) in newBooks" :key="book.id" class="ranking-item"
                @click="viewBookDetail(book.id)">
                <div class="book-rank" :class="[
                  { 'rank-first': index === 0 },
                  { 'rank-second': index === 1 },
                  { 'rank-third': index === 2 }
                ]">
                  <el-icon v-if="[0, 1, 2].includes(index)" class="medal-icon" :class="[
                    { 'first': index === 0 },
                    { 'second': index === 1 },
                    { 'third': index === 2 }
                  ]">
                    <Medal />
                  </el-icon>
                  <div v-else>
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="book-info">
                  <span class="book-title" :title="book.title">{{ book.title }}</span>
                  <span class="book-meta">{{ formatDate(book.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 人气借阅 -->
          <div class="ranking-block">
            <div class="section-header">
              <h2>人气借阅</h2>
              <router-link to="/book/list?orderBy=borrowedCount" class="more-link">
                更多 <el-icon>
                  <ArrowRight />
                </el-icon>
              </router-link>
            </div>

            <div v-if="hotBorrowLoading" class="loading-container">
              <el-skeleton :rows="10" animated />
            </div>

            <div v-else class="ranking-list">
              <div class="ranking-title">
                <span>排名</span>
                <span>书名</span>
                <span>借阅量</span>
              </div>
              <div v-for="(book, index) in hotBorrowBooks" :key="book.id" class="ranking-item"
                @click="viewBookDetail(book.id)">
                <div class="book-rank" :class="[
                  { 'rank-first': index === 0 },
                  { 'rank-second': index === 1 },
                  { 'rank-third': index === 2 }
                ]">
                  <el-icon v-if="[0, 1, 2].includes(index)" class="medal-icon" :class="[
                    { 'first': index === 0 },
                    { 'second': index === 1 },
                    { 'third': index === 2 }
                  ]">
                    <Medal />
                  </el-icon>
                  <div v-else>
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="book-info">
                  <span class="book-title" :title="book.title">{{ book.title }}</span>
                  <span class="book-meta">{{ book.borrowedCount || 0 }}次</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 收藏榜单 -->
          <div class="ranking-block">
            <div class="section-header">
              <h2>收藏榜单</h2>
              <router-link to="/book/list?orderBy=collectionCount" class="more-link">
                更多 <el-icon>
                  <ArrowRight />
                </el-icon>
              </router-link>
            </div>

            <div v-if="hotCollectionLoading" class="loading-container">
              <el-skeleton :rows="10" animated />
            </div>

            <div v-else class="ranking-list">
              <div class="ranking-title">
                <span>排名</span>
                <span>书名</span>
                <span>收藏量</span>
              </div>
              <div v-for="(book, index) in hotCollectionBooks" :key="book.id" class="ranking-item"
                @click="viewBookDetail(book.id)">
                <div class="book-rank" :class="[
                  { 'top-three': index < 3 },
                  { 'rank-first': index === 0 },
                  { 'rank-second': index === 1 },
                  { 'rank-third': index === 2 }
                ]">
                  <el-icon class="medal-icon" :class="[
                    { 'top-three': index < 3 },
                    { 'first': index === 0 },
                    { 'second': index === 1 },
                    { 'third': index === 2 }
                  ]">
                    <Medal />
                  </el-icon>
                </div>
                <div class="book-info">
                  <span class="book-title" :title="book.title">{{ book.title }}</span>
                  <span class="book-meta">{{ book.collectionCount || 0 }}次</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 评分排行 -->
          <div class="ranking-block">
            <div class="section-header">
              <h2>评分排行</h2>
              <router-link to="/book/list?orderBy=avgScore" class="more-link">
                更多 <el-icon>
                  <ArrowRight />
                </el-icon>
              </router-link>
            </div>

            <div v-if="topRatedLoading" class="loading-container">
              <el-skeleton :rows="10" animated />
            </div>

            <div v-else class="ranking-list">
              <div class="ranking-title">
                <span>排名</span>
                <span>书名</span>
                <span>评分</span>
              </div>
              <div v-for="(book, index) in topRatedBooks" :key="book.id" class="ranking-item"
                @click="viewBookDetail(book.id)">
                <div class="book-rank" :class="[
                  { 'rank-first': index === 0 },
                  { 'rank-second': index === 1 },
                  { 'rank-third': index === 2 }
                ]">
                  <el-icon v-if="[0, 1, 2].includes(index)" class="medal-icon" :class="[
                    { 'first': index === 0 },
                    { 'second': index === 1 },
                    { 'third': index === 2 }
                  ]">
                    <Medal />
                  </el-icon>
                  <div v-else>
                    {{ index + 1 }}
                  </div>
                </div>

                <div class="book-info">
                  <span class="book-title" :title="book.title">{{ book.title }}</span>
                  <div class="book-rating">
                    <el-rate v-model="book.avgScore" disabled text-color="#ff9900" size="small" :max="5"
                      :allow-half="true" />
                    <span class="score-text">{{ book.avgScore.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 书类导航 -->
      <div class="categories-section">
        <div class="section-title">
          <h2>书类导航</h2>
          <router-link to="/book/list" class="view-all">
            查看全部 <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
        </div>

        <div class="categories-wrapper" v-if="!categoriesLoading">
          <div class="category-card" v-for="category in categories" :key="category.id"
            @click="navigateToCategory(category.id)">
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}
              </h3>
              <span class="category-count">
                <span class="bookCount">
                  {{ category.bookCount }}
                </span>
                本图书</span>
            </div>
          </div>
        </div>

        <div class="loading-skeleton" v-else>
          <el-skeleton :rows="1" animated />
        </div>
      </div>

      <!-- 读者之选区 -->
      <div class="featured-books">
        <div class="section-title">
          <h2>读者之选</h2>
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

      <!-- 推荐区 -->
      <div class="recommendations-section">

        <div class="section-title">
          <h2>图书推荐</h2>
          <router-link v-if="isLoggedIn" to="/all-recommendations" class="view-all">
            查看更多推荐 <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
        </div>


        <div v-if="!isLoggedIn" class="loading-skeleton">
          <div class="login-prompt-card">
            <h2>登录获取专属图书推荐</h2>
            <el-button type="primary" size="large" @click="$router.push('/login')">立即登录</el-button>
          </div>
        </div>

        <div v-else-if="recommendationsLoading" class="loading-skeleton">
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
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import {
  ArrowRight,
  Folder,
  Medal,
  Reading,
  View,
  Warning,
  Money,
  Discount,
  Top,
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


// 新书排行数据
const newBooks = ref([]);
const newBooksLoading = ref(false);

// 热门借阅数据
const hotBorrowBooks = ref([]);
const hotBorrowLoading = ref(false);

// 热门收藏数据
const hotCollectionBooks = ref([]);
const hotCollectionLoading = ref(false);

// 评分最高数据
const topRatedBooks = ref([]);
const topRatedLoading = ref(false);

onMounted(() => {
  fetchNewBooks();
  fetchHotBorrowBooks();
  fetchHotCollectionBooks();
  fetchTopRatedBooks();
});

// 获取新书排行数据
const fetchNewBooks = async () => {
  newBooksLoading.value = true;
  try {
    const res = await request.get('/book/new?limit=5');
    newBooks.value = res || [];
  } catch (error) {
    console.error('获取新书排行失败:', error);
    ElMessage.error('获取新书排行失败');
  } finally {
    newBooksLoading.value = false;
  }
};

// 获取热门借阅数据
const fetchHotBorrowBooks = async () => {
  hotBorrowLoading.value = true;
  try {
    const res = await request.get('/book/hot?limit=5');
    hotBorrowBooks.value = res || [];
  } catch (error) {
    console.error('获取热门借阅失败:', error);
    ElMessage.error('获取热门借阅失败');
  } finally {
    hotBorrowLoading.value = false;
  }
};

// 获取热门收藏数据
const fetchHotCollectionBooks = async () => {
  hotCollectionLoading.value = true;
  try {
    const res = await request.get('/book/hot-collection?limit=5');
    hotCollectionBooks.value = res || [];
  } catch (error) {
    console.error('获取热门收藏失败:', error);
    ElMessage.error('获取热门收藏失败');
  } finally {
    hotCollectionLoading.value = false;
  }
};

// 获取评分最高数据
const fetchTopRatedBooks = async () => {
  topRatedLoading.value = true;
  try {
    const res = await request.get('/book/top-rated?limit=5');
    topRatedBooks.value = res || [];
  } catch (error) {
    console.error('获取评分最高图书失败:', error);
    ElMessage.error('获取评分最高图书失败');
  } finally {
    topRatedLoading.value = false;
  }
};

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

</script>

<style lang="scss" scoped>
// 全局变量
$primary-color: #4F9DFB;
$primary-light: #E3F2FD;
$primary-dark: #247ADB;
$green-color: #4edba0;
$primary-gradient: linear-gradient(135deg, #409EFF, #57ffb9);
$primary-gradient-low: linear-gradient(135deg, #77bafe, #77bafe 40%, #90edc6);
$background-gradient: linear-gradient(135deg, #d8ecff 0%, #edf6ff 40%, #bcffdd 100%);
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
  background: $background-gradient;

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


// 主内容区域
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}


.card-content {
  display: flex;
  flex-direction: wrap;

  .notice-cards {
    width: 45%;

    .view-all {
      height: 400px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: $border-radius;
      box-shadow: $box-shadow-light;
      transition: $transition-normal;
      overflow: hidden;
    }
  }

  .active-cards {
    width: 45%;
    padding: 0 10px;

    .view-all {
      height: 400px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: $border-radius;
      box-shadow: $box-shadow-light;
      transition: $transition-normal;
      overflow: hidden;
    }

  }

  // 统计卡片
  .stats-cards {
    margin-top: 55px;
    width: 10%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 1200px;
    min-width: 400px;

    .cards-item {
      display: flex;

      .stat-card {
        display: flex;
        align-items: center;
        height: 180px;
        margin: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: $border-radius;
        box-shadow: $box-shadow-light;
        transition: $transition-normal;
        overflow: hidden;
        flex-direction: column;

        .start-title {
          height: 50%;
          padding: 12px;

          .stat-icon {
            width: 200px;
            height: 100px;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;

            .el-icon {
              font-size: 50px;
            }

            .stat-label {
              font-size: 20px;
              color: $text-secondary;
              font-weight: 500;
            }

          }
        }

        .stat-number {
          height: 50%;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 8px;
          height: 100px;
          line-height: 100px;
        }
      }

      .jyzitem {
        background-color: rgba(57, 156, 255, 0.1);

        .start-title {
          .stat-icon {
            .el-icon {
              color: #409eff;
            }
          }
        }

        .stat-number {
          color: #409eff;
        }
      }

      .yqitem {
        background-color: rgba(149, 255, 0, 0.1);

        .start-title {
          .stat-icon {
            .el-icon {
              color: #67c23a;
            }
          }
        }

        .stat-number {
          color: #67c23a;
        }

      }

      .shitem {
        background-color: rgba(6, 255, 64, 0.1);

        .start-title {
          .stat-icon {
            .el-icon {
              color: #00ab78f3;
            }
          }
        }

        .stat-number {
          color: #00ab78f3;
        }

      }

      .zjyitem {
        background-color: rgba(67, 217, 255, 0.2);

        .start-title {
          .stat-icon {
            .el-icon {
              color: #409eff;
            }
          }
        }

        .stat-number {
          color: #409eff;
        }
      }
    }



    // .stat-card {
    //   display: flex;
    //   align-items: center;
    //   padding: 12px;
    //   // background: rgba(255, 255, 255, 0.9);
    //   // backdrop-filter: blur(10px);
    //   border: 1px solid rgba(255, 255, 255, 0.2);
    //   border-radius: $border-radius;
    //   box-shadow: $box-shadow-light;
    //   transition: $transition-normal;
    //   overflow: hidden;

    //   &:nth-child(1) {
    //     background-color: rgba(64, 158, 255, 0.1);
    //   }

    //   &:nth-child(2) {
    //     background-color: rgba(103, 194, 58, 0.1);
    //   }

    //   &:nth-child(3) {
    //     background-color: rgba(230, 162, 60, 0.1);
    //   }

    //   .stat-icon {
    //     width: 200px;
    //     height: 60px;
    //     display: flex;
    //     align-items: center;
    //     flex-direction: column;
    //     justify-content: center;
    //     border-radius: 16px;
    //     margin-right: 20px;

    //     .el-icon {
    //       font-size: 30px;
    //     }

    //   }

    //   .stat-content {
    //     flex: 1;

    //     .stat-number {
    //       font-size: 32px;
    //       font-weight: 700;
    //       margin-bottom: 8px;
    //       background: linear-gradient(135deg, $primary-color, $primary-dark);
    //       -webkit-background-clip: text;
    //       -webkit-text-fill-color: transparent;
    //     }

    //     .stat-label {
    //       font-size: 15px;
    //       color: $text-secondary;
    //       font-weight: 500;
    //     }
    //   }

    //   &:nth-child(1) {
    //     .stat-icon {
    //       .el-icon {
    //         color: #409eff;
    //       }
    //     }
    //   }

    //   &:nth-child(2) {
    //     .stat-icon {
    //       .el-icon {
    //         color: #67c23a;
    //       }
    //     }
    //   }

    //   &:nth-child(3) {
    //     .stat-icon {
    //       .el-icon {
    //         color: #e6a23c;
    //       }
    //     }
    //   }

    //   &:nth-child(4) {
    //     .stat-icon {
    //       background-color: rgba(245, 108, 108, 0.1);

    //       .el-icon {
    //         color: #f56c6c;
    //       }
    //     }
    //   }
    // }
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

  .login-prompt-card {
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
      background: $primary-gradient;
      border: none;
      transition: $transition-normal;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(79, 157, 251, 0.3);
      }
    }
  }
}

// 分类卡片区域
.categories-section {
  .categories-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  .category-card {
    @include card;
    display: flex;
    align-items: center;
    padding: 20px;
    cursor: pointer;

    .category-info {
      flex: 1;

      .category-name {
        font-size: 18px;
        font-weight: 500;
        color: $primary-color;
        margin: 0 0 5px;
      }

      .category-count {
        font-size: 14px;
        color: $text-secondary;

        .bookCount {
          font-size: 28px;
          font-weight: 500;
          color: $green-color;
        }
      }
    }


    // &:hover {
    //   .category-arrow {
    //     transform: translateX(5px);
    //     color: $primary-color;
    //   }
    // }
  }
}

// 读者之选
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

.ranking-books {
  .ranking-content {
    display: flex;
    justify-content: space-between;
  }
}

.ranking-block {
  @include card;
  padding: 0;
  transform: none;

  &:hover {
    transform: none;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0 0 10px;
  border-bottom: 1px solid $background-medium;
  background: $primary-gradient-low;
  color: #fff;

  h2 {
    font-size: 20px;
    margin: 0;
    position: relative;
    padding-left: 15px;
    color: #fff;
    font-weight: 600;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: #fff;
      border-radius: 2px;
    }
  }

  .more-link {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 14px;
    text-decoration: none;
    font-weight: 500;
    transition: $transition-fast;
    padding: 6px 12px;
    border-radius: 20px;

    &:hover {
      transform: translateX(3px);
    }

    .el-icon {
      margin-left: 5px;
      transition: $transition-fast;
    }

    &:hover .el-icon {
      transform: translateX(3px);
    }
  }
}

.ranking-list {
  padding: 10px 0;

  .ranking-title {
    display: flex;
    justify-content: space-between;
    padding: 2px 10px;
    font-size: 13px;
    color: $text-secondary;
    border-bottom: 1px solid $background-medium;
    margin-bottom: 5px;
    font-weight: 500;

    span:first-child {
      flex-shrink: 0;
      width: 34px;
    }

    span:nth-child(2) {
      flex: 1;
      text-align: left;
      padding-left: 12px;
    }

    span:last-child {
      flex-shrink: 0;
      width: 80px;
      text-align: right;
    }
  }

  .ranking-item {
    display: flex;
    align-items: center;
    padding: 10px 10px;
    border-bottom: 1px solid $background-light;
    cursor: pointer;
    transition: $transition-normal;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(to right, $primary-light, transparent);
      transition: $transition-normal;
      z-index: -1;
      opacity: 0;
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: $background-light;
      transform: translateX(8px);

      &::after {
        width: 100%;
        opacity: 1;
      }
    }

    $transition-normal: all 0.3s ease;
    $shadow-light: 0 4px 12px rgba(0, 0, 0, 0.05);

    .book-rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 15px;
      flex-shrink: 0;
      transition: $transition-normal;

      &:hover {
        transform: scale(1.1);
        box-shadow: $shadow-light;
      }

      &.rank-first {
        background-color: rgba(255, 217, 0, 0.2);
      }

      &.rank-second {
        background-color: rgba(192, 192, 192, 0.2);
      }

      &.rank-third {
        background-color: rgba(205, 127, 50, 0.2);
      }

      &:not(.rank-first):not(.rank-second):not(.rank-third) {
        background-color: rgba(245, 247, 250, 0.8);
      }
    }

    .medal-icon {
      font-size: 20px;
      transition: $transition-normal;

      &.first {
        color: #FFD700;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      &.second {
        color: #909399;
      }

      &.third {
        color: #CD7F32;
      }
    }

    .book-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-width: 0;
      overflow: hidden;

      .book-title {
        font-size: 15px;
        color: $text-primary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 65%;
        transition: $transition-fast;
        font-weight: 500;
      }

      .book-meta {
        font-size: 12px;
        color: $text-secondary;
        flex-shrink: 0;
        background-color: $background-light;
        padding: 3px 10px;
        border-radius: 20px;
        min-width: 50px;
        text-align: center;
        transition: $transition-fast;
      }

      .book-rating {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: rgba(#FFC107, 0.1);
        padding: 3px 10px;
        border-radius: 20px;

        .score-text {
          font-size: 12px;
          color: #ff9900;
          font-weight: bold;
        }
      }
    }

    &:hover .book-title {
      color: $primary-color;
    }

    &:hover .book-meta {
      background-color: $primary-light;
      color: $primary-dark;
    }
  }
}

// 图书推荐
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

// 返回顶部按钮
.floating-action-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 90;

  .back-to-top {
    width: 50px;
    height: 50px;
    background: $primary-gradient-low;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
  .card-content {
    font-size: 36px;
    display: flex;
    flex-direction: column;

    .notice-cards {
      width: 100%;
    }

    .active-cards {
      width: 100%;
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
  .card-content {
    font-size: 28px;
    display: flex;
    flex-direction: column;

    .notice-cards {
      width: 100%;
    }

    .active-cards {
      width: 100%;
    }
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