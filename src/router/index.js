import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";
import BackendLayout from "@/layouts/BackendLayout.vue";

// 静态路由
export const constantRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/frontend/user/Login.vue"),
    meta: { title: "登录", isPublic: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/frontend/user/Register.vue"),
    meta: { title: "注册", isPublic: true },
  },
  {
    path: "/reset/passwords",
    name: "Reset",
    component: () => import("@/views/frontend/user/ResetPasswords.vue"),
    meta: { title: "忘记密码", isPublic: true },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/error/404.vue"),
    meta: { title: "404" },
  },
];

// 动态路由
export const asyncRoutes = [];

// 前台路由配置
const frontendRoutes = [
  {
    path: "/",
    component: () => import("@/layouts/FrontendLayout.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/frontend/Home.vue"),
        meta: { title: "首页" },
      },
      {
        path: "book/list",
        name: "FrontendBookList",
        component: () => import("@/views/frontend/book/BookList.vue"),
        meta: { title: "图书列表" },
      },
      {
        path: "book/detail/:id",
        name: "FrontendBookDetail",
        component: () => import("@/views/frontend/book/BookDetail.vue"),
        meta: { title: "图书详情" },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/frontend/user/Profile.vue"),
        meta: { title: "个人信息", requiresAuth: true },
      },
      {
        path: "book/borrow/:id",
        name: "BorrowConfirm",
        component: () => import("@/views/frontend/borrow/BorrowConfirm.vue"),
        meta: { title: "借阅确认", requiresAuth: true },
      },
      {
        path: "user/borrow",
        name: "UserBorrow",
        component: () => import("@/views/frontend/user/UserBorrow.vue"),
        meta: { title: "我的借阅", requiresAuth: true },
      },
      {
        path: "recommendation",
        name: "UserRecommendation",
        component: () =>
          import("@/views/frontend/recommendation/UserRecommendation.vue"),
        meta: { title: "个性化推荐", requiresAuth: true },
      },
      {
        path: "all-recommendations",
        name: "AllRecommendations",
        component: () =>
          import("@/views/frontend/recommendation/UserRecommendation.vue"),
        meta: { title: "全部推荐", requiresAuth: true },
      },
      {
        path: "user/collection",
        name: "UserCollection",
        component: () => import("@/views/frontend/user/UserCollection.vue"),
        meta: { title: "我的收藏", requiresAuth: true },
      },
      {
        path: "user/comment",
        name: "UserComment",
        component: () => import("@/views/frontend/user/UserComment.vue"),
        meta: { title: "我的评论", requiresAuth: true },
      },
    ],
  },
];

// 后台路由配置
const backendRoutes = [
  {
    path: "/back",
    component: () => import("@/layouts/BackendLayout.vue"),
    redirect: "/back/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/backend/Dashboard.vue"),
        meta: { title: "控制台", requiresAuth: true },
      },
      {
        path: "user-management",
        name: "UserManagement",
        component: () => import("@/views/backend/user/UserManagement.vue"),
        meta: { title: "用户管理", requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "user",
        redirect: "/back/user/person",
      },
      {
        path: "user/person",
        name: "PersonInfo",
        component: () => import("@/views/backend/user/PersonInfo.vue"),
        meta: { title: "个人信息", requiresAuth: true },
      },
      {
        path: "user/management",
        redirect: "/back/user-management",
      },
      {
        path: "personnel/management",
        redirect: "/back/user-management",
      },
      {
        path: "person/management",
        redirect: "/back/user-management",
      },
      {
        path: "book/management",
        name: "BookManagement",
        component: () => import("@/views/backend/book/BookManagement.vue"),
        meta: { title: "图书管理", requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "book/category",
        name: "CategoryManagement",
        component: () => import("@/views/backend/book/CategoryManagement.vue"),
        meta: { title: "分类管理", requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "borrow/management",
        name: "BorrowManagement",
        component: () => import("@/views/backend/borrow/BorrowManagement.vue"),
        meta: { title: "借阅管理", requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "order/list",
        redirect: "/back/borrow/management",
      },
      {
        path: "order/management",
        redirect: "/back/borrow/management",
      },
      {
        path: "comment/management",
        name: "CommentManagement",
        component: () =>
          import("@/views/backend/comment/CommentManagement.vue"),
        meta: { title: "评论管理", requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "system/config",
        name: "ConfigManagement",
        component: () => import("@/views/backend/system/ConfigManagement.vue"),
        meta: { title: "系统配置", requiresAuth: true, roles: ["ADMIN"] },
      },
    ],
  },
];

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...frontendRoutes,
    ...backendRoutes,
    ...constantRoutes,
    // 捕获所有未匹配路由
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 图书室借阅管理系统`;
  }

  const userStore = useUserStore();

  // 公开路由直接放行
  if (to.meta.isPublic) {
    next();
    return;
  }

  // 检查是否需要登录权限
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !userStore.isLoggedIn
  ) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 检查角色权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    const hasRole = to.meta.roles.includes(userStore.roleType);
    if (!hasRole) {
      console.log("无权限，" + userStore.roleType);
      next("/");
      return;
    }
  }

  // 已登录用户不应重复访问登录和注册页面
  if (
    userStore.isLoggedIn &&
    (to.path === "/login" || to.path === "/register")
  ) {
    next("/");
    return;
  }

  next();
});

// 动态加载组件
export function loadComponent(component) {
  try {
    // 如果是布局组件
    if (component === "Layout") {
      return BackendLayout;
    }
    // 处理路径中的斜杠，转换为实际的文件路径
    const path = component.replace(/^\//, "").replace(/\//g, "/");
    // 其他组件动态导入
    return () =>
      import(`@/views/backend/${path}.vue`).catch((error) => {
        console.error(
          `Failed to load component: @/views/backend/${path}.vue`,
          error,
        );
        // 返回一个简单的错误提示组件
        return {
          template: `
          <div class="error-component">
            <h3>组件加载失败</h3>
            <p>路径: ${path}</p>
          </div>
        `,
        };
      });
  } catch (error) {
    console.error("Component loading error:", error);
    // 返回一个空组件而不是直接抛出错误
    return {
      template: "<div>组件加载失败</div>",
    };
  }
}

export default router;
