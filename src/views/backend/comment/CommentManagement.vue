<template>
  <div class="comment-management">
    <div class="page-header">
      <h2 class="page-title">评论管理</h2>
    </div>
    
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="图书ID">
          <el-input v-model="searchForm.bookId" placeholder="请输入图书ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <div class="table-operations">
        <el-button type="danger" :disabled="selectedComments.length === 0" @click="batchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>
      
      <el-table
        v-loading="loading"
        :data="commentList"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="bookId" label="图书ID" width="80" />
        <el-table-column label="图书信息" min-width="200">
          <template #default="scope">
            <div class="book-info">
              <el-image 
                v-if="scope.row.bookCover" 
                :src="scope.row.bookCover.startsWith('/api') ? scope.row.bookCover : '/api'+scope.row.bookCover" 
                class="book-cover"
                fit="cover"
                :preview-src-list="scope.row.bookCover ? [scope.row.bookCover.startsWith('/api') ? scope.row.bookCover : '/api'+scope.row.bookCover] : []"
                :initial-index="0"
                preview-teleported
              />
              <div class="book-title">{{ scope.row.bookTitle || '未知书名' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column label="是否回复" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.parentId" type="info" size="small">回复</el-tag>
            <el-tag v-else type="success" size="small">主评论</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">正常</el-tag>
            <el-tag v-else type="danger" size="small">已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 1"
              type="danger" 
              size="small" 
              @click="deleteComment(scope.row.id)"
            >
              删除
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="showBookDetail(scope.row.bookId)"
            >
              查看图书
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 图书详情对话框 -->
    <el-dialog
      v-model="bookDetailVisible"
      title="图书详情"
      width="50%"
      destroy-on-close
    >
      <div v-loading="bookLoading">
        <div v-if="bookDetail" class="book-detail">
          <div class="book-detail-header">
            <el-image
              :src="bookDetail.coverUrl ? (bookDetail.coverUrl.startsWith('/api') ? bookDetail.coverUrl : '/api'+bookDetail.coverUrl) : ''"
              fit="cover"
              class="book-detail-cover"
              :preview-src-list="bookDetail.coverUrl ? [bookDetail.coverUrl.startsWith('/api') ? bookDetail.coverUrl : '/api'+bookDetail.coverUrl] : []"
              :initial-index="0"
              preview-teleported
            />
            <div class="book-detail-info">
              <h2 class="book-detail-title">{{ bookDetail.title }}</h2>
              <div class="book-detail-meta">
                <div><strong>作者：</strong>{{ bookDetail.author }}</div>
                <div><strong>出版社：</strong>{{ bookDetail.publisher }}</div>
                <div><strong>出版日期：</strong>{{ formatDate(bookDetail.publishDate) }}</div>
                <div><strong>ISBN：</strong>{{ bookDetail.isbn }}</div>
                <div><strong>分类：</strong>{{ bookDetail.categoryName }}</div>
                <div><strong>评分：</strong>{{ bookDetail.avgScore }} / 5</div>
                <div><strong>库存：</strong>{{ bookDetail.stock }}</div>
                <div><strong>借阅次数：</strong>{{ bookDetail.borrowedCount }}</div>
                <div><strong>状态：</strong>
                  <el-tag :type="bookDetail.status === 1 ? 'success' : 'danger'">
                    {{ bookDetail.status === 1 ? '上架' : '下架' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          <div class="book-detail-description">
            <h3>图书简介</h3>
            <p>{{ bookDetail.description }}</p>
          </div>
        </div>
        <div v-else-if="!bookLoading" class="book-detail-empty">
          未找到图书信息
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  bookId: ''
})

// 表格数据
const commentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const selectedComments = ref([])

// 图书详情相关
const bookDetailVisible = ref(false)
const bookDetail = ref(null)
const bookLoading = ref(false)

// 获取评论列表
const fetchCommentList = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/admin/list', {
     
        bookId: searchForm.bookId || undefined,
        currentPage: currentPage.value,
        size: pageSize.value

    }, {
      onSuccess: (res) => {
        loading.value = false
        commentList.value = res.records || []
        total.value = res.total || 0
      }
    })
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {

    
  currentPage.value = 1
  fetchCommentList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.bookId = ''
  currentPage.value = 1
  fetchCommentList()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchCommentList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchCommentList()
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedComments.value = selection
}

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.post('/comment/admin/delete', { commentId }, {
      successMsg: '删除成功'
    })
    
    // 刷新列表
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

// 批量删除评论
const batchDelete = async () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请选择要删除的评论')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedComments.value.length} 条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const commentIds = selectedComments.value.map(item => item.id)
    
    // 循环删除评论
    for (const commentId of commentIds) {
      await request.post('/comment/admin/delete', { commentId })
    }
    
    ElMessage.success(`成功删除 ${commentIds.length} 条评论`)
    
    // 刷新列表
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除评论失败:', error)
    }
  }
}

// 查看图书详情
const showBookDetail = async (bookId) => {
  bookDetailVisible.value = true
  bookLoading.value = true
  bookDetail.value = null
  
  try {
    const res = await request.get(`/book/${bookId}`)
    bookDetail.value = res
  } catch (error) {
    console.error('获取图书详情失败:', error)
    ElMessage.error('获取图书详情失败')
  } finally {
    bookLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
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
  fetchCommentList()
})
</script>

<style lang="scss" scoped>
.comment-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  
  .page-title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
}

.search-area {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.table-operations {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.book-info {
  display: flex;
  align-items: center;
  
  .book-cover {
    width: 40px;
    height: 55px;
    margin-right: 10px;
    object-fit: cover;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .book-title {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.book-detail {
  &-header {
    display: flex;
    margin-bottom: 20px;
  }
  
  &-cover {
    width: 120px;
    height: 170px;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    margin-right: 20px;
  }
  
  &-info {
    flex: 1;
  }
  
  &-title {
    font-size: 20px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 15px;
    color: #303133;
  }
  
  &-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    
    div {
      font-size: 14px;
      color: #606266;
    }
  }
  
  &-description {
    margin-top: 20px;
    border-top: 1px solid #EBEEF5;
    padding-top: 20px;
    
    h3 {
      font-size: 16px;
      margin-top: 0;
      margin-bottom: 10px;
      color: #303133;
    }
    
    p {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      white-space: pre-line;
    }
  }
  
  &-empty {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    font-size: 16px;
  }
}
</style> 