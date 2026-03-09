<template>
  <div class="config-management-container">
    <div class="content-wrapper">
      <!-- 配置列表 -->
      <el-card class="config-list-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>借阅配置</span>
            <el-button type="success" size="small" @click="refreshConfigList">刷新</el-button>
          </div>
        </template>

        <div v-loading="loading">
          <div class="borrow-config-item" v-for="config in filteredConfigList" :key="config.configKey">
            <div class="config-header">
              <h3>{{ getConfigTitle(config.configKey) }}</h3>
              <el-button type="primary" link @click="handleEdit(config)">编辑</el-button>
            </div>
            <div class="config-content">
              <div class="config-value">
                <span class="label">当前值：</span>
                <span class="value">{{ config.configValue }}</span>
              </div>
              <div class="config-desc">
                <span>{{ config.description }}</span>
              </div>
            </div>
          </div>

          <div v-if="filteredConfigList.length === 0 && !loading" class="no-config">
            <el-empty description="未找到借阅相关配置">
              <el-button type="primary" @click="createDefaultConfigs">创建默认配置</el-button>
            </el-empty>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 编辑配置对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑借阅配置" width="40%" destroy-on-close>
      <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="100px">
        <el-form-item label="配置值" prop="configValue">
          <el-input-number v-model="configForm.configValue" :min="1" :max="getMaxValueByKey(configForm.configKey)"
            controls-position="right" style="width: 100%">
          </el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="configForm.description" type="textarea" placeholder="请输入配置描述" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConfigForm" :loading="submitLoading">
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

// 刷新配置列表
const refreshConfigList = () => {
  fetchConfigList();
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
.config-management-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .content-wrapper {
    .config-list-card {
      width: 100%;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .borrow-config-item {
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 4px;
        background-color: #f8f8f8;
        border-left: 4px solid #409EFF;

        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          h3 {
            margin: 0;
            color: #303133;
          }
        }

        .config-content {
          .config-value {
            margin-bottom: 8px;

            .label {
              font-weight: 500;
              color: #606266;
            }

            .value {
              font-size: 18px;
              font-weight: bold;
              color: #409EFF;
              margin-left: 8px;
            }
          }

          .config-desc {
            color: #909399;
            font-size: 14px;
          }
        }

        &:hover {
          background-color: #f0f7ff;
        }
      }

      .no-config {
        padding: 30px 0;
        text-align: center;
      }
    }
  }
}
</style>