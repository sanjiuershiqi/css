<template>
  <div class="my-tasks-container bg-white p-6 rounded-xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">我的优先任务</h3>
      <button class="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center" aria-label="查看所有任务">
        查看全部 <i class="fas fa-arrow-right ml-1 text-xs" aria-hidden="true"></i>
      </button>
    </div>
    
    <div class="space-y-4">
      <TaskItem 
        v-for="task in localTasks.value" 
        :key="task.id" 
        :task="task" 
        @toggle-complete="handleToggleTaskComplete" />
      
      <button 
        class="w-full mt-4 py-3 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        aria-label="添加新任务">
        <i class="fas fa-plus-circle" aria-hidden="true"></i>
        <span>添加新任务</span>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api';
import TaskItem from './TaskItem.vue'; // 导入子组件

export default defineComponent({
  name: 'MyTasks',
  components: { // 注册子组件
    TaskItem,
  },
  props: {
    // 定义 props，期望接收一个名为 'tasks' 的数组
    tasks: {
      type: Array,
      required: true,
      default: () => [] // 默认值为空数组
    }
  },
  setup(props, { emit }) { // emit 可以从 context 中解构
    // 创建一个本地的响应式副本，以便在组件内部修改任务状态
    // 使用 JSON.parse(JSON.stringify(...)) 进行深拷贝，避免直接修改 props
    const localTasks = ref(JSON.parse(JSON.stringify(props.tasks || [])));

    // 使用 watch 监听外部 props.tasks 的变化，以同步更新本地的 localTasks
    // 这在父组件异步加载数据时很有用
    watch(() => props.tasks, (newTasks) => {
      localTasks.value = JSON.parse(JSON.stringify(newTasks || []));
    }, { 
      deep: true,      // 深度监听对象内部属性的变化
      immediate: true  // 立即执行一次 watcher，以便在组件初始化时同步数据
    });

    // 处理 TaskItem 组件触发的 'toggle-complete' 事件
    const handleToggleTaskComplete = (taskId) => {
      const task = localTasks.value.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        // 在真实应用中, 这里通常会调用 API 更新后端数据
        // console.log(`Task ${taskId} completion toggled to: ${task.completed}`);
        // emit('task-updated', task); // 可以选择性地向上层组件发送事件，通知任务状态已更新
      }
    };

    return {
      localTasks,
      handleToggleTaskComplete,
    };
  }
});
</script>
