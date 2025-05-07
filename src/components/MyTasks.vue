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
        @toggle-complete="onToggleComplete"
        @edit-task="onEditTask" @delete-task="onDeleteTask" />
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

    const onDeleteTask = (taskId) => {
      emit('delete-task-requested', taskId); 
    };

    // 新增：处理编辑事件并向上触发
    const onEditTask = (task) => {
      emit('edit-task-requested', task); // 触发新事件给 App.vue，传递整个任务对象
    };

    return {
      onToggleComplete,
      onDeleteTask,
      onEditTask, // 暴露给模板
    };
  }
});
</script>
