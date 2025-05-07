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

    <nav class="space-y-1"> <a 
        v-for="item in navigationItems.value" 
        :key="item.name" 
        :href="item.href"
        :class="['nav-link flex items-center space-x-3 py-2.5 px-4 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200', { 'active': activeItem === item.name }]"
        @click.prevent="navigate(item.name)">
        <i :class="[item.icon, 'text-indigo-500 w-5 text-center']"></i>
        <span class="font-medium text-sm">{{ item.name }}</span> </a>
    </nav>

    <div class="pt-6 border-t border-gray-200 mt-auto">
       <a 
        href="#"
        :class="['nav-link flex items-center space-x-3 py-2.5 px-4 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200', { 'active': activeItem === '设置' }]"
        @click.prevent="navigate('设置')">
        <i class="fas fa-cog text-indigo-500 w-5 text-center"></i>
        <span class="font-medium text-sm">设置</span>
      </a>
      <a href="#" class="flex items-center space-x-3 py-2.5 px-4 mt-1 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
        <i class="fas fa-sign-out-alt text-gray-500 w-5 text-center"></i>
        <span class="font-medium text-sm">退出登录</span>
      </a>
    </div>
  </aside>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'Sidebar',
  props: {
    isOpen: Boolean,
    activeItem: String 
  },
  setup(props, { emit }) { 
    const navigationItems = ref([
      { name: '仪表盘', href: '#', icon: 'fas fa-tachometer-alt' },
      { name: '我的任务', href: '#', icon: 'fas fa-tasks' },
      { name: '项目', href: '#', icon: 'fas fa-folder-open' },
      { name: '日历', href: '#', icon: 'fas fa-calendar-alt' },
      { name: '报告', href: '#', icon: 'fas fa-chart-pie' },
      { name: '团队', href: '#', icon: 'fas fa-users' },
      // "设置" 已移到下方作为单独链接处理，不再此数组中
    ]);

    const navigate = (itemName) => {
      emit('navigate', itemName); 
    };

    return {
      navigationItems,
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
