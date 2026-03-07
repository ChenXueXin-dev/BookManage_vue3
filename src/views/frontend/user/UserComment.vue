<template>
  <div class="user-comment">
    <div class="page-header">
      <h1 class="page-title">我的评论</h1>
    </div>
    
    <div class="comment-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <!-- 空状态 -->
      <el-empty 
        v-else-if="comments.length === 0" 
        description="您还没有发表任何评论" 
        :image-size="200"
      >
        <el-button type="primary" @click="$router.push('/')">去浏览图书</el-button>
      </el-empty>
      
      <!-- 评论列表 -->
      <div v-else class="comment-list">
        <el-card v-for="comment in comments" :key="comment.id" class="comment-item" shadow="hover">
          <div class="comment-header">
            <div class="comment-info">
              <span class="comment-time">{{ formatDateTime(comment.createTime) }}</span>
              <el-tag size="small" effect="plain" class="book-tag" @click="viewBookDetail(comment.bookId)">
                查看图书
              </el-tag>
            </div>
            <div class="comment-actions">
              <el-button type="danger" size="small" @click="deleteComment(comment.id)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </div>
          
          <div class="comment-content-text">{{ comment.content }}</div>
          
          <div v-if="comment.parentId" class="reply-info">
            <el-tag size="small" effect="plain" type="info">回复评论</el-tag>
          </div>
        </el-card>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const comments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/user', {
  
        currentPage: currentPage.value,
        size: pageSize.value
        },{
          showDefaultMsg: false,
          onSuccess: (res) => {
            comments.value = res.records || []
            total.value = res.total || 0
          },
          onError: (error) => {
            console.error('获取评论列表失败:', error)
          }
        })
    
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.post('/comment/delete', { commentId }, {
      successMsg: '删除成功'
    })
    
    // 刷新列表
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

// 查看图书详情
const viewBookDetail = (bookId) => {
  router.push(`/book/${bookId}`)
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return dateTime
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  fetchComments()
})
</script>

<style lang="scss" scoped>
.user-comment {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
    position: relative;
    padding-left: 15px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: #409eff;
      border-radius: 2px;
    }
  }
}

.loading-container {
  padding: 20px;
}

.comment-list {
  .comment-item {
    margin-bottom: 15px;
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .comment-info {
        display: flex;
        align-items: center;
        
        .comment-time {
          font-size: 13px;
          color: #999;
          margin-right: 10px;
        }
        
        .book-tag {
          cursor: pointer;
        }
      }
    }
    
    .comment-content-text {
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 10px;
      word-break: break-word;
    }
    
    .reply-info {
      margin-top: 10px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style> 