<template>
  <div>
    <img v-if="imageSrc" :src="imageSrc" alt="批改图片" style="width: 70%;height: 70%;border: 1px solid grey;" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import responseData from '@/assets/response.json'

const imageSrc = ref('')

onMounted(() => {
  const base64 = responseData.data.graded_images[1]
  imageSrc.value = 'data:image/jpeg;base64,' + base64
})
</script>