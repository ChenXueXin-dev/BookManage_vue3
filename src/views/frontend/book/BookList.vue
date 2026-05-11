<template>
  <div class="book-list-container">
    <div class="top-section">
      <div class="search-wrapper">
        <el-input v-model="searchForm.keyword" placeholder="搜索书名/作者/关键词" :prefix-icon="Search" clearable
          @keyup.enter="handleSearch">
        </el-input>
        <el-button @click="handleSearch">
          <el-icon>
            <Search />
          </el-icon>
        </el-button>
      </div>

      <div class="sort-wrapper">
        <div class="category-reset">
          <el-icon @click="handleResetCategory">
            <Refresh />
          </el-icon>
          <div>重置分类</div>
        </div>
        <div class="sort-options">
          <span class="sort-label">排序:</span>
          <div class="sort-buttons">
            <button v-for="option in sortOptions" :key="option.value"
              :class="['sort-btn', { active: sortOption === option.value }]"
              @click="sortOption = option.value; handleSortChange()">
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content-section">
      <!-- 左侧分类栏 -->
      <div class="category-sidebar">
        <div class="category-tree-wrapper">
          <el-tree :data="categoryTree" :props="{ label: 'name', children: 'children' }"
            @node-click="handleCategorySelect" :expand-on-click-node="false" :highlight-current="true" node-key="id"
            :default-expanded-keys="[null]" :current-node-key="searchForm.categoryId">
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <div class="node-info">
                  <el-icon v-if="data.id === null">
                    <Menu />
                  </el-icon>
                  <el-icon v-else-if="!data.children || data.children.length === 0">
                    <List />
                  </el-icon>
                  <el-icon v-else>
                    <Management />
                  </el-icon>
                  <span>{{ node.label }}</span>
                </div>
                <span class="node-count" v-if="data.bookCount">{{ data.bookCount }}</span>
              </div>
            </template>
          </el-tree>


        </div>
      </div>

      <!-- 右侧图书列表 -->
      <div class="book-content">
        <div class="book-grid" v-loading="loading">
          <el-empty v-if="bookList.length === 0" description="暂无相关图书" />

          <div v-else class="book-list">
            <div v-for="book in bookList" :key="book.id" class="book-card">
              <div class="book-card-inner">
                <div class="book-cover" @click="goToDetail(book.id)">
                  <img :src="book.coverUrl ? ('/api' + book.coverUrl) : defaultCover" :alt="book.title" />

                  <div class="book-rating">
                    <el-rate v-model="book.avgScore" disabled text-color="#ff9900" score-template="{value}" />
                    <span class="book-borrowed">已借阅 {{ book.borrowedCount || 0 }} 次</span>
                  </div>
                </div>
                <div class="book-info">
                  <div class="book-top">
                    <div class="book-title" @click="goToDetail(book.id)">{{ book.title }}</div>
                    <div class="book-button">
                      <BorrowButton :isIcon="true" :bookId="book.id" :stock="book.stock" />
                      <CollectionButton :isIcon="true" :bookId="book.id" />
                    </div>
                  </div>
                  <div class="book-meta">
                    <span class="book-author">{{ book.author }}</span>
                    <span class="book-category">{{ book.categoryName }}</span>
                  </div>
                  <div class="book-actions">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-container" v-if="total">
          <el-pagination background layout=" prev, pager, next" :total="total" :page-size="searchForm.size"
            :current-page="searchForm.currentPage" @current-change="handlePageChange" />
          <div>共
            <span class="count">
              {{ total }}
            </span>
            本图书
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, Management, List, Menu, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import CollectionButton from '@/components/CollectionButton.vue';
import BorrowButton from '@/components/BorrowButton.vue';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const bookList = ref([]);
const total = ref(0);
const categoryTree = ref([]);
const defaultCover = 'https://img3.doubanio.com/f/shire/5522dd1f5b742d1e1394a17f44d590646b055ab0/pics/book-default-medium.gif';
const sortOption = ref('borrowedCount');

// 排序选项
const sortOptions = [
  { label: '借阅最多', value: 'borrowedCount' },
  { label: '评分最高', value: 'avgScore' },
  { label: '最新上架', value: 'createTime' }
];

