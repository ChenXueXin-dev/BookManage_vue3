<template>
  <div class="user-management">
    <!-- 搜索区域：统一样式 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            <span>搜索</span>
          </el-button>
          <el-button @click="resetSearch">
            <el-icon>
              <Refresh />
            </el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
      <div class="table-operations">
        <el-button class="add-btn" @click="handleAddUser">
          <el-icon>
            <Plus />
          </el-icon>
          <span>新增用户</span>
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          <el-icon>
            <Delete />
          </el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <div class="status-tab-container">
        <el-tabs v-model="roleTabValue" @tab-change="handleRoleTabChange">
          <el-tab-pane label="全部用户" name="all"></el-tab-pane>
          <el-tab-pane label="管理员" name="ADMIN"></el-tab-pane>
          <el-tab-pane label="普通用户" name="USER"></el-tab-pane>
        </el-tabs>
      </div>

      <!-- 带固定高度的滚动表格 -->
      <el-scrollbar height="600px">
        <el-table v-loading="loading" :data="userList" border stripe style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="name" label="昵称" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="roleType" label="角色">
            <template #default="scope">
              <el-tag :type="scope.row.roleType === 'ADMIN' ? 'danger' :
                scope.row.roleType === 'LIBRARIAN' ? 'warning' : 'success'">
                {{ scope.row.roleType === 'ADMIN' ? '管理员' :
                  scope.row.roleType === 'LIBRARIAN' ? '图书管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" size="small" link @click="handleResetUserPassword(scope.row)">
                重置密码
              </el-button>
              <el-button type="danger" size="small" link @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>

      <!-- 分页：统一居中样式 -->
      <div class="pagination-container">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50, 100]"
          :total="total" :page-size="pageSize" :current-page="currentPage" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>



    <!-- 用户表单对话框 -->
    <el-dialog :title="dialogTitle" v-model="userFormVisible" width="500px" append-to-body destroy-on-close>
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px">
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
          <el-input v-model="userForm.confirmPassword" placeholder="请再次输入密码" type="password" show-password />
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
    <el-dialog title="重置密码" v-model="resetPasswordVisible" width="500px" append-to-body destroy-on-close>
      <el-form ref="resetPasswordFormRef" :model="resetPasswordForm" :rules="resetPasswordRules" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPasswordForm.newPassword" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPasswordForm.confirmPassword" placeholder="请再次输入新密码" type="password" show-password />
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

// 搜索表单（对齐评论管理的命名）
const searchForm = reactive({
  username: '',
  status: undefined
});

// 角色Tab值（对齐评论管理的Tab逻辑）
const roleTabValue = ref('all');
// 筛选条件
const filterParams = reactive({
  roleType: undefined // undefined:全部, ADMIN:管理员, USER:普通用户
});

// 表格数据（对齐评论管理的命名）
const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRows = ref([]);

// 表单相关
const userFormRef = ref(null);
const resetPasswordFormRef = ref(null);
const userFormVisible = ref(false);
const resetPasswordVisible = ref(false);

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

// 获取用户列表（对齐评论管理的方法名和逻辑）
const fetchUserList = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params = {
      username: searchForm.username || undefined,
      status: searchForm.status,
      roleType: filterParams.roleType,
      currentPage: currentPage.value,
      size: pageSize.value
    };

    const res = await request.get('/user/page', params, {
      showDefaultMsg: false
    });

    userList.value = res.records || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索（对齐评论管理的方法名）
const handleSearch = () => {
  currentPage.value = 1;
  fetchUserList();
};

// 重置搜索（对齐评论管理的方法名）
const resetSearch = () => {
  // 重置搜索表单
  searchForm.username = '';
  searchForm.status = undefined;
  // 重置Tab状态
  roleTabValue.value = 'all';
  // 重置筛选条件
  filterParams.roleType = undefined;
  // 重置页码
  currentPage.value = 1;
  // 刷新列表
  fetchUserList();
};

// 处理角色Tab切换（对齐评论管理的Tab逻辑）
const handleRoleTabChange = (value) => {
  // 重置筛选条件
  filterParams.roleType = undefined;

  // 根据Tab值设置筛选条件
  switch (value) {
    case 'all':
      // 全部用户 - 不筛选
      break;
    case 'ADMIN':
      // 管理员
      filterParams.roleType = 'ADMIN';
      break;
    case 'USER':
      // 普通用户
      filterParams.roleType = 'USER';
      break;
  }

  // 重置页码并刷新列表
  currentPage.value = 1;
  fetchUserList();
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchUserList();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchUserList();
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 处理用户状态变化
const handleStatusChange = async (row) => {
  try {
    await request.put(`/user/${row.id}/status?status=${row.status}`, null, {
      successMsg: `用户 "${row.username}" 状态已${row.status === 1 ? '启用' : '禁用'}`,
      onError: (error) => {
        console.error('更新用户状态失败:', error);
        row.status = row.status === 1 ? 0 : 1;
      }
    });
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1;
  }
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
      await request.delete(`/user/delete/${row.id}`, {
        successMsg: '删除成功',
        onSuccess: () => {
          fetchUserList();
        },
        onError: (error) => {
          console.error('删除用户失败:', error);
          ElMessage.error('删除用户失败');
        }
      });
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {
    console.log('用户取消操作');
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
      await request.post('/user/batch-delete', { ids: userIds }, {
        successMsg: '批量删除成功',
        onSuccess: () => {
          fetchUserList();
        },
        onError: (error) => {
          console.error('批量删除用户失败:', error);
          ElMessage.error('批量删除用户失败');
        }
      });
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {
    console.log('用户取消操作');
  });
};

// 提交用户表单
const submitUserForm = async () => {
  await userFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      if (userForm.id) {
        const updateData = {
          name: userForm.name,
          email: userForm.email,
          roleType: userForm.roleType,
          status: userForm.status
        };

        await request.put(`/user/${userForm.id}`, updateData, {
          successMsg: '修改成功',
          onSuccess: () => {
            userFormVisible.value = false;
            fetchUserList();
          },
          onError: (error) => {
            console.error('修改用户失败:', error);
            ElMessage.error(error.message || '修改失败');
          }
        });
      } else {
        await request.post('/user/add', userForm, {
          successMsg: '新增成功',
          onSuccess: () => {
            userFormVisible.value = false;
            fetchUserList();
          },
          onError: (error) => {
            console.error('新增用户失败:', error);
            ElMessage.error(error.message || '新增失败');
          }
        });
      }
    } catch (error) {
      console.error('操作失败:', error);
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
      console.error('操作失败:', error);
    }
  });
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return dateTime;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 初始化加载列表
onMounted(() => {
  fetchUserList();
});
</script>

<style lang="scss" scoped>
$primary-gradient: linear-gradient(135deg, #4F9DFB, #77bafe 40%, #90edc6);

// 整体容器样式（对齐评论管理）
.user-management {
  padding: 20px 0;
  height: 600px;
}

// 统一搜索区域样式（完全复用评论管理的样式）
.search-area {
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  margin-bottom: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .search-form {
    display: flex;
    align-items: center;
  }

  // Tab标签样式
  .status-tab-container {
    margin-top: 15px;

    :deep(.el-tabs) {
      .el-tabs__header {
        margin: 0;
      }

      .el-tabs__nav-wrap::after {
        background-color: #e5e6eb;
      }

      .el-tabs__item {
        margin: 0 15px 0 0;

        &.is-active {
          color: #409eff;
        }
      }
    }
  }
}

// 统一表格容器样式（完全复用评论管理的样式）
.table-container {
  background-color: #fff;
  padding: 5px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .table-operations {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
}

// 新增用户按钮样式
.add-btn {
  background: $primary-gradient;
  color: #fff;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(79, 157, 251, 0.3);
  }

  .el-icon {
    font-size: 18px;
    font-weight: bold;
  }
}

// 分页样式（居中，对齐评论管理）
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

// 对话框按钮样式
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>