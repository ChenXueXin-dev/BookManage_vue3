<template>
  <div class="rating-component">
    <el-rate
      v-model="currentScore"
      :disabled="disabled"
      :show-score="true"
      :colors="colors"
      score-template="{value}"
      @change="handleRateChange"
    />
    <div v-if="showTip" class="rating-tip">
      {{ ratingTip }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const props = defineProps({
  bookId: {
    type: Number,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showTip: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['rated'])

const currentScore = ref(0)
const loading = ref(false)
const colors = ['#99A9BF', '#F7BA2A', '#FF9900']

// 评分提示
const ratingTip = computed(() => {
  if (currentScore.value === 0) return '点击星星进行评分'
  if (currentScore.value === 1) return '很差'
  if (currentScore.value === 2) return '较差'
  if (currentScore.value === 3) return '一般'
  if (currentScore.value === 4) return '较好'
  if (currentScore.value === 5) return '很好'
  return ''
})

// 获取用户对图书的评分
const getUserRating = async () => {
  try {
    const res = await request.get(`/rating/user?bookId=${props.bookId}`)
    if (res !== null) {
      currentScore.value = res
    }
  } catch (error) {
    console.error('获取评分失败:', error)
  }
}

// 提交评分
const handleRateChange = async (value) => {
  if (props.disabled) return
  
  loading.value = true
  try {
    await request.post('/rating/add', { 
      bookId: props.bookId, 
      score: value 
    }, {
      successMsg: '评分成功'
    })
    
    // 触发评分完成事件
    emit('rated', value)
  } catch (error) {
    console.error('评分失败:', error)
    // 恢复原评分
    getUserRating()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getUserRating()
})
</script>

<style lang="scss" scoped>
.rating-component {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  .rating-tip {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
  }
}
</style> 