<template>
  <div class="dashboard-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div class="flex items-center justify-between mb-3">
      <div :class="['p-3 rounded-lg', stat.bgColor, stat.iconColor]">
        <i :class="[stat.icon, 'text-2xl']" aria-hidden="true"></i>
      </div>
      
      <span v-if="stat.trend" :class="['font-semibold text-sm', stat.trendColor]">
        <i v-if="stat.trend && stat.trend.includes('新增')" class="fas fa-arrow-up mr-1" aria-hidden="true"></i>
        {{ stat.trend }}
      </span>
      <div v-else-if="stat.avatars && stat.avatars.length" class="flex -space-x-2">
        <img 
          v-for="(avatarChar, index) in stat.avatars" 
          :key="index"
          class="inline-block h-8 w-8 rounded-full ring-2 ring-white" 
          :src="`https://placehold.co/32x32/${getAvatarColor(index)}/FFFFFF?text=${avatarChar}`" 
          :alt="`成员 ${avatarChar}`">
      </div>
    </div>
    
    <h3 :class="['text-3xl font-bold', stat.valueColor || 'text-gray-800']">{{ stat.value }}</h3>
    
    <p class="text-gray-500 font-medium">{{ stat.title }}</p>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'DashboardCard',
  props: {
    // 定义 prop，期望接收一个名为 'stat' 的对象
    stat: {
      type: Object,
      required: true,
      default: () => ({}) // 默认值为空对象
    }
  },
  setup() {
    // 用于生成头像占位图颜色的数组
    const avatarPlaceholderColors = ['FFC107', '4CAF50', '03A9F4', 'E91E63', '673AB7'];
    
    // 根据索引获取头像颜色，实现颜色循环
    const getAvatarColor = (index) => {
      return avatarPlaceholderColors[index % avatarPlaceholderColors.length];
    };

    return {
      getAvatarColor,
    };
  }
});
</script>

<style scoped>
/* 卡片悬停时的动效 */
.dashboard-card:hover {
  transform: translateY(-5px);
  /* Tailwind 的 hover:shadow-xl 提供了类似的阴影效果，这里可以作为补充或替代 */
}
</style>
