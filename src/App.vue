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
import AddTaskModal from './components/AddTaskModal.vue'; // 新组件
import NotificationPanel from './components/NotificationPanel.vue'; // 新组件

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
    const currentView = ref('仪表盘'); // 默认视图
    
    const showAddTaskModal = ref(false);
    const showNotificationPanel = ref(false);
    const searchTerm = ref('');

    // --- 模拟数据 ---
    // (与之前版本类似, 但 userTasks 现在是可修改的)
    const dashboardStats = ref([
      { id: 1, title: '活跃项目', value: '15', icon: 'fas fa-folder-open', trend: '+2 新增', trendColor: 'text-green-500',bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
      { id: 2, title: '今日到期任务', value: '8', icon: 'fas fa-calendar-check', trend: '紧急!', trendColor: 'text-red-500', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      { id: 3, title: '已逾期任务', value: '3', icon: 'fas fa-exclamation-triangle', trendColor: 'text-red-600', bgColor: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-600' },
      { id: 4, title: '团队成员', value: '12', icon: 'fas fa-users', avatars: ['A', 'B', 'C'], bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
    ]);

    const userTasks = ref([ // 任务列表现在是响应式的，可以被修改
      { id: 1, title: '完成 "凤凰项目" UI设计稿 (Vue 2)', project: '凤凰项目', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '明天', assignee: { name: '李明', avatarChar: 'L', avatarColor: 'FFC107' }, completed: false },
      { id: 2, title: '准备周会演示文稿 (Vue 2)', project: '内部事务', priority: '中优先级', priorityClass: 'text-yellow-500', dueDate: '已完成', assignee: { name: '张伟', avatarChar: 'Z', avatarColor: '4CAF50' }, completed: true },
      { id: 3, title: '审核 "北极星计划" 技术文档 (Vue 2)', project: '北极星计划', priority: '高优先级', priorityClass: 'text-red-500', dueDate: '5月10日', assignee: { name: '王芳', avatarChar: 'W', avatarColor: '03A9F4' }, completed: false },
    ]);

    const projectProgressData = ref([
      { id: 1, name: '凤凰项目 - UI/UX (Vue 2)', progress: 75, color: 'bg-indigo-600' },
      { id: 2, name: '北极星计划 - 后端开发 (Vue 2)', progress: 90, color: 'bg-green-600' },
    ]);

    const recentActivities = ref([
      { id: 1, icon: 'fas fa-check', iconBg: 'bg-green-100', iconColor: 'text-green-600', textParts: [{ type: 'normal', content: '任务 ' }, { type: 'bold', content: '"完成登录页重构"' }, { type: 'normal', content: ' 已被 ' }, { type: 'user', content: '张伟' }, { type: 'normal', content: ' 标记为完成。' }], time: '2小时前' },
      { id: 2, icon: 'fas fa-comment-dots', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textParts: [{ type: 'user', content: '李明' }, { type: 'normal', content: ' 在任务 ' }, { type: 'bold', content: '"设计新的用户引导流程"' }, { type: 'normal', content: ' 中发表了评论。' }], time: '5小时前' },
    ]);
    
    const mockNotifications = ref([
        { id: 1, text: '新任务 "部署生产环境" 已分配给您。', time: '10分钟前', read: false },
        { id: 2, text: '项目 "凤凰项目" 即将到期。', time: '1小时前', read: true },
        { id: 3, text: '您有一条新消息来自 李明。', time: '3小时前', read: false },
    ]);

    // --- 计算属性 ---
    const currentViewTitle = computed(() => {
      // 可以根据 currentView.value 返回更友好的标题
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

    // --- 方法 ---
    const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
    const closeSidebar = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        isSidebarOpen.value = false;
      }
    };

    const handleNavigation = (viewName) => {
      currentView.value = viewName;
      // 在实际应用中，这里会用 Vue Router 导航到不同页面
      console.log(`导航到: ${viewName}`);
      closeSidebar(); // 导航后在移动端关闭侧边栏
    };

    const openAddTaskModal = () => showAddTaskModal.value = true;
    const closeAddTaskModal = () => showAddTaskModal.value = false;

    const addNewTask = (newTask) => {
      userTasks.value.unshift({ // 添加到列表开头
        id: Date.now(), // 简单生成唯一ID
        assignee: { name: '我', avatarChar: 'U', avatarColor: '667EEA' }, // 默认分配给自己
        completed: false,
        dueDate: '待定', // 默认截止日期
        ...newTask // 合并从模态框传来的数据
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


    // 处理点击外部关闭侧边栏 (移动端)
    const handleClickOutsideSidebar = (event) => {
      if (typeof window !== 'undefined' && isSidebarOpen.value && window.innerWidth < 1024) {
        const sidebarEl = document.getElementById('sidebar');
        const hamburgerEl = document.getElementById('hamburger'); // Header中的汉堡按钮
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
      userTasks, // 直接暴露 userTasks 以便 MyTasks 修改
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
/* 全局样式已在 public/index.html 中定义或通过 Tailwind CSS 处理 */
.sidebar-transition {
  transition: transform 0.3s ease-in-out;
}
</style>


<template>
  <aside 
    id="sidebar"
    :class="['bg-white w-64 min-h-screen p-6 space-y-6 shadow-lg fixed lg:relative lg:translate-x-0 sidebar-transition z-30', isOpen ? 'translate-x-0' : '-translate-x-full']">
    <div class="flex items-center space-x-3 pb-6 border-b border-gray-200">
      <div class="bg-indigo-600 p-2 rounded-lg">
        <i class="fas fa-rocket text-white text-xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-indigo-700">ProManage</h1>
    </div>

    <nav class="space-y-2">
      <a 
        v-for="item in navigationItems.value" 
        :key="item.name" 
        :href="item.href"
        :class="['nav-link flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200', { 'active': activeItem === item.name }]"
        @click.prevent="navigate(item.name)"> <i :class="[item.icon, 'text-indigo-500 w-5 text-center']"></i>
        <span class="font-medium">{{ item.name }}</span>
      </a>
    </nav>

    <div class="pt-6 border-t border-gray-200 mt-auto">
      <a href="#" class="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
        <i class="fas fa-cog text-gray-500 w-5 text-center"></i>
        <span class="font-medium">设置</span>
      </a>
      <a href="#" class="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
        <i class="fas fa-sign-out-alt text-gray-500 w-5 text-center"></i>
        <span class="font-medium">退出登录</span>
      </a>
    </div>
  </aside>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api';

export default defineComponent({
  name: 'Sidebar',
  props: {
    isOpen: Boolean,
    activeItem: String // 从 App.vue 接收当前激活项
  },
  setup(props, { emit }) {
    const navigationItems = ref([
      { name: '仪表盘', href: '#', icon: 'fas fa-tachometer-alt' },
      { name: '我的任务', href: '#', icon: 'fas fa-tasks' },
      { name: '项目', href: '#', icon: 'fas fa-folder-open' },
      { name: '日历', href: '#', icon: 'fas fa-calendar-alt' },
      { name: '报告', href: '#', icon: 'fas fa-chart-pie' },
      { name: '团队', href: '#', icon: 'fas fa-users' },
    ]);

    // 不再需要本地 activeItem，直接使用 prop
    // const activeItemLocal = ref(props.activeItem);
    // watch(() => props.activeItem, (newVal) => {
    //   activeItemLocal.value = newVal;
    // });

    const navigate = (itemName) => {
      emit('navigate', itemName); // 触发 navigate 事件，传递视图名称
    };

    return {
      navigationItems,
      // activeItemLocal, // 使用 prop.activeItem
      navigate,
    };
  },
});
</script>

<style scoped>
.nav-link.active {
  background-color: #4f46e5; 
  color: white;
}
.nav-link.active i {
  color: white;
}
</style>


<template>
  <header class="bg-white shadow-md p-4 sticky top-0 z-20">
    <div class="container mx-auto flex items-center justify-between">
      <button id="hamburger" @click="$emit('toggle-sidebar')" class="lg:hidden text-gray-600 hover:text-indigo-600 focus:outline-none">
        <i class="fas fa-bars text-2xl"></i>
      </button>

      <div class="relative hidden sm:block">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </span>
        <input 
          type="text" 
          placeholder="搜索任务..." 
          v-model="searchTermLocal.value"
          @input="onSearchInput"
          class="w-full md:w-96 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow">
      </div>

      <div class="flex items-center space-x-5">
        <button @click="$emit('toggle-notifications')" class="relative text-gray-500 hover:text-indigo-600" aria-label="查看通知">
          <i class="fas fa-bell text-xl"></i>
          <span class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-semibold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
        <div class="relative">
          <button @click="toggleUserDropdown" class="flex items-center space-x-2 focus:outline-none" id="userMenuButtonHeader">
            <img src="https://placehold.co/40x40/667EEA/FFFFFF?text=U" alt="用户头像" class="w-10 h-10 rounded-full border-2 border-indigo-200 hover:border-indigo-500 transition-all">
            <span class="hidden md:block font-medium text-gray-700">尊贵的用户</span>
            <i class="fas fa-chevron-down text-gray-500 text-xs hidden md:block"></i>
          </button>
          <div v-if="isUserDropdownOpen.value" @click.stop class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-40">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">个人资料</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">账户设置</a>
            <div class="border-t border-gray-100 my-1"></div>
            <a href="#" class="block px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600">退出登录</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from '@vue/composition-api';

export default defineComponent({
  name: 'Header',
  setup(props, { emit }) {
    const isUserDropdownOpen = ref(false);
    const searchTermLocal = ref('');

    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value;
    };

    const onSearchInput = () => {
      emit('search', searchTermLocal.value.value); // 在 Vue 2 Composition API 中，ref 的值在 setup 中通过 .value 访问
    };

    const closeUserDropdownOnClickOutside = (event) => {
      if (isUserDropdownOpen.value) {
        const userMenuButton = document.getElementById('userMenuButtonHeader');
        const dropdownMenu = event.target.closest('.absolute.right-0.mt-2');
        if (userMenuButton && !userMenuButton.contains(event.target) && !dropdownMenu) {
          isUserDropdownOpen.value = false;
        }
      }
    };

    onMounted(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('click', closeUserDropdownOnClickOutside);
      }
    });
    onUnmounted(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', closeUserDropdownOnClickOutside);
      }
    });
    
    return {
      isUserDropdownOpen,
      toggleUserDropdown,
      searchTermLocal,
      onSearchInput,
    };
  },
});
</script>


<template>
  <div class="my-tasks-container bg-white p-6 rounded-xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">我的优先任务</h3>
      <button class="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
        查看全部 <i class="fas fa-arrow-right ml-1 text-xs"></i>
      </button>
    </div>
    <div class="space-y-4">
      <TaskItem 
        v-for="task in tasks" 
        :key="task.id" 
        :task="task" 
        @toggle-complete="onToggleComplete" />
      <p v-if="!tasks || tasks.length === 0" class="text-center text-gray-500 py-4">没有匹配的任务。</p>
      <button 
        @click="$emit('add-task-clicked')"
        class="w-full mt-4 py-3 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
        <i class="fas fa-plus-circle"></i>
        <span>添加新任务</span>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';
import TaskItem from './TaskItem.vue';

export default defineComponent({
  name: 'MyTasks',
  components: { TaskItem },
  props: {
    tasks: Array
  },
  setup(props, { emit }) {
    const onToggleComplete = (taskId) => {
      emit('task-toggled', taskId);
    };

    return {
      onToggleComplete,
    };
  }
});
</script>


<template>
  <div 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40" 
    @click.self="$emit('close')"> <div class="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-xl bg-white">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">添加新任务</h3>
      <form @submit.prevent="submitTask">
        <div class="mb-4">
          <label for="taskTitle" class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
          <input 
            type="text" 
            id="taskTitle" 
            v-model="task.title.value" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：完成项目报告">
        </div>
        <div class="mb-4">
          <label for="taskProject" class="block text-sm font-medium text-gray-700 mb-1">所属项目</label>
          <input 
            type="text" 
            id="taskProject" 
            v-model="task.project.value"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：Q3营销活动">
        </div>
        <div class="mb-6">
          <label for="taskPriority" class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select 
            id="taskPriority" 
            v-model="task.priority.value"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="高优先级">高优先级</option>
            <option value="中优先级">中优先级</option>
            <option value="低优先级">低优先级</option>
          </select>
        </div>
        <div class="flex items-center justify-end space-x-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            取消
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            保存任务
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'AddTaskModal',
  setup(props, { emit }) {
    const task = { // 使用 ref 包裹每个属性，以便 v-model 可以双向绑定
      title: ref(''),
      project: ref(''),
      priority: ref('中优先级'), // 默认优先级
    };

    const getPriorityClass = (priority) => {
      if (priority === '高优先级') return 'text-red-500';
      if (priority === '中优先级') return 'text-yellow-500';
      if (priority === '低优先级') return 'text-green-500';
      return 'text-gray-500';
    };

    const submitTask = () => {
      if (!task.title.value.trim()) {
        alert('任务标题不能为空！');
        return;
      }
      emit('save-task', {
        title: task.title.value,
        project: task.project.value || '未指定项目', // 如果项目为空，给个默认值
        priority: task.priority.value,
        priorityClass: getPriorityClass(task.priority.value),
      });
      // 清空表单 (可选)
      task.title.value = '';
      task.project.value = '';
      task.priority.value = '中优先级';
    };

    return {
      task,
      submitTask,
    };
  }
});
</script>


<template>
  <div 
    class="fixed inset-0 bg-gray-900 bg-opacity-30 z-30 transition-opacity"
    v-show="isVisible"
    @click.self="$emit('close')">
    <div 
      class="absolute top-16 right-4 md:right-8 w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-panel-title">
      <div class="p-5 border-b border-gray-200">
        <h2 id="notification-panel-title" class="text-lg font-semibold text-gray-800">通知</h2>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <ul v-if="notifications && notifications.length > 0">
          <li 
            v-for="notification in notifications" 
            :key="notification.id"
            :class="['p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0', !notification.read ? 'bg-indigo-50' : '']">
            <p :class="['text-sm text-gray-700', !notification.read ? 'font-medium' : '']">{{ notification.text }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
          </li>
        </ul>
        <p v-else class="p-6 text-center text-sm text-gray-500">暂无新通知。</p>
      </div>
      <div class="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <a href="#" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">查看所有通知</a>
      </div>
       <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="关闭通知面板">
          <i class="fas fa-times"></i>
        </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api';

export default defineComponent({
  name: 'NotificationPanel',
  props: {
    notifications: {
      type: Array,
      default: () => []
    },
    // isVisible: Boolean // 改为内部控制，因为 App.vue 中用 v-if
  },
  setup(props, { emit }) {
    // 如果需要内部控制可见性，可以这样做，但App.vue中已用v-if
    const isVisible = ref(true); // 假设初始可见，或由父组件控制

    // 监听外部的 isVisible prop 变化 (如果父组件用prop控制)
    // watch(() => props.isVisible, (newVal) => {
    //   isVisible.value = newVal;
    // });

    return {
      isVisible,
    };
  }
});
</script>

<style scoped>
/* 添加一些平滑过渡效果 */
.fixed {
  transition: opacity 0.3s ease-out;
}
.absolute {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
</style>