const searchForm = reactive({
  keyword: '',
  categoryId: null,
  currentPage: 1,
  size: 8
});

onMounted(() => {
  // 从URL参数中获取排序方式
  const urlParams = new URLSearchParams(window.location.search);
  const orderByParam = urlParams.get('orderBy');
  if (orderByParam && sortOptions.some(option => option.value === orderByParam)) {
    sortOption.value = orderByParam;
  }

  // 从URL参数中获取分类ID
  const categoryIdParam = route.query.categoryId;
  if (categoryIdParam) {
    searchForm.categoryId = categoryIdParam;
  }

  // 从URL参数中获取搜索关键词
  const keywordParam = route.query.keyword;
  if (keywordParam) {
    searchForm.keyword = keywordParam;
  }

  fetchCategories();
  fetchBooks();
});

// 监听URL参数变化
watch(() => route.query, (newQuery) => {
  let needRefetch = false;

  if (newQuery.orderBy && sortOptions.some(option => option.value === newQuery.orderBy)) {
    sortOption.value = newQuery.orderBy;
    needRefetch = true;
  }

  if (newQuery.categoryId !== undefined && newQuery.categoryId !== searchForm.categoryId) {
    searchForm.categoryId = newQuery.categoryId || null;
    needRefetch = true;
  }

  if (newQuery.keyword !== undefined && newQuery.keyword !== searchForm.keyword) {
    searchForm.keyword = newQuery.keyword || '';
    needRefetch = true;
  }

  if (needRefetch) {
    searchForm.currentPage = 1;
    fetchBooks();
  }
}, { deep: true });

// 获取图书分类树
const fetchCategories = async () => {
  try {
    const res = await request.get('/book/category/tree');
    // 获取有图书的分类及其数量
    const categoriesWithBooks = await request.get('/book/category/with-books');

    // 处理分类树，新增图书数量
    const processCategories = (categories) => {
      if (!categories || categories.length === 0) return [];

      return categories.map(category => {
        // 查找对应的图书数量
        const categoryWithCount = categoriesWithBooks.find(item => item.id === category.id);
        const bookCount = categoryWithCount ? categoryWithCount.bookCount : 0;

        return {
          ...category,
          bookCount,
          children: processCategories(category.children)
        };
      });
    };

    const processedCategories = processCategories(res);

    // 新增"全部"选项作为根节点
    categoryTree.value = [
      {
        id: null,
        name: '全部分类',
        children: processedCategories || []
      }
    ];
  } catch (error) {
    console.error('获取分类失败:', error);
    ElMessage.error('获取分类失败');
  }
};

