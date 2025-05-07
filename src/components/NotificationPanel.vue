<template>
  <div
    class="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 flex items-start justify-end pt-16 pr-4 md:pr-8" 
    @click.self="$emit('close')" 
    aria-hidden="false">

    <div
      class="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-panel-title"
      @click.stop 
    >
      <div class="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 id="notification-panel-title" class="text-lg font-semibold text-gray-800">通知</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          aria-label="关闭通知面板">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <ul v-if="localNotifications.value && localNotifications.value.length > 0">
          <li 
            v-for="notification in localNotifications.value" 
            :key="notification.id"
            :class="['p-4 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0', !notification.read ? 'bg-indigo-50 font-medium' : '']"
            @click="markAsRead(notification.id)"> <p :class="['text-sm', !notification.read ? 'text-gray-800' : 'text-gray-600']">{{ notification.text }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
          </li>
        </ul>
        <p v-else class="p-6 text-center text-sm text-gray-500">暂无新通知。</p>
      </div>

      <div class="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <a href="#" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">查看所有通知</a>
      </div>
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
    }
  },
  setup(props, { emit }) {
    // 创建本地副本以便修改 read 状态
    const localNotifications = ref([]);

    watch(() => props.notifications, (newNotifications) => {
      // 深拷贝以避免直接修改 prop
      localNotifications.value = JSON.parse(JSON.stringify(newNotifications || []));
    }, { immediate: true, deep: true });

    const markAsRead = (notificationId) => {
      const notification = localNotifications.value.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        // 在真实应用中，这里会通知父组件或API更新后端状态
        emit('notification-read', notificationId); 
        console.log(`通知 ${notificationId} 已标记为已读 (本地)`);
      }
    };

    return {
      localNotifications,
      markAsRead,
    };
  }
});
</script>
