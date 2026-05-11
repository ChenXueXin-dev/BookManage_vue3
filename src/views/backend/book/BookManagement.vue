<template>
  <div class="book-management-container">
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="图书标题">
          <el-input v-model="searchForm.keyword" placeholder="搜索书名" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable>
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id">
            </el-option>
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
      <el-button class="add-btn" @click="showAddBookDialog">
        <el-icon>
          <Plus />
        </el-icon>
        <span>新增图书</span>
      </el-button>
    </div>

    <div class="table-area">
      <div class="status-tab-container">
        <el-tabs v-model="statusTabValue" @tab-change="handleStatusTabChange">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="上架" name="1"></el-tab-pane>
          <el-tab-pane label="下架" name="0"></el-tab-pane>
        </el-tabs>
      </div>
      <el-scrollbar height="600px">
        <el-table v-loading="loading" :data="bookList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="60"></el-table-column>
          <el-table-column label="封面" width="80">
            <template #default="scope">
              <el-image style="width: 50px; height: 70px"
                :src="scope.row.coverUrl ? ('/api' + scope.row.coverUrl) : defaultCover"
                :preview-src-list="[scope.row.coverUrl ? ('/api' + scope.row.coverUrl) : defaultCover]"
                fit="cover"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="书名" min-width="150" show-overflow-tooltip></el-table-column>
          <el-table-column prop="author" label="作者" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="publisher" label="出版社" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="isbn" label="ISBN" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="categoryName" label="分类" width="100"></el-table-column>
          <el-table-column prop="stock" label="库存" width="80"></el-table-column>
          <el-table-column prop="borrowedCount" label="借阅次数" width="100"></el-table-column>
          <el-table-column prop="avgScore" label="评分" width="80"></el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
              <el-button link :type="scope.row.status === 1 ? 'warning' : 'success'" size="small"
                @click="handleToggleStatus(scope.row)">
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>

      <div class="pagination-container">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper"
          :current-page="searchForm.currentPage" :page-size="searchForm.size" :page-sizes="[10, 20, 50, 100]"
          :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>
      </div>
    </div>

    <!-- 新增/修改图书对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改图书' : '新增图书'" width="30%" destroy-on-close>
      <el-form ref="bookFormRef" :model="bookForm" :rules="bookRules" label-width="100px"
        style="max-height: 60vh; overflow-y: auto;">
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN编号"></el-input>
        </el-form-item>
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入书名"></el-input>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" placeholder="请输入出版社"></el-input>
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker v-model="bookForm.publishDate" type="date" placeholder="选择出版日期"
            style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="bookForm.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option v-for="category in categories" :key="category.id" :label="category.name"
              :value="category.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="bookForm.stock" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="图书封面" prop="coverUrl">
          <div class="upload-container">
            <el-upload class="cover-uploader" action="#" :show-file-list="false" :auto-upload="false"
              :on-change="handleCoverChange" accept="image/jpeg,image/png,image/jpg">
              <img v-if="bookForm.coverUrl"
                :src="bookForm.coverUrl.startsWith('http') ? bookForm.coverUrl : ('/api' + bookForm.coverUrl)"
                class="cover-preview" />
              <div v-else class="upload-placeholder">
                <el-icon>
                  <Plus />
                </el-icon>
                <div class="upload-text">点击上传</div>
              </div>
            </el-upload>
            <el-button type="primary" size="small" class="change-cover-btn" @click="showCropperDialog = true"
              v-if="bookForm.coverUrl">
              更换封面
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="图书简介" prop="description">
          <el-input v-model="bookForm.description" type="textarea" :rows="4" placeholder="请输入图书简介"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="bookForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBookForm" :loading="submitLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片裁剪对话框 -->
    <el-dialog v-model="showCropperDialog" title="图片裁剪" width="600px" destroy-on-close :close-on-click-modal="false"
      @closed="handleCropperDialogClosed">
      <div class="cropper-container">
        <div v-if="imageUrl" class="cropper-content">
          <VueCropper ref="cropperRef" :img="imageUrl" :info="true" :autoCrop="true" :autoCropWidth="200"
            :autoCropHeight="280" :fixedBox="true" :fixedNumber="[5, 7]" outputType="png" :canMove="true"
            :canScale="true" :centerBox="true" />
        </div>
        <div v-else class="cropper-tip">请先选择图片</div>

        <div class="cropper-control">
          <div class="control-btn-group">
            <el-button size="small" @click="selectImage">选择图片</el-button>
            <el-button size="small" @click="rotateImage">旋转</el-button>
            <el-button size="small" @click="resetCropper">重置</el-button>
          </div>

          <div class="cropper-preview" v-if="previewUrl">
            <div class="preview-title">预览</div>
            <img :src="previewUrl" class="preview-img" />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCropperDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCrop" :loading="uploadLoading">确认并上传</el-button>
        </span>
      </template>

      <!-- 隐藏的文件输入 -->
      <input type="file" ref="fileInputRef" accept="image/jpeg,image/png,image/jpg" style="display: none"
        @change="handleFileSelect" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';

