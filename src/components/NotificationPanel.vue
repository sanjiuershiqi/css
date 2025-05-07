<template>
  <div
    class="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 flex items-start justify-end pt-16 pr-4 md:pr-8" 
    @click.self="$emit('close')" 
    aria-hidden="false"> <div
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
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'NotificationPanel',
  props: {
    notifications: {
      type: Array,
      default: () => [] // 默认值为空数组
    }
    // 移除了内部的 isVisible prop 和 ref，完全由父组件通过 v-if 控制
  },
  // setup 函数如果只是为了 emit 事件，且事件在模板中通过 $emit 处理，则可以为空或移除
  // emits: ['close'] // 在 Vue 2 Options API 中声明 emits，Composition API 中通常在 setup 的 context 中处理
});
</script>

<style scoped>
/* 如果需要特定的过渡动画，最好配合 Vue 的 <transition> 组件使用 */
/* 这里的 transform 和 opacity 过渡可能不会在 v-if 直接添加/移除元素时平滑生效 */
/*.fixed {
  transition: opacity 0.3s ease-out;
}
.transform {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}*/
</style>
