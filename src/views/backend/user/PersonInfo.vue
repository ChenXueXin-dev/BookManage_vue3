<template>
  <div class="person-info-container">
    <el-card class="info-card">
      <!-- 个人信息表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :disabled="!isEditing" class="info-form">
        <div class="form-row">
          <!-- 左侧：用户信息展示区 -->
          <div class="avatar-section">
            <div class="avatar-preview">
              <img :src="defaultAvatar" alt="用户头像" class="avatar-image" />
            </div>
            <div class="user-basic-info">
              <div class="username-display">{{ form.username }}</div>
              <div class="user-role">管理员</div>
            </div>
          </div>

          <!-- 右侧：编辑区域 -->
          <div class="info-section">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" disabled class="disabled-input" />
            </el-form-item>

            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="密码">
              <el-button @click="openPasswordDialog" class="password-btn">
                修改密码
              </el-button>
            </el-form-item>

            <el-form-item class="submit-section">
              <div v-if="!isEditing">
                <el-button class="button" type="primary" @click="handleEdit">
                  编辑信息
                </el-button>
              </div>
              <div v-else class="action-buttons">
                <el-button class="button save-btn" type="primary" @click="handleSave" :loading="saving">
                  保存
                </el-button>
                <el-button class="button cancel-btn" @click="handleCancel">
                  取消
                </el-button>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" v-model="passwordDialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px"
        class="password-form">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（6-20位）" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="changingPassword" @click="handleChangePassword" class="button">
          修改密码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const userStore = useUserStore()
const formRef = ref(null)
const passwordFormRef = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const passwordDialogVisible = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 表单数据
const form = reactive({
  username: '',
  name: '',
  email: '',
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
}

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 打开修改密码弹窗
const openPasswordDialog = () => {
  passwordDialogVisible.value = true
  // 清空密码表单
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await request.get(`/user/${userStore.userInfo.id}`)
    Object.assign(form, {
      username: res.username,
      name: res.name,
      email: res.email,
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 编辑信息
const handleEdit = () => {
  isEditing.value = true
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  fetchUserInfo() // 重新获取数据，恢复原值
}

// 保存信息
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    await request.put(`/user/${userStore.userInfo.id}`, {
      name: form.name,
      email: form.email,
    }, {
      successMsg: '个人信息更新成功'
    })

    isEditing.value = false
    // 更新store中的用户信息
    userStore.setUserInfo({
      ...userStore.userInfo,
      name: form.name,
      email: form.email,
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
  } finally {
    saving.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    await request.put(`/user/password/${userStore.userInfo.id}`, {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }, null, {
      showSuccessMsg: '密码修改成功'
    })

    // 清空密码表单并关闭弹窗
    passwordFormRef.value.resetFields()
    passwordDialogVisible.value = false
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
$primary-gradient-low: linear-gradient(135deg, #77bafe, #77bafe 40%, #90edc6);
$primary-color: #4F9DFB;

.person-info-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.info-card {
  width: 100%;
  max-width: 900px;
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

/* 表单整体布局 */
.info-form {
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

.user-basic-info {
  text-align: center;
  width: 100%;

  .username-display {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .user-role {
    font-size: 12px;
    color: #909399;
    background-color: #f5f7fa;
    padding: 2px 8px;
    border-radius: 10px;
    display: inline-block;
  }
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

.password-btn {
  border-radius: 6px;
  padding: 8px 16px;
}

.submit-section {
  margin-top: 10px;

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .button {
    border: none;
    background: $primary-gradient-low;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: #fff;
    padding: 8px 16px;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      opacity: 0.8;
    }
  }

  .cancel-btn {
    background: #f5f7fa;
    color: #606266;

    &:hover {
      background: #e8eaec;
    }
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

  .info-form {
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
}
</style>