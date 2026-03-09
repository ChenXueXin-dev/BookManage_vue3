<template>
  <div class="borrow-management-container">
    <div class="page-header">
      <h2>借阅记录管理</h2>
      <p>管理系统中的所有借阅记录</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="图书名称">
          <el-input v-model="queryParams.bookTitle" placeholder="请输入图书名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="借阅状态">
          <el-select v-model="queryParams.status" placeholder="请选择借阅状态" clearable>
            <el-option label="已取消" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="借阅中" :value="2" />
            <el-option label="已归还" :value="3" />
            <el-option label="已逾期" :value="4" />
            <el-option label="审核拒绝" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="borrowList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="id" label="借阅ID" width="80" />
        <el-table-column label="图书信息" min-width="200">
          <template #default="scope">
            <div class="book-info">
              <el-image
                :src="scope.row.coverUrl ? ('/api' + scope.row.coverUrl) : defaultCover"
                :preview-src-list="[scope.row.coverUrl ? ('/api' + scope.row.coverUrl) : defaultCover]"
                fit="cover"
                class="book-cover"
              />
              <div class="book-details">
                <div class="book-title">{{ scope.row.bookTitle }}</div>
                <div class="book-author">{{ scope.row.author }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="借阅用户" width="120" />
        <el-table-column label="借阅时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.borrowTime) }}
          </template>
        </el-table-column>
        <el-table-column label="应还时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.planReturnTime) }}
          </template>
        </el-table-column>
        <el-table-column label="实际归还时间" width="160">
          <template #default="scope">
            {{ scope.row.actualReturnTime ? formatDateTime(scope.row.actualReturnTime) : '未归还' }}
          </template>
        </el-table-column>
        <el-table-column prop="renewCount" label="续借次数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getBorrowStatusType(scope.row.status)">
              {{ getBorrowStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 1" 
              type="success" 
              link 
              @click="handleApprove(scope.row)"
            >
              审批通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              type="danger" 
              link 
              @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>
            <el-button 
              v-if="scope.row.status === 2" 
              type="primary" 
              link 
              @click="handleReturn(scope.row)"
            >
              归还
            </el-button>
            <el-button 
              v-if="scope.row.status === 4" 
              type="warning" 
              link 
              @click="handleReturn(scope.row)"
            >
              逾期归还
            </el-button>
            <el-button 
              v-if="scope.row.status === 2" 
              type="success" 
              link 
              @click="handleRenew(scope.row)"
            >
              续借
            </el-button>
            <el-button 
              v-if="[1,2].includes(scope.row.status)" 
              type="danger" 
              link 
              @click="handleCancel(scope.row)"
            >
              取消
            </el-button>
            <el-button
              type="info"
              link
              @click="handleDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @update:current-page="queryParams.pageNum = $event"
          @update:page-size="queryParams.pageSize = $event"
        />
      </div>
    </div>
    
    <!-- 借阅详情对话框 -->
    <el-dialog
      title="借阅详情"
      v-model="detailDialogVisible"
      width="600px"
      append-to-body
    >
      <div class="borrow-detail" v-if="currentBorrow">
        <div class="detail-header">
          <el-image
            :src="currentBorrow.coverUrl ? ('/api' + currentBorrow.coverUrl) : defaultCover"
            fit="cover"
            class="detail-cover"
          />
          <div class="detail-info">
            <h3>{{ currentBorrow.bookTitle }}</h3>
            <p>作者: {{ currentBorrow.author }}</p>
            <p>借阅用户: {{ currentBorrow.username }}</p>
            <p>借阅状态: {{ getBorrowStatusText(currentBorrow.status) }}</p>
          </div>
        </div>
        <el-divider />
        <div class="detail-body">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="借阅ID">{{ currentBorrow.id }}</el-descriptions-item>
            <el-descriptions-item label="图书ID">{{ currentBorrow.bookId }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentBorrow.userId }}</el-descriptions-item>
            <el-descriptions-item label="借阅时间">{{ formatDateTime(currentBorrow.borrowTime) }}</el-descriptions-item>
            <el-descriptions-item label="应还时间">{{ formatDateTime(currentBorrow.planReturnTime) }}</el-descriptions-item>
            <el-descriptions-item label="实际归还时间">
              {{ currentBorrow.actualReturnTime ? formatDateTime(currentBorrow.actualReturnTime) : '未归还' }}
            </el-descriptions-item>
            <el-descriptions-item label="续借次数">{{ currentBorrow.renewCount }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(currentBorrow.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(currentBorrow.updateTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const borrowList = ref([])
const total = ref(0)
const defaultCover = '/default-cover.jpg'
const detailDialogVisible = ref(false)
const currentBorrow = ref(null)

// 查询参数
const queryParams = reactive({
  username: '',
  bookTitle: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 获取借阅记录列表
const getBorrowList = async () => {
  loading.value = true
  try {
    const params = {
      username: queryParams.username || undefined,
      bookTitle: queryParams.bookTitle || undefined,
      status: queryParams.status,
      currentPage: queryParams.pageNum,
      size: queryParams.pageSize
    }
    
    const res = await request.get('/borrow/admin/records', params)
    borrowList.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取借阅记录列表失败:', error)
    ElMessage.error('获取借阅记录列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '无'
  
  const date = new Date(dateTime)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return dateTime
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取借阅状态文本
const getBorrowStatusText = (status) => {
  switch (status) {
    case 0:
      return '已取消'
    case 1:
      return '待审核'
    case 2:
      return '借阅中'
    case 3:
      return '已归还'
    case 4:
      return '已逾期'
    case 5:
      return '审核拒绝'
    default:
      return '未知'
  }
}

// 获取借阅状态标签类型
const getBorrowStatusType = (status) => {
  switch (status) {
    case 0:
      return 'info'
    case 1:
      return 'warning'
    case 2:
      return 'primary'
    case 3:
      return 'success'
    case 4:
      return 'danger'
    case 5:
      return 'danger'
    default:
      return 'info'
  }
}

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getBorrowList()
}

// 重置查询
const resetQuery = () => {
  queryParams.username = ''
  queryParams.bookTitle = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  getBorrowList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  queryParams.pageNum = page
  getBorrowList()
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  getBorrowList()
}

// 处理归还
const handleReturn = (row) => {
  ElMessageBox.confirm(`确定要将图书《${row.bookTitle}》标记为已归还吗?`, '归还确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.post('/borrow/return', { id: row.id }, {
        params: {
          userId: row.userId
        },
        successMsg: '归还操作成功',
        onSuccess: () => {
          getBorrowList()
        }
      })
    } catch (error) {
      console.error('归还操作失败:', error)
    }
  }).catch(() => {})
}

// 处理续借
const handleRenew = (row) => {
  ElMessageBox.confirm(`确定要为图书《${row.bookTitle}》办理续借吗?`, '续借确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.post('/borrow/renew', { id: row.id }, {
        params: {
          userId: row.userId
        },
        successMsg: '续借操作成功',
        onSuccess: () => {
          getBorrowList()
        }
      })
    } catch (error) {
      console.error('续借操作失败:', error)
    }
  }).catch(() => {})
}

// 处理取消
const handleCancel = (row) => {
  ElMessageBox.confirm(`确定要取消图书《${row.bookTitle}》的借阅记录吗?`, '取消确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      await request.post('/borrow/cancel', { id: row.id }, {
        params: {
          userId: row.userId
        },
        successMsg: '取消操作成功',
        onSuccess: () => {
          getBorrowList()
        }
      })
    } catch (error) {
      console.error('取消操作失败:', error)
    }
  }).catch(() => {})
}

