<template>
  <section class="settings-view bg-white p-6 md:p-8 rounded-xl shadow-lg">
    <h3 class="text-2xl font-semibold text-gray-800 mb-6">账户设置</h3>

    <form @submit.prevent="saveSettings">
      <div class="mb-6">
        <label for="userName" class="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
        <input 
          type="text" 
          id="userName" 
          v-model="editableProfile.userName.value" 
          class="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="请输入您的显示名称">
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择头像</label>
        <div class="flex flex-wrap gap-3">
          <div 
            v-for="avatarOption in predefinedAvatars" 
            :key="avatarOption.char + avatarOption.color"
            @click="selectAvatar(avatarOption)"
            :class="['w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold cursor-pointer transition-all duration-200', 
                     `bg-${avatarOption.bgColorClass}`, 
                     {'ring-4 ring-offset-2 ring-indigo-500': isSelectedAvatar(avatarOption)}]"
            :style="{ backgroundColor: avatarOption.color }"
            role="button"
            tabindex="0"
            :aria-label="`选择头像 ${avatarOption.char}`"
            @keypress.enter="selectAvatar(avatarOption)"
            @keypress.space="selectAvatar(avatarOption)">
            {{ avatarOption.char }}
          </div>
        </div>
        <div class="mt-4 flex items-center space-x-3">
          <span class="text-sm text-gray-600">当前选择:</span>
          <div 
            v-if="editableProfile.avatarChar.value"
            :class="['w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold', `bg-${selectedAvatarBgClass.value}`]"
            :style="{ backgroundColor: editableProfile.avatarColor.value }">
            {{ editableProfile.avatarChar.value }}
          </div>
          <span v-else class="text-sm text-gray-500">未选择</span>
        </div>
      </div>

      <div class="mb-8">
        <label for="darkModeToggle" class="block text-sm font-medium text-gray-700 mb-1">界面偏好</label>
        <div class="flex items-center mt-2">
          <input 
            type="checkbox" 
            id="darkModeToggle" 
            v-model="editableSettings.darkMode.value"
            class="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer">
          <label for="darkModeToggle" class="ml-2 text-sm text-gray-700 cursor-pointer">启用暗黑模式 (偏好设置)</label>
        </div>
        <p class="text-xs text-gray-500 mt-1">注意：此功能仅保存偏好，完整UI切换需额外实现。</p>
      </div>

      <div class="flex justify-start">
        <button 
          type="submit"
          class="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          保存设置
        </button>
      </div>
    </form>
    
    <div v-if="showSuccessMessage.value" class="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
      设置已成功保存！
    </div>

  </section>
</template>

<script>
import { defineComponent, ref, watch, computed } from '@vue/composition-api';

export default defineComponent({
  name: 'SettingsView',
  props: {
    currentProfile: { // 从 App.vue 传入当前用户配置
      type: Object,
      required: true,
      default: () => ({ userName: '', avatarChar: 'U', avatarColor: '#667EEA' }) // 默认值
    },
    currentSettings: { // 从 App.vue 传入当前应用设置
      type: Object,
      required: true,
      default: () => ({ darkMode: false })
    }
  },
  setup(props, { emit }) {
    // 本地编辑状态，用 props 初始化
    const editableProfile = {
      userName: ref(props.currentProfile.userName),
      avatarChar: ref(props.currentProfile.avatarChar),
      avatarColor: ref(props.currentProfile.avatarColor),
    };
    const editableSettings = {
      darkMode: ref(props.currentSettings.darkMode),
    };

    const showSuccessMessage = ref(false);

    // 预定义头像选项
    const predefinedAvatars = ref([
      { char: 'A', color: '#EF4444', bgColorClass: 'red-500' }, // red-500
      { char: 'B', color: '#F97316', bgColorClass: 'orange-500' }, // orange-500
      { char: 'C', color: '#EAB308', bgColorClass: 'yellow-500' }, // yellow-500
      { char: 'D', color: '#22C55E', bgColorClass: 'green-500' }, // green-500
      { char: 'E', color: '#0EA5E9', bgColorClass: 'sky-500' },   // sky-500
      { char: 'F', color: '#6366F1', bgColorClass: 'indigo-500' },// indigo-500
      { char: 'G', color: '#A855F7', bgColorClass: 'purple-500' },// purple-500
      { char: 'H', color: '#EC4899', bgColorClass: 'pink-500' },  // pink-500
      { char: 'U', color: '#667EEA', bgColorClass: 'indigo-400' },// 默认
    ]);

    // 监听 props 变化，以防父组件异步更新数据
    watch(() => props.currentProfile, (newProfile) => {
      if (newProfile) {
        editableProfile.userName.value = newProfile.userName;
        editableProfile.avatarChar.value = newProfile.avatarChar;
        editableProfile.avatarColor.value = newProfile.avatarColor;
      }
    }, { deep: true });

    watch(() => props.currentSettings, (newSettings) => {
      if (newSettings) {
        editableSettings.darkMode.value = newSettings.darkMode;
      }
    }, { deep: true });

    const selectAvatar = (avatar) => {
      editableProfile.avatarChar.value = avatar.char;
      editableProfile.avatarColor.value = avatar.color;
    };

    const isSelectedAvatar = (avatarOption) => {
      return editableProfile.avatarChar.value === avatarOption.char && editableProfile.avatarColor.value === avatarOption.color;
    };
    
    const selectedAvatarBgClass = computed(() => {
        const selected = predefinedAvatars.value.find(
            av => av.char === editableProfile.avatarChar.value && av.color === editableProfile.avatarColor.value
        );
        return selected ? selected.bgColorClass : 'gray-500'; // 默认灰色背景
    });


    const saveSettings = () => {
      emit('save-settings', {
        profile: {
          userName: editableProfile.userName.value,
          avatarChar: editableProfile.avatarChar.value,
          avatarColor: editableProfile.avatarColor.value,
        },
        settings: {
          darkMode: editableSettings.darkMode.value,
        }
      });
      showSuccessMessage.value = true;
      setTimeout(() => {
        showSuccessMessage.value = false;
      }, 3000); // 3秒后自动隐藏成功消息
    };

    return {
      editableProfile,
      editableSettings,
      predefinedAvatars,
      selectAvatar,
      isSelectedAvatar,
      selectedAvatarBgClass,
      saveSettings,
      showSuccessMessage,
    };
  }
});
</script>

<style scoped>
/* 为背景颜色动态绑定添加 Tailwind 类名 (如果直接 style 绑定不生效或不希望内联样式过多) */
/* 例如: .bg-red-500 { background-color: #EF4444 !important; } ... 等等，但这通常由 Tailwind 自动处理 */
/* 这里我们直接使用 style 绑定 backgroundColor，Tailwind 的 bg-类名用于语义或备用 */
</style>
