<template>
  <div class="task-item flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200 cursor-pointer">
    <div class="flex items-center space-x-3 flex-grow min-w-0"> <input 
        type="checkbox" 
        :checked="task.completed"
        @change="$emit('toggle-complete', task.id)"
        :aria-labelledby="'task-title-' + task.id"
        class="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer flex-shrink-0">
      <div class="flex-grow min-w-0"> <p :id="'task-title-' + task.id" :class="['font-medium text-gray-800 truncate', { 'line-through text-gray-500': task.completed }]">
          {{ task.title }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          项目: {{ task.project }} - <span :class="['font-semibold', task.priorityClass]">{{ task.priority }}</span>
        </p>
      </div>
    </div>
    
    <div class="flex items-center space-x-3 flex-shrink-0 ml-2">
      <span v-if="task.completed" class="text-sm text-green-600 whitespace-nowrap">
        <i class="fas fa-check-circle mr-1" aria-hidden="true"></i> 已完成
      </span>
      <span v-else class="text-sm text-gray-500 whitespace-nowrap">
        <i class="fas fa-clock mr-1" aria-hidden="true"></i> {{ task.dueDate }}
      </span>
      <img 
        v-if="task.assignee"
        :src="`https://placehold.co/24x24/${task.assignee.avatarColor || 'CCCCCC'}/FFFFFF?text=${task.assignee.avatarChar || '?'}`" 
        :alt="task.assignee.name || '未分配'" 
        class="w-6 h-6 rounded-full" 
        :title="task.assignee.name || '未分配'">
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'TaskItem',
  props: {
    // 定义 prop，期望接收一个名为 'task' 的对象
    task: {
      type: Object,
      required: true,
      default: () => ({ // 提供一个更完整的默认对象结构
        id: Date.now(), // 默认ID，确保唯一性
        title: '未命名任务',
        completed: false,
        project: '未分配项目',
        priority: '中优先级',
        priorityClass: 'text-yellow-500',
        dueDate: '待定',
        assignee: { name: '未分配', avatarChar: '?', avatarColor: 'CCCCCC' }
      })
    }
  },
  // emits: ['toggle-complete'] // 在 Vue 2 中，如果模板中直接使用 $emit，这里不是必需的
  setup(props, { emit }) {
    // setup 函数内容 (如果需要特定的逻辑)
    // 例如，可以从这里调用 emit，但通常在模板中更直接
    // const toggle = () => {
    //   emit('toggle-complete', props.task.id);
    // };
    return {};
  }
});
</script>

<style scoped>
/* 任务项悬停时的背景色变化 */
.task-item:hover {
  background-color: #f0f0f5; /* 一个浅灰色背景 */
}
/* Tailwind 的 form-checkbox class 已经负责了复选框的大部分样式 */
</style>