// 获取图书列表
const fetchBooks = async () => {
  loading.value = true;
  try {
    const params = {
      ...searchForm,
      status: 1,
      orderBy: sortOption.value  // 新增排序参数
    };
    const res = await request.get('/book/list', params);
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
  updateRouteQuery();
  fetchBooks();
};

// 处理分类选择
const handleCategorySelect = (data) => {
  if (searchForm.categoryId !== data.id) {
    searchForm.categoryId = data.id;
    searchForm.currentPage = 1;
    updateRouteQuery();
    fetchBooks();
  }
};

// 重置分类选择
const handleResetCategory = () => {
  searchForm.categoryId = null;
  searchForm.currentPage = 1;
  updateRouteQuery();
  fetchBooks();
};

// 更新路由查询参数
const updateRouteQuery = () => {
  const query = { ...route.query };

  // 更新分类ID
  if (searchForm.categoryId) {
    query.categoryId = searchForm.categoryId;
  } else {
    delete query.categoryId;
  }

  // 更新关键词
  if (searchForm.keyword) {
    query.keyword = searchForm.keyword;
  } else {
    delete query.keyword;
  }

  // 更新排序方式
  query.orderBy = sortOption.value;

  router.push({ query });
};

// 排序方式切换
const handleSortChange = () => {
  searchForm.currentPage = 1;
  updateRouteQuery();
  fetchBooks();
};

// 页码变化
const handlePageChange = (page) => {
  searchForm.currentPage = page;
  fetchBooks();
};

// 跳转到图书详情
const goToDetail = (id) => {
  router.push(`/book/detail/${id}`);
};
</script>

<style lang="scss" scoped>
$nav-gradient: linear-gradient(135deg, #f2fffa, #409EFF, #f2fffa);
$primary-color: #4F9DFB;
$primary-gradient: linear-gradient(135deg, #409EFF, #57ffb9);
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$green-color: #4edba0;
$primary-light: #E3F2FD;
$primary-dark: #247ADB;
$accent-color: #FF9800;
$text-primary: #37474F;
$text-secondary: #607D8B;
$background-light: #F5F7FA;
$background-medium: #ECEFF1;
$background-dark: #CFD8DC;
$success-color: #66BB6A;
$warning-color: #FFA726;
$error-color: #EF5350;
$border-radius: 12px;
$box-shadow-light: 0 3px 5px rgba(0, 0, 0, 0.05);
$box-shadow-medium: 0 8px 16px rgba(0, 0, 0, 0.08);
$box-shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.12);
$transition-fast: all 0.2s ease;
$transition-normal: all 0.3s ease;
$transition-slow: all 0.5s ease;

// 卡片混入
@mixin card {
  background: white;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  transition: $transition-normal;
  overflow: hidden;

  &:hover {
    box-shadow: $box-shadow-medium;
    transform: translateY(-3px);
  }
}

.book-list-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: transparent;
  min-height: calc(100vh - 60px);
}

// 顶部区域样式
.top-section {
  margin-bottom: 10px;

  .search-wrapper {
    display: flex;
    margin-bottom: 10px;

    .el-input {
      :deep(.el-input__wrapper) {
        border-radius: 50px;
        padding-left: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: $transition-fast;
        border: none;

        &:hover,
        &:focus-within {
          box-shadow: 0 4px 12px rgba(79, 157, 251, 0.15);
        }
      }

      :deep(.el-input__inner) {
        font-size: 15px;
        height: 44px;
      }
    }

    .el-button {
      height: 44px;
      width: 44px;
      border-radius: 50%;
      color: white;
      padding: 0;
      margin: 0 4px;
      background: $primary-gradient;
      border: none;
      box-shadow: 0 3px 6px rgba(79, 157, 251, 0.2);
      transition: $transition-normal;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 12px rgba(79, 157, 251, 0.3);
      }

      .el-icon {
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

  .sort-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;

      .total-label {
        margin-bottom: 16px;
      }
    }

    .category-reset {
      color: $text-secondary;
      width: 100%;
      font-size: 17px;
      font-weight: 500;
      align-items: center;
      color: $text-secondary;
      display: flex;

      .el-icon {
        margin-right: 10px;
        color: $primary-color;
        font-size: 18px;
      }

    }

    .total-label {
      display: flex;
      align-items: center;

      .total-text {
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
        margin-right: 10px;
      }

      .total-count {
        color: $primary-color;
        font-size: 28px;
        font-weight: 600;
        padding: 4px 12px;
      }
    }

    .sort-options {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: end;
      width: 100%;

      .sort-label {
        margin-right: 15px;
        font-size: 15px;
        font-weight: 500;
        color: $text-primary;
      }

      .sort-buttons {
        display: flex;
        gap: 20px;

        .sort-btn {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          outline: inherit;
          color: $text-secondary;
          font-size: 20px;
          font-weight: 500;
          transition: color 0.3s ease, transform 0.3s ease;
          position: relative;
          padding-bottom: 3px;

          &:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: $nav-gradient;
            transition: width $transition;
            border-radius: 1px;
          }

          &:hover {
            color: $primary-color;
            transform: translateY(-1px);
          }

          &.active {
            color: $primary-color;

            &:after {
              width: 100%;
            }
          }
        }
      }

      .sort-hint {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: $warning-color;
        margin-top: 8px;

        .el-icon {
          margin-right: 6px;
          font-size: 14px;
        }
      }

      @media (max-width: 768px) {
        width: 100%;
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 4px;

        .sort-buttons {
          padding-right: 10px;
        }

        .sort-hint {
          margin-top: 6px;
          margin-left: 0;
        }
      }
    }
  }
}

