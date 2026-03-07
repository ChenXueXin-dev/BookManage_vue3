<template>
  <div class="profile-container">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>个人信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本信息选项卡 -->
        <el-tab-pane label="基本信息" name="info">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="昵称" prop="name">
              <el-input v-model="profileForm.name" placeholder="请输入昵称" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
            </el-form-item>
            
            <el-form-item label="头像">
              <div class="avatar-upload-container">
                <div class="avatar-preview">
                  <img :src="profileForm.avatar ? ('/api' + profileForm.avatar) : defaultAvatar" alt="头像预览" class="avatar-image" />
                  <div v-if="avatarUploading" class="avatar-uploading">
                    <div class="loading-spinner"></div>
                  </div>
                </div>
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    :auto-upload="true"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                    :on-error="handleAvatarError"
                    :http-request="customUpload"
                    :disabled="avatarUploading"
                  >
                    <el-button type="primary" :disabled="avatarUploading">
                      {{ avatarUploading ? '上传中...' : '选择头像' }}
                    </el-button>
                  </el-upload>
                  <div class="upload-tip">
                    <small>支持 jpg、png、gif 格式，文件大小不超过 2MB</small>
                  </div>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleUpdateProfile"
              >
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 修改密码选项卡 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="passwordLoading"
                @click="handleUpdatePassword"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 借阅历史选项卡 -->
        <el-tab-pane label="借阅历史" name="history">
          <div class="borrow-history" v-if="borrowHistory.length > 0">
            <el-table :data="borrowHistory" style="width: 100%">
              <el-table-column prop="bookName" label="图书名称" />
              <el-table-column prop="borrowTime" label="借阅日期" />
              <el-table-column prop="returnTime" label="归还日期" />
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === '已归还' ? 'success' : 'warning'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination">
              <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                layout="total, prev, pager, next"
                @current-change="handlePageChange"
              />
            </div>
          </div>
          <el-empty description="暂无借阅记录" v-else />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import request from '@/utils/request';

const userStore = useUserStore();
const activeTab = ref('info');
const loading = ref(false);
const passwordLoading = ref(false);
const profileFormRef = ref(null);
const passwordFormRef = ref(null);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 借阅历史数据
const borrowHistory = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 个人信息表单
const profileForm = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  roleType: '',
  status: null
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 头像上传状态
const avatarUploading = ref(false);

// 自定义校验规则 - 确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

// 邮箱验证正则表达式
const emailPattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
// 手机号验证正则表达式
const phonePattern = /^1[3-9]\d{9}$/;

// 个人信息表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: phonePattern, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度应在6到100个字符之间', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度应在6到100个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 直接调用API获取当前用户信息
    const res = await request.get('/user/current');
    // 填充表单数据
    if (res) {
      profileForm.id = res.id;
      profileForm.username = res.username || '';
      profileForm.name = res.name || '';
      profileForm.email = res.email || '';
      profileForm.phone = res.phone || '';
      profileForm.avatar = res.avatar || '';
      profileForm.roleType = res.roleType || '';
      profileForm.status = res.status;
      
      // 同时更新到store保持同步
      userStore.setUserInfo(res);
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

// 加载借阅历史
const loadBorrowHistory = async () => {
  try {
    // 调用API获取借阅历史
    const res = await request.get('/borrow/user/records', {
      userId: userStore.userInfo.id,
      currentPage: currentPage.value,
      size: pageSize.value
    }, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        if (res && res.records) {
          borrowHistory.value = res.records.map(record => ({
            bookName: record.bookTitle || '未知书名',
            borrowTime: formatDate(record.borrowTime) || '',
            returnTime: formatDate(record.actualReturnTime) || '',
            status: getBorrowStatusText(record.status)
          }));
          total.value = res.total || 0;
        } else {
          borrowHistory.value = [];
          total.value = 0;
        }
      }
    });
  } catch (error) {
    console.error('获取借阅历史失败:', error);
    ElMessage.error('获取借阅历史失败');
    borrowHistory.value = [];
    total.value = 0;
  }
};

// 日期格式化函数
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

// 头像上传前的校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('头像必须是图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  
  // 设置上传中状态
  avatarUploading.value = true;
  return true;
};

