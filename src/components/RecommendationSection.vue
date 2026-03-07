<template>
  <div class="recommendation-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <router-link v-if="isLoggedIn" to="/recommendation" class="more-link">
        查看更多 <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>
    
    <div v-loading="loading" class="section-content">
      <template v-if="books.length > 0">
        <el-carousel 
          :interval="5000" 
          type="card" 
          :autoplay="true"
          indicator-position="none"
          :loop="true"
          height="320px"
        >
          <el-carousel-item v-for="book in books" :key="book.bookId">
            <div class="book-card" @click="viewBookDetail(book.bookId)">
              <div class="book-cover-wrapper">
                <el-image 
                  :src="book.coverUrl || '/placeholder-cover.png'" 
                  fit="cover"
                  class="book-cover"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-if="showBadge" class="recommendation-badge" :class="`type-${book.recommendationType}`">
                  {{ book.recommendationTypeDesc }}
                </div>
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title || '未知书名' }}</h3>
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
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </template>
      
      <div v-else-if="!loading" class="empty-state">
        <el-empty :description="emptyText" />
        <div v-if="!isLoggedIn" class="login-prompt">
          <router-link to="/login" class="login-link">
            <el-button type="primary">登录获取个性化推荐</el-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const props = defineProps({
  title: {
    type: String,
    default: '为您推荐'
  },
  type: {
    type: Number,
    default: null
  },
  limit: {
    type: Number,
    default: 6
  },
  emptyText: {
    type: String,
    default: '暂无推荐图书'
  },
  showBadge: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const books = ref([])
const loading = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userId = computed(() => userStore.userInfo?.id)

// API方法
const getRecommendationList = (params) => {
  return request.get('/recommendation/list', params)
}

// 获取推荐列表
const fetchRecommendations = async () => {
  if (!isLoggedIn.value) {
    return
  }
  
  loading.value = true
  try {
    const params = {
      userId: userId.value,
      currentPage: 1,
      size: props.limit
    }
    
    if (props.type) {
      params.type = props.type
    }
    
    const res = await getRecommendationList(params)
    books.value = res.records || []
  } catch (error) {
    console.error('获取推荐列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/${bookId}`)
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchRecommendations()
  }
})
</script>

<style lang="scss" scoped>
.recommendation-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  .section-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: #303133;
  }
  
  .more-link {
    display: flex;
    align-items: center;
    color: #409EFF;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: #66b1ff;
    }
    
    .el-icon {
      margin-left: 5px;
    }
  }
}

.section-content {
  min-height: 320px;
}

.book-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.book-cover-wrapper {
  position: relative;
  height: 70%;
  overflow: hidden;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  
  .el-icon {
    font-size: 32px;
  }
}

.recommendation-badge {
  position: absolute;
  top: 10px;
  right: 0;
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px 0 0 4px;
  
  &.type-1 {
    background-color: rgba(103, 194, 58, 0.9); // 用户协同过滤
  }
  
  &.type-2 {
    background-color: rgba(144, 147, 153, 0.9); // 物品协同过滤
  }
  
  &.type-3 {
    background-color: rgba(230, 162, 60, 0.9); // 热门推荐
  }
  
  &.type-4 {
    background-color: rgba(64, 158, 255, 0.9); // 新书推荐
  }
}

.book-info {
  padding: 15px;
  height: 30%;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-rating {
  display: flex;
  align-items: center;
  
  .rating-value {
    margin-left: 5px;
    color: #ff9900;
    font-weight: bold;
  }
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-prompt {
  margin-top: 20px;
  
  .login-link {
    text-decoration: none;
  }
}

:deep(.el-carousel__item) {
  padding: 0 10px;
}

@media (max-width: 768px) {
  .section-header {
    .section-title {
      font-size: 20px;
    }
  }
  
  .book-title {
    font-size: 14px;
  }
  
  .book-author {
    font-size: 12px;
  }
}
</style> 