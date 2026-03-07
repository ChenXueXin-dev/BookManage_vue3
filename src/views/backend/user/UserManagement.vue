<template>
  <div class="user-management-container">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/back/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>系统管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header">
        <h2>用户管理</h2>
        <div class="actions">
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
          <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryParams.roleType" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="ADMIN" />
            <!-- <el-option label="图书管理员" value="LIBRARIAN" /> -->
            <el-option label="普通用户" value="USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      v-loading="loading"
      :data="userList"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="name" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="roleType" label="角色">
        <template #default="scope">
          <el-tag
            :type="scope.row.roleType === 'ADMIN' ? 'danger' : 
                  scope.row.roleType === 'LIBRARIAN' ? 'warning' : 'success'"
          >
            {{ scope.row.roleType === 'ADMIN' ? '管理员' : 
               scope.row.roleType === 'LIBRARIAN' ? '图书管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link @click="handleResetUserPassword(scope.row)">
            重置密码
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        :current-page="queryParams.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="userFormVisible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="userForm.id !== undefined" />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="roleType">
          <el-select v-model="userForm.roleType" placeholder="请选择角色">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="图书管理员" value="LIBRARIAN" />
            <el-option label="普通用户" value="USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!userForm.id">
          <el-input
            v-model="userForm.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitUserForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="resetPasswordVisible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            placeholder="请输入新密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPasswordForm.confirmPassword"
            placeholder="请再次输入新密码"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitResetPassword">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue';
import request from '@/utils/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const selectedRows = ref([]);
const userFormRef = ref(null);
const resetPasswordFormRef = ref(null);
const userFormVisible = ref(false);
const resetPasswordVisible = ref(false);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  roleType: '',
  status: undefined
});

// 用户表单
const userForm = reactive({
  id: undefined,
  username: '',
  name: '',
  email: '',
  roleType: 'USER',
  password: '',
  confirmPassword: '',
  status: 1
});

// 重置密码表单
const resetPasswordForm = reactive({
  userId: null,
  newPassword: '',
  confirmPassword: ''
});

// 对话框标题
const dialogTitle = computed(() => {
  return userForm.id ? '编辑用户' : '新增用户';
});

// 自定义校验规则 - 确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== userForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

// 自定义校验规则 - 确认重置密码
const validateResetConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== resetPasswordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

// 邮箱验证正则表达式
const emailPattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

// 用户表单校验规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  roleType: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 重置密码表单校验规则
const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateResetConfirmPassword, trigger: 'blur' }
  ]
};

// 获取用户列表
const getUserList = async () => {
  try {
    loading.value = true;
    // 修改为与后端一致的API路径和参数
    const params = {
      username: queryParams.username,
      roleType: queryParams.roleType,
      status: queryParams.status,
      currentPage: queryParams.pageNum,
      size: queryParams.pageSize
    };
    await request.get('/user/page', params, {
      showDefaultMsg: false,
      onSuccess: (res) => {
        userList.value = res.records || [];
        total.value = res.total || 0;
      },
      onError: (error) => {
        console.error('获取用户列表失败:', error);
        ElMessage.error('获取用户列表失败');
      }
    });
  } finally {
    loading.value = false;
  }
};

// 处理查询
const handleSearch = () => {
  queryParams.pageNum = 1;
  getUserList();
};

