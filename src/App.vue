<template>
  <div id="app-wrapper" class="flex h-screen overflow-hidden">
    <Sidebar 
      :is-open="isSidebarOpen.value" 
      :active-item="currentView.value"
      @navigate="handleNavigation"
      @close-sidebar="closeSidebar" />

    <div class="flex-1 flex flex-col overflow-auto">
      <Header 
        @toggle-sidebar="toggleSidebar"
        @search="performSearch" 
        @toggle-notifications="toggleNotificationPanel"
      />

      <main class="flex-1 p-6 md:p-8 space-y-8">
        <section>
          <h2 class="text-3xl font-semibold text-gray-800 mb-2">早上好, {{ userName.value }}!</h2>
          <p class="text-gray-600 mb-1">当前视图: <span class="font-semibold text-indigo-600">{{ currentViewTitle.value }}</span></p>
          <p class="text-gray-600 mb-6">这是您今天的仪表盘概览。</p>
        </section>

        <StatsGrid :stats="dashboardStats.value" />

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MyTasks 
            :tasks="filteredTasks.value" 
            @add-task-clicked="openAddTaskModal"
            @task-toggled="toggleTaskComplete" 
            class="lg:col-span-2" />
          <ProjectProgressList :projects="projectProgressData.value" />
        </section>

        <RecentActivity :activities="recentActivities.value" />
      </main>
    </div>

    <AddTaskModal 
      v-if="showAddTaskModal.value" 
      @close="closeAddTaskModal"
      @save-task="addNewTask" 
    />

    <NotificationPanel 
      v-if="showNotificationPanel.value"
      :notifications="mockNotifications.value"
      @close="closeNotificationPanel" 
    />

  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from '@vue/composition-api';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import StatsGrid from './components/StatsGrid.vue';
import MyTasks from './components/MyTasks.vue';
import ProjectProgressList from './components/ProjectProgressList.vue';
import RecentActivity from './components/RecentActivity.vue';
import AddTaskModal from './components/AddTaskModal.vue';
import NotificationPanel from './components/NotificationPanel.vue';

