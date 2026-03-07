<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <template #header>
        <div class="welcome-header">
          <el-avatar :size="64" :src="'/api'+userInfo?.avatar">
            {{ userInfo?.name?.charAt(0) }}
          </el-avatar>
          <div class="welcome-info">
            <h2>欢迎回来, {{ userInfo?.name || userInfo?.username }}</h2>
            <p>{{ currentTime }}</p>
          </div>
        </div>
      </template>
      <div class="role-info">
        <el-tag>{{ roleLabel }}</el-tag>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>图书总数</span>
            <el-icon><component :is="'Reading'" /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-number">{{ stats.bookCount || 0 }}</div>
          <div class="stat-desc">系统中的图书总数</div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>分类数量</span>
            <el-icon><component :is="'Folder'" /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-number">{{ stats.categoryCount || 0 }}</div>
          <div class="stat-desc">系统中的分类总数</div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>借阅总数</span>
            <el-icon><component :is="'Paperclip'" /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-number">{{ stats.borrowCount || 0 }}</div>
          <div class="stat-desc">系统中的借阅总次数</div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>用户总数</span>
            <el-icon><component :is="'User'" /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="stat-number">{{ stats.userCount || 0 }}</div>
          <div class="stat-desc">系统中的注册用户数</div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <!-- 图书分类分布饼图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>图书分类分布</span>
            <el-icon><component :is="'PieChart'" /></el-icon>
          </div>
        </template>
        <div id="category-pie-chart" class="chart-box"></div>
      </el-card>

      <!-- 借阅趋势折线图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>借阅趋势</span>
            <el-icon><component :is="'TrendCharts'" /></el-icon>
          </div>
        </template>
        <div id="borrow-trend-chart" class="chart-box"></div>
      </el-card>
    </div>

    <div class="chart-container">
      <!-- 用户活跃度柱状图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>高分图书</span>
            <el-icon><component :is="'Star'" /></el-icon>
          </div>
        </template>
        <div id="top-rated-books-chart" class="chart-box"></div>
      </el-card>

      <!-- 热门图书排行 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>热门图书排行</span>
            <el-icon><component :is="'Medal'" /></el-icon>
          </div>
        </template>
        <div id="hot-books-chart" class="chart-box"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
