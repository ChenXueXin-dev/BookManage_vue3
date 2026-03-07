<template>
  <div class="recommendation-page">
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="page-description">根据您的阅读喜好和借阅历史，为您推荐以下图书</p>
    </div>

    <div v-loading="loading" class="recommendation-content">
      <template v-if="recommendationList.length > 0">
        <div class="book-grid">
          <div v-for="book in recommendationList" :key="book.id || book.bookId" class="book-card">
            <div class="book-cover-wrapper" @click="viewBookDetail(book.bookId)">
              <el-image
                  :src="book.coverUrl ? ('/api' + book.coverUrl) : '/placeholder-cover.png'"
                  fit="cover"
                  class="book-cover"
                  :preview-src-list="book.coverUrl ? ['/api' + book.coverUrl] : []"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="recommendation-badge" :class="getRecommendationTypeClass(book.recommendationType)">
                {{ getRecommendationTypeName(book.recommendationType) }}
              </div>
            </div>
            <div class="book-info">
              <h3 class="book-title" @click="viewBookDetail(book.bookId)">{{ book.title || '未知书名' }}</h3>
              <p class="book-author">{{ book.author || '未知作者' }}</p>
              <div class="book-rating">
                <el-rate
                    v-model="book.avgScore"
                    disabled
                    text-color="#ff9900"
                    score-template="{value}"
                />
                <span class="rating-value">{{ book.avgScore || '0' }}</span>
              </div>
              <div class="book-actions">
                <el-button type="primary" size="small" @click="viewBookDetail(book.bookId)">查看详情</el-button>

              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="showPagination">
          <el-pagination
              background
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handleCurrentChange"
          />
        </div>
      </template>

      <el-empty v-else description="暂无推荐图书" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 推荐数据
const recommendationList = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// 是否显示分页
const showPagination = computed(() => {
  // 只有使用分页接口时显示分页器
  return false;
})

// 根据当前路由设置页面标题
const isAllRecommendationsPage = computed(() => route.name === 'AllRecommendations')
const pageTitle = computed(() => isAllRecommendationsPage.value ? '全部推荐' : '个性化推荐')

// 获取用户ID
const userId = computed(() => userStore.userInfo?.id)

// 获取推荐类型名称
const getRecommendationTypeName = (type) => {
  switch (type) {
    case 1: return '个人喜好';
    case 2: return '相似图书';
    case 3: return '热门推荐';
    case 4: return '新书推荐';
    case 5: return '主题推荐';
    case 6: return '猜你喜欢';
    default: return '推荐';
  }
}

// 获取推荐类型样式类
const getRecommendationTypeClass = (type) => {
  switch (type) {
    case 1: return 'type-1';
    case 2: return 'type-2';
    case 3: return 'type-3';
    case 4: return 'type-4';
    case 5: return 'type-5';
    case 6: return 'type-6';
    default: return '';
  }
}

// 获取推荐列表
const fetchRecommendations = async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录')
    const currentPath = isAllRecommendationsPage.value ? '/all-recommendations' : '/recommendation'
    router.push(`/login?redirect=${currentPath}`)
    return
  }

  loading.value = true;

  try {
    // 使用混合推荐API获取数据
    const endpoint = '/recommendation/hybrid';
    const params = {
      userId: userId.value,
      limit: pageSize.value
    };

    await request.get(endpoint, params, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        recommendationList.value = (res || []).map(item => ({
          ...item,
          // 确保有评分值
          avgScore: item.avgScore || 0
        }));

        // 如果是分页接口，设置总数
        if (res && res.total !== undefined) {
          total.value = res.total || 0;
        }
      }
    });
  } catch (error) {
    console.error('获取推荐列表失败:', error);
    ElMessage.error('获取推荐列表失败');
  } finally {
    loading.value = false;
  }
}


// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/detail/${bookId}`)
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchRecommendations()
}

