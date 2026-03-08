<template>
  <div class="book-detail-container" v-loading="loading">
    <div class="back-navigation">
      <div class="back-button" @click="goBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </div>
    </div>

    <div v-if="book" class="book-detail">
      <div class="book-header">
        <div class="book-main">
          <div class="book-cover">
            <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" :alt="book.title" />
          </div>
          <div class="book-rating">
            <el-rate v-model="book.avgScore" disabled allow-half text-color="#FF9900" />
            <span class="score-text">{{ book.avgScore ? book.avgScore.toFixed(1) : '暂无评分' }}</span>
            <el-button v-if="isLoggedIn" type="primary" text @click="handleRate" class="rate-btn">去评分</el-button>
          </div>
          <div class="book-actions">
            <BorrowButton :bookId="book.id" :stock="book.stock" />
            <CollectionButton :bookId="book.id" />
          </div>
        </div>


        <div class="book-info">
          <div class="book-condition">
            <h1 class="book-title">{{ book.title }}</h1>
            <p class="stock"><span>库存：</span>{{ book.stock }} 本</p>
            <p class="borrowed"><span>借阅次数：</span>{{ book.borrowedCount }} 次</p>
          </div>
          <div class="book-description">
            <p>简介：{{ book.description || '暂无简介' }}</p>
          </div>
          <div class="book-meta">
            <p><span class="label">作者：</span>{{ book.author }}</p>
            <p><span class="label">出版社：</span>{{ book.publisher }}</p>
            <p><span class="label">出版日期：</span>{{ formatDate(book.publishDate) }}</p>
            <p><span class="label">ISBN：</span>{{ book.isbn }}</p>
            <p><span class="label">分类：</span>{{ book.categoryName }}</p>
          </div>






        </div>
      </div>
      <div class="book-comments">
        <div v-if="isLoggedIn" class="comment-form">
          <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="评论..." maxlength="500"
            show-word-limit @focus="handleCommentFocus" @blur="handleCommentBlur" />
          <div class="form-actions">
            <el-button type="primary" v-if="isSubmitVisible" @click="submitComment" :disabled="!commentContent.trim()">
              发表
            </el-button>
          </div>
        </div>

        <div v-else class="login-tip">
          <el-alert type="info" show-icon :closable="false">
            <template #title>
              请先<el-button type="text" @click="goToLogin">登录</el-button>后发表评论
            </template>
          </el-alert>
        </div>

        <div class="comment-list">
          <el-empty v-if="comments.length === 0" description="暂无评论"></el-empty>

          <div v-else>
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :src="comment.avatar ? ('/api' + comment.avatar) : defaultAvatar">
                  {{ comment.username?.[0]?.toUpperCase() || 'U' }}
                </el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.username }}</span>
                  <span class="comment-time">{{ formatDateTime(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <el-button type="text" @click="replyToComment(comment)">
                    <el-icon>
                      <ChatDotRound />
                    </el-icon> 回复
                  </el-button>
                  <!-- 当评论是当前用户发表的时候显示删除按钮 -->
                  <el-button v-if="isCurrentUserComment(comment)" type="text" @click="handleDeleteComment(comment)"
                    class="delete-btn">
                    <el-icon>
                      <Delete />
                    </el-icon> 删除
                  </el-button>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-avatar">
                      <el-avatar :src="reply.avatar ? ('/api' + reply.avatar) : defaultAvatar" size="small">
                        {{ reply.username?.[0]?.toUpperCase() || 'U' }}
                      </el-avatar>
                    </div>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.username }}</span>
                        <span class="reply-time">{{ formatDateTime(reply.createTime) }}</span>
                      </div>
                      <div class="reply-text">{{ reply.content }}</div>
                      <!-- 当回复是当前用户发表的时候显示删除按钮 -->
                      <div v-if="isCurrentUserComment(reply)" class="reply-actions">
                        <el-button type="text" @click="handleDeleteComment(reply)" class="delete-btn">
                          <el-icon>
                            <Delete />
                          </el-icon> 删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="related-books">
        <h2 class="section-title">相关推荐</h2>
        <div class="related-books-list">
          <el-empty v-if="relatedBooks.length === 0" description="暂无相关推荐"></el-empty>

          <div v-else class="book-carousel">
            <div v-for="relatedBook in relatedBooks" :key="relatedBook.bookId" class="related-book-card">
              <div class="related-book-cover" @click="goToBookDetail(relatedBook.bookId)">
                <img :src="relatedBook.coverUrl ? ('/api' + relatedBook.coverUrl) : defaultCover"
                  :alt="relatedBook.title" />
              </div>
              <div class="related-book-info">
                <h3 class="related-book-title" @click="goToBookDetail(relatedBook.bookId)">
                  {{ relatedBook.title }}
                </h3>
                <p class="related-book-author">{{ relatedBook.author }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else-if="!loading" description="图书不存在或已下架"></el-empty>

    <!-- 评分对话框 -->
    <el-dialog v-model="ratingDialogVisible" title="图书评分" width="30%">
      <div class="rate-dialog-content">
        <p class="rate-book-title">《{{ book?.title }}》</p>
        <RatingComponent :bookId="book?.id" @rated="handleRatedSuccess" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ratingDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复评论" width="40%">
      <div class="reply-dialog-content">
        <p class="quoted-comment">{{ currentComment?.content }}</p>
        <el-input v-model="replyContent" type="textarea" :rows="3" placeholder="写下你的回复..." maxlength="500"
          show-word-limit />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ChatDotRound, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import DateUtils from '@/utils/dateUtils';
import RatingComponent from '@/components/RatingComponent.vue';
import CollectionButton from '@/components/CollectionButton.vue';
import BorrowButton from '@/components/BorrowButton.vue';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const book = ref(null);
const comments = ref([]);
const relatedBooks = ref([]);
const commentContent = ref('');
const ratingDialogVisible = ref(false);
const replyDialogVisible = ref(false);
const replyContent = ref('');
const currentComment = ref(null);
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif';
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 检查用户是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token');
});