// 主内容区域
.main-content-section {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 25px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }

  // 左侧分类栏
  .category-sidebar {
    @include card;
    overflow: hidden;



    .category-tree-wrapper {
      padding: 15px;

      .el-tree {
        :deep(.el-tree-node__content) {
          height: 38px;
          margin-bottom: 3px;
          border-radius: 6px;
          transition: $transition-fast;

          &:hover {
            background-color: $primary-light;
          }
        }

        :deep(.el-tree-node.is-current > .el-tree-node__content) {
          background-color: $primary-light;
          color: $primary-color;
          font-weight: 500;
        }
      }

      .custom-tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .node-info {
          display: flex;
          align-items: center;

          .el-icon {
            margin-right: 8px;
            font-size: 16px;
            color: $primary-color;
          }
        }

        .node-count {
          font-size: 12px;
          background-color: $background-light;
          color: $text-secondary;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }

      .reset-category {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        padding-top: 15px;
        border-top: 1px solid $background-medium;

        .el-button {
          display: flex;
          align-items: center;
          transition: $transition-normal;

          .el-icon {
            margin-right: 6px;
            font-size: 16px;
          }

          &:hover {
            transform: translateY(-2px);
          }
        }
      }
    }

    @media (max-width: 992px) {
      .category-tree-wrapper {
        max-height: 300px;
        overflow-y: auto;
      }
    }
  }

  // 右侧图书内容
  .book-content {
    .book-grid {
      min-height: 400px;
    }

    .book-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 15px;
      margin-bottom: 5px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 15px;
      }
    }

    .book-card {
      &:hover {
        z-index: 1;
      }

      .book-card-inner {
        @include card;
        height: 100%;
        display: flex;
        flex-direction: column;

        .book-cover {
          position: relative;
          height: 220px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          &:hover img {
            transform: scale(1.05);
          }

          .book-rating {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
            padding: 25px 12px 10px;
            z-index: 1;

            .book-borrowed {
              font-size: 14px;
              color: #ffffff;
              padding-left: 10px;
            }
          }
        }

        .book-info {
          padding: 10px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;

          .book-top {
            display: flex;
            justify-content: space-around;


            .book-title {
              width: 50%;
              font-size: 16px;
              font-weight: 500;
              color: $text-primary;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              cursor: pointer;
              transition: $transition-fast;

              &:hover {
                color: $primary-color;
              }
            }

          }

          .book-meta {

            .book-author,
            .book-category {
              display: block;
              font-size: 14px;
              color: $text-secondary;
              margin: 2px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              position: relative;
              padding-left: 12px;

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: $background-dark;
              }
            }

          }

          .book-actions {
            margin-top: auto;
            display: flex;
            gap: 10px;

            :deep(.el-button) {
              flex: 1;
              font-size: 14px;
              border-radius: 20px;
              transition: $transition-normal;

              &:hover {
                transform: translateY(-2px);
              }

              // 确保按钮样式与整体风格一致
              &.el-button--primary {
                background: linear-gradient(45deg, $primary-color, $primary-dark);
                border: none;
              }

              // 默认尺寸微调
              &.el-button--small {
                padding: 9px 15px;
                height: 36px;
                font-weight: normal;
              }
            }

            @media (max-width: 768px) {
              flex-direction: column;
              gap: 8px;
            }
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      align-items: center;

      .count {
        color: $primary-color;
        font-size: 24px;
        font-weight: 400;
      }

      :deep(.el-pagination) {
        --el-pagination-button-bg-color: transparent;
        --el-pagination-hover-color: #{$primary-color};
        --el-pagination-button-color: black;
        --el-pagination-button-disabled-bg-color: transparent;

        button {
          min-width: 32px;
          height: 32px;

          &:hover {
            color: $primary-color;
          }

          &:disabled {
            background-color: transparent;
          }
        }

        .el-pager li {
          background-color: transparent;
          min-width: 32px;
          height: 32px;
          font-size: 14px;

          &.is-active {
            background-color: $primary-color;
            color: white;
            font-weight: bold;
          }

          &:hover:not(.is-active) {
            color: $primary-color;
          }
        }
      }
    }
  }
}
</style>