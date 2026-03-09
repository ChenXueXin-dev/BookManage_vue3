<template>
  <div class="user-collection-container">
    <!-- 顶部区域：标题 -->
    <div class="top-section">
      <div class="page-header">
        <h2 class="section-title">我的收藏</h2>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="collection-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="books.length === 0" description="您还没有收藏任何图书" :image-size="200" class="empty-collection">
        <el-button type="primary" @click="$router.push('/book/list')">去浏览图书</el-button>
      </el-empty>

      <!-- 收藏列表 -->
      <div v-else class="book-list">
        <el-row :gutter="30"> <!-- 增大列间距 -->
          <el-col v-for="book in books" :key="book.id" xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <div class="book-card-wrapper">
              <div class="book-card-inner">
                <div class="book-cover" @click="viewBookDetail(book.id)">
                  <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" alt="book cover" />
                  <div class="book-rating">
                    <el-rate v-model="book.avgScore" disabled text-color="#ff9900" score-template="{value}" />
                  </div>
                </div>
                <div class="book-info">
                  <h3 class="book-title" @click="viewBookDetail(book.id)">{{ book.title }}</h3>
                  <div class="book-meta">
                    <span class="book-author">{{ book.author || '未知作者' }}</span>
                    <span class="book-publisher">{{ book.publisher || '未知出版社' }}</span>
                  </div>
                  <div class="book-actions">
                    <el-button type="danger" @click.stop="cancelCollection(book.id, $event)" class="uncollect-btn">
                      <el-icon>
                        <Delete />
                      </el-icon> 移出收藏
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :page-size="pageSize"
            :current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b63871d/pics/book-default-medium.gif'

const books = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15) // 改为15，每行5个，共3行
const loading = ref(false)

// 获取收藏列表
const fetchCollections = async () => {
  loading.value = true
  try {
    await request.get('/collection/list', {
      currentPage: currentPage.value,
      size: pageSize.value
    }, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        books.value = res.records || []
        total.value = res.total || 0
      },
      onError: (error) => {
        console.error('获取收藏列表失败:', error)
      }
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消收藏
const cancelCollection = async (bookId, event) => {
  try {
    // 阻止事件冒泡
    if (event) event.stopPropagation()

    await ElMessageBox.confirm('确定要取消收藏这本书吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.post('/collection/cancel', { bookId }, {
      successMsg: '已取消收藏'
    })

    // 刷新列表
    fetchCollections()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
    }
  }
}

// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/detail/${bookId}`);
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchCollections()
}

onMounted(() => {
  fetchCollections()
})
</script>

<style lang="scss" scoped>
$primary-gradient-red-orange: linear-gradient(135deg, #f98a6c, #fdd888);

// 全局变量
:root {
  --primary-color: #409EFF;
  --text-color: #303133;
  --secondary-text: #606266;
  --border-color: #EBEEF5;
  --bg-color: #F5F7FA;
  --hover-color: #ECF5FF;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --card-hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.user-collection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  min-height: calc(100vh - 64px - 20px);
}

// 顶部区域样式
.top-section {
  .page-header {
    margin-bottom: 20px;

    .section-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      padding-left: 15px;
      border-left: 4px solid #409EFF;
      display: flex;
      align-items: center;
    }

    .page-description {
      font-size: 15px;
      color: var(--secondary-text);
      margin: 10px 0 0;
    }
  }
}

.loading-container {
  padding: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.empty-collection {
  padding: 40px 0;
  background: white;
  border-radius: 4px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.book-list {

  .book-card-wrapper {
    padding: 5px;
    height: 100%;
  }

  .book-card-inner {
    background-color: white;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    height: 100%;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .book-cover {
      position: relative;
      height: 210px;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .book-rating {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
        padding: 20px 10px 8px;
        z-index: 1;
      }
    }

    .book-info {
      padding: 15px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;

      .book-title {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: var(--primary-color);
        }
      }

      .book-meta {
        margin-bottom: 15px;

        .book-author,
        .book-publisher {
          display: block;
          font-size: 13px;
          color: var(--secondary-text);
          margin: 3px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          position: relative;
          padding-left: 10px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #dcdfe6;
          }
        }
      }



      .book-actions {
        margin-top: auto;
        display: flex;
        gap: 8px;

        .el-button {
          flex: 1;
          font-size: 13px;
          border-radius: 4px;
          padding: 8px 0;

          .el-icon {
            margin-right: 4px;
          }
        }

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 6px;
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
}

// 响应式调整
@media (max-width: 1200px) {
  .book-list .book-card-inner {
    .book-cover {
      height: 200px;
    }
  }
}

@media (max-width: 992px) {
  .book-list .book-card-inner {
    .book-cover {
      height: 220px;
    }
  }
}

@media (max-width: 768px) {
  .user-collection-container {
    padding: 15px;
  }

  .page-header {
    .page-description {
      font-size: 14px;
    }
  }

  .book-list {
    .book-card-wrapper {
      padding: 0 5px;
      margin-bottom: 20px;
    }

    .book-card-inner {
      .book-cover {
        height: 180px;
      }
    }
  }
}

@media (max-width: 480px) {
  .book-list .book-card-inner .book-cover {
    height: 160px;
  }
}
</style>