// 状态变量
const loading = ref(false);
const submitLoading = ref(false);
const uploadLoading = ref(false);
const bookList = ref([]);
const total = ref(0);
const categories = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const bookFormRef = ref(null);
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif';

// 新增：状态Tab值
const statusTabValue = ref('all');

// 裁剪相关
const showCropperDialog = ref(false);
const cropperRef = ref(null);
const fileInputRef = ref(null);
const imageUrl = ref('');
const previewUrl = ref('');

// 表单对象
const searchForm = reactive({
  keyword: '',
  categoryId: null,
  status: null, // 保留status字段用于接口传参
  currentPage: 1,
  size: 10
});

const bookForm = reactive({
  id: null,
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publishDate: '',
  categoryId: null,
  description: '',
  coverUrl: '',
  stock: 0,
  status: 1
});

// 表单校验规则
const bookRules = {
  isbn: [
    { required: true, message: '请输入ISBN编号', trigger: 'blur' },
    { max: 20, message: 'ISBN编号长度不能超过20个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' },
    { max: 100, message: '书名长度不能超过100个字符', trigger: 'blur' }
  ],
  author: [
    { max: 100, message: '作者长度不能超过100个字符', trigger: 'blur' }
  ],
  publisher: [
    { max: 100, message: '出版社长度不能超过100个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 生命周期钩子
onMounted(() => {
  fetchCategories();
  fetchBooks();
});

// 获取图书分类
const fetchCategories = async () => {
  try {
    const res = await request.get('/book/category/all');
    categories.value = res || [];
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

// 获取图书列表
const fetchBooks = async () => {
  loading.value = true;
  try {
    const res = await request.get('/book/list', searchForm);
    bookList.value = res.records || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取图书列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索图书
const handleSearch = () => {
  searchForm.currentPage = 1;
  fetchBooks();
};

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.categoryId = null;
  searchForm.status = null;
  searchForm.currentPage = 1;
  // 重置Tab选中状态
  statusTabValue.value = 'all';
  fetchBooks();
};

// 新增：处理状态Tab切换
const handleStatusTabChange = (value) => {
  // all -> null, 1 -> 1, 0 -> 0
  searchForm.status = value === 'all' ? null : Number(value);
  searchForm.currentPage = 1; // 切换状态后重置页码
  fetchBooks();
};

// 每页条数变化
const handleSizeChange = (val) => {
  searchForm.size = val;
  fetchBooks();
};

// 页码变化
const handleCurrentChange = (val) => {
  searchForm.currentPage = val;
  fetchBooks();
};

// 显示新增图书对话框
const showAddBookDialog = () => {
  isEdit.value = false;
  Object.keys(bookForm).forEach(key => {
    bookForm[key] = key === 'status' ? 1 : key === 'stock' ? 0 : '';
  });
  dialogVisible.value = true;
};

// 处理修改图书
const handleEdit = (row) => {
  isEdit.value = true;
  Object.keys(bookForm).forEach(key => {
    bookForm[key] = row[key];
  });
  dialogVisible.value = true;
};

// 切换图书状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await request.put(`/book/${row.id}/status?status=${newStatus}`, null, {
      successMsg: newStatus === 1 ? '上架成功' : '下架成功'
    });
    // 刷新图书列表
    fetchBooks();
  } catch (error) {
    console.error('更新状态失败:', error);
  }
};

// 处理删除图书
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除《${row.title}》吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await request.delete(`/book/${row.id}`, {
          successMsg: '删除成功'
        });
        // 刷新图书列表
        fetchBooks();
      } catch (error) {
        console.error('删除失败:', error);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// 提交图书表单
const submitBookForm = () => {
  bookFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value) {
          // 修改图书
          await request.put(`/book/${bookForm.id}`, bookForm, {
            successMsg: '修改成功'
          });
        } else {
          // 新增图书
          await request.post('/book/add', bookForm, {
            successMsg: '新增成功'
          });
        }
        dialogVisible.value = false;
        fetchBooks();
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

// 封面图片变更处理
const handleCoverChange = (file) => {
  if (file && file.raw) {
    // 验证文件类型
    const isImage = /\.(jpe?g|png)$/i.test(file.raw.name);
    if (!isImage) {
      ElMessage.error('请选择jpg或png格式的图片');
      return;
    }

    // 验证文件大小 (最大5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.raw.size > maxSize) {
      ElMessage.error('图片大小不能超过5MB');
      return;
    }

    imageUrl.value = URL.createObjectURL(file.raw);
    showCropperDialog.value = true;
  }
};

// 选择图片
const selectImage = () => {
  fileInputRef.value.click();
};

// 文件选择处理
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 验证文件类型
  const isImage = /\.(jpe?g|png)$/i.test(file.name);
  if (!isImage) {
    ElMessage.error('请选择jpg或png格式的图片');
    return;
  }

  // 验证文件大小 (最大5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }

  imageUrl.value = URL.createObjectURL(file);

  // 重置文件选择器，以便下次选择同一文件也能触发事件
  e.target.value = '';
};

