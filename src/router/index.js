import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// 导入需要路由的组件
import Home from "@/views/home.vue";

// 定义路由规则
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

// 创建路由实例
const router = new Router({
  mode: "history", // 使用 history 模式，去掉 URL 中的 #
  routes, // 注入路由规则
});

export default router;
