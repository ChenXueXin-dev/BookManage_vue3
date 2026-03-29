<template>
  <div class="ai-float-button" @click="openDialog">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <div class="float-icon">
        <el-icon :size="24"><MagicStick /></el-icon>
      </div>
    </el-badge>
    <span class="float-text">AI推荐</span>
  </div>

  <el-dialog
    v-model="dialogVisible"
    title="AI智能图书推荐"
    width="700px"
    :close-on-click-modal="false"
    class="ai-recommend-dialog"
  >
    <div class="ai-content" v-loading="loading">
      <div v-if="!isLoggedIn" class="login-prompt">
        <el-empty description="请先登录以获取个性化推荐">
          <el-button type="primary" @click="goLogin">立即登录</el-button>
        </el-empty>
      </div>

      <div v-else-if="aiSummary" class="recommend-result">
        <div class="ai-summary">
          <div class="summary-header">
            <el-icon class="ai-icon"><Cpu /></el-icon>
            <span>AI分析</span>
          </div>
          <div class="summary-content">{{ aiSummary }}</div>
        </div>

        <div class="book-list">
          <div class="list-header">
            <span>推荐图书</span>
            <el-tag type="success" size="small">共{{ recommendations.length }}本</el-tag>
          </div>
          <div class="book-items">
            <div
              v-for="(book, index) in recommendations"
              :key="book.bookId"
              class="book-item"
              @click="goBookDetail(book.bookId)"
            >
              <div class="book-rank">{{ index + 1 }}</div>
              <div class="book-cover">
                <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" :alt="book.title" />
              </div>
              <div class="book-info">
                <div class="book-title">{{ book.title }}</div>
                <div class="book-author">{{ book.author }}</div>
                <div class="book-score">
                  <el-rate :model-value="book.avgScore || 0" disabled :max="5" size="small" />
                  <span class="score-text">{{ book.avgScore?.toFixed(1) || '暂无评分' }}</span>
                </div>
              </div>
              <div class="recommend-score">
                <el-progress
                  type="circle"
                  :width="50"
                  :percentage="Math.round(book.recommendationScore * 10)"
                  :stroke-width="4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <el-empty description="暂无推荐数据">
          <el-button type="primary" @click="fetchRecommendations">获取推荐</el-button>
        </el-empty>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="fetchRecommendations" :loading="loading">
        刷新推荐
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Cpu } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const dialogVisible = ref(false)
const loading = ref(false)
const recommendations = ref([])
const aiSummary = ref('')
const unreadCount = ref(0)
const defaultCover = 'https://via.placeholder.com/80x100?text=Book'

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userId = computed(() => userStore.userInfo?.id)

const openDialog = () => {
  dialogVisible.value = true
  if (isLoggedIn.value && recommendations.value.length === 0) {
    fetchRecommendations()
  }
}

const fetchRecommendations = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    const res = await request.get(`/ai-recommendation/user/${userId.value}`, null, { showDefaultMsg: false })
    recommendations.value = res.recommendations || []
    aiSummary.value = res.aiSummary || ''
  } catch (error) {
    ElMessage.error('获取推荐失败')
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  dialogVisible.value = false
  router.push('/login')
}

const goBookDetail = (bookId) => {
  dialogVisible.value = false
  router.push(`/book/${bookId}`)
}

onMounted(() => {
  if (isLoggedIn.value) {
    unreadCount.value = 1
  }
})
</script>

<style lang="scss" scoped>
.ai-float-button {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  .float-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .float-text {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
}

.ai-content {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;

  .login-prompt {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .ai-summary {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;

    .summary-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;

      .ai-icon {
        color: #667eea;
      }
    }

    .summary-content {
      color: #666;
      line-height: 1.6;
      font-size: 14px;
    }
  }

  .book-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
      color: #333;
    }

    .book-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .book-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #f0f0f0;
        transform: translateX(5px);
      }

      .book-rank {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .book-cover {
        width: 50px;
        height: 70px;
        margin-right: 12px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
      }

      .book-info {
        flex: 1;
        min-width: 0;

        .book-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .book-author {
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        .book-score {
          display: flex;
          align-items: center;
          gap: 8px;

          .score-text {
            font-size: 12px;
            color: #ff9900;
          }
        }
      }

      .recommend-score {
        flex-shrink: 0;
        margin-left: 12px;
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
}
</style>
