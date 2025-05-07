<template>
  <section class="recent-activity-section bg-white p-6 rounded-xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">最近活动</h3>
      <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm" aria-label="查看所有活动日志">查看日志</a>
    </div>
    
    <ul class="divide-y divide-gray-200">
      <li v-for="activity in activities" :key="activity.id" class="py-4 flex items-start space-x-4">
        <div :class="[activity.iconBg, activity.iconColor, 'p-2 rounded-full flex-shrink-0 mt-1']">
          <i :class="[activity.icon, 'w-5 h-5 text-center']" aria-hidden="true"></i>
        </div>
        <div>
          <p class="text-sm text-gray-700">
            <template v-for="(part, index) in activity.textParts">
              <span v-if="part.type === 'normal'" class="leading-relaxed" :key="`${activity.id}-normal-${index}`">{{ part.content }}</span>
              <span v-if="part.type === 'bold'" class="font-semibold leading-relaxed" :key="`${activity.id}-bold-${index}`">{{ part.content }}</span>
              <span v-if="part.type === 'user'" class="font-semibold text-indigo-600 leading-relaxed" :key="`${activity.id}-user-${index}`">{{ part.content }}</span>
            </template>
          </p>
          <p class="text-xs text-gray-500 mt-0.5">{{ activity.time }}</p>
        </div>
      </li>
      <li v-if="!activities || activities.length === 0" class="py-4 text-sm text-gray-500 text-center">
        暂无最近活动。
      </li>
    </ul>
  </section>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'RecentActivity',
  props: {
    // 定义 props，期望接收一个名为 'activities' 的数组
    activities: {
      type: Array,
      required: true,
      default: () => [] // 默认值为空数组
    }
  },
  setup() {
    // setup 函数内容 (如果需要特定的逻辑)
    return {};
  }
});
</script>