onMounted(() => {
  const bookId = route.params.id;
  if (bookId) {
    fetchBookDetail(bookId);
    fetchComments(bookId);
    fetchRelatedBooks(bookId);
  }
});

const isSubmitVisible = ref(false)
const handleCommentBlur = () => {
  if (!commentContent.value.length) {
    isSubmitVisible.value = false
  }
}
const handleCommentFocus = () => {
  isSubmitVisible.value = true
}
// 获取图书详情
const fetchBookDetail = async (id) => {
  loading.value = true;
  try {
    const res = await request.get(`/book/${id}`, null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        book.value = res;
      }
    });
  } catch (error) {
    console.error('获取图书详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取图书评论
const fetchComments = async (id) => {
  try {
    const res = await request.get(`/comment/book?bookId=${id}`, null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        // 检查返回的数据结构并处理
        if (res && res.records) {
          // 如果返回的是分页对象
          comments.value = res.records || [];
        } else if (Array.isArray(res)) {
          // 如果直接返回数组
          comments.value = res;
        } else {
          comments.value = [];
        }

        // 确保每个评论都有有效的用户名和头像
        comments.value.forEach(comment => {
          if (!comment.username) comment.username = '匿名用户';
          // 确保回复列表是一个数组
          if (!comment.replies) comment.replies = [];
          // 确保每个回复都有有效的用户名和头像
          comment.replies.forEach(reply => {
            if (!reply.username) reply.username = '匿名用户';
          });
        });
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    comments.value = [];
  }
};

// 获取相关推荐
const fetchRelatedBooks = async (id) => {
  try {
    const res = await request.get(`/recommendation/similar?bookId=${id}&limit=6`, null, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        // 检查数据结构
        if (Array.isArray(res)) {
          relatedBooks.value = res.map(book => {
            // 确保每本书都有必要的字段
            return {
              ...book,
              bookId: book.bookId || book.id, // 兼容可能的id字段名
              title: book.title || '未知书名',
              author: book.author || '未知作者',
              coverUrl: book.coverUrl || null
            };
          });
        } else {
          relatedBooks.value = [];
        }
      }
    });
  } catch (error) {
    console.error('获取相关推荐失败:', error);
    relatedBooks.value = [];
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 跳转到其他图书详情
const goToBookDetail = (id) => {
  router.push(`/book/detail/${id}`);
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知';
  return DateUtils.formatDate(date);
};

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未知';
  return DateUtils.formatDateTime(datetime);
};

// 显示评分对话框
const handleRate = () => {
  // 这里应该判断是否登录，如果未登录则跳转到登录页
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再进行评分');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }

  ratingDialogVisible.value = true;
};

// 新的评分成功处理方法
const handleRatedSuccess = () => {
  // 关闭评分对话框
  ratingDialogVisible.value = false;
  // 刷新图书详情，更新平均评分
  fetchBookDetail(book.value.id);
};

// 提交评论
const submitComment = async () => {
  // 这里应该判断是否登录，如果未登录则跳转到登录页
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再发表评论');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }

  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  try {
    await request.post('/comment/add', {
      bookId: book.value.id,
      content: commentContent.value.trim(),
      parentId: null
    }, {
      successMsg: '评论成功',
      onSuccess: () => {
        commentContent.value = '';
        // 刷新评论列表
        fetchComments(book.value.id);
      }
    });
  } catch (error) {
    console.error('评论失败:', error);
  }
};

// 打开回复对话框
const replyToComment = (comment) => {
  // 这里应该判断是否登录，如果未登录则跳转到登录页
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再回复评论');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }

  currentComment.value = comment;
  replyDialogVisible.value = true;
};

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空');
    return;
  }

  try {
    await request.post('/comment/add', {
      bookId: book.value.id,
      content: replyContent.value.trim(),
      parentId: currentComment.value.id
    }, {
      successMsg: '回复成功',
      onSuccess: () => {
        replyContent.value = '';
        replyDialogVisible.value = false;
        // 刷新评论列表
        fetchComments(book.value.id);
      }
    });
  } catch (error) {
    console.error('回复失败:', error);
  }
};

