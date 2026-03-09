<template>
  <div class="config-management-container">
    <div class="content-wrapper">
      <!-- 配置列表 -->
      <div class="config-list-wrapper">
        <div class="page-header">
          <el-button type="primary" size="default" @click="fetchConfigList">
            <el-icon>
              <Refresh />
            </el-icon>
            <span>刷新配置</span>
          </el-button>
        </div>

        <div v-loading="loading" class="config-grid">
          <div class="config-card" v-for="config in filteredConfigList" :key="config.configKey">
            <div class="config-card-header">
              <div class="config-icon">
                <el-icon v-if="config.configKey === 'borrow.max_days'">
                  <Calendar />
                </el-icon>
                <el-icon v-else-if="config.configKey === 'borrow.max_books'">
                  <Discount />
                </el-icon>
                <el-icon v-else-if="config.configKey === 'borrow.max_renew'">
                  <Clock />
                </el-icon>
              </div>
              <h3 class="config-name">{{ getConfigTitle(config.configKey) }}</h3>
              <el-button type="text" @click="handleEdit(config)" class="edit-btn">
                <el-icon>
                  <EditPen />
                </el-icon>
              </el-button>
            </div>

            <div class="config-card-body">
              <div class="config-value-display">
                {{ config.configValue }}
                <span class="config-unit" v-if="config.configKey === 'borrow.max_days'">天</span>
                <span class="config-unit" v-if="config.configKey === 'borrow.max_books'">本</span>
                <span class="config-unit" v-if="config.configKey === 'borrow.max_renew'">次</span>
              </div>
              <p class="config-description">{{ config.description }}</p>
            </div>
          </div>

          <div v-if="filteredConfigList.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无借阅配置数据">
              <el-button type="primary" @click="createDefaultConfigs">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>创建默认配置</span>
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑配置对话框 -->
    <el-dialog v-model="dialogVisible" title="修改配置值" width="500px" destroy-on-close>
      <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="100px" class="config-form">
        <div class="form-header">
          <el-icon class="form-icon">
            <Setting />
          </el-icon>
          <h3>{{ getConfigTitle(configForm.configKey) }}</h3>
        </div>

        <el-form-item label="配置值" prop="configValue">
          <el-input-number v-model="configForm.configValue" :min="1" :max="getMaxValueByKey(configForm.configKey)"
            controls-position="right" style="width: 100%" size="large">
          </el-input-number>
          <div class="form-tip">
            取值范围：1 - {{ getMaxValueByKey(configForm.configKey) }}
          </div>
        </el-form-item>

        <el-form-item label="配置说明">
          <el-input v-model="configForm.description" type="textarea" :disabled="true" size="large" rows="2"
            class="desc-input"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-actions">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitConfigForm" :loading="submitLoading" size="large">
            <el-icon>
              <Check />
            </el-icon>
            <span>保存修改</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入需要的图标
import {
  Refresh, Plus, Check, Discount,
  Clock,
  Calendar, Book, EditPen, Setting
} from '@element-plus/icons-vue';
import request from '@/utils/request';

// 状态变量
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const configList = ref([]);
const configFormRef = ref(null);

// 定义要管理的配置列表
const borrowConfigKeys = [
  'borrow.max_days',
  'borrow.max_books',
  'borrow.max_renew'
];

// 配置项描述
const configDescriptions = {
  'borrow.max_days': '最大借阅天数',
  'borrow.max_books': '单用户最大借阅数量',
  'borrow.max_renew': '最大续借次数'
};

// 配置项最大值限制
const configMaxValues = {
  'borrow.max_days': 180,  // 最多半年
  'borrow.max_books': 20,  // 最多20本
  'borrow.max_renew': 5    // 最多续借5次
};

// 获取配置项标题
const getConfigTitle = (key) => {
  return configDescriptions[key] || key;
};

// 获取配置项最大值
const getMaxValueByKey = (key) => {
  return configMaxValues[key] || 999;
};

// 过滤配置列表，只显示借阅相关配置
const filteredConfigList = computed(() => {
  return configList.value.filter(config => borrowConfigKeys.includes(config.configKey));
});

// 表单对象
const configForm = reactive({
  id: null,
  configKey: '',
  configValue: '',
  description: ''
});

