<template>
  <header class="bg-white shadow-md p-4 sticky top-0 z-20">
    <div class="container mx-auto flex items-center justify-between">
      <button 
        id="hamburger" 
        @click="$emit('toggle-sidebar')" 
        class="lg:hidden text-gray-600 hover:text-indigo-600 focus:outline-none"
        aria-label="Toggle sidebar">
        <i class="fas fa-bars text-2xl"></i>
      </button>

      <div class="relative hidden sm:block">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </span>
        <input 
          type="text" 
          placeholder="搜索项目、任务..." 
          class="w-full md:w-96 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
          aria-label="Search">
      </div>

      <div class="flex items-center space-x-5">
        <button class="relative text-gray-500 hover:text-indigo-600" aria-label="View notifications">
          <i class="fas fa-bell text-xl"></i>
          <span class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-semibold w-4 h-4 rounded-full flex items-center justify-center" aria-hidden="true">3</span>
        </button>
        
        <div class="relative">
          <button 
            @click="toggleUserDropdown" 
            class="flex items-center space-x-2 focus:outline-none" 
            id="userMenuButtonHeader"
            aria-expanded="isUserDropdownOpen.value"
            aria-haspopup="true">
            <img src="https://placehold.co/40x40/667EEA/FFFFFF?text=U" alt="用户头像" class="w-10 h-10 rounded-full border-2 border-indigo-200 hover:border-indigo-500 transition-all">
            <span class="hidden md:block font-medium text-gray-700">尊贵的用户</span>
            <i class="fas fa-chevron-down text-gray-500 text-xs hidden md:block" aria-hidden="true"></i>
          </button>
          
          <div 
            v-if="isUserDropdownOpen.value" 
            @click.stop 
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-40"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="userMenuButtonHeader">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" role="menuitem">个人资料</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" role="menuitem">账户设置</a>
            <div class="border-t border-gray-100 my-1" role="separator"></div>
            <a href="#" class="block px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600" role="menuitem">退出登录</a>
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
  // emits: ['toggle-sidebar'] // Vue 2 中 $emit 在模板中使用时不需要显式声明 emits
  setup(props, { emit }) { // emit 可以从 context 中解构出来
    // 用户下拉菜单的显示状态
    const isUserDropdownOpen = ref(false);

    // 切换用户下拉菜单的显示/隐藏
    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value;
    };

    // 处理点击外部区域以关闭用户下拉菜单
    const closeUserDropdownOnClickOutside = (event) => {
      if (isUserDropdownOpen.value) {
        // 获取用户菜单按钮元素
        const userMenuButton = document.getElementById('userMenuButtonHeader'); 
        // 检查点击事件的目标是否在下拉菜单内部
        const dropdownMenu = event.target.closest('.absolute.right-0.mt-2'); 

        // 如果点击的不是按钮本身，也不是下拉菜单内部，则关闭下拉菜单
        if (userMenuButton && !userMenuButton.contains(event.target) && !dropdownMenu) {
          isUserDropdownOpen.value = false;
        }
      }
    };

    // 组件挂载后，添加全局点击事件监听器
    onMounted(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('click', closeUserDropdownOnClickOutside);
      }
    });

    // 组件卸载前，移除全局点击事件监听器
    onUnmounted(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', closeUserDropdownOnClickOutside);
      }
    });
    
    return {
      isUserDropdownOpen,
      toggleUserDropdown,
    };
  },
});
</script>
