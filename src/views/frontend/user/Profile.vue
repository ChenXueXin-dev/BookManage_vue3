<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <!-- 个人信息表单 - 重新布局 -->
      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px" class="profile-form">
        <div class="form-row">
          <!-- 左侧：头像区域 -->
          <div class="avatar-section">
            <div class="avatar-preview">
              <img :src="profileForm.avatar ? ('/api' + profileForm.avatar) : defaultAvatar" alt="头像预览"
                class="avatar-image" />
              <div v-if="avatarUploading" class="avatar-uploading">
                <div class="loading-spinner"></div>
              </div>
            </div>
            <div class="avatar-upload">
              <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :on-error="handleAvatarError"
                :http-request="customUpload" :disabled="avatarUploading">
                <el-button type="primary" plain :disabled="avatarUploading">
                  {{ avatarUploading ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>

              <div class="upload-tip">
                <small>支持 jpg、png、gif 格式，文件大小不超过 2MB</small>
              </div>
            </div>
          </div>

          <!-- 右侧：基本信息 -->
          <div class="info-section">

            <el-form-item label="昵称" prop="name">
              <el-input v-model="profileForm.name" placeholder="请输入昵称" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>


            <el-form-item label="密码">
              <el-button @click="openPasswordDialog" class="password-btn">
                修改密码
              </el-button>
            </el-form-item>

            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled class="disabled-input" />
            </el-form-item>

            <el-form-item label="用户角色">
              <el-input v-model="profileForm.roleType" disabled class="disabled-input" />
            </el-form-item>

            <el-form-item label="账号状态">
              <el-tag :type="profileForm.status === 1 ? 'success' : 'danger'">
                {{ profileForm.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-form-item>

            <el-form-item class="submit-section">
              <el-button class="button" type="primary" :loading="loading" @click="handleUpdateProfile">
                保存修改
              </el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" v-model="passwordDialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px"
        class="password-form">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleUpdatePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import request from '@/utils/request';

const userStore = useUserStore();
const loading = ref(false);
const passwordLoading = ref(false);
const profileFormRef = ref(null);
const passwordFormRef = ref(null);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 修改密码弹窗控制
const passwordDialogVisible = ref(false);

// 个人信息表单
const profileForm = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
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

// 打开修改密码弹窗
const openPasswordDialog = () => {
  passwordDialogVisible.value = true;
  // 清空密码表单
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate();
  }
};

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

// 自定义校验规则 - 新密码不能与原密码相同
const validateNewPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度应不少于6个字符'));
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与原密码相同'));
  } else {
    callback();
  }
};

// 邮箱验证正则表达式
const emailPattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

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
};

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度应在6到100个字符之间', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validateNewPassword, trigger: ['blur', 'change'] }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await request.get('/user/current');
    if (res) {
      profileForm.id = res.id;
      profileForm.username = res.username || '';
      profileForm.name = res.name || '';
      profileForm.email = res.email || '';
      profileForm.avatar = res.avatar || '';
      profileForm.roleType = res.roleType || '';
      profileForm.status = res.status;

      userStore.setUserInfo(res);
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
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

  avatarUploading.value = true;
  return true;
};

// 自定义文件上传方法
const customUpload = async (options) => {
  try {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append('file', file);

    request.post('/file/upload/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      showDefaultMsg: false,
      onSuccess: (res) => {
        console.log('上传成功，响应数据:', res);
        onSuccess({
          code: 200,
          data: res,
          msg: '上传成功'
        });
      },
      onError: (error) => {
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

  console.log('handleAvatarSuccess接收到的响应:', response);

  if (response) {
    profileForm.avatar = response.data;
    handleUpdateAvatar();
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
    const updateData = {
      avatar: profileForm.avatar
    };

    console.log('开始更新头像数据:', updateData);

    await request.put(`/user/profile/${profileForm.id}`, updateData, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        console.log('头像更新成功，响应:', res);
        userStore.setUserInfo({
          ...userStore.userInfo,
          avatar: res
        });

        ElMessage.success("头像更新成功");
      },
      onError: (error) => {
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

      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar || ''
      };

      await request.put(`/user/profile/${profileForm.id}`, updateData, {
        successMsg: "个人信息更新成功",
        onSuccess: () => {
          loadUserInfo();
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

      const passwordData = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      };

      await request.put(`/user/password/${profileForm.id}`, passwordData, {
        successMsg: "密码修改成功！",
        onSuccess: () => {
          passwordDialogVisible.value = false;
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

// 组件挂载时加载数据
onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
$primary-gradient-low: linear-gradient(135deg, #77bafe, #77bafe 40%, #90edc6);
$primary-color: #4F9DFB;

.profile-container {
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.password-btn {
  border-radius: 6px;
  padding: 8px 16px;
}

/* 表单整体布局 */
.profile-form {
  padding: 30px 24px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

/* 头像区域样式 */
.avatar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  width: 220px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.avatar-uploader {
  width: 100%;
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-button {
  width: 100%;
  border-radius: 6px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
  text-align: center;
  line-height: 1.4;
}

/* 信息区域样式 */
.info-section {
  flex: 1;
  padding: 10px 0;
}

.info-section .el-form-item {
  margin-bottom: 24px;
}

.info-section .el-input {
  border-radius: 6px;
}

.disabled-input {
  background-color: #f5f7fa;
  color: #909399;
}

.submit-section {
  margin-top: 10px;

  .button {
    border: none;
    background: $primary-gradient-low;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: #fff;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      opacity: 0.8;
    }

  }
}

/* 头像上传中样式 */
.avatar-uploading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 密码表单样式 */
.password-form {
  padding: 10px 0;
}

.password-form .el-form-item {
  margin-bottom: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }

  .avatar-section {
    width: 100%;
    padding: 15px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .profile-form {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .avatar-preview {
    width: 100px;
    height: 100px;
  }

  .info-section .el-form-item {
    margin-bottom: 20px;
  }

  .card-header h2 {
    font-size: 16px;
  }
}
</style>