import * as echarts from 'echarts'
import { 
  PieChart, TrendCharts, DataAnalysis, Medal,
  User, List, Folder, Paperclip, Reading, Star
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 角色标签
const roleLabel = computed(() => {
  const roleMap = {
    'ADMIN': '系统管理员',
    'USER': '普通用户',
    'LIBRARIAN': '图书管理员'
  }
  return roleMap[userInfo.value?.roleType] || '未知角色'
})

// 统计数据
const stats = ref({
  bookCount: 0,
  categoryCount: 0,
  borrowCount: 0,
  userCount: 0
})

// ECharts实例对象
const charts = {
  categoryPieChart: null,
  borrowTrendChart: null,
  topRatedBooksChart: null,
  hotBooksChart: null
}

// 图表数据
const chartData = ref({
  categoryData: [],
  borrowTrendData: [],
  topRatedBooksData: [],
  hotBooksData: []
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await request.get('/system/stats')
    stats.value = res || {
      bookCount: 0,
      categoryCount: 0,
      borrowCount: 0,
      userCount: 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 设置模拟数据
    stats.value = {
      bookCount: 256,
      categoryCount: 12,
      borrowCount: 384,
      userCount: 128
    }
  }
}

// 获取图表数据
const fetchChartData = async () => {
  try {
    // 获取分类分布数据
    const categoryRes = await request.get('/system/chart/category-distribution')
    chartData.value.categoryData = categoryRes || []

    // 获取借阅趋势数据
    const borrowTrendRes = await request.get('/system/chart/borrow-trend')
    chartData.value.borrowTrendData = borrowTrendRes || []

    // 获取高分图书数据
    const topRatedBooksRes = await request.get('/system/chart/top-rated-books')
    chartData.value.topRatedBooksData = topRatedBooksRes || []

    // 获取热门图书数据
    const hotBooksRes = await request.get('/system/chart/hot-books')
    chartData.value.hotBooksData = hotBooksRes || []
  } catch (error) {
    console.error('获取图表数据失败:', error)
    // 设置模拟数据
    generateMockData()
  }

  // 渲染图表
  nextTick(() => {
    initCharts()
  })
}

// 生成模拟数据
const generateMockData = () => {
  // 分类分布模拟数据
  chartData.value.categoryData = [
    { name: '小说', value: 120 },
    { name: '散文', value: 45 },
    { name: '诗歌', value: 30 },
    { name: '计算机', value: 85 },
    { name: '人工智能', value: 50 },
    { name: '编程语言', value: 70 },
    { name: '经济管理', value: 40 },
    { name: '历史', value: 35 }
  ]

  // 借阅趋势模拟数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const borrowData = [35, 42, 50, 63, 58, 72, 80, 85, 76, 70, 65, 60]
  const returnData = [30, 38, 45, 58, 52, 65, 75, 80, 70, 62, 58, 55]
  
  chartData.value.borrowTrendData = {
    months,
    borrowData,
    returnData
  }

  // 高分图书模拟数据
  chartData.value.topRatedBooksData = [
    { name: '活着', rating: 9.8 },
    { name: '三体', rating: 9.7 },
    { name: '百年孤独', rating: 9.6 },
    { name: '人类简史', rating: 9.5 },
    { name: '围城', rating: 9.4 },
    { name: '红楼梦', rating: 9.3 },
    { name: '高效能人士的七个习惯', rating: 9.2 }
  ]

  // 热门图书模拟数据
  chartData.value.hotBooksData = [
    { name: '平凡的世界', count: 185 },
    { name: '三体', count: 165 },
    { name: '解忧杂货店', count: 142 },
    { name: '活着', count: 125 },
    { name: '围城', count: 118 },
    { name: '红楼梦', count: 98 },
    { name: 'Python编程：从入门到实践', count: 92 },
    { name: '小狗钱钱', count: 88 }
  ]
}

// 初始化图表
const initCharts = () => {
  // 初始化图书分类分布饼图
  initCategoryPieChart()
  
  // 初始化借阅趋势折线图
  initBorrowTrendChart()
  
  // 初始化高分图书柱状图
  initTopRatedBooksChart()
  
  // 初始化热门图书排行图
  initHotBooksChart()
}

// 初始化分类分布饼图
const initCategoryPieChart = () => {
  const chartDom = document.getElementById('category-pie-chart')
  if (!chartDom) return
  
  charts.categoryPieChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: chartData.value.categoryData.map(item => item.name)
    },
    series: [
      {
        name: '图书分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value.categoryData
      }
    ]
  }
  
  charts.categoryPieChart.setOption(option)
}

// 初始化借阅趋势折线图
const initBorrowTrendChart = () => {
  const chartDom = document.getElementById('borrow-trend-chart')
  if (!chartDom) return
  
  charts.borrowTrendChart = echarts.init(chartDom)
  
  const { months, borrowData, returnData } = chartData.value.borrowTrendData
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['借出', '归还']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '借出',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8
        },
        data: borrowData
      },
      {
        name: '归还',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8
        },
        data: returnData
      }
    ]
  }
  
  charts.borrowTrendChart.setOption(option)
}

// 初始化高分图书柱状图
const initTopRatedBooksChart = () => {
  const chartDom = document.getElementById('top-rated-books-chart')
  if (!chartDom) return
  
  charts.topRatedBooksChart = echarts.init(chartDom)
  
  // 确保数据存在
  if (!chartData.value.topRatedBooksData || chartData.value.topRatedBooksData.length === 0) {
    charts.topRatedBooksChart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    })
    return
  }
  
  const data = [...chartData.value.topRatedBooksData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 7)
    .map(item => ({
      ...item,
      rating: parseFloat(item.rating.toFixed(1)) // 保留一位小数
    }))
  
  const bookNames = data.map(item => item.name)
  const ratings = data.map(item => item.rating)
  
  // 计算y轴范围，最小值为最低分数的90%（但不低于0），最大值为5或稍高于最高分
  const minRating = Math.max(0, Math.floor(Math.min(...ratings) * 0.9))
  const maxRating = Math.min(5, Math.ceil(Math.max(...ratings) * 1.05))
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 分'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: bookNames,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: 0,
          rotate: 30,
          width: 100,
          overflow: 'truncate'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: minRating,
        max: maxRating,
        name: '评分',
        nameLocation: 'end',
        axisLabel: {
          formatter: '{value} 分'
        }
      }
    ],
    series: [
      {
        name: '图书评分',
        type: 'bar',
        barWidth: '60%',
        data: ratings.map((value, index) => {
          return {
            value,
            itemStyle: {
              // 根据评分值设置不同的颜色
              color: getRatingColor(value)
            }
          }
        }),
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 分'
        }
      }
    ]
  }
  
  charts.topRatedBooksChart.setOption(option)
}