// 旋转图片
const rotateImage = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateRight();
  }
};

// 重置裁剪器
const resetCropper = () => {
  if (cropperRef.value) {
    cropperRef.value.refresh();
  }
};

// 关闭裁剪对话框时清空数据
const handleCropperDialogClosed = () => {
  imageUrl.value = '';
  previewUrl.value = '';
  if (cropperRef.value) {
    cropperRef.value.clearCrop();
  }
};

// 确认裁剪并上传
const confirmCrop = async () => {
  if (!cropperRef.value) {
    ElMessage.warning('裁剪组件未初始化');
    return;
  }

  try {
    uploadLoading.value = true;

    // 获取裁剪后的图片数据
    const base64Data = await new Promise((resolve, reject) => {
      cropperRef.value.getCropBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('获取裁剪数据失败'));
        }
      });
    });

    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', base64Data, 'cover.png');

    // 发送上传请求
    await request.post('/file/upload/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      successMsg: '封面上传成功',
      errorMsg: '封面上传失败，请重试',
      onSuccess: (res) => {
        // 服务器返回的是不带前缀的路径，直接赋值
        bookForm.coverUrl = res;

        // 生成预览图
        const reader = new FileReader();
        reader.onload = () => {
          previewUrl.value = reader.result;
        };
        reader.readAsDataURL(base64Data);

        showCropperDialog.value = false;
      }
    });
  } catch (error) {
    console.error('处理或上传图片失败:', error);
    ElMessage.error('处理或上传图片失败，请重试');
  } finally {
    uploadLoading.value = false;
  }
};

