<template>
  <el-button v-if="isIcon" :type="isCollected ? 'warning' : ''" circle :icon="Star"
    @click="toggleCollection" />
  <el-button v-else :type="isCollected ? 'danger' : 'warning'" :icon="isCollected ? Star : StarFilled"
    :loading="loading" @click="toggleCollection" class="collection-btn" size="small">
    {{ isCollected ? '已收藏' : '收藏' }}
  </el-button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'

const props = defineProps({
  bookId: {
    type: Number,
    required: true
  },
  isIcon: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const isCollected = ref(false)
const loading = ref(false)

// 检查是否已收藏
const checkCollection = async () => {
  // 如果未登录，不需要检查收藏状态
  if (!localStorage.getItem('token')) {
    return
  }

  try {
    const res = await request.get(`/collection/check?bookId=${props.bookId}`)
    isCollected.value = res
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleCollection = async () => {
  if (!props.bookId) return

  // 检查是否登录
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再进行收藏')
    router.push('/login?redirect=' + encodeURIComponent(route.fullPath))
    return
  }

  loading.value = true
  try {
    if (isCollected.value) {
      // 取消收藏
      await request.post('/collection/cancel', { bookId: props.bookId }, {
        successMsg: '已取消收藏'
      })
      isCollected.value = false
    } else {
      // 添加收藏
      await request.post('/collection/add', { bookId: props.bookId }, {
        successMsg: '收藏成功'
      })
      isCollected.value = true
    }
  } catch (error) {
    console.error('操作收藏失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkCollection()
})
</script>

<style lang="scss" scoped>
.collection-btn {
  background-color: #E6A23C;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }

  &.el-button--danger {
    background-color: #F56C6C;
  }
}
</style>