// 判断评论是否是当前用户发表的
const isCurrentUserComment = (comment) => {
  // 从localStorage获取用户ID
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return false;

  try {
    const user = JSON.parse(userInfo);
    return comment.userId && user.id && comment.userId.toString() === user.id.toString();
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return false;
  }
};

// 删除评论
const handleDeleteComment = async (comment) => {
  // 这里应该判断是否登录，如果未登录则跳转到登录页
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录再删除评论');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }

  try {
    await request.post('/comment/delete', {
      commentId: comment.id
    }, {
      successMsg: '删除成功',
      onSuccess: () => {
        // 刷新评论列表
        fetchComments(book.value.id);
      }
    });
  } catch (error) {
    console.error('删除评论失败:', error);
  }
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
};
</script>

<style lang="scss" scoped>
// 全局变量
$primary-color: #4F9DFB;
$primary-light: #E3F2FD;
$green-color: #4edba0;
$primary-dark: #247ADB;
$accent-color: #FF9800;
$text-primary: #37474F;
$text-secondary: #607D8B;
$background-light: #F5F7FA;
$background-medium: #ECEFF1;
$background-dark: #CFD8DC;
$success-color: #66BB6A;
$warning-color: #FFA726;
$error-color: #EF5350;
$border-radius: 12px;
$primary-gradient-low: linear-gradient(135deg, #77bafe, #77bafe 40%, #90edc6);
$box-shadow-light: 0 3px 5px rgba(0, 0, 0, 0.05);
$box-shadow-medium: 0 8px 16px rgba(0, 0, 0, 0.08);
$box-shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.12);
$transition-fast: all 0.2s ease;
$transition-normal: all 0.3s ease;
$transition-slow: all 0.5s ease;

// 卡片混入
@mixin card {
  background: white;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  transition: $transition-normal;
  overflow: hidden;

  &:hover {
    box-shadow: $box-shadow-medium;
    transform: translateY(-3px);
  }
}

// 磨砂玻璃效果混入
@mixin glass-effect {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.book-detail-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 25px;
  background-color: transparent;
  min-height: calc(100vh - 60px);
}

.back-navigation {
  margin-bottom: 25px;

  .back-button {
    color: $text-primary;
    font-weight: 500;

    .el-icon {
      margin-right: 5px;
    }
  }
}

.book-detail {
  @include card;
  overflow: visible;
  transform: none;
  box-shadow: $box-shadow-heavy;

  &:hover {
    transform: none;
  }
}

