<template>
    <!-- <router-view v-slot="{ Component }">
      <keep-alive include="home">
        <component :is="Component" />
      </keep-alive>
    </router-view> -->
    <router-view></router-view>
    <nav class="bottom-tabs" aria-label="主导航">
      <router-link to="/" class="tab-item">智能客服</router-link>
      <router-link to="/report" class="tab-item">PDF 报告</router-link>
      <router-link to="/grading" class="tab-item">作业批改</router-link>
    </nav>
</template>

<script setup>
import { onMounted } from 'vue';

    // import { onMounted, nextTick } from 'vue';
    // import { getSystemInfo } from '@/utils/util'
    // console.log('app.vue: ',window.screen.width,navigator.language)
    // const systemInfo = getSystemInfo();
    // console.log(`操作系统: ${systemInfo.system}`);
    // console.log(`版本号: ${systemInfo.version}`);
    
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  height: 100%;
}

.bottom-tabs {
  position: fixed;
  z-index: 20;
  right: 50%;
  bottom: 18px;
  display: flex;
  width: min(calc(100% - 32px), 360px);
  padding: 5px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5f5;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(25, 52, 104, 0.18);
  transform: translateX(50%);
  backdrop-filter: blur(12px);
}

.tab-item {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  color: #64718b;
  font-size: 14px;
  text-align: center;
  text-decoration: none;
}

.tab-item.router-link-exact-active {
  background: #3267ed;
  color: #ffffff;
  font-weight: 700;
}
</style>