// 重置查询参数
const resetQuery = () => {
  queryParams.username = '';
  queryParams.roleType = '';
  queryParams.status = undefined;
  queryParams.pageNum = 1;
  getUserList();
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 处理用户状态变化
const handleStatusChange = async (row) => {
  try {
    // 直接使用request调用API
    await request.put(`/user/${row.id}/status?status=${row.status}`, null, {
      successMsg: `用户 "${row.username}" 状态已${row.status === 1 ? '启用' : '禁用'}`,
      onError: (error) => {
        console.error('更新用户状态失败:', error);
        // 恢复状态
        row.status = row.status === 1 ? 0 : 1;
      }
    });
  } catch (error) {
    // 恢复状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 处理页码变化
const handleCurrentChange = (page) => {
  queryParams.pageNum = page;
  getUserList();
};

// 处理页面大小变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getUserList();
};

// 处理新增用户
const handleAddUser = () => {
  resetUserForm();
  userFormVisible.value = true;
};

// 重置用户表单
const resetUserForm = () => {
  userForm.id = undefined;
  userForm.username = '';
  userForm.name = '';
  userForm.email = '';
  userForm.roleType = 'USER';
  userForm.password = '';
  userForm.confirmPassword = '';
  userForm.status = 1;
  
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 处理编辑用户
const handleEdit = (row) => {
  userForm.id = row.id;
  userForm.username = row.username;
  userForm.name = row.name;
  userForm.email = row.email;
  userForm.roleType = row.roleType;
  userForm.status = row.status;
  userFormVisible.value = true;
};

// 处理删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 修改为与后端一致的API路径
      await request.delete(`/user/delete/${row.id}`, {
        successMsg: '删除成功',
        onSuccess: () => {
          getUserList();
        },
        onError: (error) => {
          console.error('删除用户失败:', error);
          ElMessage.error('删除用户失败');
        }
      });
    } catch (error) {
      // 错误已在request中处理
    }
  }).catch(() => {
    // 取消删除
  });
};

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }
  
  const usernames = selectedRows.value.map(row => row.username).join(', ');
  const userIds = selectedRows.value.map(row => row.id);
  
  ElMessageBox.confirm(`确定要删除以下用户吗? ${usernames}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 修改为与后端一致的API路径和参数格式
      await request.post('/user/batch-delete', { ids: userIds }, {
        successMsg: '批量删除成功',
        onSuccess: () => {
          getUserList();
        },
        onError: (error) => {
          console.error('批量删除用户失败:', error);
          ElMessage.error('批量删除用户失败');
        }
      });
    } catch (error) {
      // 错误已在request中处理
    }
  }).catch(() => {
    // 取消删除
  });
};

// 提交用户表单
const submitUserForm = async () => {
  await userFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      if (userForm.id) {
        // 编辑用户
        const updateData = {
          name: userForm.name,
          email: userForm.email,
          roleType: userForm.roleType,
          status: userForm.status
        };
        
        // 修改为与后端一致的API路径
        await request.put(`/user/${userForm.id}`, updateData, {
          successMsg: '修改成功',
          onSuccess: () => {
            userFormVisible.value = false;
            getUserList();
          },
          onError: (error) => {
            console.error('修改用户失败:', error);
            ElMessage.error(error.message || '修改失败');
          }
        });
      } else {
        // 新增用户
        // 修改为与后端一致的API路径
        await request.post('/user/add', userForm, {
          successMsg: '新增成功',
          onSuccess: () => {
            userFormVisible.value = false;
            getUserList();
          },
          onError: (error) => {
            console.error('新增用户失败:', error);
            ElMessage.error(error.message || '新增失败');
          }
        });
      }
    } catch (error) {
      // 错误已在request中处理
    }
  });
};

// 处理重置用户密码
const handleResetUserPassword = (row) => {
  resetPasswordForm.userId = row.id;
  resetPasswordForm.newPassword = '';
  resetPasswordForm.confirmPassword = '';
  resetPasswordVisible.value = true;
  
  if (resetPasswordFormRef.value) {
    resetPasswordFormRef.value.resetFields();
  }
};

// 提交重置密码
const submitResetPassword = async () => {
  await resetPasswordFormRef.value.validate(async (valid) => {
    if (!valid) return;
    const params = {
      userId: resetPasswordForm.userId,
      newPassword: resetPasswordForm.newPassword
    }
    try {
      // 直接使用userId重置密码，后端已经支持
      await request.get('/user/forget', params, {
        successMsg: '密码重置成功',
        onSuccess: () => {
          resetPasswordVisible.value = false;
        },
        onError: (error) => {
          console.error('重置密码失败:', error);
          ElMessage.error(error.message || '重置密码失败');
        }
      });
    } catch (error) {
      // 错误已在request中处理
    }
  });
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return dateTime;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 组件挂载时获取用户列表
onMounted(() => {
  getUserList();
});
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.search-wrapper {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 