.book-header {
  display: flex;
  padding: 35px;
  background: linear-gradient(135deg, rgb(223, 224, 255) 0%,rgb(224, 225, 253) 40%,rgb(193, 231, 255) 100%);
  border-radius: $border-radius $border-radius 0 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba($primary-color, 0.2) 0%, rgba($primary-color, 0) 70%);
    top: -150px;
    right: -150px;
    border-radius: 50%;
  }

  .book-main {
    .book-cover {
      flex: 0 0 240px;
      margin-right: 35px;
      position: relative;
      z-index: 2;

      img {
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: $border-radius;
        box-shadow: $box-shadow-heavy;
        transition: $transition-normal;
      }
    }

    .book-rating {
      display: flex;
      align-items: center;
      margin: 5px 30px 5px 0;

      .el-rate {
        margin: 0 12px;
      }

      .score-text {
        font-size: 15px;
        color: $accent-color;
        font-weight: 500;
        background: rgba(255, 152, 0, 0.1);
        padding: 4px 10px;
        border-radius: 20px;
      }
    }

    .book-actions {
      display: flex;
      justify-content: space-around;
      margin: 0 30px 0 0;
      align-items: center;

      :deep(.el-button) {
        border-radius: 50px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        height: auto;
        transition: $transition-normal;

        &:hover {
          transform: translateY(-3px);
          box-shadow: $box-shadow-medium;
        }

        &.el-button--primary {
          background: linear-gradient(45deg, $primary-color, $primary-dark);
          border: none;
        }

        &.el-button--success {
          background: linear-gradient(45deg, $success-color, darken($success-color, 10%));
          border: none;
        }

        &.el-button--danger {
          background: linear-gradient(45deg, $error-color, darken($error-color, 10%));
          border: none;
        }
      }
    }
  }


  .book-info {
    flex: 1;
    position: relative;
    z-index: 2;

    .book-condition {
      display: flex;
      align-items: center;
      min-width: 400px;

      .book-title {
        font-size: 32px;
        font-weight: 600;
        color: $text-primary;
      }

      p {
        margin: 0 0 0 20px;
        font-size: 15px;
        font-weight: 500;
        align-items: center;
        text-align: center;
        padding: 5px;
        border-radius: 20px;
        min-width: 140px;
      }

      .stock {
        border: 1px solid $primary-color;
        color: $primary-color;
      }

      .borrowed {
        border: 1px solid $success-color;
        color: $success-color;
      }
    }


    .book-description {
      color: $text-secondary;
      font-size: 16px;
      height: 80px;
      margin: 0 0 20px 0;
    }


    .book-meta {
      margin-bottom: 20px;
      background: #ffffff;
      padding: 15px;
      border-radius: $border-radius;

      p {
        margin: 10px 0;
        font-size: 15px;
        color: $text-secondary;
        display: flex;
        align-items: center;
      }
    }

    .label {
      color: $primary-dark;
      font-weight: 500;
      min-width: 90px;
      display: inline-block;
    }

  }
}

.book-content,
.book-comments,
.related-books {
  padding: 35px;
  border-top: 1px solid $background-medium;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 25px;
  color: $text-primary;
  padding-left: 15px;
  border-left: 4px solid $green-color;
  display: flex;
  align-items: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 15px;
    bottom: -8px;
    width: 50px;
    height: 2px;
  }
}


.comment-form {
  margin-bottom: 35px;
  padding: 10px 20px;

  .form-actions {
    display: flex;
    justify-content: flex-end;

    .el-button {
      border-radius: 50px;
      margin-top: 10px;
      background: $primary-gradient-low;
      border: none;
      padding: 10px 25px;
      transition: $transition-normal;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $box-shadow-medium;
      }
    }
  }
}

.login-tip {
  margin-bottom: 35px;

  :deep(.el-alert) {
    background-color: $background-light;
    border-radius: $border-radius;
    padding: 15px;
    border: none;
    box-shadow: $box-shadow-light;

    .el-alert__icon {
      color: $primary-color;
    }

    .el-alert__title {
      font-size: 14px;
      color: $text-secondary;
    }

    .el-button--text {
      padding: 0 5px;
      color: $primary-color;
      font-weight: 500;

      &:hover {
        color: $primary-dark;
      }
    }
  }
}