// 表单校验规则
const configRules = {
  configValue: [
    { required: true, message: '请输入配置值', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (isNaN(value) || parseInt(value) <= 0) {
          callback(new Error('请输入大于0的数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 生命周期钩子
onMounted(() => {
  fetchConfigList();
});

// 获取配置列表
const fetchConfigList = async () => {
  loading.value = true;
  try {
    const res = await request.get('/system/config/list');
    configList.value = res || [];

    // 检查是否需要创建默认配置
    if (filteredConfigList.value.length === 0) {
      ElMessage.info('未找到借阅相关配置，可以点击创建默认配置');
    }
  } catch (error) {
    console.error('获取配置列表失败:', error);
    ElMessage.error('获取配置列表失败');
  } finally {
    loading.value = false;
  }
};

// 创建默认配置
const createDefaultConfigs = async () => {
  loading.value = true;
  try {
    const defaultConfigs = [
      {
        configKey: 'borrow.max_days',
        configValue: '30',
        description: '最大借阅天数'
      },
      {
        configKey: 'borrow.max_books',
        configValue: '5',
        description: '单用户最大借阅数量'
      },
      {
        configKey: 'borrow.max_renew',
        configValue: '2',
        description: '最大续借次数'
      }
    ];

    for (const config of defaultConfigs) {
      await request.post('/system/config/add', config);
    }

    ElMessage.success('创建默认配置成功');
    await fetchConfigList();
  } catch (error) {
    console.error('创建默认配置失败:', error);
    ElMessage.error('创建默认配置失败');
  } finally {
    loading.value = false;
  }
};

// 处理编辑配置
const handleEdit = (data) => {
  configForm.id = data.id;
  configForm.configKey = data.configKey;
  configForm.configValue = data.configValue;
  configForm.description = data.description;

  dialogVisible.value = true;
};

// 提交配置表单
const submitConfigForm = () => {
  configFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 编辑配置
        await request.put(`/system/config/${configForm.configKey}`, {
          ...configForm,
          configValue: String(configForm.configValue) // 转换为字符串
        }, {
          successMsg: '编辑成功'
        });

        dialogVisible.value = false;

        // 刷新配置列表
        await fetchConfigList();
      } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('保存失败');
      } finally {
        submitLoading.value = false;
      }
    } else {
      ElMessage.warning('请正确填写表单');
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
// 新的配色方案 - 暖色调
$primary: #367ee9;
$secondary: #667eea;
$accent: #764ba2;
$light-bg: #f8f9fa;
$card-bg: #ffffff;
$text-primary: #2d3748;
$text-secondary: #718096;
$text-light: #a0aec0;
$border-color: #e2e8f0;
$hover-color: #f7fafc;
$primary-gradient-low: linear-gradient(135deg, #77bafe, #77bafe 40%, #90edc6);

.config-management-container {
  padding: 2rem;
  min-height: 100vh;
}

.content-wrapper {
  margin: 0 auto;
}

.config-list-wrapper {
  border-radius: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;

  .page-title {
    margin: 0;
    color: $text-primary;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.config-card {
  background: $card-bg;
  border-radius: 0.75rem;
  border: 1px solid $border-color;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.config-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  .config-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: $primary-gradient-low;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;

    :deep(.el-icon) {
      font-size: 1.25rem;
    }
  }

  .config-name {
    flex: 1;
    margin: 0;
    color: $text-primary;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .edit-btn {
    color: $primary;
    padding: 0.25rem;

    &:hover {
      color: $secondary;
      background-color: rgba(54, 126, 233, 0.1);
    }
  }
}

.config-card-body {
  .config-value-display {
    font-size: 2.5rem;
    font-weight: 700;
    color: $primary;
    margin-bottom: 0.5rem;

    .config-unit {
      font-size: 1rem;
      font-weight: 400;
      color: $text-secondary;
      margin-left: 0.5rem;
    }
  }

  .config-description {
    color: $text-secondary;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

.empty-state {
  grid-column: 1 / -1;
  padding: 4rem 2rem;
  text-align: center;

  :deep(.el-empty) {
    :deep(.el-empty__description) {
      color: $text-secondary;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
  }
}

// 对话框样式
:deep(.el-dialog) {
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  :deep(.el-dialog__header) {
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid $border-color;

    :deep(.el-dialog__title) {
      color: $text-primary;
      font-size: 1.25rem;
      font-weight: 600;
    }
  }

  :deep(.el-dialog__body) {
    padding: 1.5rem;
  }

  :deep(.el-dialog__footer) {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid $border-color;
  }
}

.config-form {
  .form-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid $border-color;

    .form-icon {
      color: $primary;
      font-size: 1.5rem;
      margin-right: 0.75rem;
    }

    h3 {
      margin: 0;
      color: $text-primary;
      font-size: 1.1rem;
      font-weight: 500;
    }
  }

  .form-tip {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: $text-light;
  }

  .desc-input {
    background-color: $light-bg;
    color: $text-secondary;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}


// 按钮样式优化
:deep(.el-button) {
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;

  &.el-button--primary {
    background: $primary-gradient-low;
    border: none;

    &:hover {
      background: $primary-gradient-low;
      transform: translateY(-2px);

    }
  }
}

// 表单样式
:deep(.el-form-item) {
  margin-bottom: 1.5rem;

  :deep(.el-form-item__label) {
    color: $text-primary;
    font-weight: 500;
  }
}

:deep(.el-input-number) {
  --el-input-number-input-text-color: $text-primary;
  --el-input-number-input-bg-color: $card-bg;
  --el-input-number-border-color: $border-color;
  --el-input-number-hover-border-color: $primary;
}
</style>