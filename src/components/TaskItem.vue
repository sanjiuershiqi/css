<template>
  <div class="task-item flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200">
    <div class="flex items-center space-x-3 flex-grow min-w-0 mr-2">
      <input 
        type="checkbox" 
        :checked="task.completed"
        @change="$emit('toggle-complete', task.id)"
        :aria-labelledby="'task-title-' + task.id"
        class="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer flex-shrink-0">
      <div class="flex-grow min-w-0">
        <p :id="'task-title-' + task.id" :class="['font-medium text-gray-800 truncate', { 'line-through text-gray-500': task.completed }]">
          {{ task.title }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          项目: {{ task.project }} - <span :class="['font-semibold', task.priorityClass]">{{ task.priority }}</span>
        </p>
      </div>
    </div>
    
    <div class="flex items-center space-x-2 md:space-x-3 flex-shrink-0 ml-2">
      <span v-if="task.completed" class="text-sm text-green-600 whitespace-nowrap hidden md:inline-flex items-center">
        <i class="fas fa-check-circle mr-1" aria-hidden="true"></i> 已完成
      </span>
      <span v-else class="text-sm text-gray-500 whitespace-nowrap hidden md:inline-flex items-center">
        <i class="fas fa-clock mr-1" aria-hidden="true"></i> {{ task.dueDate }}
      </span>
      <img 
        v-if="task.assignee"
        :src="`https://placehold.co/24x24/${task.assignee.avatarColor || 'CCCCCC'}/FFFFFF?text=${task.assignee.avatarChar || '?'}`" 
        :alt="task.assignee.name || '未分配'" 
        class="w-6 h-6 rounded-full hidden sm:block" 
        :title="task.assignee.name || '未分配'">
      <button 
        @click.stop="$emit('edit-task', task)" 
        class="text-gray-400 hover:text-indigo-500 focus:outline-none focus:text-indigo-500 transition-colors p-1 rounded-full"
        aria-label="编辑任务">
        <i class="fas fa-pencil-alt text-sm"></i>
      </button>
      <button 
        @click.stop="$emit('delete-task', task.id)" 
        class="text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors p-1 rounded-full"
        aria-label="删除任务">
        <i class="fas fa-trash-alt text-sm"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'TaskItem',
  props: {
    task: {
      type: Object,
      required: true,
      default: () => ({ 
        id: Date.now(), 
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
  // Emits 'toggle-complete', 'edit-task', 'delete-task'
});
</script>

<style scoped>
.task-item:hover {
  background-color: #f0f0f5; 
}
</style>
