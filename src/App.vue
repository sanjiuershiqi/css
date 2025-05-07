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
        <div v-if="isLoading.value" class="text-center py-10 text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl"></i> 加载中...
        </div>
        <template v-else>
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
              @task-toggled="handleToggleTask" 
              @delete-task-requested="handleDeleteTask" class="lg:col-span-2" />
            <ProjectProgressList :projects="projectProgressData.value" />
          </section>

          <RecentActivity :activities="recentActivities.value" />
        </template>
      </main>
    </div>

    <AddTaskModal 
      v-if="showAddTaskModal.value" 
      @close="closeAddTaskModal"
      @save-task="handleSaveNewTask" 
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

// 本地存储的 Key
const LOCAL_STORAGE_TASKS_KEY = 'vue2-dashboard-tasks';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'vue2-dashboard-activities';

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
    const isLoading = ref(true); // 添加加载状态
    
    const showAddTaskModal = ref(false);
    const showNotificationPanel = ref(false);
    const searchTerm = ref('');

    // --- 响应式数据 ---
    const dashboardStats = ref([]); // 将从模拟 API 加载
    const userTasks = ref([]); // 将从 localStorage 或 模拟 API 加载
    const projectProgressData = ref([]); // 将从模拟 API 加载
    const recentActivities = ref([]); // 将从 localStorage 或 模拟 API 加载
    
    const mockNotifications = ref([
        { id: 1, text: '新任务 "部署生产环境" 已分配给您。', time: '10分钟前', read: false },
        { id: 2, text: '项目 "凤凰项目" 即将到期。', time: '1小时前', read: true },
        { id: 3, text: '您有一条新消息来自 李明。', time: '3小时前', read: false },
    ]);

    // --- 计算属性 ---
    const currentViewTitle = computed(() => currentView.value);

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

    // --- 模拟 API 调用和数据处理 ---

    // 模拟获取数据的函数
    const fetchData = async () => {
      isLoading.value = true;
      console.log("开始加载数据...");
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // 加载任务列表 (优先从 localStorage 获取)
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
        if (storedTasks) {
          userTasks.value = JSON.parse(storedTasks);
        } else {
          // 如果 localStorage 没有，则使用初始模拟数据
          userTasks.value = [
            { id: 1, title: '完成 "凤凰项目" UI设计稿 (Vue 2)', project: '凤凰项目', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '明天', assignee: { name: '李明', avatarChar: 'L', avatarColor: 'FFC107' }, completed: false },
            { id: 2, title: '准备周会演示文稿 (Vue 2)', project: '内部事务', priority: '中优先级', priorityClass: 'text-yellow-500', dueDate: '已完成', assignee: { name: '张伟', avatarChar: 'Z', avatarColor: '4CAF50' }, completed: true },
          ];
          saveTasksToLocalStorage(); // 保存初始数据
        }

        // 加载活动列表 (优先从 localStorage 获取)
        const storedActivities = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
         if (storedActivities) {
          recentActivities.value = JSON.parse(storedActivities);
        } else {
           recentActivities.value = [
             { id: Date.now(), icon: 'fas fa-info-circle', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textParts: [{ type: 'normal', content: '欢迎使用仪表盘！' }], time: '刚刚' },
           ];
           saveActivitiesToLocalStorage();
         }

        // 加载其他静态模拟数据
        dashboardStats.value = [
          { id: 1, title: '活跃项目', value: '15', icon: 'fas fa-folder-open', trend: '+2 新增', trendColor: 'text-green-500',bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
          { id: 2, title: '今日到期任务', value: userTasks.value.filter(t => t.dueDate === '明天' && !t.completed).length.toString(), icon: 'fas fa-calendar-check', trend: '紧急!', trendColor: 'text-red-500', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
          { id: 3, title: '已逾期任务', value: '0', icon: 'fas fa-exclamation-triangle', trendColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-600' }, // 简化处理
          { id: 4, title: '团队成员', value: '12', icon: 'fas fa-users', avatars: ['A', 'B', 'C'], bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
        ];
        projectProgressData.value = [
          { id: 1, name: '凤凰项目 - UI/UX (Vue 2)', progress: 75, color: 'bg-indigo-600' },
          { id: 2, name: '北极星计划 - 后端开发 (Vue 2)', progress: 90, color: 'bg-green-600' },
        ];

        console.log("数据加载完成。");
      } catch (error) {
        console.error("加载数据时出错:", error);
        // 可以在这里设置错误状态
      } finally {
        isLoading.value = false;
      }
    };

    // 保存任务到 localStorage
    const saveTasksToLocalStorage = () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(userTasks.value));
        console.log("任务已保存到 localStorage");
      }
    };
    
    // 保存活动到 localStorage
    const saveActivitiesToLocalStorage = () => {
       if (typeof localStorage !== 'undefined') {
         // 只保存最近的 N 条活动，避免 localStorage 膨胀
         const MAX_ACTIVITIES = 20;
         const activitiesToSave = recentActivities.value.slice(0, MAX_ACTIVITIES);
         localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(activitiesToSave));
         console.log("活动已保存到 localStorage");
       }
    };

    // 添加活动记录的函数
    const addActivity = (icon, iconBg, iconColor, textParts) => {
      recentActivities.value.unshift({
        id: Date.now(),
        icon: icon,
        iconBg: iconBg,
        iconColor: iconColor,
        textParts: textParts,
        time: '刚刚' // 简化时间显示
      });
      saveActivitiesToLocalStorage(); // 保存活动
    };

    // --- 事件处理方法 ---
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

    // 处理保存新任务
    const handleSaveNewTask = async (newTaskData) => {
      isLoading.value = true; // 显示加载状态
      closeAddTaskModal();
      console.log("正在添加新任务...");
      await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟

      const newTask = { 
        id: Date.now(), 
        assignee: { name: '我', avatarChar: 'U', avatarColor: '667EEA' }, 
        completed: false,
        dueDate: '待定', 
        ...newTaskData 
      };
      userTasks.value.unshift(newTask); 
      saveTasksToLocalStorage(); // 保存到 localStorage
      addActivity('fas fa-plus-circle', 'bg-green-100', 'text-green-600', [
        { type: 'normal', content: '添加了新任务 ' },
        { type: 'bold', content: `"${newTask.title}"` }
      ]);
      console.log("新任务已添加:", newTask);
      isLoading.value = false; // 隐藏加载状态
    };

    // 处理切换任务完成状态
    const handleToggleTask = async (taskId) => {
      isLoading.value = true;
      console.log(`正在切换任务 ${taskId} 的状态...`);
      await new Promise(resolve => setTimeout(resolve, 200)); 

      const taskIndex = userTasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const task = userTasks.value[taskIndex];
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        addActivity(
          task.completed ? 'fas fa-check-circle' : 'fas fa-undo', 
          task.completed ? 'bg-green-100' : 'bg-yellow-100', 
          task.completed ? 'text-green-600' : 'text-yellow-600', 
          [
            { type: 'normal', content: `任务 "${task.title}" 被标记为 ` },
            { type: 'bold', content: task.completed ? '已完成' : '未完成' }
          ]
        );
        console.log(`任务 ${taskId} 状态已切换为: ${task.completed}`);
      }
      isLoading.value = false;
    };
    
    // 处理删除任务请求
    const handleDeleteTask = async (taskId) => {
       // 可以添加一个确认步骤
       if (typeof confirm !== 'undefined' && !confirm('确定要删除这个任务吗？')) {
         return;
       }
       
       isLoading.value = true;
       console.log(`正在删除任务 ${taskId}...`);
       await new Promise(resolve => setTimeout(resolve, 300));

       const taskIndex = userTasks.value.findIndex(t => t.id === taskId);
       if (taskIndex !== -1) {
         const deletedTask = userTasks.value[taskIndex];
         userTasks.value.splice(taskIndex, 1); // 从数组中移除
         saveTasksToLocalStorage();
         addActivity('fas fa-trash-alt', 'bg-red-100', 'text-red-600', [
           { type: 'normal', content: '删除了任务 ' },
           { type: 'bold', content: `"${deletedTask.title}"` }
         ]);
         console.log(`任务 ${taskId} 已删除。`);
       }
       isLoading.value = false;
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

    // 处理点击外部关闭侧边栏 (移动端)
    const handleClickOutsideSidebar = (event) => {
      if (typeof window !== 'undefined' && isSidebarOpen.value && window.innerWidth < 1024) {
        const sidebarEl = document.getElementById('sidebar');
        const hamburgerEl = document.getElementById('hamburger'); 
        if (sidebarEl && !sidebarEl.contains(event.target) && hamburgerEl && !hamburgerEl.contains(event.target)) {
          closeSidebar();
        }
      }
    };

    // --- 生命周期钩子 ---
    onMounted(() => {
      fetchData(); // 组件挂载后加载初始数据
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
      handleSaveNewTask, // 修改为 handleSaveNewTask
      handleToggleTask, // 修改为 handleToggleTask
      handleDeleteTask, // 新增删除处理函数
      performSearch,
      filteredTasks,
      showNotificationPanel,
      toggleNotificationPanel,
      closeNotificationPanel,
      mockNotifications,
      isLoading, // 暴露加载状态
    };
  },
});
</script>

<style>
/* 全局样式 */
.sidebar-transition {
  transition: transform 0.3s ease-in-out;
}
</style>