.comment-list {
  .comment-item {
    display: flex;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid $background-medium;

    &:last-child {
      border-bottom: none;
    }

    .comment-avatar {
      flex: 0 0 50px;
      margin-right: 20px;

      :deep(.el-avatar) {
        border: 2px solid white;
        box-shadow: $box-shadow-light;
      }
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        .comment-author {
          font-weight: 500;
          color: $text-primary;
          font-size: 16px;
        }

        .comment-time {
          font-size: 14px;
          color: $text-secondary;
        }
      }

      .comment-text {
        margin-bottom: 12px;
        color: $text-secondary;
        line-height: 1.6;
        font-size: 15px;
        background-color: $background-light;
        padding: 12px 15px;
        border-radius: $border-radius;
      }

      .comment-actions {
        margin-bottom: 15px;
        display: flex;
        gap: 15px;

        :deep(.el-button) {
          &:hover {
            color: $primary-color;
          }

          &.delete-btn {
            color: $error-color;

            &:hover {
              color: darken($error-color, 10%);
            }
          }
        }
      }
    }
  }

  .reply-list {
    background-color: $background-light;
    padding: 15px;
    border-radius: $border-radius;
    margin-top: 10px;

    .reply-item {
      display: flex;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .reply-avatar {
        flex: 0 0 32px;
        margin-right: 15px;

        :deep(.el-avatar) {
          border: 1px solid white;
          box-shadow: $box-shadow-light;
        }
      }

      .reply-content {
        flex: 1;

        .reply-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .reply-author {
            font-weight: 500;
            font-size: 14px;
            color: $text-primary;
          }

          .reply-time {
            font-size: 12px;
            color: $text-secondary;
          }
        }

        .reply-text {
          font-size: 14px;
          color: $text-secondary;
          line-height: 1.5;
          margin-bottom: 8px;
          background-color: white;
          padding: 10px 12px;
          border-radius: 8px;
        }

        .reply-actions {
          display: flex;
          justify-content: flex-end;

          :deep(.el-button) {
            &.delete-btn {
              color: $error-color;
              font-size: 12px;

              &:hover {
                color: darken($error-color, 10%);
              }
            }
          }
        }
      }
    }
  }
}

.book-carousel {
  display: flex;
  overflow-x: auto;
  gap: 25px;
  padding: 5px 5px 20px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $background-dark;
    border-radius: 6px;

    &:hover {
      background-color: $text-secondary;
    }
  }

  .related-book-card {
    flex: 0 0 180px;
    transition: $transition-normal;

    &:hover {
      transform: translateY(-5px);
    }

    .related-book-cover {
      height: 240px;
      overflow: hidden;
      border-radius: $border-radius;
      cursor: pointer;
      box-shadow: $box-shadow-light;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      &:hover img {
        transform: scale(1.08);
      }
    }

    .related-book-info {
      padding: 12px 5px;

      .related-book-title {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        color: $text-primary;

        &:hover {
          color: $primary-color;
        }
      }

      .related-book-author {
        margin: 0;
        font-size: 13px;
        color: $text-secondary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.rate-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;

  .rate-book-title {
    margin-bottom: 25px;
    font-size: 18px;
    font-weight: 500;
    color: $text-primary;
    padding: 10px 20px;
    background-color: $primary-light;
    border-radius: 30px;
  }
}

.reply-dialog-content {
  .quoted-comment {
    padding: 15px;
    margin-bottom: 20px;
    background-color: $background-light;
    border-left: 4px solid $primary-color;
    color: $text-secondary;
    font-size: 15px;
    line-height: 1.6;
    border-radius: 0 $border-radius $border-radius 0;
  }

  :deep(.el-textarea) {
    .el-textarea__inner {
      border: 1px solid $background-medium;
      border-radius: $border-radius;
      transition: $transition-fast;

      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
      }
    }
  }
}

:deep(.el-dialog) {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: $box-shadow-heavy;

  .el-dialog__header {
    background: linear-gradient(135deg, $primary-light 0%, white 100%);
    padding: 20px 25px;
    margin: 0;

    .el-dialog__title {
      color: $text-primary;
      font-weight: 600;
    }

    .el-dialog__headerbtn:hover .el-dialog__close {
      color: $primary-color;
    }
  }

  .el-dialog__body {
    padding: 25px;
  }

  .el-dialog__footer {
    padding: 15px 25px 25px;
    border-top: 1px solid $background-medium;

    .el-button {
      border-radius: 50px;
      padding: 10px 25px;
      transition: $transition-normal;

      &:hover {
        transform: translateY(-2px);
      }

      &.el-button--primary {
        background: linear-gradient(45deg, $primary-color, $primary-dark);
        border: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .book-header {
    flex-direction: column;

    .book-cover {
      flex: 0 0 auto;
      margin-right: 0;
      margin-bottom: 25px;
      max-width: 220px;
      align-self: center;
    }
  }

  .book-info .book-actions {
    flex-wrap: wrap;
    gap: 12px;

    .el-button {
      flex: 1;
      min-width: 120px;
    }
  }

  .book-content,
  .book-comments,
  .related-books {
    padding: 25px 20px;
  }

  .comment-item .comment-avatar {
    flex: 0 0 40px;
    margin-right: 15px;
  }
}
</style>