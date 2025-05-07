<template>
  <div id="app-wrapper" class="flex h-screen overflow-hidden">
    <Sidebar 
      :is-open="isSidebarOpen" 
      :active-item="currentView"
      @navigate="handleNavigation"
      @close-sidebar="closeSidebar" />

    <div class="flex-1 flex flex-col overflow-auto">
      <Header 
        @toggle-sidebar="toggleSidebar"
        @search="performSearch" 
        @toggle-notifications="toggleNotificationPanel"
      />

      <main class="flex-1 p-6 md:p-8 space-y-8">
        <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i>
          <span class="ml-3 text-gray-700">处理中...</span>
        </div>
        
        <template v-else>
          <section>
            <h2 class="text-3xl font-semibold text-gray-800 mb-2">早上好, {{ userName }}!</h2>
            <p class="text-gray-600 mb-6">您当前正在查看: <span class="font-semibold text-indigo-600">{{ currentViewTitle }}</span></p>
          </section>

          <template v-if="currentView === '仪表盘'">
            <StatsGrid :stats="dashboardStats" @stat-card-clicked="handleStatCardClick" />
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <MyTasks 
                :tasks="filteredTasks" 
                @add-task-clicked="openTaskModalForAdd"
                @task-toggled="handleToggleTask" 
                @edit-task-requested="openTaskModalForEdit"
                @delete-task-requested="handleDeleteTask"
                class="lg:col-span-2" />
              <ProjectProgressList :projects="projectProgressData" />
            </section>
            <RecentActivity :activities="recentActivities" class="mt-8" />
          </template>
          
          <template v-else-if="currentView === '我的任务'">
            <section class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">所有任务</h3>
              <MyTasks 
                :tasks="userTasks" 
                @add-task-clicked="openTaskModalForAdd"
                @task-toggled="handleToggleTask" 
                @edit-task-requested="openTaskModalForEdit"
                @delete-task-requested="handleDeleteTask"
              />
            </section>
          </template>

          <template v-else-if="currentView === '项目'">
             <section class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">项目列表</h3>
              <p class="text-gray-600">这里将显示您的项目列表和详细信息。</p>
              <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="proj in projectProgressData" :key="'proj-list-' + proj.id" class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h4 class="font-semibold text-indigo-700">{{ proj.name.replace('(Vue 2)', '').trim() }}</h4>
                  <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div :class="['h-2.5 rounded-full', proj.color]" :style="{ width: proj.progress + '%' }"></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ proj.progress }}% 完成</p>
                </div>
                 <p v-if="!projectProgressData || projectProgressData.length === 0" class="text-sm text-gray-500 md:col-span-2 text-center py-4">
                    暂无项目数据。
                  </p>
              </div>
            </section>
          </template>
          
          <template v-else-if="currentView === '报告'">
             <section class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">报告中心</h3>
              <p class="text-gray-600">这里将生成和显示各种项目报告和数据分析图表。</p>
              <div class="mt-6 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                [图表区域占位符]
              </div>
            </section>
          </template>

          <template v-else>
            <section class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">{{ currentViewTitle }}</h3>
              <p class="text-gray-600">此模块内容正在建设中...</p>
            </section>
          </template>
        </template>
      </main>
    </div>

    <TaskFormModal 
      v-if="showTaskModal" 
      :task-to-edit="editingTask"
      @close="closeTaskModal"
      @save-task="handleSaveTask" 
    />

    <NotificationPanel 
      v-if="showNotificationPanel"
      :notifications="mockNotifications"
      @close="closeNotificationPanel" 
      @notification-read="handleNotificationRead"
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
import TaskFormModal from './components/TaskFormModal.vue';
import NotificationPanel from './components/NotificationPanel.vue';

const LOCAL_STORAGE_TASKS_KEY = 'vue2-dashboard-tasks-v2';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'vue2-dashboard-activities-v2';
const LOCAL_STORAGE_NOTIFICATIONS_KEY = 'vue2-dashboard-notifications-v2';

