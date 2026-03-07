<template>
  <div class="register-container">
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="register-wrapper">
      <div class="brand-section">
        <div class="brand-content">
          <h1 class="site-name">图书室借阅管理系统</h1>
          <div class="slogan-wrapper">
            <p class="site-slogan">每一本书都是一次心灵的旅行</p>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <el-icon>
                  <Collection />
                </el-icon>
              </div>
              <div class="feature-text">
                <h3>海量图书推荐</h3>
                <p>根据您的阅读喜好，智能推荐优质书籍</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <el-icon>
                  <StarFilled />
                </el-icon>
              </div>
              <div class="feature-text">
                <h3>个性化阅读体验</h3>
                <p>定制专属阅读计划，记录您的阅读足迹</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <el-icon>
                  <Connection />
                </el-icon>
              </div>
              <div class="feature-text">
                <h3>读者社区交流</h3>
                <p>与书友分享阅读心得，探讨文学见解</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-container">
          <div class="register-header">
            <h2>加入我们</h2>
            <p>创建您的账号，开启阅读之旅</p>
          </div>

          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
            <div class="form-row">
              <el-form-item prop="username">
                <div class="input-wrapper">
                  <el-icon>
                    <User />
                  </el-icon>
                  <el-input v-model="registerForm.username" placeholder="用户名" class="custom-input">
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="name">
                <div class="input-wrapper">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  <el-input v-model="registerForm.name" placeholder="真实姓名（选填）" class="custom-input">
                  </el-input>
                </div>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item prop="password">
                <div class="input-wrapper">
                  <el-icon>
                    <Lock />
                  </el-icon>
                  <el-input v-model="registerForm.password" type="password" placeholder="密码" class="custom-input">
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <div class="input-wrapper">
                  <el-icon>
                    <Lock />
                  </el-icon>
                  <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                    class="custom-input">
                  </el-input>
                </div>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item prop="email">
                <div class="input-wrapper">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <el-input v-model="registerForm.email" placeholder="电子邮箱" class="custom-input">
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="phone">
                <div class="input-wrapper">
                  <el-icon>
                    <Phone />
                  </el-icon>
                  <el-input v-model="registerForm.phone" placeholder="手机号（选填）" class="custom-input">
                  </el-input>
                </div>
              </el-form-item>
            </div>

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
      <p>探索阅读的无限可能 | 图书室借阅管理系统 © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, Phone, UserFilled, Collection, StarFilled, Connection } from '@element-plus/icons-vue'
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
  name: '',
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
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ],

  name: [
    { required: false }
  ]
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
.register-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  padding: 40px 0;
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

.register-wrapper {
  position: relative;
  z-index: 5;
  width: 90%;
  max-width: 1400px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.brand-section {
  flex: 1;
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
  width: 100%;
  max-width: 500px;
}

.site-name {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #ffffff, #e0f7fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.slogan-wrapper {
  position: relative;
  margin-bottom: 50px;
  text-align: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 60px;
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

.features-list {
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;

    .el-icon {
      font-size: 28px;
    }
  }

  .feature-text {
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
      opacity: 0.9;
    }
  }
}

.form-section {
  flex: 1.2;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 40px;
}

.form-container {
  width: 100%;
  max-width: 600px;
}

.register-header {
  margin-bottom: 40px;
  text-align: center;

  h2 {
    font-size: 36px;
    font-weight: 600;
    color: #37474f;
    margin-bottom: 10px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  transition: all 0.3s;
  border: 2px solid transparent;
  height: 54px;

  .el-icon {
    padding: 0 15px;
    font-size: 18px;
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

:deep(.custom-input) {
  .el-input__wrapper {
    box-shadow: none !important;
    padding: 0;
    background-color: transparent;
  }

  .el-input__inner {
    height: 50px;
    font-size: 15px;
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
    color: #5e72e4;
    margin: 0 4px;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-button {
  width: 100%;
  height: 54px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #64b5f6 0%, #5e72e4 100%);
  border: none;
  box-shadow: 0 8px 16px rgba(94, 114, 228, 0.3);
  transition: all 0.3s;

  &:hover {
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
  margin-top: 25px;

  p {
    color: #78909c;
    margin-right: 10px;
    font-size: 15px;
  }

  .login-link {
    color: #5e72e4;
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

@media (max-width: 1200px) {
  .register-wrapper {
    max-width: 1000px;
  }

  .feature-item {
    padding: 15px;

    .feature-icon {
      width: 50px;
      height: 50px;
      margin-right: 15px;

      .el-icon {
        font-size: 24px;
      }
    }
  }
}

@media (max-width: 992px) {
  .register-wrapper {
    flex-direction: column;
    max-width: 600px;
  }

  .brand-section,
  .form-section {
    padding: 40px 30px;
  }

  .site-name {
    font-size: 42px;
  }

  .features-list {
    margin-top: 30px;
  }

  .form-container {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .register-container {
    padding: 20px 0;
  }

  .register-wrapper {
    width: 95%;
    border-radius: 16px;
  }

  .brand-section,
  .form-section {
    padding: 30px 20px;
  }

  .site-name {
    font-size: 36px;
  }

  .slogan-wrapper {
    margin-bottom: 30px;

    &::before,
    &::after {
      width: 40px;
    }
  }

  .feature-item {
    padding: 12px;

    .feature-icon {
      width: 40px;
      height: 40px;
      margin-right: 10px;

      .el-icon {
        font-size: 20px;
      }
    }

    .feature-text {
      h3 {
        font-size: 16px;
      }

      p {
        font-size: 12px;
      }
    }
  }

  .register-header h2 {
    font-size: 28px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .register-button {
    height: 50px;
  }
}
</style>