// 处理查看详情
const handleDetail = (row) => {
  currentBorrow.value = row
  detailDialogVisible.value = true
}

// 检查并更新逾期状态
const checkAndUpdateOverdueStatus = async () => {
  try {
    await request.post('/borrow/check-overdue', null, {
      showDefaultMsg: false
    })
    console.log('已检查并更新逾期状态')
  } catch (error) {
    console.error('检查逾期状态失败:', error)
  }
}

// 处理审批通过
const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要审批通过用户 ${row.username} 对图书《${row.bookTitle}》的借阅申请吗?`, '审批确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await request.post('/borrow/approve', { id: row.id }, {
        successMsg: '审批通过成功',
        onSuccess: () => {
          getBorrowList()
        }
      })
    } catch (error) {
      console.error('审批操作失败:', error)
    }
  }).catch(() => {})
}

// 处理审批拒绝
const handleReject = (row) => {
  ElMessageBox.confirm(`确定要拒绝用户 ${row.username} 对图书《${row.bookTitle}》的借阅申请吗?`, '拒绝确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.post('/borrow/reject', { id: row.id }, {
        successMsg: '已拒绝借阅申请',
        onSuccess: () => {
          getBorrowList()
        }
      })
    } catch (error) {
      console.error('拒绝操作失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  // 先检查逾期状态，再获取列表
  checkAndUpdateOverdueStatus().then(() => {
    getBorrowList()
  })
})
</script>

<style lang="scss" scoped>
.borrow-management-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
  }
}

.search-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.book-info {
  display: flex;
  align-items: center;
}

.book-cover {
  width: 50px;
  height: 70px;
  margin-right: 10px;
  border-radius: 4px;
  object-fit: cover;
}

.book-details {
  display: flex;
  flex-direction: column;
  
  .book-title {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .book-author {
    font-size: 12px;
    color: #666;
  }
}

.borrow-detail {
  .detail-header {
    display: flex;
    margin-bottom: 20px;
    
    .detail-cover {
      width: 120px;
      height: 180px;
      border-radius: 4px;
      margin-right: 20px;
    }
    
    .detail-info {
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
      }
      
      p {
        margin: 5px 0;
        color: #666;
      }
    }
  }
  
  .detail-body {
    margin-top: 20px;
  }
}
</style> 