export default defineComponent({
  name: 'App',
  components: {
    Sidebar, Header, StatsGrid, MyTasks, ProjectProgressList, RecentActivity, TaskFormModal, NotificationPanel,
  },
  setup() {
    const isSidebarOpen = ref(false);
    const userName = ref('尊贵的用户');
    const currentView = ref('仪表盘'); 
    const isLoading = ref(true);
    
    const showTaskModal = ref(false);
    const editingTask = ref(null);
    const showNotificationPanel = ref(false);
    const searchTerm = ref('');

    const dashboardStats = ref([]);
    const userTasks = ref([]);
    const projectProgressData = ref([]);
    const recentActivities = ref([]);
    const mockNotifications = ref([]);

    const currentViewTitle = computed(() => currentView.value);

    const filteredTasks = computed(() => {
      // 确保在访问 userTasks.value 前它是已定义的数组
      const tasksSource = Array.isArray(userTasks.value) ? userTasks.value : [];
      
      let tasksToFilter;
      if (currentView.value === '我的任务') {
        tasksToFilter = tasksSource;
      } else if (currentView.value === '仪表盘') {
        tasksToFilter = tasksSource.filter(t => !t.completed);
      } else {
        return []; // 其他视图不显示任务列表或不过滤
      }

      if (!searchTerm.value) {
        return tasksToFilter;
      }
      const lowerSearchTerm = searchTerm.value.toLowerCase();
      return tasksToFilter.filter(task => 
        (task.title && task.title.toLowerCase().includes(lowerSearchTerm)) ||
        (task.project && task.project.toLowerCase().includes(lowerSearchTerm))
      );
    });

    const loadFromLocalStorage = (key, defaultValue) => {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(key);
        try {
          if (stored) return JSON.parse(stored);
        } catch (e) {
          console.error(`Error parsing localStorage key "${key}":`, e);
          localStorage.removeItem(key); // 清除损坏的数据
        }
      }
      return defaultValue;
    };

    const saveToLocalStorage = (key, data, maxItems = null) => {
      if (typeof localStorage !== 'undefined') {
        let dataToSave = data;
        if (maxItems && Array.isArray(data) && data.length > maxItems) {
          dataToSave = data.slice(0, maxItems);
        }
        try {
          localStorage.setItem(key, JSON.stringify(dataToSave));
        } catch (e) {
          console.error(`Error saving to localStorage key "${key}":`, e);
        }
      }
    };

    const addActivity = (icon, iconBg, iconColor, textParts) => {
      recentActivities.value.unshift({
        id: Date.now(), icon, iconBg, iconColor, textParts, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      });
      saveToLocalStorage(LOCAL_STORAGE_ACTIVITIES_KEY, recentActivities.value, 20);
    };
    
    const fetchData = async () => {
      isLoading.value = true;
      await new Promise(resolve => setTimeout(resolve, 300)); // 缩短延迟以便更快看到结果

      userTasks.value = loadFromLocalStorage(LOCAL_STORAGE_TASKS_KEY, [
        { id: 1, title: 'UI评审会议准备', project: '凤凰项目', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '明天', assignee: { name: '李明', avatarChar: 'L', avatarColor: 'FFC107' }, completed: false },
        { id: 2, title: '周报提交', project: '内部事务', priority: '中优先级', priorityClass: 'text-yellow-500', dueDate: '今天', assignee: { name: '我', avatarChar: 'U', avatarColor: '667EEA' }, completed: false },
      ]);
      recentActivities.value = loadFromLocalStorage(LOCAL_STORAGE_ACTIVITIES_KEY, [
        { id: Date.now() + 1, icon: 'fas fa-info-circle', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textParts: [{ type: 'normal', content: '欢迎使用仪表盘！数据将保存在本地。' }], time: '刚刚' },
      ]);
      mockNotifications.value = loadFromLocalStorage(LOCAL_STORAGE_NOTIFICATIONS_KEY, [
        { id: 1, text: '新任务 "部署生产环境" 已分配给您。', time: '10分钟前', read: false },
        { id: 2, text: '项目 "凤凰项目" 即将到期。', time: '1小时前', read: true },
      ]);

      const activeTasksCount = Array.isArray(userTasks.value) ? userTasks.value.filter(t => (t.dueDate === '今天' || t.dueDate === '明天') && !t.completed).length : 0;
      const completedTasksCount = Array.isArray(userTasks.value) ? userTasks.value.filter(t => t.completed).length : 0;

      dashboardStats.value = [
        { id: 1, title: '活跃项目', value: '3', icon: 'fas fa-folder-open', trend: '+1 新增', trendColor: 'text-green-500',bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
        { id: 2, title: '今日到期任务', value: activeTasksCount.toString(), icon: 'fas fa-calendar-check', trend: '紧急!', trendColor: 'text-red-500', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
        { id: 3, title: '已完成任务', value: completedTasksCount.toString(), icon: 'fas fa-check-double', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
        { id: 4, title: '团队成员', value: '12', icon: 'fas fa-users', avatars: ['A', 'B', 'C'], bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
      ];
      projectProgressData.value = [
        { id: 1, name: '凤凰项目 - UI/UX', progress: 75, color: 'bg-indigo-600' },
        { id: 2, name: '北极星计划 - 后端开发', progress: 90, color: 'bg-green-600' },
      ];
      isLoading.value = false;
    };

    const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
    const closeSidebar = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) isSidebarOpen.value = false;
    };
    const handleNavigation = (viewName) => {
      currentView.value = viewName;
      // isLoading.value = true; // 可以选择在切换视图时也显示加载状态
      // setTimeout(() => isLoading.value = false, 100); // 模拟加载
      closeSidebar(); 
    };

    const openTaskModalForAdd = () => {
      editingTask.value = null; 
      showTaskModal.value = true;
    };
    const openTaskModalForEdit = (task) => {
      editingTask.value = JSON.parse(JSON.stringify(task)); 
      showTaskModal.value = true;
    };
    const closeTaskModal = () => showTaskModal.value = false;

    const handleSaveTask = async (taskData) => {
      isLoading.value = true;
      closeTaskModal();
      await new Promise(resolve => setTimeout(resolve, 300));

      if (taskData.id) { 
        const taskIndex = userTasks.value.findIndex(t => t.id === taskData.id);
        if (taskIndex !== -1) {
          const oldTask = userTasks.value[taskIndex];
          userTasks.value.splice(taskIndex, 1, { ...oldTask, ...taskData }); // 保留 completed 和 assignee
          addActivity('fas fa-edit', 'bg-yellow-100', 'text-yellow-600', [
            { type: 'normal', content: '编辑了任务 ' }, { type: 'bold', content: `"${taskData.title}"` }
          ]);
        }
      } else { 
        const newTask = { 
          id: Date.now(), 
          assignee: { name: '我', avatarChar: 'U', avatarColor: '667EEA' }, 
          completed: false,
          ...taskData 
        };
        userTasks.value.unshift(newTask); 
        addActivity('fas fa-plus-circle', 'bg-green-100', 'text-green-600', [
          { type: 'normal', content: '添加了新任务 ' }, { type: 'bold', content: `"${newTask.title}"` }
        ]);
      }
      saveToLocalStorage(LOCAL_STORAGE_TASKS_KEY, userTasks.value);
      fetchData(); // 重新加载数据以更新统计卡片等
      // isLoading.value = false; // fetchData 会处理
    };

    const handleToggleTask = async (taskId) => {
      isLoading.value = true;
      await new Promise(resolve => setTimeout(resolve, 200)); 
      const task = userTasks.value.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveToLocalStorage(LOCAL_STORAGE_TASKS_KEY, userTasks.value);
        addActivity(
          task.completed ? 'fas fa-check-circle' : 'fas fa-undo', 
          task.completed ? 'bg-green-100' : 'bg-yellow-100', 
          task.completed ? 'text-green-600' : 'text-yellow-600', 
          [{ type: 'normal', content: `任务 "${task.title}" 被标记为 ` }, { type: 'bold', content: task.completed ? '已完成' : '未完成' }]
        );
      }
      fetchData(); // 重新加载数据以更新统计卡片等
      // isLoading.value = false; // fetchData 会处理
    };
    
    const handleDeleteTask = async (taskId) => {
       if (typeof confirm !== 'undefined' && !confirm('确定要删除这个任务吗？')) return;
       isLoading.value = true;
       await new Promise(resolve => setTimeout(resolve, 300));
       const taskIndex = userTasks.value.findIndex(t => t.id === taskId);
       if (taskIndex !== -1) {
         const deletedTask = userTasks.value[taskIndex];
         userTasks.value.splice(taskIndex, 1);
         saveToLocalStorage(LOCAL_STORAGE_TASKS_KEY, userTasks.value);
         addActivity('fas fa-trash-alt', 'bg-red-100', 'text-red-600', [
           { type: 'normal', content: '删除了任务 ' }, { type: 'bold', content: `"${deletedTask.title}"` }
         ]);
       }
       fetchData(); // 重新加载数据以更新统计卡片等
       // isLoading.value = false; // fetchData 会处理
    };
    
    const performSearch = (term) => searchTerm.value = term;

    const toggleNotificationPanel = () => showNotificationPanel.value = !showNotificationPanel.value;
    const closeNotificationPanel = () => showNotificationPanel.value = false;

    const handleNotificationRead = (notificationId) => {
      const notification = mockNotifications.value.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        saveToLocalStorage(LOCAL_STORAGE_NOTIFICATIONS_KEY, mockNotifications.value);
      }
    };
    
    const handleStatCardClick = (stat) => { // 接收整个 stat 对象
        if (stat.title === '活跃项目') {
            handleNavigation('项目');
        }
        console.log(`统计卡片 "${stat.title}" 被点击。`);
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
      fetchData();
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
      isSidebarOpen, toggleSidebar, closeSidebar, userName, currentView, currentViewTitle, handleNavigation,
      dashboardStats, userTasks, projectProgressData, recentActivities, showTaskModal, editingTask,
      openTaskModalForAdd, openTaskModalForEdit, closeTaskModal, handleSaveTask, handleToggleTask, handleDeleteTask,
      performSearch, filteredTasks, showNotificationPanel, toggleNotificationPanel, closeNotificationPanel,
      mockNotifications, isLoading, handleNotificationRead, handleStatCardClick,
    };
  },
});
</script>

<style>
.sidebar-transition {
  transition: transform 0.3s ease-in-out;
}
</style>
