<template>
  <div class="category-management-container">
    <div class="page-header">
      <h2 class="page-title">图书分类管理</h2>
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>
    </div>
    
    <div class="content-wrapper">
      <div class="category-tree-container">
        <el-card class="tree-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类列表</span>
              <el-button type="success" size="small" @click="refreshCategoryTree">刷新</el-button>
            </div>
          </template>
          <el-tree
            ref="categoryTreeRef"
            :data="categoryTree"
            node-key="id"
            :props="defaultProps"
            default-expand-all
            :expand-on-click-node="false"
            highlight-current
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span class="tree-node-actions">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click.stop="handleAddChild(data)"
                  >
                    添加子分类
                  </el-button>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click.stop="handleEdit(data)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click.stop="handleDelete(node, data)"
                  >
                    删除
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </div>
      
      <div class="category-details-container" v-if="currentCategory">
        <el-card class="details-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类详情</span>
              <el-button type="primary" size="small" @click="handleEdit(currentCategory)">
                编辑
              </el-button>
            </div>
          </template>
          <div class="category-info">
            <div class="info-item">
              <span class="label">分类ID:</span>
              <span class="value">{{ currentCategory.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">分类名称:</span>
              <span class="value">{{ currentCategory.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">父分类:</span>
              <span class="value">{{ getParentCategoryName(currentCategory.parentId) }}</span>
            </div>
      
            <div class="info-item">
              <span class="label">排序号:</span>
              <span class="value">{{ currentCategory.sort || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDateTime(currentCategory.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新时间:</span>
              <span class="value">{{ formatDateTime(currentCategory.updateTime) }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : addAsChild ? '添加子分类' : '添加分类'"
      width="40%"
      destroy-on-close
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categorySelectTree"
            :props="defaultProps"
            :render-after-expand="false"
            check-strictly
            value-key="id"
            default-expand-all
            placeholder="请选择父分类（不选则为顶级分类）"
            clearable
          ></el-tree-select>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm" :loading="submitLoading">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

// 状态变量
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const addAsChild = ref(false);
const categoryTree = ref([]);
const flatCategories = ref([]);
const categoryTreeRef = ref(null);
const categoryFormRef = ref(null);
const currentCategory = ref(null);

// 树形配置
const defaultProps = {
  children: 'children',
  label: 'name'
};

// 表单对象
const categoryForm = reactive({
  id: null,
  name: '',
  parentId: null,
  sort: 0
});

// 表单校验规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 50, message: '分类名称长度不能超过50个字符', trigger: 'blur' }
  ],
  parentId: [
    { 
      validator: (rule, value, callback) => {
        if (value) {
          // 获取父级分类
          const parentCategory = flatCategories.value.find(item => item.id === value);
          if (parentCategory) {
            // 获取父级的父级
            const grandParent = flatCategories.value.find(item => item.id === parentCategory.parentId);
            // 检查是否已经有两级父级（即将形成四级分类）
            if (grandParent && grandParent.parentId) {
              callback(new Error('分类最多支持三级'));
              return;
            }
          }
        }
        callback();
      }, 
      trigger: 'change' 
    }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ]
};

// 分类选择树（去除当前分类及其子分类）
const categorySelectTree = computed(() => {
  if (!isEdit.value) {
    return categoryTree.value;
  }
  
  // 深拷贝分类树
  const cloneData = JSON.parse(JSON.stringify(categoryTree.value));
  
  // 移除当前分类及其子分类，避免循环引用
  const removeCurrentAndChildren = (tree, id) => {
    return tree.filter(node => {
      if (node.id === id) {
        return false;
      }
      if (node.children && node.children.length > 0) {
        node.children = removeCurrentAndChildren(node.children, id);
      }
      return true;
    });
  };
  
  return removeCurrentAndChildren(cloneData, categoryForm.id);
});

// 生命周期钩子
onMounted(() => {
  fetchCategoryTree();
});

// 获取分类树
const fetchCategoryTree = async () => {
  loading.value = true;
  try {
    const res = await request.get('/book/category/tree');
    categoryTree.value = res || [];
    
    // 扁平化分类树，方便查找
    flatCategories.value = flattenTree(categoryTree.value);
  } catch (error) {
    console.error('获取分类树失败:', error);
  } finally {
    loading.value = false;
  }
};

// 扁平化树形结构
const flattenTree = (tree) => {
  const result = [];
  
  const flatten = (nodes) => {
    nodes.forEach(node => {
      result.push({
        id: node.id,
        name: node.name,
        parentId: node.parentId
      });
      
      if (node.children && node.children.length > 0) {
        flatten(node.children);
      }
    });
  };
  
  flatten(tree);
  return result;
};

// 刷新分类树
const refreshCategoryTree = () => {
  fetchCategoryTree();
  currentCategory.value = null;
};

// 获取父分类名称
const getParentCategoryName = (parentId) => {
  if (!parentId) return '无（顶级分类）';
  
  const parent = flatCategories.value.find(item => item.id === parentId);
  return parent ? parent.name : '未知';
};

// 节点点击事件
const handleNodeClick = (data) => {
  currentCategory.value = data;
};

// 显示添加分类对话框
const showAddDialog = () => {
  isEdit.value = false;
  addAsChild.value = false;
  resetCategoryForm();
  dialogVisible.value = true;
};

// 获取分类的级别
const getCategoryLevel = (categoryId) => {
  if (!categoryId) return 1; // 顶级分类
  
  const category = flatCategories.value.find(item => item.id === categoryId);
  if (!category) return 1;
  
  if (!category.parentId) return 2; // 二级分类
  
  const parentCategory = flatCategories.value.find(item => item.id === category.parentId);
  if (!parentCategory || !parentCategory.parentId) return 3; // 三级分类
  
  return 4; // 四级分类（不应该出现）
};

// 处理添加子分类
const handleAddChild = (data) => {
  // 检查分类级别，若已是三级分类则不允许添加子分类
  const level = getCategoryLevel(data.id);
  if (level >= 3) {
    ElMessage.warning('最多只能创建三级分类');
    return;
  }
  
  isEdit.value = false;
  addAsChild.value = true;
  resetCategoryForm();
  categoryForm.parentId = data.id;
  dialogVisible.value = true;
};

// 处理编辑分类
const handleEdit = (data) => {
  isEdit.value = true;
  addAsChild.value = false;
  resetCategoryForm();
  
  categoryForm.id = data.id;
  categoryForm.name = data.name;
  categoryForm.parentId = data.parentId;
  categoryForm.sort = data.sort || 0;
  
  dialogVisible.value = true;
};

// 处理删除分类
const handleDelete = (node, data) => {
  // 检查是否有子分类
  if (data.children && data.children.length > 0) {
    ElMessage.warning('该分类下有子分类，无法删除');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要删除分类"${data.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await request.delete(`/book/category/${data.id}`, {
          successMsg: '删除成功'
        });
        
        // 刷新分类树
        await fetchCategoryTree();
        
        // 如果删除的是当前选中的分类，则清空当前选中
        if (currentCategory.value && currentCategory.value.id === data.id) {
          currentCategory.value = null;
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.id = null;
  categoryForm.name = '';
  categoryForm.parentId = null;
  categoryForm.sort = 0;
};

// 提交分类表单
const submitCategoryForm = () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value) {
          // 编辑分类
          await request.put(`/book/category/${categoryForm.id}`, categoryForm, {
            successMsg: '编辑成功'
          });
        } else {
          // 添加分类
          await request.post('/book/category/add', categoryForm, {
            successMsg: '添加成功'
          });
        }
        
        dialogVisible.value = false;
        
        // 刷新分类树
        await fetchCategoryTree();
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        submitLoading.value = false;
      }
    } else {
      ElMessage.warning('请正确填写表单');
      return false;
    }
  });
};

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未知';
  
  const date = new Date(datetime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


</script>

<style lang="scss" scoped>
.category-management-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .content-wrapper {
    display: flex;
    gap: 20px;
    
    .category-tree-container {
      width: 45%;
      
      .tree-card {
        height: 100%;
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .custom-tree-node {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 8px;
          
          .tree-node-actions {
            display: none;
          }
          
          &:hover .tree-node-actions {
            display: block;
          }
        }
      }
    }
    
    .category-details-container {
      width: 55%;
      
      .details-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .category-info {
          .info-item {
            display: flex;
            margin-bottom: 15px;
            
            .label {
              font-weight: 500;
              width: 100px;
              color: #606266;
            }
            
            .value {
              flex: 1;
              color: #333;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    
    .category-tree-container,
    .category-details-container {
      width: 100% !important;
    }
  }
}
</style> 