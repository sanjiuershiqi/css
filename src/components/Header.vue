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
          <span 
            v-if="unreadNotificationsCount > 0"
            class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-semibold w-4 h-4 rounded-full flex items-center justify-center">
            {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
          </span>
        </button>
        <div class="relative">
          <button @click="toggleUserDropdown" class="flex items-center space-x-2 focus:outline-none" id="userMenuButtonHeader">
            <div 
              v-if="userProfile && userProfile.avatarChar"
              :class="['w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold border-2 border-indigo-200 hover:border-indigo-500 transition-all']"
              :style="{ backgroundColor: userProfile.avatarColor || '#A0AEC0' }"> 
              {{ userProfile.avatarChar }}
            </div>
            <img v-else src="https://placehold.co/40x40/A0AEC0/FFFFFF?text=?" alt="用户头像" class="w-10 h-10 rounded-full border-2 border-indigo-200 hover:border-indigo-500 transition-all">
            
            <span class="hidden md:block font-medium text-gray-700">{{ userProfile ? userProfile.userName : '用户' }}</span>
            <i class="fas fa-chevron-down text-gray-500 text-xs hidden md:block"></i>
          </button>
          <div v-if="isUserDropdownOpen.value" @click.stop class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-40">
            <a href="#" @click.prevent="navigateToSettings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">账户设置</a>
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
  props: {
    userProfile: { // 从 App.vue 接收用户配置
      type: Object,
      default: () => ({ userName: '用户', avatarChar: '?', avatarColor: '#A0AEC0' })
    },
    unreadNotificationsCount: { // 从 App.vue 接收未读通知数量
      type: Number,
      default: 0
    }
  },
  setup(props, { emit }) {
    const isUserDropdownOpen = ref(false);
    const searchTermLocal = ref('');

    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value;
    };

    const onSearchInput = () => {
      emit('search', searchTermLocal.value.value); 
    };
    
    const navigateToSettings = () => {
        emit('navigate-to-settings'); // 触发事件通知 App.vue 导航到设置页
        isUserDropdownOpen.value = false; // 关闭下拉菜单
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
      navigateToSettings,
    };
  },
});
</script>
