<template>
    <!-- <router-view v-slot="{ Component }">
      <keep-alive include="home">
        <component :is="Component" />
      </keep-alive>
    </router-view> -->
    <router-view></router-view>
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
</style>