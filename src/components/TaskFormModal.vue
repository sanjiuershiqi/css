<template>
  <div 
    class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-40 p-4" 
    @click.self="$emit('close')">
    <div class="relative mx-auto p-6 md:p-8 border w-full max-w-lg shadow-xl rounded-xl bg-white">
      <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">{{ modalTitle }}</h3>
      <form @submit.prevent="submitTask">
        <div class="mb-4">
          <label for="taskFormTitle" class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
          <input 
            type="text" 
            id="taskFormTitle" 
            v-model="editableTask.title.value" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：完成项目报告">
        </div>
        <div class="mb-4">
          <label for="taskFormProject" class="block text-sm font-medium text-gray-700 mb-1">所属项目</label>
          <input 
            type="text" 
            id="taskFormProject" 
            v-model="editableTask.project.value"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：Q3营销活动">
        </div>
        <div class="mb-4">
          <label for="taskFormDueDate" class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
          <input 
            type="text" 
            id="taskFormDueDate" 
            v-model="editableTask.dueDate.value"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：明天, 5月15日 (暂不支持日期选择器)">
        </div>
        <div class="mb-6">
          <label for="taskFormPriority" class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select 
            id="taskFormPriority" 
            v-model="editableTask.priority.value"
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
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from '@vue/composition-api';

export default defineComponent({
  name: 'TaskFormModal',
  props: {
    taskToEdit: { // 用于接收要编辑的任务对象
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    // 根据 taskToEdit prop 判断是添加模式还是编辑模式
    const isEditMode = computed(() => !!props.taskToEdit);
    
    const modalTitle = computed(() => isEditMode.value ? '编辑任务' : '添加新任务');
    const submitButtonText = computed(() => isEditMode.value ? '保存更改' : '保存任务');

    // 使用 ref 包裹每个属性，以便 v-model 可以双向绑定
    // 初始化时，如果是编辑模式，则填充表单；否则为空
    const editableTask = { 
      title: ref(props.taskToEdit ? props.taskToEdit.title : ''),
      project: ref(props.taskToEdit ? props.taskToEdit.project : ''),
      priority: ref(props.taskToEdit ? props.taskToEdit.priority : '中优先级'),
      dueDate: ref(props.taskToEdit ? props.taskToEdit.dueDate : '待定'),
      // id 和 completed 等其他属性在提交时处理
    };

    // 如果 taskToEdit prop 发生变化 (例如父组件切换了要编辑的任务)，则更新表单
    watch(() => props.taskToEdit, (newTask) => {
      if (newTask) {
        editableTask.title.value = newTask.title;
        editableTask.project.value = newTask.project;
        editableTask.priority.value = newTask.priority;
        editableTask.dueDate.value = newTask.dueDate;
      } else { // 如果 taskToEdit 变为 null (例如从编辑切换到添加模式，或关闭后重新打开为添加模式)
        editableTask.title.value = '';
        editableTask.project.value = '';
        editableTask.priority.value = '中优先级';
        editableTask.dueDate.value = '待定';
      }
    }, { immediate: true }); // immediate: true 确保在组件初始化时也执行一次

    const getPriorityClass = (priority) => {
      if (priority === '高优先级') return 'text-red-500';
      if (priority === '中优先级') return 'text-yellow-500';
      if (priority === '低优先级') return 'text-green-500';
      return 'text-gray-500';
    };

    const submitTask = () => {
      if (!editableTask.title.value.trim()) {
        if (typeof alert !== 'undefined') alert('任务标题不能为空！'); 
        return;
      }
      
      const taskData = {
        title: editableTask.title.value,
        project: editableTask.project.value || '未指定项目', 
        priority: editableTask.priority.value,
        priorityClass: getPriorityClass(editableTask.priority.value),
        dueDate: editableTask.dueDate.value || '待定',
      };

      if (isEditMode.value) {
        // 编辑模式，额外传递 id
        emit('save-task', { ...taskData, id: props.taskToEdit.id });
      } else {
        // 添加模式
        emit('save-task', taskData);
      }
    };

    return {
      editableTask,
      submitTask,
      modalTitle,
      submitButtonText,
      isEditMode,
    };
  }
});
</script>
