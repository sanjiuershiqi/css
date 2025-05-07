// src/main.js

import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api'; // 引入 Composition API 插件
import App from './App.vue'; // 引入根组件

// 可选: 如果您将 Tailwind CSS 指令放在一个单独的 CSS 文件中
// import './assets/css/main.css'; // 例如: src/assets/css/main.css

// Vue 全局配置
Vue.config.productionTip = false; // 在生产环境中关闭生产提示

// 注册 Vue Composition API 插件
// 这是在 Vue 2 中使用 Composition API 的关键步骤
Vue.use(VueCompositionAPI);

// 创建 Vue 实例
new Vue({
  // render 函数用于渲染根组件 App.vue
  render: h => h(App), 
}).$mount('#app'); // 将 Vue 实例挂载到 public/index.html 中的 #app元素上