export default defineComponent({
  name: 'App',
  components: {
    Sidebar,
    Header,
    StatsGrid,
    MyTasks,
    ProjectProgressList,
    RecentActivity,
    AddTaskModal,
    NotificationPanel,
  },
  setup() {
    const isSidebarOpen = ref(false);
    const userName = ref('尊贵的用户 (Vue 2)');
    const currentView = ref('仪表盘'); 
    
    const showAddTaskModal = ref(false);
    const showNotificationPanel = ref(false);
    const searchTerm = ref('');

    const dashboardStats = ref([
      { id: 1, title: '活跃项目', value: '15', icon: 'fas fa-folder-open', trend: '+2 新增', trendColor: 'text-green-500',bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
      { id: 2, title: '今日到期任务', value: '8', icon: 'fas fa-calendar-check', trend: '紧急!', trendColor: 'text-red-500', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      { id: 3, title: '已逾期任务', value: '3', icon: 'fas fa-exclamation-triangle', trendColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-600' },
      { id: 4, title: '团队成员', value: '12', icon: 'fas fa-users', avatars: ['A', 'B', 'C'], bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
    ]);

    const userTasks = ref([ 
      { id: 1, title: '完成 "凤凰项目" UI设计稿 (Vue 2)', project: '凤凰项目', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '明天', assignee: { name: '李明', avatarChar: 'L', avatarColor: 'FFC107' }, completed: false },
      { id: 2, title: '准备周会演示文稿 (Vue 2)', project: '内部事务', priority: '中优先级', priorityClass: 'text-yellow-500', dueDate: '已完成', assignee: { name: '张伟', avatarChar: 'Z', avatarColor: '4CAF50' }, completed: true },
      { id: 3, title: '审核 "北极星计划" 技术文档 (Vue 2)', project: '北极星计划', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '5月10日', assignee: { name: '王芳', avatarChar: 'W', avatarColor: '03A9F4' }, completed: false },
    ]);

    const projectProgressData = ref([
      { id: 1, name: '凤凰项目 - UI/UX (Vue 2)', progress: 75, color: 'bg-indigo-600' },
      { id: 2, name: '北极星计划 - 后端开发 (Vue 2)', progress: 90, color: 'bg-green-600' },
      { id: 3, name: '营销活动Q3 - 资料准备 (Vue 2)', progress: 40, color: 'bg-yellow-500' },
      { id: 4, name: '客户支持系统升级 (Vue 2)', progress: 60, color: 'bg-blue-500' },
    ]);

    const recentActivities = ref([
      { id: 1, icon: 'fas fa-check', iconBg: 'bg-green-100', iconColor: 'text-green-600', textParts: [{ type: 'normal', content: '任务 ' }, { type: 'bold', content: '"完成登录页重构"' }, { type: 'normal', content: ' 已被 ' }, { type: 'user', content: '张伟' }, { type: 'normal', content: ' 标记为完成。' }], time: '2小时前' },
      { id: 2, icon: 'fas fa-comment-dots', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textParts: [{ type: 'user', content: '李明' }, { type: 'normal', content: ' 在任务 ' }, { type: 'bold', content: '"设计新的用户引导流程"' }, { type: 'normal', content: ' 中发表了评论。' }], time: '5小时前' },
      { id: 3, icon: 'fas fa-user-plus', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', textParts: [{ type: 'normal', content: '新成员 ' }, { type: 'user', content: '王芳' }, { type: 'normal', content: ' 已加入项目 ' }, { type: 'bold', content: '"北极星计划"' }, { type: 'normal', content: '。' }], time: '昨天' },
    ]);
    
    const mockNotifications = ref([
        { id: 1, text: '新任务 "部署生产环境" 已分配给您。', time: '10分钟前', read: false },
        { id: 2, text: '项目 "凤凰项目" 即将到期。', time: '1小时前', read: true },
        { id: 3, text: '您有一条新消息来自 李明。', time: '3小时前', read: false },
    ]);

    const currentViewTitle = computed(() => {
      return currentView.value;
    });

    const filteredTasks = computed(() => {
      if (!searchTerm.value) {
        return userTasks.value;
      }
      const lowerSearchTerm = searchTerm.value.toLowerCase();
      return userTasks.value.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        task.project.toLowerCase().includes(lowerSearchTerm)
      );
    });

    const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
    const closeSidebar = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        isSidebarOpen.value = false;
      }
    };

    const handleNavigation = (viewName) => {
      currentView.value = viewName;
      console.log(`导航到: ${viewName}`);
      closeSidebar(); 
    };

    const openAddTaskModal = () => showAddTaskModal.value = true;
    const closeAddTaskModal = () => showAddTaskModal.value = false;

    const addNewTask = (newTask) => {
      userTasks.value.unshift({ 
        id: Date.now(), 
        assignee: { name: '我', avatarChar: 'U', avatarColor: '667EEA' }, 
        completed: false,
        dueDate: '待定', 
        ...newTask 
      });
      closeAddTaskModal();
    };

    const toggleTaskComplete = (taskId) => {
      const task = userTasks.value.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    };
    
    const performSearch = (term) => {
      searchTerm.value = term;
    };

    const toggleNotificationPanel = () => {
      showNotificationPanel.value = !showNotificationPanel.value;
    };
    const closeNotificationPanel = () => {
      showNotificationPanel.value = false;
    };

    const handleClickOutsideSidebar = (event) => {
      if (typeof window !== 'undefined' && isSidebarOpen.value && window.innerWidth < 1024) {
        const sidebarEl = document.getElementById('sidebar');
        const hamburgerEl = document.getElementById('hamburger'); 
        if (sidebarEl && !sidebarEl.contains(event.target) && hamburgerEl && !hamburgerEl.contains(event.target)) {
          closeSidebar();
        }
      }
    };

    onMounted(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('click', handleClickOutsideSidebar);
      }
    });
    onUnmounted(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleClickOutsideSidebar);
      }
    });

    return {
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      userName,
      currentView,
      currentViewTitle,
      handleNavigation,
      dashboardStats,
      userTasks, 
      projectProgressData,
      recentActivities,
      showAddTaskModal,
      openAddTaskModal,
      closeAddTaskModal,
      addNewTask,
      toggleTaskComplete,
      performSearch,
      filteredTasks,
      showNotificationPanel,
      toggleNotificationPanel,
      closeNotificationPanel,
      mockNotifications,
    };
  },
});
</script>

<style>
.sidebar-transition {
  transition: transform 0.3s ease-in-out;
}
</style>
