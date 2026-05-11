<template>
  <div class="ai-recommendation-container">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>AI图书推荐管理</span>
          <el-tag :type="aiEnabled ? 'success' : 'info'">
            {{ aiEnabled ? 'AI服务已启用' : 'AI服务未配置' }}
          </el-tag>
        </div>
      </template>

      <div class="search-form">
        <el-input v-model="searchUsername" placeholder="请输入用户名搜索" style="width: 300px" clearable
          @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" :loading="searchLoading">
          搜索
        </el-button>
        <el-button @click="fetchAllSummary" :loading="summaryLoading">
          获取所有用户汇总
        </el-button>
      </div>
    </el-card>

    <el-card class="result-card" v-if="searchResults.length > 0">
      <template #header>
        <span>搜索结果</span>
      </template>

      <el-table :data="searchResults" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="推荐图书" min-width="300">
          <template #default="{ row }">
            <div class="book-tags">
              <el-tag v-for="book in row.recommendations" :key="book.bookId" type="primary" effect="plain"
                style="margin: 2px">
                《{{ book.title }}》
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="preferenceSummary" label="AI偏好分析" min-width="200">
          <template #default="{ row }">
            <div class="summary-text">{{ row.preferenceSummary }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="summary-card" v-if="overallSummary">
      <template #header>
        <div class="card-header">
          <el-icon class="ai-icon">
            <Cpu />
          </el-icon>
          <span>AI整体分析报告</span>
        </div>
      </template>

      <div class="overall-summary">
        <div class="summary-content">{{ overallSummary }}</div>
      </div>

      <el-divider />

      <div class="user-list" v-if="allUsers.length > 0">
        <h4>用户推荐详情</h4>
        <el-table :data="allUsers" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="username" label="用户" width="120" />
          <el-table-column label="推荐图书" min-width="400">
            <template #default="{ row }">
              <div class="book-list">
                <div v-for="(book, index) in row.recommendations" :key="book.bookId" class="book-item">
                  <span class="book-index">{{ index + 1 }}.</span>
                  <span class="book-title">《{{ book.title }}》</span>
                  <span class="book-author">- {{ book.author }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-empty v-if="!searchResults.length && !overallSummary" description="请搜索用户或获取所有用户汇总" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Cpu } from '@element-plus/icons-vue'
import request from '@/utils/request'

const searchUsername = ref('')
const searchLoading = ref(false)
const summaryLoading = ref(false)
const searchResults = ref([])
const allUsers = ref([])
const overallSummary = ref('')
const aiEnabled = ref(false)

const handleSearch = async () => {
  if (!searchUsername.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  searchLoading.value = true
  try {
    const res = await request.get('/ai-recommendation/admin/search', {
      username: searchUsername.value
    }, { showDefaultMsg: false })
    searchResults.value = res || []
    if (res.length === 0) {
      ElMessage.info('未找到匹配的用户')
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searchLoading.value = false
  }
}

const fetchAllSummary = async () => {
  summaryLoading.value = true
  try {
    const res = await request.get('/ai-recommendation/admin/summary', null, { showDefaultMsg: false })
    console.log('AI汇总响应:', res)
    allUsers.value = res.users || []
    overallSummary.value = res.overallSummary || ''
    aiEnabled.value = res.aiEnabled || false
  } catch (error) {
    console.error('获取汇总失败:', error)
    ElMessage.error('获取汇总失败: ' + (error.message || '未知错误'))
  } finally {
    summaryLoading.value = false
  }
}

onMounted(() => {
  fetchAllSummary()
})
</script>

<style lang="scss" scoped>
.ai-recommendation-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-form {
      display: flex;
      gap: 12px;
    }
  }

  .result-card {
    margin-bottom: 20px;

    .book-tags {
      display: flex;
      flex-wrap: wrap;
    }

    .summary-text {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }

  .summary-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;

      .ai-icon {
        color: #667eea;
        font-size: 20px;
      }
    }

    .overall-summary {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      border-radius: 12px;
      padding: 20px;

      .summary-content {
        font-size: 15px;
        color: #333;
        line-height: 1.8;
      }
    }

    .user-list {
      h4 {
        margin-bottom: 16px;
        color: #333;
      }

      .book-list {
        .book-item {
          padding: 4px 0;

          .book-index {
            color: #667eea;
            font-weight: 600;
            margin-right: 8px;
          }

          .book-title {
            color: #333;
            font-weight: 500;
          }

          .book-author {
            color: #999;
            font-size: 13px;
            margin-left: 8px;
          }
        }
      }
    }
  }
}
</style>
