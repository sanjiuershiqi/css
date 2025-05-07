<template>
  <section class="stats-grid-section">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard 
        v-for="stat in stats" 
        :key="stat.id" 
        :stat="stat" />
    </div>
  </section>
</template>

<script>
import { defineComponent } from '@vue/composition-api';
import DashboardCard from './DashboardCard.vue'; // 导入子组件

export default defineComponent({
  name: 'StatsGrid',
  components: { // 注册子组件
    DashboardCard,
  },
  props: {
    // 定义 props，期望接收一个名为 'stats' 的数组
    stats: {
      type: Array,
      required: true, // 表示这个 prop 是必需的
      default: () => [] // 如果父组件没有传递，则默认为空数组
    }
  },
  setup(props) {
    // setup 函数可以访问 props
    // console.log('Stats received in StatsGrid:', props.stats);
    return {}; // 如果没有其他逻辑，可以返回空对象
  }
});
</script>
