<template>
  <el-button
    type="primary"
    :disabled="disabled || stock <= 0"
    @click="handleBorrow"
    class="borrow-btn"
    size="small"
  >
    <span v-if="loading">提交中...</span>
    <span v-else-if="stock <= 0">暂无库存</span>
    <span v-else>申请借阅</span>
  </el-button>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true
  },
  stock: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['borrow-success']);
const router = useRouter();
const route = useRoute();
const loading = ref(false);

// 处理借阅
const handleBorrow = () => {
  // 检查是否登录
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再进行借阅');
    router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
    return;
  }
  
  // 跳转到借阅确认页面
  router.push(`/book/borrow/${props.bookId}`);
};
</script>

<style lang="scss" scoped>
.borrow-btn {
  background-color: #409eff;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    opacity: 0.8;
  }
  
  &:disabled {
    background-color: #a0cfff;
    opacity: 0.7;
  }
}
</style>