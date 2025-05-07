<template>
  <div id="app-wrapper" class="flex h-screen overflow-hidden">
    <Sidebar :is-open="isSidebarOpen.value" @close-sidebar="closeSidebar" />

    <div class="flex-1 flex flex-col overflow-auto">
      <Header @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 p-6 md:p-8 space-y-8">
        <section>
          <h2 class="text-3xl font-semibold text-gray-800 mb-2">早上好, {{ userName.value }}!</h2>
          <p class="text-gray-600 mb-6">这是您今天的仪表盘概览。</p>
        </section>

        <StatsGrid :stats="dashboardStats.value" />

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MyTasks :tasks="userTasks.value" class="lg:col-span-2" />
          <ProjectProgressList :projects="projectProgressData.value" />
        </section>

        <RecentActivity :activities="recentActivities.value" />
      </main>
    </div>
  </div>
</template>

<script>
// 导入 Vue Composition API 的核心函数和子组件
import { defineComponent, ref, onMounted, onUnmounted } from '@vue/composition-api';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import StatsGrid from './components/StatsGrid.vue';
import MyTasks from './components/MyTasks.vue';
import ProjectProgressList from './components/ProjectProgressList.vue';
import RecentActivity from './components/RecentActivity.vue';

export default defineComponent({
  name: 'App',
  components: { // 注册子组件
    Sidebar,
    Header,
    StatsGrid,
    MyTasks,
    ProjectProgressList,
    RecentActivity,
  },
  setup() {
    // --- 响应式状态 ---
    // 侧边栏在移动端的显示状态
    const isSidebarOpen = ref(false);
    // 用户名 (模拟数据)
    const userName = ref('尊贵的用户 (Vue 2)');
    // 仪表盘统计数据 (模拟数据)
    const dashboardStats = ref([
      { id: 1, title: '活跃项目', value: '15', icon: 'fas fa-folder-open', trend: '+2 新增', trendColor: 'text-green-500',bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
      { id: 2, title: '今日到期任务', value: '8', icon: 'fas fa-calendar-check', trend: '紧急!', trendColor: 'text-red-500', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      { id: 3, title: '已逾期任务', value: '3', icon: 'fas fa-exclamation-triangle', trendColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-600' },
      { id: 4, title: '团队成员', value: '12', icon: 'fas fa-users', avatars: ['A', 'B', 'C'], bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
    ]);
    // 用户任务列表 (模拟数据)
    const userTasks = ref([
      { id: 1, title: '完成 "凤凰项目" UI设计稿 (Vue 2)', project: '凤凰项目', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '明天', assignee: { name: '李明', avatarChar: 'L', avatarColor: 'FFC107' }, completed: false },
      { id: 2, title: '准备周会演示文稿 (Vue 2)', project: '内部事务', priority: '中优先级', priorityClass: 'text-yellow-500', dueDate: '已完成', assignee: { name: '张伟', avatarChar: 'Z', avatarColor: '4CAF50' }, completed: true },
      { id: 3, title: '审核 "北极星计划" 技术文档 (Vue 2)', project: '北极星计划', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '5月10日', assignee: { name: '王芳', avatarChar: 'W', avatarColor: '03A9F4' }, completed: false },
    ]);
    // 项目进度数据 (模拟数据)
    const projectProgressData = ref([
      { id: 1, name: '凤凰项目 - UI/UX (Vue 2)', progress: 75, color: 'bg-indigo-600' },
      { id: 2, name: '北极星计划 - 后端开发 (Vue 2)', progress: 90, color: 'bg-green-600' },
      { id: 3, name: '营销活动Q3 - 资料准备 (Vue 2)', progress: 40, color: 'bg-yellow-500' },
      { id: 4, name: '客户支持系统升级 (Vue 2)', progress: 60, color: 'bg-blue-500' },
    ]);
    // 最近活动数据 (模拟数据)
    const recentActivities = ref([
      { id: 1, icon: 'fas fa-check', iconBg: 'bg-green-100', iconColor: 'text-green-600', textParts: [{ type: 'normal', content: '任务 ' }, { type: 'bold', content: '"完成登录页重构"' }, { type: 'normal', content: ' 已被 ' }, { type: 'user', content: '张伟' }, { type: 'normal', content: ' 标记为完成。' }], time: '2小时前' },
      { id: 2, icon: 'fas fa-comment-dots', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textParts: [{ type: 'user', content: '李明' }, { type: 'normal', content: ' 在任务 ' }, { type: 'bold', content: '"设计新的用户引导流程"' }, { type: 'normal', content: ' 中发表了评论。' }], time: '5小时前' },
      { id: 3, icon: 'fas fa-user-plus', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', textParts: [{ type: 'normal', content: '新成员 ' }, { type: 'user', content: '王芳' }, { type: 'normal', content: ' 已加入项目 ' }, { type: 'bold', content: '"北极星计划"' }, { type: 'normal', content: '。' }], time: '昨天' },
    ]);

    // --- 方法 ---
    // 切换侧边栏显示/隐藏 (通常由 Header 组件的汉堡菜单触发)
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    // 关闭侧边栏 (通常在移动端点击导航项或外部区域时触发)
    const closeSidebar = () => {
      // 检查 window 对象是否存在 (确保在浏览器环境中运行)
      if (typeof window !== 'undefined' && window.innerWidth < 1024) { // 1024px 是 Tailwind 的 'lg' 断点
        isSidebarOpen.value = false;
      }
    };

    // 处理点击侧边栏外部区域以关闭侧边栏 (移动端)
    const handleClickOutsideSidebar = (event) => {
      if (typeof window !== 'undefined' && isSidebarOpen.value && window.innerWidth < 1024) {
        const sidebarEl = document.getElementById('sidebar'); // 假设 Sidebar.vue 的根元素有 id="sidebar"
        const hamburgerEl = document.getElementById('hamburger'); // 假设 Header.vue 的汉堡按钮有 id="hamburger"
        
        // 如果点击事件的目标不在侧边栏内部，也不在汉堡菜单按钮上，则关闭侧边栏
        if (sidebarEl && !sidebarEl.contains(event.target) && hamburgerEl && !hamburgerEl.contains(event.target)) {
          closeSidebar();
        }
      }
    };

    // --- 生命周期钩子 ---
    onMounted(() => {
      // 检查 document 对象是否存在 (确保在浏览器环境中运行)
      if (typeof document !== 'undefined') {
        // 组件挂载后，添加全局点击事件监听器
        document.addEventListener('click', handleClickOutsideSidebar);
      }
    });

    onUnmounted(() => {
      // 检查 document 对象是否存在
      if (typeof document !== 'undefined') {
        // 组件卸载前，移除全局点击事件监听器，防止内存泄漏
        document.removeEventListener('click', handleClickOutsideSidebar);
      }
    });

    // 从 setup 函数返回响应式状态和方法，使其在模板中可用
    return {
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      userName,
      dashboardStats,
      userTasks,
      projectProgressData,
      recentActivities,
    };
  },
});
</script>

<style>
/* 全局样式或 App.vue 特有的样式 */
/* 例如，确保 #app-wrapper 占满高度，这通常由 html, body, #app { height: 100%; } 实现 */

/* 侧边栏过渡动画 (也可以使用 Vue 的 <transition> 组件实现) */
.sidebar-transition {
  transition: transform 0.3s ease-in-out;
}
</style>
