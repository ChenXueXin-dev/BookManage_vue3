<template>
  <div class="login-container">
    <div class="brand-content">
      <el-icon :size="80">
        <Reading />
      </el-icon>
      <h1 class="site-name">图书室借阅管理系统</h1>
    </div>
    <div class="login-wrapper">
      <div class="form-section">
        <div class="form-container">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>登录账号，即刻借阅</p>
          </div>

          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input :prefix-icon="User" v-model="loginForm.username" placeholder="用户名" class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input :prefix-icon="Lock" type="password" v-model="loginForm.password" placeholder="密码"
                  class="custom-input" show-password />
              </div>
            </el-form-item>

            <div class="action-row">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="/reset/passwords" class="forget-link">忘记密码?</a>
            </div>

            <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">
              登录
            </el-button>

            <div class="register-cta">
              <p>还没有账号？<router-link to="/register" class="register-link">立即注册</router-link></p>
            </div>
          </el-form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
import { User, Lock, Reading } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        // 统一使用用户登录接口
        const res = await request.post("/user/login", loginForm, {
          successMsg: "登录成功",
          showDefaultMsg: true,
          onSuccess: async (data) => {
            userStore.setUserInfo(data)

            // 根据返回的角色决定跳转路径
            if (data.roleType !== 'USER') {
              await router.isReady()
              router.push(route.query.redirect || '/back/dashboard')
            } else {
              // 普通用户登录，直接跳转到前台
              const redirect = route.query.redirect || '/'
              router.push(redirect)
            }
          },
          onError: (error) => {
            console.error('登录失败:', error)
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

.login-container {
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

.login-wrapper {
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

.brand-section {
  flex: 1.2;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.95) 0%, rgba(94, 114, 228, 0.95) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &::before {
    width: 400px;
    height: 400px;
    bottom: -200px;
    right: -200px;
  }

  &::after {
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
  }
}

.brand-content {
  display: flex;
  align-items: cener;
  padding: 20px;

  .el-icon {
    color: $primary-color;
  }


  .site-name {
    font-size: 52px;
    font-weight: 700;
    margin-left: 10px;
    letter-spacing: 2px;
    background: $primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}



.slogan-wrapper {
  position: relative;
  margin-bottom: 40px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 80px;
    background-color: rgba(255, 255, 255, 0.4);
    top: 50%;
    transform: translateY(-50%);
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
}

.site-slogan {
  font-size: 18px;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.9;
  margin: 0 auto;
  max-width: 80%;
}

.brand-image {
  margin-top: 50px;
  height: 200px;
  position: relative;
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

.login-header {
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

.login-form {
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

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;

  .forget-link {
    color: $primary-color;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: #64b5f6;
      text-decoration: underline;
    }
  }
}

.login-button {
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
  }

  &:active {
    transform: translateY(-1px);
  }
}

.register-cta {
  text-align: center;
  margin-top: 30px;

  p {
    color: #78909c;
    font-size: 16px;
  }

  .register-link {
    color: $primary-color;
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    transition: all 0.3s;
    margin-left: 8px;

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
  .login-wrapper {
    flex-direction: column;
    min-height: auto;
    max-width: 600px;
  }

  .brand-section {
    padding: 30px;
  }

  .site-name {
    font-size: 42px;
  }

  .brand-image {
    margin-top: 20px;
    height: 150px;
  }

  .form-section {
    padding: 30px;
  }

  .form-container {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .login-wrapper {
    width: 95%;
    border-radius: 16px;
  }

  .brand-section {
    padding: 25px 20px;
  }

  .site-name {
    font-size: 36px;
  }

  .site-slogan {
    font-size: 16px;
  }

  .slogan-wrapper {

    &::before,
    &::after {
      width: 40px;
    }
  }

  .brand-image {
    height: 120px;
  }

  .form-section {
    padding: 25px 20px;
  }

  .login-header h2 {
    font-size: 28px;
  }

  .login-button {
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