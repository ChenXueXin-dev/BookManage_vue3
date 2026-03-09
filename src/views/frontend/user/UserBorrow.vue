<template>
  <div class="user-borrow-container">
    <div class="page-header">
      <div class="category-reset">
        <h2 class="section-title">我的借阅</h2>
      </div>
      <div class="sort-options">
        <span class="sort-label">显示模式:</span>
        <div class="sort-buttons">
          <button v-for="option in sortOptions" :key="option.value"
            :class="['sort-btn', { active: sortOption === option.value }]" @click="handleSortChange(option.value)">
            {{ option.label }}
          </button>

        </div>
      </div>
    </div>


    <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="custom-tabs">
      <el-tab-pane label="待审核" name="pending"></el-tab-pane>
      <el-tab-pane label="借阅中" name="borrowing"></el-tab-pane>
      <el-tab-pane label="已归还" name="returned"></el-tab-pane>
      <el-tab-pane label="已逾期" name="overdue"></el-tab-pane>
      <el-tab-pane label="全部记录" name="all"></el-tab-pane>
    </el-tabs>

    <div class="borrow-list" v-loading="loading">
      <el-empty v-if="borrowList.length === 0" description="暂无借阅记录"></el-empty>

      <div v-else-if="sortOption === 'card'" class="borrow-cards">
        <div v-for="borrow in borrowList" :key="borrow.id" class="borrow-card">
          <div class="book-cover">
            <img :src="borrow.coverUrl ? ('/api' + borrow.coverUrl) : defaultCover" :alt="borrow.bookTitle" />
          </div>
          <div class="borrow-info">
            <h3 class="book-title">{{ borrow.bookTitle }}</h3>
            <p class="book-author">作者: {{ borrow.author }}</p>
            <div class="borrow-details">
              <p><span class="label">借阅日期:</span> {{ formatDateTime(borrow.borrowTime) }}</p>
              <p><span class="label">应还日期:</span> {{ formatDateTime(borrow.planReturnTime) }}</p>
              <p v-if="borrow.status === 2">
                <span class="label">到期倒计时:</span>
                <span :class="getExpiryCountdownClass(borrow.planReturnTime)">
                  {{ getExpiryCountdown(borrow.planReturnTime) }}
                </span>
              </p>
              <p v-if="borrow.actualReturnTime">
                <span class="label">实际归还:</span> {{ formatDateTime(borrow.actualReturnTime) }}
              </p>
              <p><span class="label">续借次数:</span> {{ borrow.renewCount }} 次</p>
              <p><span class="label">状态:</span> <span :class="'status-' + getStatusClass(borrow.status)">{{
                getStatusText(borrow.status) }}</span></p>
            </div>
            <div v-if="borrow.status === 1" class="borrow-tip">
              <el-alert title="借阅申请正在审核中，请耐心等待" type="info" :closable="false" show-icon />
            </div>
            <div v-if="borrow.status === 5" class="borrow-tip">
              <el-alert title="很抱歉，您的借阅申请被拒绝" type="error" :closable="false" show-icon />
            </div>
            <div v-if="borrow.status === 2 && isAboutToExpire(borrow.planReturnTime)" class="borrow-tip">
              <el-alert :title="`该书将于 ${formatDateTime(borrow.planReturnTime)} 到期，请及时归还或续借`" type="warning"
                :closable="false" show-icon />
            </div>
            <div v-if="borrow.status === 4" class="borrow-tip">
              <el-alert title="该书已逾期，请尽快归还！" type="error" :closable="false" show-icon />
            </div>
            <div class="borrow-actions">
              <el-button v-if="borrow.status === 1" type="danger" class="cancel-btn" @click="handleCancel(borrow)">
                取消申请
              </el-button>
              <el-button v-if="borrow.status === 2" type="primary" class="return-btn" @click="handleReturn(borrow)">
                归还图书
              </el-button>
              <el-button v-if="borrow.status === 2 && borrow.renewCount < maxRenewCount" type="success"
                class="renew-btn" @click="handleRenew(borrow)">
                续借
              </el-button>
              <el-button v-if="borrow.status === 4" type="warning" class="overdue-btn" @click="handleReturn(borrow)">
                立即归还
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="sortOption === 'table' && borrowList.length > 0" class="borrow-history">
        <el-table :data="borrowList" style="width: 100%">
          <el-table-column prop="bookTitle" label="图书名称" />
          <el-table-column prop="borrowTime" label="借阅日期" />
          <el-table-column prop="returnTime" label="归还日期" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === '已归还' ? 'success' : 'warning'">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
          :current-page="currentPage" @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const loading = ref(false)
