<template>
  <div class="container">
    <h3>Lottie动画示例</h3>
    
    <lottie-player
      ref="lottieRef"
      :src="animationPath"
      :loop="true"
      :autoplay="false"
      style="width: 300px; height: 300px;"
      @load="onAnimationLoad"
      @error="onAnimationError"
    />
    
    <div class="controls">
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="stop">停止</button>
    </div>
    
    <!-- 显示加载状态 -->
    <div v-if="loadingMessage">{{ loadingMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const animationPath = 'src/assets/json/treasure.json';
// const animationPath = 'src/assets/json/aa.json';
const lottieRef = ref(null);
const loadingMessage = ref('加载动画中...');

// 控制方法
const play = () => {
  lottieRef.value?.play();
};

const pause = () => {
  lottieRef.value?.pause();
};

const stop = () => {
  lottieRef.value?.stop();
};

// 动画加载成功事件
const onAnimationLoad = () => {
  loadingMessage.value = '动画已加载';
  console.log('Lottie动画加载成功');
};

// 动画加载失败事件
const onAnimationError = (e) => {
  loadingMessage.value = '动画加载失败';
  console.error('Lottie动画加载失败:', e);
};

onMounted(() => {
  console.log('Lottie组件已挂载');
  
  // 检查lottieRef是否存在
  setTimeout(() => {
    if (lottieRef.value) {
      console.log('LottiePlayer元素:', lottieRef.value);
    } else {
      console.error('未找到LottiePlayer元素');
    }
  }, 500);
});

// 组件卸载前销毁动画
onBeforeUnmount(() => {
  if (lottieRef.value) {
    lottieRef.value.destroy();
    console.log('Lottie动画已销毁');
  }
});
</script>