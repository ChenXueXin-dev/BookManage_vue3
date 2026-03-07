<template>
  <div class="borrow-container">
    <div class="back-navigation">
      <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
    </div>
    
    <div class="borrow-content">
      <div class="borrow-left">
        <div class="book-info" v-if="book">
          <div class="book-cover">
            <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" :alt="book.title" />
          </div>
          <div class="book-rating">
            <el-rate
              v-model="book.avgScore"
              disabled
              text-color="#ff9900"
              score-template="{value}"
            />
            <span class="rating-value">{{ book.avgScore }}</span>
          </div>
        </div>
      </div>
      
      <div class="borrow-right">
        <div class="borrow-box">
          <div class="borrow-header">
            <h2 class="section-title">借阅确认</h2>
          </div>
          
          <el-form :model="borrowForm" :rules="rules" ref="borrowFormRef" class="borrow-form" v-loading="loading">
            <div class="book-details">
              <h3 class="book-title">{{ book?.title }}</h3>
              <p><span class="label">作者:</span> {{ book?.author }}</p>
              <p><span class="label">出版社:</span> {{ book?.publisher }}</p>
              <p><span class="label">分类:</span> {{ book?.categoryName }}</p>
              <p><span class="label">库存:</span> {{ book?.stock }} 本</p>
            </div>
            
            <el-divider />
            
            <el-form-item label="借阅天数" prop="days">
              <el-select v-model="borrowForm.days" placeholder="请选择借阅天数">
                <el-option :value="7" label="7天"></el-option>
                <el-option :value="14" label="14天"></el-option>
                <el-option :value="30" label="30天"></el-option>
              </el-select>
            </el-form-item>
            
            <div class="borrow-summary">
              <p><strong>借阅日期:</strong> {{ formatDate(new Date()) }}</p>
              <p><strong>应还日期:</strong> {{ calculateReturnDate() }}</p>
            </div>
            
            <div class="borrow-notice">
              <p>借阅须知：</p>
              <ol>
                <li>借阅申请提交后，需等待管理员审核。审核通过后即可开始借阅。</li>
                <li>请在借阅期限内归还图书，逾期将影响您的借阅信用。</li>
                <li>爱护图书，如有损坏需照价赔偿。</li>
                <li>借阅期间可申请续借，每本书最多可续借2次。</li>
              </ol>
            </div>
            
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleBorrow" class="borrow-button">
                提交借阅申请
              </el-button>
              <el-button @click="goBack" class="cancel-button">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const bookId = route.params.id
const borrowFormRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const book = ref(null)
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif'

const borrowForm = reactive({
  bookId: bookId,
  days: 14
})

const rules = {
  days: [
    { required: true, message: '请选择借阅天数', trigger: 'change' }
  ]
}

// 获取图书详情
const fetchBookDetail = async () => {
  loading.value = true
  try {
    const res = await request.get(`/book/${bookId}`)
    book.value = res
    
    // 检查库存
    if (book.value.stock <= 0) {
      ElMessage.warning('该图书当前无库存，无法借阅')
      setTimeout(() => {
        router.push('/book/detail/' + bookId)
      }, 1500)
    }
  } catch (error) {
    console.error('获取图书详情失败:', error)
    ElMessage.error('获取图书详情失败')
    router.push('/book/list')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 计算归还日期
const calculateReturnDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + borrowForm.days)
  return formatDate(date)
}

// 处理借阅
const handleBorrow = () => {
  borrowFormRef.value.validate(async valid => {
    if (valid) {
      submitting.value = true
      try {
        const userStore = useUserStore();
        await request.post('/borrow/book', borrowForm, {
          params: {
            userId: userStore.userId
          },
          successMsg: '借阅成功',
          onSuccess: (data) => {
            ElMessage.success('借阅申请已提交，请等待审核')
            router.push('/user/borrow')
          },
          onError: (error) => {
            console.error('借阅失败:', error)
          }
        })
      } finally {
        submitting.value = false
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchBookDetail()
})
</script>

<style lang="scss" scoped>
.borrow-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 25px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.back-navigation {
  margin-bottom: 25px;
}

.borrow-content {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.borrow-left {
  flex: 0 0 300px;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.book-cover {
  width: 200px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.book-rating {
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  .rating-value {
    margin-left: 8px;
    color: #ff9900;
    font-weight: bold;
  }
}

.borrow-right {
  flex: 1;
  padding: 30px;
}

.borrow-box {
  max-width: 700px;
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

.borrow-form {
  margin-top: 20px;
}

.book-details {
  margin-bottom: 20px;
  
  .book-title {
    font-size: 20px;
    margin-bottom: 15px;
    color: #333;
  }
  
  p {
    margin: 8px 0;
    font-size: 15px;
    color: #555;
    display: flex;
    align-items: center;
  }
  
  .label {
    color: #333;
    font-weight: 500;
    min-width: 80px;
    display: inline-block;
  }
}

.borrow-summary {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  p {
    margin: 8px 0;
    color: #333;
  }
}

.borrow-notice {
  margin: 20px 0;
  padding: 15px;
  background-color: #fff8e6;
  border-radius: 8px;
  border-left: 4px solid #ffcc00;
  
  p {
    margin: 5px 0;
    color: #333;
    font-weight: bold;
  }
  
  ol {
    margin: 10px 0 0 20px;
    padding: 0;
    
    li {
      margin-bottom: 5px;
      color: #666;
    }
  }
}

.borrow-button {
  background: linear-gradient(135deg, #409eff 0%, #5352ed 100%);
  border: none;
  padding: 12px 25px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(83, 82, 237, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(83, 82, 237, 0.3);
    background: linear-gradient(135deg, #5a9eff 0%, #6a6aff 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.cancel-button {
  margin-left: 15px;
}

@media (max-width: 768px) {
  .borrow-content {
    flex-direction: column;
  }
  
  .borrow-left {
    flex: 0 0 auto;
    width: 100%;
    max-width: 100%;
    padding: 20px;
  }
  
  .borrow-right {
    padding: 20px;
  }
  
  .book-cover {
    width: 150px;
    height: 225px;
  }
}
</style> 