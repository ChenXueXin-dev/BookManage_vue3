<template>
  <div class="dashboard">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <p class="welcome-time">{{ currentTime }}</p>
      <div class="welcome-bg"></div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">
            <el-icon>
              <Reading />
            </el-icon>
            <span>图书总数</span>
          </p>
          <h3 class="stat-value">{{ stats.bookCount || 0 }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">
            <el-icon>
              <Folder />
            </el-icon>
            <span>分类数量</span>
          </p>
          <h3 class="stat-value">{{ stats.categoryCount || 0 }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">
            <el-icon>
              <Paperclip />
            </el-icon>
            <span>借阅总数</span>
          </p>
          <h3 class="stat-value">{{ stats.borrowCount || 0 }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">
            <el-icon>
              <User />
            </el-icon>
            <span>用户总数</span>
          </p>
          <h3 class="stat-value">{{ stats.userCount || 0 }}</h3>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 图书分类分布饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>图书分类分布</h3>
          <el-icon class="chart-icon">
            <PieChart />
          </el-icon>
        </div>
        <div id="category-pie-chart" class="chart-content"></div>
      </div>

      <!-- 借阅趋势折线图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>借阅趋势</h3>
          <el-icon class="chart-icon">
            <TrendCharts />
          </el-icon>
        </div>
        <div id="borrow-trend-chart" class="chart-content"></div>
      </div>

      <!-- 高分图书 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>高分图书</h3>
          <el-icon class="chart-icon">
            <Star />
          </el-icon>
        </div>
        <div id="top-rated-books-chart" class="chart-content"></div>
      </div>

      <!-- 热门图书排行 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>热门图书排行</h3>
          <el-icon class="chart-icon">
            <Medal />
          </el-icon>
        </div>
        <div id="hot-books-chart" class="chart-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import request from '@/utils/request'
import * as echarts from 'echarts'
import {
  User, Folder, Paperclip, Reading, PieChart, TrendCharts, Star, Medal
} from '@element-plus/icons-vue'

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

// 定义主题色（浅色系）
const themeColors = {
  blue: {
    main: '#3b82f6',
    light: '#eff6ff',
    gradient: ['#3b82f6', '#bedbff']
  },
  green: {
    main: '#10b981',
    light: '#f0fdfa',
    gradient: ['#10b981', '#c6ffea']
  },
  orange: {
    main: '#f59e0b',
    light: '#fffbeb',
    gradient: ['#f59e0b', '#ffecbd']
  },
  red: {
    main: '#ef4444',
    light: '#fef2f2',
    gradient: ['#ef4444', '#ffbdbd']
  },
  text: '#64748b', // 文字颜色
  border: '#e2e8f0', // 边框颜色
  split: '#f1f5f9'  // 分割线颜色
}

// 初始化分类分布饼图
// 初始化分类分布饼图
const initCategoryPieChart = () => {
  const chartDom = document.getElementById('category-pie-chart')
  if (!chartDom) return

  charts.categoryPieChart = echarts.init(chartDom)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: themeColors.border,
      borderWidth: 1,
      textStyle: {
        color: themeColors.text
      }
    },
    legend: {
      // 关键修改：改为水平显示在底部
      orient: 'horizontal', // 水平排列
      bottom: 10, // 距离底部10px
      left: 'center', // 水平居中
      // 图例项水平排列时的间距
      itemGap: 15,
      // 图例文字大小
      textStyle: {
        color: themeColors.text,
        fontSize: 12
      },
      data: chartData.value.categoryData.map(item => item.name)
    },
    series: [
      {
        name: '图书分类',
        type: 'pie',
        radius: ['30%', '60%'], // 调整饼图大小，给底部图例留出空间
        center: ['50%', '40%'], // 调整饼图位置（上移，避免和图例重叠）
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
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
            fontSize: '16',
            fontWeight: '600',
            color: themeColors.text
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value.categoryData,
        // 使用对应主题色的浅色系
        color: [
          themeColors.blue.main,
          themeColors.green.main,
          themeColors.orange.main,
          themeColors.red.main,
          '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
        ]
      }
    ],
    backgroundColor: 'transparent'
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
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: themeColors.border,
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: themeColors.text
      }
    },
    legend: {
      data: ['借出', '归还'],
      textStyle: {
        color: themeColors.text
      },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisLine: {
        lineStyle: {
          color: themeColors.border
        }
      },
      axisLabel: {
        color: themeColors.text
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: themeColors.split
        }
      },
      axisLabel: {
        color: themeColors.text
      }
    },
    series: [
      {
        name: '借出',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: themeColors.blue.main
        },
        itemStyle: {
          color: themeColors.blue.main,
          borderRadius: 4
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: themeColors.blue.light
          }, {
            offset: 1,
            color: 'rgba(239, 246, 255, 0.05)'
          }])
        },
        data: borrowData
      },
      {
        name: '归还',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: themeColors.green.main
        },
        itemStyle: {
          color: themeColors.green.main,
          borderRadius: 4
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: themeColors.green.light
          }, {
            offset: 1,
            color: 'rgba(240, 253, 250, 0.05)'
          }])
        },
        data: returnData
      }
    ],
    backgroundColor: 'transparent'
  }

  charts.borrowTrendChart.setOption(option)
}