// 根据评分值获取颜色（基于5分制）
const getRatingColor = (rating) => {
  if (rating >= 4.5) {
    // 金色渐变 - 优秀
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#FFD700' },
      { offset: 0.5, color: '#FFA500' },
      { offset: 1, color: '#FF8C00' }
    ])
  } else if (rating >= 4.0) {
    // 绿色渐变 - 良好
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#52c41a' },
      { offset: 0.5, color: '#73d13d' },
      { offset: 1, color: '#95de64' }
    ])
  } else if (rating >= 3.5) {
    // 蓝色渐变 - 一般
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#1890ff' },
      { offset: 0.5, color: '#40a9ff' },
      { offset: 1, color: '#69c0ff' }
    ])
  } else {
    // 灰色渐变 - 较差
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#8c8c8c' },
      { offset: 0.5, color: '#bfbfbf' },
      { offset: 1, color: '#d9d9d9' }
    ])
  }
}

// 初始化热门图书排行图
const initHotBooksChart = () => {
  const chartDom = document.getElementById('hot-books-chart')
  if (!chartDom) return
  
  charts.hotBooksChart = echarts.init(chartDom)
  
  const data = chartData.value.hotBooksData.sort((a, b) => b.count - a.count)
  const bookNames = data.map(item => item.name)
  const bookCounts = data.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: bookNames.reverse(),
      axisLabel: {
        interval: 0,
        width: 100,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: '借阅次数',
        type: 'bar',
        data: bookCounts.reverse(),
        itemStyle: {
          color: function(params) {
            const colorList = [
              '#f56c6c', '#f56c6c', '#e6a23c', '#e6a23c',
              '#5cb87a', '#5cb87a', '#5cb87a', '#5cb87a'
            ]
            return colorList[params.dataIndex] || '#5cb87a'
          }
        }
      }
    ]
  }
  
  charts.hotBooksChart.setOption(option)
}

// 当前时间
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }
  currentTime.value = now.toLocaleDateString('zh-CN', options)
}

// 处理窗口大小变化
const handleResize = () => {
  for (const key in charts) {
    if (charts[key]) {
      charts[key].resize()
    }
  }
}

let timer = null

onMounted(() => {
  updateTime()
  // 每分钟更新一次时间
  timer = setInterval(updateTime, 60000)
  
  // 获取统计数据和图表数据
  fetchStats()
  fetchChartData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  for (const key in charts) {
    if (charts[key]) {
      charts[key].dispose()
      charts[key] = null
    }
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  
  .welcome-card {
    margin-bottom: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-header {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .el-avatar {
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }
      
      .welcome-info {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          background: linear-gradient(to right, #409eff, #67c23a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientText 6s infinite;
        }
        p {
          margin: 0;
          color: #666;
        }
      }
    }
    
    .role-info {
      margin-top: 16px;
    }
  }
  
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    .stat-card {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .el-icon {
          font-size: 20px;
          color: #409eff;
        }
      }
      
      .card-content {
        text-align: center;
        padding: 10px 0;
        
        .stat-number {
          font-size: 36px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .stat-desc {
          font-size: 14px;
          color: #909399;
        }
      }
      
      &:nth-child(1) {
        .el-icon {
          color: #409eff;
        }
        .stat-number {
          color: #409eff;
        }
      }
      
      &:nth-child(2) {
        .el-icon {
          color: #67c23a;
        }
        .stat-number {
          color: #67c23a;
        }
      }
      
      &:nth-child(3) {
        .el-icon {
          color: #e6a23c;
        }
        .stat-number {
          color: #e6a23c;
        }
      }
      
      &:nth-child(4) {
        .el-icon {
          color: #f56c6c;
        }
        .stat-number {
          color: #f56c6c;
        }
      }
    }
  }
  
  .chart-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
    
    .chart-card {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart-box {
        height: 350px;
        width: 100%;
      }
    }
  }
}

// 添加全局进入动画
.dashboard {
  animation: fadeInUp 0.8s ease;
}

@keyframes gradientText {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 