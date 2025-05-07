<template>
  <div 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40" 
    @click.self="$emit('close')">
    <div class="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-xl bg-white">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">添加新任务</h3>
      <form @submit.prevent="submitTask">
        <div class="mb-4">
          <label for="taskTitleModal" class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
          <input 
            type="text" 
            id="taskTitleModal" 
            v-model="task.title.value" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：完成项目报告">
        </div>
        <div class="mb-4">
          <label for="taskProjectModal" class="block text-sm font-medium text-gray-700 mb-1">所属项目</label>
          <input 
            type="text" 
            id="taskProjectModal" 
            v-model="task.project.value"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：Q3营销活动">
        </div>
        <div class="mb-6">
          <label for="taskPriorityModal" class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select 
            id="taskPriorityModal" 
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
    const task = { 
      title: ref(''),
      project: ref(''),
      priority: ref('中优先级'), 
    };

    const getPriorityClass = (priority) => {
      if (priority === '高优先级') return 'text-red-500';
      if (priority === '中优先级') return 'text-yellow-500';
      if (priority === '低优先级') return 'text-green-500';
      return 'text-gray-500';
    };

    const submitTask = () => {
      if (!task.title.value.trim()) {
        // 在实际应用中，最好使用更友好的提示方式
        if (typeof alert !== 'undefined') alert('任务标题不能为空！'); 
        return;
      }
      emit('save-task', {
        title: task.title.value,
        project: task.project.value || '未指定项目', 
        priority: task.priority.value,
        priorityClass: getPriorityClass(task.priority.value),
      });
      
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