// 自定义文件上传方法
const customUpload = async (options) => {
  try {
    const { file, onSuccess, onError } = options;
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用request.js发送请求
    request.post('/file/upload/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      showDefaultMsg: false,
      onSuccess: (res) => {
        // 打印响应数据，便于调试
        console.log('上传成功，响应数据:', res);
        
        // 成功回调，处理el-upload预期的响应格式
        // 确保只传入成功的数据结构
        onSuccess({
          code: 200,
          data: res,
          msg: '上传成功'
        });
      },
      onError: (error) => {
        // 错误回调
        console.error('upload onError回调:', error);
        avatarUploading.value = false;
        onError(error);
      }
    }).catch(error => {
      console.error('文件上传请求失败:', error);
      avatarUploading.value = false;
      options.onError(error);
    });
  } catch (error) {
    console.error('文件上传方法捕获错误:', error);
    avatarUploading.value = false;
    options.onError(error);
  }
};

// 头像上传成功的回调
const handleAvatarSuccess = (response) => {
  avatarUploading.value = false;
  
  // 打印接收到的响应，便于调试
  console.log('handleAvatarSuccess接收到的响应:', response);
  
  // 确保数据结构符合预期
  if (response) {
    // 设置头像URL
    profileForm.avatar = response.data;
    
    // 自动保存头像更新 (handleUpdateAvatar内部会显示成功消息)
    handleUpdateAvatar();
  } else {
    // ElMessage.error(response?.msg || '头像上传失败111');
  }
};

// 头像上传失败的回调
const handleAvatarError = (error) => {
  avatarUploading.value = false;
  console.error('handleAvatarError回调:', error);
  ElMessage.error('头像上传失败，请稍后重试');
};

// 处理头像更新
const handleUpdateAvatar = async () => {
  if (!profileForm.id || !profileForm.avatar) {
    console.warn('缺少用户ID或头像路径，无法更新头像');
    return;
  }
  
  try {
    // 构建更新数据，仅包含头像字段
    const updateData = {
      avatar: profileForm.avatar
    };
    
    console.log('开始更新头像数据:', updateData);
    
    // 调用API更新头像
    await request.put(`/user/profile/${profileForm.id}`, updateData, {
      // 使用showDefaultMsg:false避免重复显示成功信息
      showDefaultMsg: false,
      onSuccess: (res) => {
        console.log('头像更新成功，响应:', res);
        // 更新 store 中的头像
        userStore.setUserInfo({
          ...userStore.userInfo,
          avatar: res
        });
        
        // 手动显示成功信息
        ElMessage.success("头像更新成功");
      },
      onError: (error) => {
        // 显示错误信息
        console.error('更新头像失败(onError):', error);
        ElMessage.error(error.message || '更新头像失败');
      }
    });
  } catch (error) {
    console.error('更新头像失败(catch):', error);
    ElMessage.error(error.message || '更新头像失败');
  }
};

// 处理更新个人信息
const handleUpdateProfile = async () => {
  if (loading.value) return;
  
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      loading.value = true;
      
      if (!profileForm.id) {
        ElMessage.error('无法获取用户ID，请重新登录');
        return;
      }
      
      // 构建更新数据，仅包含允许更新的字段
      const updateData = {
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
        avatar: profileForm.avatar || ''
      };
      
      // 调用API更新个人信息
      await request.put(`/user/profile/${profileForm.id}`, updateData, {
        successMsg: "个人信息更新成功",
        onSuccess: () => {
          loadUserInfo(); // 重新加载用户信息以保持同步
        }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      ElMessage.error(error.message || '更新用户信息失败');
    } finally {
      loading.value = false;
    }
  });
};

// 处理修改密码
const handleUpdatePassword = async () => {
  if (passwordLoading.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      passwordLoading.value = true;
      
      if (!profileForm.id) {
        ElMessage.error('无法获取用户ID，请重新登录');
        return;
      }
      
      // 构建密码更新数据，确保与后端DTO匹配
      const passwordData = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      };
      
      // 调用API更新密码
      await request.put(`/user/password/${profileForm.id}`, passwordData, {
        successMsg: "密码修改成功！",
        onSuccess: () => {
          // 清空表单
          passwordFormRef.value.resetFields();
        }
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      ElMessage.error(error.message || '修改密码失败');
    } finally {
      passwordLoading.value = false;
    }
  });
};

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page;
  loadBorrowHistory();
};

// 组件挂载时加载数据
onMounted(() => {
  loadUserInfo();
  loadBorrowHistory();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
  color: #303133;
}

.profile-form,
.password-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.borrow-history {
  margin-top: 20px;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  border: 2px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
}

.avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
}

.avatar-uploader {
  margin-bottom: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.avatar-uploading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.upload-progress {
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.cancel-upload {
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.8) !important;
  color: #F56C6C !important;
  border: none !important;
  padding: 5px 10px !important;
  font-size: 12px !important;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 600px) {
  .avatar-upload-container {
    flex-direction: column;
    align-items: center;
  }
  
  .avatar-preview {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .avatar-upload {
    align-items: center;
  }
}
</style> 