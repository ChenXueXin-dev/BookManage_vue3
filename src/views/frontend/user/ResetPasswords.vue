<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="form-section">
        <div class="form-container">
          <div class="register-header">
            <h2>欢迎注册</h2>
            <p>创建账号，探索阅读海洋</p>
          </div>

          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input :prefix-icon="User" v-model="registerForm.username" placeholder="用户名" class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input :prefix-icon="Lock" v-model="registerForm.password" type="password" placeholder="密码"
                  show-password class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <el-form-item v-if="registerForm.password" prop="confirmPassword">
              <div class="input-wrapper">
                <el-input :prefix-icon="Lock" v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                  show-password class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="email">
              <div class="input-wrapper">
                <el-input :prefix-icon="Message" v-model="registerForm.email" placeholder="qq邮箱" class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <div class="terms-agreement">
              <el-checkbox v-model="agreement">我已阅读并同意</el-checkbox>
              <a href="#" class="terms-link">用户协议</a>和<a href="#" class="terms-link">隐私政策</a>
            </div>

            <el-button type="primary" :loading="loading" @click="handleRegister" class="register-button">
              注册账号
            </el-button>

            <div class="login-cta">
              <p>已有账号？</p>
              <router-link to="/login" class="login-link">立即登录</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <footer class="site-footer">
      <p> Copyright © 2024 - {{ new Date().getFullYear() }} LL All Rights Reserved</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const agreement = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  roleType: 'USER', // 默认注册为普通用户
})

const validatePass2 = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!emailRegex.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度必须在3到50个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度必须在6到100个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
}

const handleRegister = () => {
  if (!agreement.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策');
    return;
  }

  registerFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        const { confirmPassword, ...registerData } = registerForm
        await request.post("/user/add", registerData, {
          successMsg: "注册成功",
          showDefaultMsg: true,
          onSuccess: () => {
            router.push('/login')
          }
        })
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
$background-dark: #CFD8DC;

.register-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #bbd8ff, #d6fff5, #cadfff);
  overflow: hidden;
  padding: 40px 0;
}

.register-wrapper {
  position: relative;
  z-index: 5;
  width: 400px;
  max-width: 1200px;
  min-height: 400px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 50px rgba(92, 92, 92, 0.1);
}

.form-section {
  flex: 1;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 450px;
  padding: 0 20px;
}

.register-header {
  margin-bottom: 10px;
  text-align: center;

  h2 {
    font-size: 32px;
    font-weight: 600;
    color: #37474f;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    color: #78909c;
    line-height: 1.5;
  }
}

.register-form {
  margin-bottom: 30px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fff !important;
  padding: 10px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 2px solid $background-dark;
  height: 56px;
  margin-bottom: 5px;

  &:hover,
  &:focus-within {
    background-color: #fff !important;
    border-color: #64b5f6;

    .el-icon {
      color: #64b5f6;
    }
  }
}

:deep(.input-wrapper) {
  width: 100% !important;
}

:deep(.custom-input) {
  .el-input__wrapper {
    box-shadow: none !important;
    padding: 0;
    width: 100% !important;
    background-color: #fff !important;
  }

  .el-input__inner {
    height: 52px;
    font-size: 16px;
    width: 100% !important;
    background-color: #fff !important;
    padding-right: 15px;
  }

  .el-input__wrapper.is-focus {
    background-color: #fff !important;
    box-shadow: none !important;
  }
}

.terms-agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 25px 0;
  font-size: 14px;
  color: #546e7a;

  .terms-link {
    color: $primary-color;
    margin: 0 4px;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-button {
  margin-top: 10px;
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: $primary-gradient;
  border: none;
  transition: all 0.3s;

  &:hover {
    border: 1px solid #cadfff;
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(94, 114, 228, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
}

.login-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;

  p {
    color: #78909c;
    margin-right: 10px;
    font-size: 16px;
  }

  .login-link {
    color: $primary-color;
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      color: #64b5f6;
      text-decoration: underline;
    }
  }
}

.site-footer {
  position: relative;
  z-index: 5;
  margin-top: 30px;
  text-align: center;
  color: #607d8b;
  font-size: 14px;
  padding: 10px 0;
}

@media (max-width: 992px) {
  .register-wrapper {
    flex-direction: column;
    min-height: auto;
    max-width: 600px;
  }

  .brand-content .site-name {
    font-size: 42px;
  }

  .form-section {
    padding: 30px;
  }

  .form-container {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .register-wrapper {
    width: 95%;
    border-radius: 16px;
  }

  .brand-content {
    padding: 10px;

    .site-name {
      font-size: 36px;
    }
  }

  .form-section {
    padding: 25px 20px;
  }

  .register-header h2 {
    font-size: 28px;
  }

  .register-button {
    height: 50px;
  }

  .form-container {
    padding: 0;
  }

  :deep(.custom-input) {
    .el-input__inner {
      height: 48px;
    }
  }
}
</style>