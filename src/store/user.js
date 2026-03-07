import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const token = ref(localStorage.getItem('token') || '')
  const expiryNotifications = ref([])
  const overdueNotifications = ref([])
  
  // 计算属性
  const isLoggedIn = computed(() => Boolean(token.value))
  const roleType = computed(() => userInfo.value.roleType || '')
  const userId = computed(() => userInfo.value.id)
  // 合并即将到期和已逾期的通知
  const allNotifications = computed(() => [...expiryNotifications.value, ...overdueNotifications.value])
  
  // 方法
  /**
   * 设置用户信息
   * @param {Object} info 用户信息
   */
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
    
    if (info.token) {
      token.value = info.token
      localStorage.setItem('token', info.token)
    }
  }
  
  /**
   * 获取用户信息（直接从本地获取，不进行API调用）
   */
  function getUserInfo() {
    // 直接返回当前存储的用户信息
    request.get("/user/current",null,{
      showDefaultMsg:false,
      onSuccess:(res)=>{
        setUserInfo({
          ...res
        })
        return res;
      },
      onError:(err)=>{
        ElMessage.error(err.msg || '获取当前用户信息失败')
      }
    })
  }
  
  /**
   * 获取即将到期的借阅提醒
   */
  async function fetchExpiryNotifications() {
    if (!isLoggedIn.value || !userId.value) return;
    
    try {
      const res = await request.get('/borrow/soon-to-expire', {
        userId: userId.value
      }, {
        showDefaultMsg: false
      });
      
      if (res && Array.isArray(res)) {
        expiryNotifications.value = res;
      } else {
        expiryNotifications.value = [];
      }
    } catch (error) {
      console.error('获取借阅到期提醒失败:', error);
      expiryNotifications.value = [];
    }
  }
  
  /**
   * 获取已逾期的借阅提醒
   */
  async function fetchOverdueNotifications() {
    if (!isLoggedIn.value || !userId.value) return;
    
    try {
      const res = await request.get('/borrow/overdue', {
        userId: userId.value
      }, {
        showDefaultMsg: false
      });
      
      if (res && Array.isArray(res)) {
        overdueNotifications.value = res;
      } else {
        overdueNotifications.value = [];
      }
    } catch (error) {
      console.error('获取已逾期借阅提醒失败:', error);
      overdueNotifications.value = [];
    }
  }
  
  /**
   * 获取所有借阅提醒（包括即将到期和已逾期）
   */
  async function fetchAllNotifications() {
    await Promise.all([
      fetchExpiryNotifications(),
      fetchOverdueNotifications()
    ]);
  }
  
  /**
   * 登出
   */
  async function logout() {
    try {
      // 清除状态
      userInfo.value = {}
      token.value = ''
      expiryNotifications.value = []
      overdueNotifications.value = []
      
      // 清除本地存储
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      
      ElMessage.success('退出登录成功')
      return true
    } catch (error) {
      console.error('退出登录失败:', error)
      return false
    }
  }
  
  /**
   * 检查是否有指定角色
   * @param {string|Array} roles 角色或角色数组
   */
  function hasRole(roles) {
    if (!roleType.value) return false
    
    if (typeof roles === 'string') {
      return roles === roleType.value
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(roleType.value)
    }
    
    return false
  }
  
  return {
    userInfo,
    token,
    isLoggedIn,
    roleType,
    userId,
    expiryNotifications,
    overdueNotifications,
    allNotifications,
    setUserInfo,
    getUserInfo,
    fetchExpiryNotifications,
    fetchOverdueNotifications,
    fetchAllNotifications,
    logout,
    hasRole
  }
}, {
  persist: true
})