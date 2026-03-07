<template>
  <div class="comment-list">
    <!-- 评论统计 -->
    <div class="comment-header">
      <h3 class="comment-title">读者评论 ({{ total }})</h3>
      <el-button type="primary" size="small" @click="showCommentForm = true">
        <el-icon>
          <Edit />
        </el-icon>
        写评论
      </el-button>
    </div>

    <!-- 评论表单 -->
    <div v-if="showCommentForm" class="comment-form">
      <el-form :model="commentForm" ref="commentFormRef">
        <el-form-item prop="content" :rules="[{ required: true, message: '请输入评论内容', trigger: 'blur' }]">
          <el-input v-model="commentForm.content" type="textarea" :rows="3" placeholder="分享你的想法..." maxlength="1000"
            show-word-limit></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitComment" :loading="submitting">提交评论</el-button>
          <el-button @click="cancelComment">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 评论列表 -->
    <el-empty v-if="comments.length === 0" description="暂无评论" />

    <div v-else class="comments-container">
      <el-card v-for="comment in comments" :key="comment.id" class="comment-item" shadow="hover">
        <div class="comment-user">
          <el-avatar :src="comment.avatar || defaultAvatar" :size="40"></el-avatar>
          <div class="user-info">
            <div class="username">{{ comment.username || '匿名用户' }}</div>
            <div class="comment-time">{{ formatDateTime(comment.createTime) }}</div>
          </div>
        </div>
        <div class="comment-content">{{ comment.content }}</div>

        <!-- 回复按钮 -->
        <div class="comment-actions">
          <el-button type="text" @click="showReplyForm(comment.id)">
            <el-icon>
              <ChatDotRound />
            </el-icon> 回复
          </el-button>

          <!-- 如果是自己的评论，显示删除按钮 -->
          <el-button v-if="canDelete(comment)" type="text" @click="deleteComment(comment.id)">
            <el-icon>
              <Delete />
            </el-icon> 删除
          </el-button>
        </div>

        <!-- 回复表单 -->
        <div v-if="activeReplyId === comment.id" class="reply-form">
          <el-input v-model="replyForm.content" type="textarea" :rows="2" placeholder="回复评论..." maxlength="1000"
            show-word-limit></el-input>
          <div class="reply-actions">
            <el-button type="primary" size="small" @click="submitReply(comment.id)"
              :loading="submitting">提交回复</el-button>
            <el-button size="small" @click="cancelReply">取消</el-button>
          </div>
        </div>

        <!-- 回复列表 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <div class="reply-user">
              <el-avatar :src="reply.avatar || defaultAvatar" :size="30"></el-avatar>
              <div class="user-info">
                <div class="username">{{ reply.username || '匿名用户' }}</div>
                <div class="comment-time">{{ formatDateTime(reply.createTime) }}</div>
              </div>
            </div>
            <div class="reply-content">{{ reply.content }}</div>

            <!-- 如果是自己的回复，显示删除按钮 -->
            <div v-if="canDelete(reply)" class="reply-actions">
              <el-button type="text" @click="deleteComment(reply.id)">
                <el-icon>
                  <Delete />
                </el-icon> 删除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :current-page="currentPage" @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Edit, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const props = defineProps({
  bookId: {
    type: Number,
    required: true
  }
})

const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const comments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const submitting = ref(false)
const showCommentForm = ref(false)
const activeReplyId = ref(null)

const commentFormRef = ref(null)
const commentForm = ref({
  content: ''
})

const replyForm = ref({
  content: ''
})

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/book', {
      params: {
        bookId: props.bookId,
        currentPage: currentPage.value,
        size: pageSize.value
      }
    })

    comments.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  submitting.value = true
  try {
    await request.post('/comment/add', {
      bookId: props.bookId,
      content: commentForm.value.content
    }, {
      successMsg: '评论成功'
    })

    // 重置表单
    commentForm.value.content = ''
    showCommentForm.value = false

    // 刷新评论列表
    currentPage.value = 1
    fetchComments()
  } catch (error) {
    console.error('提交评论失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消评论
const cancelComment = () => {
  commentForm.value.content = ''
  showCommentForm.value = false
}

// 显示回复表单
const showReplyForm = (commentId) => {
  activeReplyId.value = commentId
  replyForm.value.content = ''
}

// 提交回复
const submitReply = async (commentId) => {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  submitting.value = true
  try {
    await request.post('/comment/add', {
      bookId: props.bookId,
      content: replyForm.value.content,
      parentId: commentId
    }, {
      successMsg: '回复成功'
    })

    // 重置表单
    replyForm.value.content = ''
    activeReplyId.value = null

    // 刷新评论列表
    fetchComments()
  } catch (error) {
    console.error('提交回复失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消回复
const cancelReply = () => {
  replyForm.value.content = ''
  activeReplyId.value = null
}

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.post('/comment/delete', { commentId }, {
      successMsg: '删除成功'
    })

    // 刷新评论列表
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

// 判断是否可以删除评论（自己的评论才能删除）
const canDelete = (comment) => {
  return userStore.isLoggedIn && comment.userId === userStore.userInfo.id
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
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
  fetchComments()
})
</script>

<style lang="scss" scoped>
.comment-list {
  margin-top: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .comment-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.comment-form {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.comments-container {
  margin-bottom: 20px;
}

.comment-item {
  margin-bottom: 15px;

  .comment-user {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .user-info {
      margin-left: 10px;

      .username {
        font-weight: 500;
        font-size: 14px;
      }

      .comment-time {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }

  .comment-content {
    margin-bottom: 10px;
    line-height: 1.6;
    word-break: break-word;
  }

  .comment-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;

    .el-button {
      padding: 0;
      margin-left: 15px;
    }
  }
}

.reply-form {
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;

  .reply-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;

    .el-button {
      margin-left: 10px;
    }
  }
}

.replies-list {
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;

  .reply-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .reply-user {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .user-info {
        margin-left: 10px;

        .username {
          font-weight: 500;
          font-size: 13px;
        }

        .comment-time {
          font-size: 11px;
          color: #999;
          margin-top: 2px;
        }
      }
    }

    .reply-content {
      margin-left: 40px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }

    .reply-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 5px;

      .el-button {
        padding: 0;
        font-size: 12px;
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>