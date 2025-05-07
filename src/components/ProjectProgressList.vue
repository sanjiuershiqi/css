<template>
  <div class="project-progress-list bg-white p-6 rounded-xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">项目进度</h3>
      <select 
        class="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
        aria-label="选择项目进度时间范围">
        <option value="month">本月</option>
        <option value="last_month">上月</option>
        <option value="all_time">所有时间</option>
      </select>
    </div>
    
    <div class="space-y-5">
      <div v-for="project in projects" :key="project.id" class="project-item">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 truncate" :title="project.name">{{ project.name }}</span>
          <span class="text-sm font-medium" :style="{ color: getProgressTextColor(project.progress) }">{{ project.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <div 
            :class="['h-2.5 rounded-full progress-bar-animated', project.color]" 
            :style="{ width: project.progress + '%' }"
            role="progressbar"
            :aria-valuenow="project.progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${project.name} 进度 ${project.progress}%`">
          </div>
        </div>
      </div>
      <p v-if="!projects || projects.length === 0" class="text-sm text-gray-500 text-center py-4">
        暂无项目进度数据。
      </p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'ProjectProgressList',
  props: {
    // 定义 props，期望接收一个名为 'projects' 的数组
    projects: {
      type: Array,
      required: true,
      default: () => [] // 默认值为空数组
    }
  },
  setup() {
    // 根据进度百分比决定文本颜色，以提高对比度和可读性
    const getProgressTextColor = (progress) => {
      if (progress >= 90) return '#10B981'; // Tailwind green-600
      if (progress >= 70) return '#4F46E5'; // Tailwind indigo-600
      if (progress >= 40) return '#3B82F6'; // Tailwind blue-500
      return '#F59E0B'; // Tailwind yellow-500 (或 amber-500)
    };
    return {
      getProgressTextColor,
    };
  }
});
</script>

<style scoped>
/* 可选：为进度条添加一个简单的加载动画 */
.progress-bar-animated {
  transition: width 0.5s ease-in-out;
}
</style>
