<template>
  <aside 
    id="sidebar"
    :class="['bg-white w-64 min-h-screen p-6 space-y-6 shadow-lg fixed lg:relative lg:translate-x-0 sidebar-transition z-30', isOpen ? 'translate-x-0' : '-translate-x-full']">
    <div class="flex items-center space-x-3 pb-6 border-b border-gray-200">
      <div class="bg-indigo-600 p-2 rounded-lg">
        <i class="fas fa-rocket text-white text-xl"></i> </div>
      <h1 class="text-2xl font-bold text-indigo-700">ProManage</h1>
    </div>

    <nav class="space-y-2">
      <a 
        v-for="item in navigationItems.value" 
        :key="item.name" 
        :href="item.href"
        :class="['nav-link flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200', { 'active': activeItem.value === item.name }]"
        @click.prevent="setActive(item.name)">
        <i :class="[item.icon, 'text-indigo-500 w-5 text-center']"></i>
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
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'Sidebar',
  props: {
    isOpen: Boolean // 控制侧边栏在移动端是否打开
  },
  setup(props, { emit }) { // emit 通过第二个参数 context 获取
    // 导航项数据
    const navigationItems = ref([
      { name: '仪表盘', href: '#', icon: 'fas fa-tachometer-alt' },
      { name: '我的任务', href: '#', icon: 'fas fa-tasks' },
      { name: '项目', href: '#', icon: 'fas fa-folder-open' },
      { name: '日历', href: '#', icon: 'fas fa-calendar-alt' },
      { name: '报告', href: '#', icon: 'fas fa-chart-pie' },
      { name: '团队', href: '#', icon: 'fas fa-users' },
    ]);

    // 当前激活的导航项
    const activeItem = ref('仪表盘'); 

    // 设置激活导航项的方法
    const setActive = (itemName) => {
      activeItem.value = itemName;
      // 在真实应用中, 这里会使用 Vue Router 进行导航
      // 示例: 同时触发 'close-sidebar' 事件，以便在移动端点击导航项后关闭侧边栏
      emit('close-sidebar');
    };

    return {
      navigationItems,
      activeItem,
      setActive,
    };
  },
});
</script>

<style scoped>
/* 激活导航链接的特定样式 */
.nav-link.active {
  background-color: #4f46e5; /* Tailwind indigo-600 */
  color: white;
}
.nav-link.active i { /* 激活时图标也变为白色 */
  color: white;
}
</style>