// 监听路由变化
watch(
    () => route.name,
    () => {
      // 当路由变化时重新获取数据
      fetchRecommendations()
    }
)

onMounted(() => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录查看推荐')
    const currentPath = isAllRecommendationsPage.value ? '/all-recommendations' : '/recommendation'
    router.push(`/login?redirect=${currentPath}`)
    return
  }

  fetchRecommendations()
})
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

.recommendation-page {
  padding: 20px;
  max-width: 1280px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F7FA 0%, #E4ECF7 100%);
  position: relative;

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
    z-index: 0;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
  padding: 40px 0;
  background: linear-gradient(to right, $primary-dark, $primary-color);
  color: white;
  border-radius: $border-radius;
  box-shadow: $box-shadow-medium;

  .page-title {
    font-size: 32px;
    margin-bottom: 15px;
    font-weight: 600;

    &::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: white;
      margin: 15px auto 0;
      border-radius: 3px;
    }
  }

  .page-description {
    font-size: 18px;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 300;
  }
}

.recommendation-content {
  position: relative;
  z-index: 1;
  min-height: 500px;
  margin-bottom: 40px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.book-card {
  @include card;
  display: flex;
  flex-direction: column;
  height: 100%;
  transform: none;

  &:hover {
    .book-cover {
      transform: scale(1.05);
    }
  }
}

.book-cover-wrapper {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
  cursor: pointer;

  .book-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: $transition-normal;
  }
}

.recommendation-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &.type-1 {
    background: linear-gradient(45deg, #4FC3F7, #2196F3);
  }

  &.type-2 {
    background: linear-gradient(45deg, #66BB6A, #4CAF50);
  }

  &.type-3 {
    background: linear-gradient(45deg, #9575CD, #673AB7);
  }

  &.type-4 {
    background: linear-gradient(45deg, #EF5350, #F44336);
  }

  &.type-5 {
    background: linear-gradient(45deg, #FFA726, #FF9800);
  }

  &.type-6 {
    background: linear-gradient(45deg, #7E57C2, #673AB7);
  }
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: $background-light;
  color: $text-secondary;
  font-size: 40px;
}

.book-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;

  .book-title {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    height: 2.8em;

    &:hover {
      color: $primary-color;
    }
  }

  .book-author {
    margin: 0 0 12px;
    font-size: 14px;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-rating {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    :deep(.el-rate) {
      --el-rate-void-color: #{$background-dark};
    }

    .rating-value {
      margin-left: 10px;
      font-size: 14px;
      font-weight: 600;
      color: $accent-color;
    }
  }

  .book-actions {
    margin-top: auto;
    display: flex;
    gap: 10px;

    .el-button {
      flex: 1;
      border-radius: 50px;
      font-size: 14px;

      &.el-button--primary {
        background: linear-gradient(45deg, $primary-color, $primary-dark);
        border: none;

        &:hover {
          transform: translateY(-2px);
          box-shadow: $box-shadow-medium;
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: white;
    --el-pagination-hover-color: #{$primary-color};
    --el-pagination-button-color: #{$text-secondary};
    --el-pagination-button-disabled-bg-color: #{$background-light};

    border-radius: $border-radius;
    padding: 15px 20px;
    box-shadow: $box-shadow-light;

    .el-pager li {
      min-width: 35px;
      height: 35px;
      font-size: 14px;

      &.is-active {
        background-color: $primary-color;
        color: white;
      }
    }

    button {
      height: 35px;
      min-width: 35px;
    }
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 30px 0;

    .page-title {
      font-size: 28px;
    }

    .page-description {
      font-size: 16px;
    }
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 25px 0;

    .page-title {
      font-size: 24px;
    }

    .page-description {
      font-size: 14px;
    }
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .book-info {
    padding: 15px;

    .book-title {
      font-size: 14px;
    }

    .book-author {
      font-size: 12px;
    }

    .book-actions {
      flex-direction: column;
    }
  }
}
</style>