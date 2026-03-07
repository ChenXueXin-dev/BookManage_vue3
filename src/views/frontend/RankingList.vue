<template>
  <div class="ranking-container">
    <div class="page-header">
      <div class="container">
        <h1>图书榜单</h1>
        <p>发现最受欢迎和最新的优质图书</p>
      </div>
    </div>

    <div class="ranking-content">
      <div class="container">
        <div class="ranking-section">
          <!-- 第一行：新书排行和热门借阅 -->
          <div class="ranking-row">
            <!-- 新书排行 -->
            <div class="ranking-block">
              <div class="section-header">
                <h2>新书排行</h2>
                <router-link to="/book/list?orderBy=createTime" class="more-link">
                  查看更多 <el-icon><ArrowRight /></el-icon>
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
                <div
                  v-for="(book, index) in newBooks"
                  :key="book.id"
                  class="ranking-item"
                  @click="viewBookDetail(book.id)"
                >
                  <div class="book-rank" :class="[
                    { 'top-three': index < 3 },
                    { 'rank-first': index === 0 },
                    { 'rank-second': index === 1 },
                    { 'rank-third': index === 2 }
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div class="book-info">
                    <span class="book-title" :title="book.title">{{ book.title }}</span>
                    <span class="book-meta">{{ formatDate(book.createTime) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 热门借阅 -->
            <div class="ranking-block">
              <div class="section-header">
                <h2>热门借阅</h2>
                <router-link to="/book/list?orderBy=borrowedCount" class="more-link">
                  查看更多 <el-icon><ArrowRight /></el-icon>
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
                <div
                  v-for="(book, index) in hotBorrowBooks"
                  :key="book.id"
                  class="ranking-item"
                  @click="viewBookDetail(book.id)"
                >
                  <div class="book-rank" :class="[
                    { 'top-three': index < 3 },
                    { 'rank-first': index === 0 },
                    { 'rank-second': index === 1 },
                    { 'rank-third': index === 2 }
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div class="book-info">
                    <span class="book-title" :title="book.title">{{ book.title }}</span>
                    <span class="book-meta">{{ book.borrowedCount || 0 }}次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 第二行：热门收藏和评价最高 -->
          <div class="ranking-row">
            <!-- 热门收藏 -->
            <div class="ranking-block">
              <div class="section-header">
                <h2>热门收藏</h2>
                <router-link to="/book/list?orderBy=collectionCount" class="more-link">
                  查看更多 <el-icon><ArrowRight /></el-icon>
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
                <div
                  v-for="(book, index) in hotCollectionBooks"
                  :key="book.id"
                  class="ranking-item"
                  @click="viewBookDetail(book.id)"
                >
                  <div class="book-rank" :class="[
                    { 'top-three': index < 3 },
                    { 'rank-first': index === 0 },
                    { 'rank-second': index === 1 },
                    { 'rank-third': index === 2 }
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div class="book-info">
                    <span class="book-title" :title="book.title">{{ book.title }}</span>
                    <span class="book-meta">{{ book.collectionCount || 0 }}次</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 评价最高 -->
            <div class="ranking-block">
              <div class="section-header">
                <h2>评价最高</h2>
                <router-link to="/book/list?orderBy=avgScore" class="more-link">
                  查看更多 <el-icon><ArrowRight /></el-icon>
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
                <div
                  v-for="(book, index) in topRatedBooks"
                  :key="book.id"
                  class="ranking-item"
                  @click="viewBookDetail(book.id)"
                >
                  <div class="book-rank" :class="[
                    { 'top-three': index < 3 },
                    { 'rank-first': index === 0 },
                    { 'rank-second': index === 1 },
                    { 'rank-third': index === 2 }
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div class="book-info">
                    <span class="book-title" :title="book.title">{{ book.title }}</span>
                    <div class="book-rating">
                      <el-rate
                        v-model="book.avgScore"
                        disabled
                        text-color="#ff9900"
                        size="small"
                        :max="5"
                        :allow-half="true"
                      />
                      <span class="score-text">{{ book.avgScore.toFixed(1) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const router = useRouter();

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
    const res = await request.get('/book/new?limit=15');
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
    const res = await request.get('/book/hot?limit=15');
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
    const res = await request.get('/book/hot-collection?limit=15');
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
    const res = await request.get('/book/top-rated?limit=15');
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

// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/detail/${bookId}`);
};
</script>

<style lang="scss" scoped>
// 全局变量
$primary-color: #4F9DFB;
$primary-light: #E3F2FD;
$primary-dark: #247ADB;
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

// 磨砂玻璃效果混入
@mixin glass-effect {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ranking-container {
  min-height: 100vh;
  background-color: transparent;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  position: relative;
  padding-bottom: 40px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 10% 10%, rgba($primary-light, 0.5) 0%, transparent 70%),
      radial-gradient(circle at 90% 90%, rgba($primary-light, 0.5) 0%, transparent 70%);
    pointer-events: none;
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.page-header {
  background: linear-gradient(to right, $primary-dark, $primary-color);
  color: white;
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: $box-shadow-medium;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::before {
    top: -150px;
    right: -50px;
  }
  
  &::after {
    bottom: -200px;
    left: -100px;
    width: 400px;
    height: 400px;
  }

  h1 {
    font-size: 36px;
    margin: 0 0 15px;
    font-weight: 600;
    position: relative;
    display: inline-block;
    z-index: 1;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: white;
      border-radius: 3px;
    }
  }

  p {
    font-size: 18px;
    opacity: 0.9;
    margin: 0;
    font-weight: 300;
  }
}

.ranking-section {
  margin-bottom: 40px;
}

.ranking-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
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
  padding: 20px 25px;
  border-bottom: 1px solid $background-medium;
  background: linear-gradient(to right, $primary-light, white);

  h2 {
    font-size: 20px;
    margin: 0;
    position: relative;
    padding-left: 15px;
    color: $text-primary;
    font-weight: 600;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: $primary-color;
      border-radius: 2px;
    }
  }

  .more-link {
    display: flex;
    align-items: center;
    color: $primary-color;
    font-size: 14px;
    text-decoration: none;
    font-weight: 500;
    transition: $transition-fast;
    padding: 6px 12px;
    border-radius: 20px;
    
    &:hover {
      background-color: $primary-light;
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
    padding: 10px 25px;
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
    padding: 12px 25px;
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

    .book-rank {
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background-color: $background-dark;
      color: $text-secondary;
      border-radius: 6px;
      font-size: 14px;
      margin-right: 15px;
      flex-shrink: 0;
      font-weight: bold;
      box-shadow: $box-shadow-light;
      transition: $transition-normal;

      &.top-three {
        color: white;
      }
      
      &.rank-first {
        background: linear-gradient(45deg, #f56c6c, #ff9068);
        box-shadow: 0 4px 10px rgba(#f56c6c, 0.3);
      }

      &.rank-second {
        background: linear-gradient(45deg, #e6a23c, #faad7d);
        box-shadow: 0 4px 10px rgba(#e6a23c, 0.3);
      }

      &.rank-third {
        background: linear-gradient(45deg, $primary-color, lighten($primary-color, 15%));
        box-shadow: 0 4px 10px rgba($primary-color, 0.3);
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

.loading-container {
  padding: 20px 25px;
  
  :deep(.el-skeleton) {
    --el-skeleton-color: #{$background-medium};
    --el-skeleton-to-color: #{$background-light};
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 0;
    
    h1 {
      font-size: 28px;
    }
    
    p {
      font-size: 16px;
    }
  }
  
  .section-header {
    padding: 15px 20px;
    
    h2 {
      font-size: 18px;
    }
  }
  
  .ranking-list .ranking-item {
    padding: 10px 20px;
    
    .book-rank {
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 12px;
      margin-right: 10px;
    }
    
    .book-info .book-title {
      font-size: 14px;
    }
    
    .book-info .book-meta {
      padding: 2px 8px;
      font-size: 11px;
      min-width: 40px;
    }
    
    .book-info .book-rating .score-text {
      font-size: 11px;
    }
  }
  
  .ranking-list .ranking-title {
    padding: 8px 20px;
    font-size: 12px;
  }
  
  .loading-container {
    padding: 15px 20px;
  }
}
</style> 