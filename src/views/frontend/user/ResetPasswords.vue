<template>
  <div class="forgot-password-container">
    <div class="forgot-password-wrapper">
      <!-- <div class="brand-section">
        <h1 class="brand-title">图书管理系统</h1>
        <p class="brand-subtitle">找回密码</p>
        <div class="brand-decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div> -->

      <div class="form-section">
        <div class="form-header">
          <h2>重置密码</h2>
          <p>请输入您的注册邮箱，我们将发送验证码</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" class="forgot-form">
          <el-form-item prop="email">
            <el-input v-model="form.email" placeholder="请输入注册邮箱" prefix-icon="Message" size="large" />
          </el-form-item>

          <el-form-item prop="code">
            <div class="code-input-wrapper">
              <el-input v-model="form.code" placeholder="请输入验证码" prefix-icon="Key" size="large" class="code-input" />
              <el-button type="primary" :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode"
                class="send-code-btn">
                {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item prop="newPassword">
            <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" prefix-icon="Lock" size="large"
              show-password />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请确认新密码" prefix-icon="Lock"
              size="large" show-password />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="handleSubmit" class="submit-btn">
              重置密码
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <router-link to="/login">返回登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  sendingCode.value = true
  try {
    await request.post('/user/send-code', { email: form.email }, {
      successMsg: '验证码已发送',
      showDefaultMsg: true
    })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    sendingCode.value = false
  }
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await request.post('/user/reset-password', {
          email: form.email,
          code: form.code,
          newPassword: form.newPassword
        }, {
          successMsg: '密码重置成功，请登录',
          showDefaultMsg: true
        })
        router.push('/login')
      } catch (error) {
        console.error('重置密码失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
$primary-color: #4F9DFB;
$primary-gradient: linear-gradient(135deg, #4F9DFB, #77bafe 40%, #90edc6);

.forgot-password-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #bbd8ff, #d6fff5, #cadfff);
  overflow: hidden;
}

.forgot-password-wrapper {
  position: relative;
  z-index: 5;
  width: 800px;
  max-width: 1200px;
  min-height: 500px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 50px rgba(92, 92, 92, 0.1);
}

.brand-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.95) 0%, rgba(94, 114, 228, 0.95) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  text-align: center;
}

.brand-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.form-section {
  flex: 1.5;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
}

.forgot-form {
  width: 100%;
}

.code-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;

  .code-input {
    flex: 1;
  }

  .send-code-btn {
    width: 120px;
  }
}

.submit-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;

  a {
    color: $primary-color;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 768px) {
  .forgot-password-wrapper {
    width: 90%;
    flex-direction: column;
  }

  .brand-section {
    padding: 40px 20px;
  }

  .form-section {
    padding: 30px 20px;
  }
}
</style>