// 初始化高分图书柱状图（修复：暂无数据 + 只显示前5个）
const initTopRatedBooksChart = () => {
  const chartDom = document.getElementById('top-rated-books-chart')
  if (!chartDom) return

  charts.topRatedBooksChart = echarts.init(chartDom)

  // 修复1：判断数据是否为空（修正了之前的错误判断）
  if (!chartData.value.topRatedBooksData || chartData.value.topRatedBooksData.length === 0) {
    charts.topRatedBooksChart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: themeColors.text,
          fontSize: 16
        }
      },
      backgroundColor: 'transparent'
    })
    return
  }

  // 修复2：只取前5个高分图书
  const data = [...chartData.value.topRatedBooksData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5) // 改为5，之前是7
    .map(item => ({
      ...item,
      rating: parseFloat(item.rating.toFixed(1))
    }))

  const bookNames = data.map(item => item.name)
  const ratings = data.map(item => item.rating)

  // 计算y轴范围
  const minRating = Math.max(0, Math.floor(Math.min(...ratings) * 0.9))
  const maxRating = Math.min(10, Math.ceil(Math.max(...ratings) * 1.05))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 分',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: themeColors.border,
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: themeColors.text
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: bookNames,
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: themeColors.border
          }
        },
        axisLabel: {
          interval: 0,
          rotate: 30,
          width: 100,
          overflow: 'truncate',
          color: themeColors.text
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
        nameTextStyle: {
          color: themeColors.text
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: themeColors.split
          }
        },
        axisLabel: {
          formatter: '{value} 分',
          color: themeColors.text
        }
      }
    ],
    series: [
      {
        name: '图书评分',
        type: 'bar',
        barWidth: '40%',
        data: ratings.map((value) => ({
          value,
          itemStyle: {
            color: echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: themeColors.orange.gradient[0] },
              { offset: 1, color: themeColors.orange.gradient[1] }
            ])
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 分',
          color: themeColors.text,
          fontWeight: 600
        }
      }
    ],
    backgroundColor: 'transparent'
  }

  charts.topRatedBooksChart.setOption(option)
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
      },
      formatter: '{b}: {c} 次',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: themeColors.border,
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: themeColors.text
      }
    },
    grid: {
      left: '8%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: themeColors.split
        }
      },
      axisLabel: {
        color: themeColors.text
      }
    },
    yAxis: {
      type: 'category',
      data: bookNames.reverse(),
      axisLine: {
        lineStyle: {
          color: themeColors.border
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        interval: 0,
        width: 120,
        overflow: 'truncate',
        color: themeColors.text
      }
    },
    series: [
      {
        name: '借阅次数',
        type: 'bar',
        data: bookCounts.reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: themeColors.red.gradient[0] },
            { offset: 1, color: themeColors.red.gradient[1] }
          ]),
          borderRadius: [0, 6, 6, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: themeColors.text,
          fontWeight: 600
        }
      }
    ],
    backgroundColor: 'transparent'
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
// 全局样式变量
$primary: #79acff;
$success: #3ec99a;
$warning: #ffbf51;
$danger: #ff7a7a;
$purple: #8b5cf6;
$dark: #64748b;
$gray-100: #f1f5f9;
$gray-200: #e2e8f0;
$gray-400: #94a3b8;
$text-primary: #64748b;
$gray-600: #64748b;
$shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.04);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

.dashboard {
  max-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 24px;
}

// 欢迎区域样式
.welcome-section {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 40%, #dbeafe 100%);
  border-radius: $radius-lg;
  padding: 32px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: $shadow-md;

  .welcome-time {
    color: $text-primary;
    font-size: 36px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    transition: $transition-normal;
    background: linear-gradient(135deg, #4F9DFB, #31db94 40%, #31db94);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }

  .welcome-bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 1;
  }
}

// 统计卡片样式
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
  margin-bottom: 24px;

  .stat-card {
    &:nth-child(1) {
      background: linear-gradient(135deg, $primary, #bedbff);
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, $success, #c6ffea);
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, $warning, #ffecbd);
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, $danger, #ffbdbd);
    }

    border-radius: $radius-md;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 25px;
    transition: $transition;
    box-shadow: $shadow-md;

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 36px;
        color: #fff;
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 20px;
          color: #fff;
        }
      }

      .stat-value {
        margin: 0 0 4px 0;
        font-size: 36px;
        font-weight: 600;
        color: #fff;
      }

      .stat-desc {
        margin: 0;
        font-size: 12px;
        color: $gray-400;
      }
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .chart-card {
    background: #ffffff;
    border-radius: $radius-md;
    padding: 20px;
    box-shadow: $shadow-sm;
    transition: $transition;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-md;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: $dark;
      }

      .chart-icon {
        font-size: 18px;
        color: #fff;
      }
    }

    .chart-content {
      width: 100%;
      height: 320px;
    }
  }
}

// 响应式适配
@media (max-width: 1400px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    /* 中屏2列 */
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-section {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    /* 小屏1列 */
  }

  .chart-card .chart-content {
    height: 280px;
  }
}

@media (max-width: 480px) {
  .chart-card .chart-content {
    height: 240px;
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>