// base64转blob
const base64ToBlob = (base64Data, contentType) => {
  try {
    // 严格输入验证
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('无效的base64数据类型');
    }

    // 正则表达式验证是否为合法的base64格式
    // base64编码只包含A-Z, a-z, 0-9, +, /, 和尾部可能的=
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

    // 先移除所有换行符、空格和其他可能的非法字符
    const cleanBase64 = base64Data.replace(/[\r\n\t\f\v ]/g, '');

    if (!base64Regex.test(cleanBase64)) {
      console.warn('Base64数据格式可能不正确，尝试清理特殊字符');
      // 过滤掉不符合base64字符集的字符
      const filteredBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

      // 补齐=（如果缺少）
      let paddedBase64 = filteredBase64;
      const missingPadding = filteredBase64.length % 4;
      if (missingPadding > 0) {
        paddedBase64 = filteredBase64 + '='.repeat(4 - missingPadding);
      }

      console.log('原始长度:', base64Data.length, '清理后长度:', paddedBase64.length);

      // 构建二进制数据
      try {
        const byteCharacters = window.atob(paddedBase64);
        const byteArrays = [];
        const sliceSize = 1024;

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);

          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          byteArrays.push(new Uint8Array(byteNumbers));
        }

        return new Blob(byteArrays, { type: contentType || 'image/png' });
      } catch (e) {
        console.error('清理后的Base64仍无法解码:', e);
        throw new Error('图片格式有误，解码失败');
      }
    }

    // 标准处理流程 - 对验证通过的base64进行解码
    contentType = contentType || 'image/png';
    const sliceSize = 1024;
    let byteCharacters;

    try {
      byteCharacters = window.atob(cleanBase64);
    } catch (e) {
      console.error('Base64解码失败:', e, '数据长度:', cleanBase64.length);
      // 记录数据前20个字符用于调试(不要记录整个base64，可能会很长)
      console.error('数据前20个字符:', cleanBase64.substring(0, 20));
      throw new Error('图片格式有误，请确保上传了正确的图片格式');
    }

    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }

    // 创建并返回Blob对象
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error('Base64转Blob失败:', error);
    throw error;
  }
};
</script>

<style lang="scss" scoped>
$primary-gradient: linear-gradient(135deg, #4F9DFB, #77bafe 40%, #90edc6);

.book-management-container {
  padding: 20px 0;
  height: 600px;

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

  .search-area {
    background-color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    margin-bottom: 5px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    // 新增：状态Tab容器样式
    .status-tab-container {

      :deep(.el-tabs--card) {
        .el-tabs__header {
          border-bottom: none;
        }

        .el-tabs__nav {
          border-bottom: 1px solid #e5e6eb;

          .el-tabs__item {
            border-bottom: 1px solid transparent;
            margin: 0 15px 0 0;

            &.is-active {
              border-bottom: 1px solid #409eff;
              color: #409eff;
            }
          }
        }
      }
    }
  }

  .add-btn {
    background: $primary-gradient ;
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

  .table-area {
    background-color: #fff;
    padding: 5px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .upload-container {
    display: flex;
    flex-direction: column;

    .cover-uploader {
      width: 140px;
      height: 196px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409EFF;
      }

      .cover-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #8c939d;

        .upload-text {
          margin-top: 8px;
          font-size: 14px;
        }
      }
    }

    .change-cover-btn {
      margin-top: 8px;
      width: 140px;
    }
  }

  .cropper-container {
    .cropper-content {
      height: 300px;
      background-color: #f5f5f5;
    }

    .cropper-tip {
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      color: #999;
    }

    .cropper-control {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 15px;

      .control-btn-group {
        display: flex;
        gap: 10px;
      }

      .cropper-preview {
        width: 100px;

        .preview-title {
          font-size: 14px;
          margin-bottom: 5px;
          color: #606266;
        }

        .preview-img {
          width: 100px;
          height: 140px;
          border: 1px solid #dcdfe6;
          object-fit: cover;
        }
      }
    }
  }
}
</style>