const borrowList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref('borrowing')
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif'
const maxRenewCount = ref(2) // 最大续借次数，可以从系统配置获取
const userStore = useUserStore()
const expiryThreshold = ref(7) // 到期提醒阈值，默认7天
let timerInterval = null // 倒计时定时器
const sortOption = ref('card');

const sortOptions = [
  { label: '卡片', value: 'card' },
  { label: '表格', value: 'table' },
];

const handleSortChange = (e) => {
  sortOption.value = e
};


// 获取借阅记录
const fetchBorrowRecords = async () => {
  loading.value = true
  try {
    const status = getStatusByTab()
    const res = await request.get('/borrow/user/records', {
      userId: userStore.userId,
      status,
      currentPage: currentPage.value,
      size: pageSize.value
    })
    borrowList.value = res.records?.map((item) =>
    ({
      ...item,
      bookTitle: item.bookTitle || '未知书名',
      borrowTime: formatDate(item.borrowTime) || '',
      returnTime: formatDate(item.actualReturnTime) || '',
    })) || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取借阅记录失败:', error)
    ElMessage.error('获取借阅记录失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 如果转换失败，返回原字符串

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateString; // 出错时返回原字符串
  }
};

// 获取借阅状态文本
const getBorrowStatusText = (status) => {
  switch (status) {
    // 0:已取消,1:待审核,2:借阅中,3:已归还,4:已逾期,5:审核拒绝
    case 0: return '已取消';
    case 1: return '待审核';
    case 2: return '借阅中';
    case 3: return '已归还';
    case 4: return '已逾期';
    case 5: return '审核拒绝';
    default: return '未知状态';
  }
};


// 获取系统配置
const fetchSystemConfig = async () => {
  try {
    const res = await request.get('/system/config/borrow.expiry_reminder_days', {}, {
      showDefaultMsg: false
    })
    if (res && res.configValue) {
      expiryThreshold.value = parseInt(res.configValue) || 7
    }

    const renewRes = await request.get('/system/config/borrow.max_renew', {}, {
      showDefaultMsg: false
    })
    if (renewRes && renewRes.configValue) {
      maxRenewCount.value = parseInt(renewRes.configValue) || 2
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
  }
}

// 根据标签页获取状态值
const getStatusByTab = () => {
  switch (activeTab.value) {
    case 'pending':
      return 1
    case 'borrowing':
      return 2
    case 'returned':
      return 3
    case 'overdue':
      return 4
    default:
      return undefined
  }
}

// 处理标签页点击
const handleTabClick = () => {
  currentPage.value = 1
  fetchBorrowRecords()
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchBorrowRecords()
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

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 判断是否即将到期（在设定的天数内）
const isAboutToExpire = (planReturnTime) => {
  if (!planReturnTime) return false

  const now = new Date()
  const returnDate = new Date(planReturnTime)
  const diffTime = returnDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= expiryThreshold.value
}

// 获取到期倒计时
const getExpiryCountdown = (planReturnTime) => {
  if (!planReturnTime) return '未知'

  const now = new Date()
  const returnDate = new Date(planReturnTime)
  const diffTime = returnDate - now

  if (diffTime <= 0) {
    return '已逾期'
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return `${diffDays}天${diffHours}小时`
}

// 获取倒计时样式
const getExpiryCountdownClass = (planReturnTime) => {
  if (!planReturnTime) return ''

  const now = new Date()
  const returnDate = new Date(planReturnTime)
  const diffTime = returnDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return 'countdown-expired'
  } else if (diffDays <= 3) {
    return 'countdown-urgent'
  } else if (diffDays <= 7) {
    return 'countdown-warning'
  } else {
    return 'countdown-normal'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    // 0:已取消,1:待审核,2:借阅中,3:已归还,4:已逾期,5:审核拒绝
    case 0: return '已取消';
    case 1: return '待审核';
    case 2: return '借阅中';
    case 3: return '已归还';
    case 4: return '已逾期';
    case 5: return '审核拒绝';
    default: return '未知状态';
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0:
      return 'canceled'
    case 1:
      return 'pending'
    case 2:
      return 'borrowing'
    case 3:
      return 'returned'
    case 4:
      return 'overdue'
    case 5:
      return 'rejected'
    default:
      return ''
  }
}

// 归还图书
const handleReturn = (borrow) => {
  ElMessageBox.confirm('确定要归还图书《' + borrow.bookTitle + '》吗?', '归还确认', {
    confirmButtonText: '确定归还',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await request.post('/borrow/return', { id: borrow.id }, {
        params: {
          userId: userStore.userId
        },
        successMsg: '归还成功',
        onSuccess: () => {
          fetchBorrowRecords()
        }
      })
    } catch (error) {
      console.error('归还图书失败:', error)
    }
  }).catch(() => { })
}

// 续借图书
const handleRenew = (borrow) => {
  ElMessageBox.confirm('确定要续借图书《' + borrow.bookTitle + '》吗?', '续借确认', {
    confirmButtonText: '确定续借',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await request.post('/borrow/renew', { id: borrow.id }, {
        params: {
          userId: userStore.userId
        },
        successMsg: '续借成功',
        onSuccess: () => {
          fetchBorrowRecords()
        }
      })
    } catch (error) {
      console.error('续借图书失败:', error)
    }
  }).catch(() => { })
}

// 取消借阅
const handleCancel = (borrow) => {
  ElMessageBox.confirm('确定要取消借阅图书《' + borrow.bookTitle + '》吗?', '取消确认', {
    confirmButtonText: '确定取消',
    cancelButtonText: '返回',
    type: 'warning'
  }).then(async () => {
    try {
      await request.post('/borrow/cancel', { id: borrow.id }, {
        params: {
          userId: userStore.userId
        },
        successMsg: '取消借阅成功',
        onSuccess: () => {
          fetchBorrowRecords()
        }
      })
    } catch (error) {
      console.error('取消借阅失败:', error)
    }
  }).catch(() => { })
}

// 更新倒计时
const updateCountdowns = () => {
  // 强制更新组件，刷新倒计时
  borrowList.value = [...borrowList.value]
}

onMounted(() => {
  fetchBorrowRecords()
  fetchSystemConfig()

  // 每分钟更新一次倒计时
  timerInterval = setInterval(updateCountdowns, 60000)

  // 获取所有借阅提醒
  userStore.fetchAllNotifications()
})

onUnmounted(() => {
  // 清除定时器
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style lang="scss" scoped>
$text-secondary: #607D8B;
$primary-color: #4F9DFB;
$text-primary: #37474F;
$nav-gradient: linear-gradient(135deg, #f2fffa, #409EFF, #f2fffa);
$warning-color: #FFA726;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$box-shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.12);

.user-borrow-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 25px;
  background: linear-gradient(135deg, #f5efff 0%, #e0eeff 100%);
  box-shadow: $box-shadow-heavy;
  min-height: 100vh;
}


.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 25px;
  color: #333;
  padding-left: 15px;
  border-left: 4px solid #409EFF;
  display: flex;
  align-items: center;
}


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

    .total-label {
      margin-bottom: 16px;
    }
  }

  .category-reset {
    color: $text-secondary;
    width: 100%;
    font-size: 17px;
    font-weight: 500;
    align-items: center;
    color: $text-secondary;
    display: flex;

    .el-icon {
      margin-right: 10px;
      color: $primary-color;
      font-size: 18px;
    }

  }

  .total-label {
    display: flex;
    align-items: center;

    .total-text {
      font-size: 16px;
      font-weight: 500;
      color: $text-primary;
      margin-right: 10px;
    }

    .total-count {
      color: $primary-color;
      font-size: 28px;
      font-weight: 600;
      padding: 4px 12px;
    }
  }

  .sort-options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: end;
    width: 100%;

    .sort-label {
      margin-right: 15px;
      font-size: 15px;
      font-weight: 500;
      color: $text-primary;
    }

    .sort-buttons {
      display: flex;
      gap: 20px;

      .sort-btn {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        color: $text-secondary;
        font-size: 20px;
        font-weight: 500;
        transition: color 0.3s ease, transform 0.3s ease;
        position: relative;
        padding-bottom: 3px;

        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: $nav-gradient;
          transition: width $transition;
          border-radius: 1px;
        }

        &:hover {
          color: $primary-color;
          transform: translateY(-1px);
        }

        &.active {
          color: $primary-color;

          &:after {
            width: 100%;
          }
        }
      }
    }

    .sort-hint {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: $warning-color;
      margin-top: 8px;

      .el-icon {
        margin-right: 6px;
        font-size: 14px;
      }
    }

    @media (max-width: 768px) {
      width: 100%;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 4px;

      .sort-buttons {
        padding-right: 10px;
      }

      .sort-hint {
        margin-top: 6px;
        margin-left: 0;
      }
    }
  }
}


