<template>
  <div class="login-container">
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="login-wrapper">
      <div class="brand-section">
        <div class="brand-content">
          <h1 class="site-name">图书室借阅管理系统</h1>
          <div class="slogan-wrapper">
            <p class="site-slogan">探索知识的海洋，发现阅读的无限可能</p>
          </div>
          <div class="brand-image">
            <div class="floating-books">
              <div class="book book-1"></div>
              <div class="book book-2"></div>
              <div class="book book-3"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-container">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>登录您的账号，继续您的阅读之旅</p>
          </div>

          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-icon>
                  <User />
                </el-icon>
                <el-input v-model="loginForm.username" placeholder="用户名" class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-icon>
                  <Lock />
                </el-icon>
                <el-input v-model="loginForm.password" type="password" placeholder="密码" class="custom-input">
                </el-input>
              </div>
            </el-form-item>

            <div class="action-row">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="#" class="forget-link">忘记密码?</a>
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

    <footer class="site-footer">
      <p>探索阅读的无限可能 | 图书室借阅管理系统 © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
import { User, Lock } from '@element-plus/icons-vue'

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
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;

  .shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.2;

    &.shape-1 {
      top: 10%;
      left: 5%;
      width: 250px;
      height: 250px;
      background: linear-gradient(120deg, #64b5f6, #5e72e4);
      animation: float 20s infinite alternate ease-in-out;
    }

    &.shape-2 {
      bottom: 10%;
      right: 10%;
      width: 350px;
      height: 350px;
      background: linear-gradient(120deg, #5e72e4, #b066fe);
      animation: float 25s infinite alternate-reverse ease-in-out;
    }

    &.shape-3 {
      top: 60%;
      left: 15%;
      width: 150px;
      height: 150px;
      background: linear-gradient(120deg, #b066fe, #64b5f6);
      animation: float 18s infinite alternate ease-in-out 2s;
    }

    &.shape-4 {
      top: 20%;
      right: 20%;
      width: 200px;
      height: 200px;
      background: linear-gradient(120deg, #64b5f6, #b066fe);
      animation: float 22s infinite alternate-reverse ease-in-out 3s;
    }
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(20px, 30px) rotate(4deg);
  }

  100% {
    transform: translate(-20px, -15px) rotate(-4deg);
  }
}

.login-wrapper {
  position: relative;
  z-index: 5;
  width: 85%;
  max-width: 1200px;
  min-height: 600px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
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
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 500px;
}

.site-name {
  font-size: 52px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #ffffff, #e0f7fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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

.floating-books {
  position: relative;
  height: 100%;

  .book {
    position: absolute;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

    &::before {
      content: '';
      position: absolute;
      height: 80%;
      width: 2px;
      background: rgba(255, 255, 255, 0.3);
      left: 15%;
      top: 10%;
    }

    &.book-1 {
      height: 160px;
      width: 120px;
      transform: rotate(-15deg);
      left: 30%;
      top: 10%;
      animation: float-book 6s infinite ease-in-out;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
    }

    &.book-2 {
      height: 140px;
      width: 105px;
      transform: rotate(5deg);
      right: 25%;
      top: 20%;
      animation: float-book 8s infinite ease-in-out 1s;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02));
    }

    &.book-3 {
      height: 120px;
      width: 90px;
      transform: rotate(20deg);
      left: 15%;
      bottom: 15%;
      animation: float-book 7s infinite ease-in-out 0.5s;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
    }
  }
}

@keyframes float-book {

  0%,
  100% {
    transform: translateY(0) rotate(-15deg);
  }

  50% {
    transform: translateY(-15px) rotate(-10deg);
  }
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
  margin-bottom: 40px;
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
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 2px solid transparent;
  height: 56px;
  margin-bottom: 20px;

  .el-icon {
    padding: 0 15px;
    font-size: 20px;
    color: #78909c;
  }

  &:hover,
  &:focus-within {
    background-color: #fff;
    border-color: #64b5f6;
    box-shadow: 0 4px 12px rgba(100, 181, 246, 0.15);

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
    background-color: transparent;
  }

  .el-input__inner {
    height: 52px;
    font-size: 16px;
    width: 100% !important;
    padding-right: 15px;
  }
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 30px;
  padding: 0 5px;

  .forget-link {
    color: #5e72e4;
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
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #64b5f6 0%, #5e72e4 100%);
  border: none;
  box-shadow: 0 8px 16px rgba(94, 114, 228, 0.3);
  transition: all 0.3s;
  margin-bottom: 20px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(94, 114, 228, 0.4);
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
    color: #5e72e4;
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

  .input-wrapper {
    height: 52px;
  }

  :deep(.custom-input) {
    .el-input__inner {
      height: 48px;
    }
  }
}
</style>