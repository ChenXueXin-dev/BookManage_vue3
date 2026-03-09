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
      <el-empty v-else-if="comments.length === 0" description="您还没有发表任何评论" :image-size="200">
        <el-button type="primary" @click="$router.push('/')">去浏览图书</el-button>
      </el-empty>

      <!-- 评论表格 -->
      <div v-else class="comment-table">
        <el-table :data="comments" border stripe style="width: 100%"
          :header-cell-style="{ background: '#f8f9fa', fontWeight: '600' }">
          <!-- 时间列 -->
          <el-table-column label="评论时间" prop="createTime" width="200" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>

          <!-- 评论内容列 -->
          <el-table-column label="评论内容" prop="content" min-width="400">
            <template #default="scope">
              <div>
                <div v-if="scope.row.content.length > 40" @click="openCommentDialog(scope.row.content)">
                  {{ scope.row.content.substring(0, 40) + '......' }}
                  <el-button type="text">查看</el-button>
                </div>
                <div v-else>{{
                  scope.row.content }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 回复标识列 -->
          <el-table-column label="类型" width="100" align="center">
            <template #default="scope">
              <el-tag size="small" effect="plain" type="info" v-if="scope.row.parentId">
                回复
              </el-tag>
              <span v-else>普通</span>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" plain @click="viewBookDetail(scope.row.bookId)">
                查看图书
              </el-button>
              <el-button type="danger" size="small" @click="deleteComment(scope.row.id)">
                <el-icon>
                  <Delete />
                </el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination background layout="prev, pager, next, jumper, ->, total" :total="total" :page-size="pageSize"
            :current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </div>
    </div>

    <!-- 评论详情弹窗 -->
    <el-dialog title="评论详情" v-model="commentDialogVisible" width="600px" :close-on-click-modal="false">
      <div class="comment-detail-content">
        {{ currentCommentContent }}
      </div>
    </el-dialog>
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

// 评论弹窗相关
const commentDialogVisible = ref(false)
const currentCommentContent = ref('')

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    await request.get('/comment/user', {
      currentPage: currentPage.value,
      size: pageSize.value
    }, {
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

// 查看图书详情（修复跳转路径）
const viewBookDetail = (bookId) => {
  router.push(`/book/detail/${bookId}`) // 改为和收藏页面一致的路径
}

// 打开评论详情弹窗
const openCommentDialog = (content) => {
  currentCommentContent.value = content
  commentDialogVisible.value = true
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

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  fetchComments()
})
</script>

<style lang="scss" scoped>
.user-comment {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px - 40px);
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
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comment-content {
  min-height: 550px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;

  .comment-table {
    border-radius: 4px;
    flex: 1;

    .el-table {
      --el-table-row-hover-bg-color: #f5f7fa;
      min-height: 500px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.comment-detail-content {
  line-height: 1.8;
  font-size: 14px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

// 响应式适配
@media (max-width: 768px) {
  .user-comment {
    padding: 10px;
  }

  .comment-table {
    overflow-x: auto;
  }

  .el-dialog {
    width: 90% !important;
  }
}
</style>