.filter-section {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.borrow-list {
  min-height: 300px;
}

.borrow-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.borrow-card {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}

.book-cover {
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  align-self: center;
  margin: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.borrow-info {
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .book-title {
    font-size: 18px;
    margin: 0 0 8px;
    color: #333;
    font-weight: 600;
  }

  .book-author {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
  }
}

.borrow-details {
  flex-grow: 1;

  p {
    margin: 8px 0;
    font-size: 14px;
    color: #555;

    .label {
      color: #333;
      font-weight: 500;
      margin-right: 8px;
      min-width: 80px;
      display: inline-block;
    }
  }

  .status-pending {
    color: #E6A23C;
    font-weight: 500;
  }

  .status-approved {
    color: #67C23A;
    font-weight: 500;
  }

  .status-borrowing {
    color: #409EFF;
    font-weight: 500;
  }

  .status-returned {
    color: #67C23A;
    font-weight: 500;
  }

  .status-overdue {
    color: #F56C6C;
    font-weight: 500;
  }

  .status-canceled {
    color: #909399;
    font-weight: 500;
  }

  .status-rejected {
    color: #F56C6C;
    font-weight: 500;
  }
}

.borrow-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.return-btn {
  background: $nav-gradient;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(83, 82, 237, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(83, 82, 237, 0.3);
    background: $nav-gradient;
  }

  &:active {
    transform: translateY(0);
  }
}

.renew-btn {
  background: linear-gradient(135deg, #67C23A 0%, #4CAF50 100%);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(103, 194, 58, 0.3);
    background: linear-gradient(135deg, #85CE61 0%, #5EC362 100%);
  }

  &:active {
    transform: translateY(0);
  }
}

.cancel-btn {
  background: linear-gradient(135deg, #F56C6C 0%, #e64a19 100%);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(245, 108, 108, 0.3);
    background: linear-gradient(135deg, #f78989 0%, #ff6e40 100%);
  }

  &:active {
    transform: translateY(0);
  }
}

.overdue-btn {
  background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(230, 162, 60, 0.3);
    background: linear-gradient(135deg, #EEBE77 0%, #F78989 100%);
  }

  &:active {
    transform: translateY(0);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.borrow-tip {
  margin-top: 15px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .borrow-cards {
    grid-template-columns: 1fr;
  }

  .borrow-card {
    flex-direction: column;
  }

  .book-cover {
    width: 140px;
    height: 210px;
    margin: 20px auto;
    align-self: center;
  }

  .borrow-info {
    padding: 0 15px 20px;
  }

  .borrow-actions {
    justify-content: center;
  }
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
  background: $nav-gradient;
}

:deep(.el-tabs__item.is-active) {
  color: $primary-color;
  font-weight: 600;
}

// 倒计时样式
.countdown-normal {
  color: #67C23A;
  font-weight: 500;
}

.countdown-warning {
  color: #E6A23C;
  font-weight: 500;
}

.countdown-urgent {
  color: #F56C6C;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.countdown-expired {
  color: #F56C6C;
  font-weight: 700;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>