<template>
  <main class="grading-page">
    <header class="page-header">
      <p class="eyebrow">AI 作业批改</p>
      <h1>上传答案与学生试卷，生成批改图片</h1>
      <p>支持一次上传多张标准答案和学生答题图片，系统将逐页批改并返回可下载的标注结果。</p>
    </header>

    <section class="grading-layout">
      <article class="panel upload-panel">
        <div class="panel-heading"><span>1</span><div><h2>上传试卷图片</h2><p>答案与学生试卷都支持多张上传</p></div></div>

        <section class="upload-group">
          <div class="upload-group-title"><h3>标准答案</h3><small>answer_image</small></div>
          <input ref="answerInput" class="file-input" type="file" accept="image/png,image/jpeg,image/jpg" multiple @change="handleFileChange($event, 'answer')" />
          <button class="upload-zone" type="button" @click="answerInput?.click()"><span>＋</span>选择标准答案图片</button>
          <div v-if="answerImages.length" class="file-list">
            <div v-for="(file, index) in answerImages" :key="file.name + file.lastModified" class="file-row"><span>图片</span><b>{{ file.name }}</b><button type="button" @click="removeFile('answer', index)">删除</button></div>
          </div>
        </section>

        <section class="upload-group">
          <div class="upload-group-title"><h3>学生答题</h3><small>student_image</small></div>
          <input ref="studentInput" class="file-input" type="file" accept="image/png,image/jpeg,image/jpg" multiple @change="handleFileChange($event, 'student')" />
          <button class="upload-zone student" type="button" @click="studentInput?.click()"><span>＋</span>选择学生答题图片</button>
          <div v-if="studentImages.length" class="file-list">
            <div v-for="(file, index) in studentImages" :key="file.name + file.lastModified" class="file-row"><span>图片</span><b>{{ file.name }}</b><button type="button" @click="removeFile('student', index)">删除</button></div>
          </div>
        </section>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="grade-button" type="button" :disabled="!canGrade || isGrading" @click="submitGrading">{{ isGrading ? '正在识别与批改…' : '开始批改' }}</button>
      </article>

      <article class="panel result-panel">
        <div class="panel-heading"><span>2</span><div><h2>批改结果</h2><p>批改完成后可查看并下载标注图片</p></div></div>
        <div v-if="result" class="score-card">
          <div><small>科目</small><b>{{ result.answer.subject || '未识别' }}</b></div>
          <div><small>总分</small><b class="score">{{ result.answer.total_score }}</b></div>
          <p v-if="result.answer.summary">{{ result.answer.summary }}</p>
        </div>
        <div v-if="gradedImages.length" class="graded-list">
          <article v-for="(image, index) in gradedImages" :key="index" class="graded-item">
            <header><strong>第 {{ index + 1 }} 页批改结果</strong><button type="button" @click="downloadImage(image, index)">下载图片</button></header>
            <div class="graded-image-viewer">
              <img :src="image" :alt="`第 ${index + 1} 页批改结果`" />
            </div>
          </article>
        </div>
        <div v-else class="empty-result">{{ isGrading ? '正在生成批改图片，请稍候…' : '上传答案与学生试卷后，批改结果将在这里展示。' }}</div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const GRADING_API_URL = 'http://101.200.32.195:8000/grading/upload';

type GradingAnswer = {
  subject?: string;
  total_score: number;
  questions: unknown[];
  summary?: string;
};
type GradingResult = { answer: GradingAnswer; graded_images: string[] };

const answerImages = ref<File[]>([]);
const studentImages = ref<File[]>([]);
const result = ref<GradingResult>();
const gradedImages = ref<string[]>([]);
const errorMessage = ref('');
const isGrading = ref(false);
const answerInput = ref<HTMLInputElement>();
const studentInput = ref<HTMLInputElement>();
const canGrade = computed(() => answerImages.value.length > 0 && studentImages.value.length > 0);

function handleFileChange(event: Event, type: 'answer' | 'student') {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (type === 'answer') answerImages.value = files;
  else studentImages.value = files;
  result.value = undefined;
  gradedImages.value = [];
  errorMessage.value = '';
}

function removeFile(type: 'answer' | 'student', index: number) {
  if (type === 'answer') {
    answerImages.value.splice(index, 1);
    if (!answerImages.value.length && answerInput.value) answerInput.value.value = '';
  } else {
    studentImages.value.splice(index, 1);
    if (!studentImages.value.length && studentInput.value) studentInput.value.value = '';
  }
}

function toImageUrl(base64: string) {
  return base64.startsWith('data:image/') ? base64 : `data:image/jpeg;base64,${base64}`;
}

async function submitGrading() {
  if (!canGrade.value || isGrading.value) return;
  isGrading.value = true;
  errorMessage.value = '';
  result.value = undefined;
  gradedImages.value = [];

  try {
    const formData = new FormData();
    answerImages.value.forEach((file) => formData.append('answer_image', file));
    studentImages.value.forEach((file) => formData.append('student_image', file));
    const response = await fetch(GRADING_API_URL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok || payload.code !== 0) throw new Error(payload.detail || payload.msg || '作业批改失败');
    result.value = payload.data as GradingResult;
    gradedImages.value = (payload.data.graded_images || []).map(toImageUrl);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '作业批改失败，请稍后重试。';
  } finally {
    isGrading.value = false;
  }
}

function downloadImage(imageUrl: string, index: number) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `批改结果-第${index + 1}页.jpg`;
  link.click();
}
</script>

<style scoped>
.grading-page { min-height: 100%; padding: 54px 24px 105px; background: linear-gradient(135deg, #f7faff 0%, #eef4ff 48%, #f9fbff 100%); color: #17213a; }.page-header, .grading-layout { width: min(1150px, 100%); margin: 0 auto; }.page-header { margin-bottom: 28px; }.eyebrow { margin-bottom: 9px; color: #3267ed; font-size: 13px; font-weight: 700; letter-spacing: .08em; }.page-header h1 { margin-bottom: 10px; font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -.03em; }.page-header > p:last-child { color: #65738e; font-size: 15px; }
.grading-layout { display: grid; grid-template-columns: minmax(310px, .85fr) minmax(440px, 1.4fr); gap: 20px; align-items: start; }.panel { padding: 22px; border: 1px solid #dbe5f5; border-radius: 18px; background: rgba(255,255,255,.92); box-shadow: 0 12px 35px rgba(29,61,121,.08); }.panel-heading { display: flex; gap: 10px; align-items: center; margin-bottom: 19px; }.panel-heading > span { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; background: #eaf1ff; color: #2e62df; font-size: 13px; font-weight: 800; }.panel h2 { font-size: 17px; font-weight: 800; }.panel-heading p { margin-top: 3px; color: #78859d; font-size: 12px; }.upload-group + .upload-group { margin-top: 17px; }.upload-group-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }.upload-group-title h3 { font-size: 14px; font-weight: 700; }.upload-group-title small { color: #7d8aa0; font: 11px ui-monospace, monospace; }.file-input { display: none; }.upload-zone { display: block; width: 100%; min-height: 48px; border: 1.5px dashed #a9c2f5; border-radius: 12px; background: #f8fbff; color: #3765bd; cursor: pointer; font-size: 13px; }.upload-zone span { margin-right: 5px; font-size: 18px; }.upload-zone.student { border-color: #a6dabe; background: #f4fcf7; color: #168252; }.file-list { display: flex; max-height: 100px; flex-direction: column; gap: 5px; margin-top: 8px; overflow: auto; }.file-row { display: flex; gap: 7px; align-items: center; padding: 7px; border-radius: 7px; background: #f3f6fb; }.file-row span { padding: 3px 5px; border-radius: 4px; background: #dbe7ff; color: #3267ed; font-size: 10px; }.file-row b { flex: 1; min-width: 0; overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.file-row button { flex: 0 0 auto; color: #c64c5d; cursor: pointer; font-size: 11px; }.error-message { margin-top: 10px; color: #cf4055; font-size: 12px; }.grade-button { width: 100%; height: 44px; margin-top: 18px; border-radius: 10px; background: #3267ed; color: white; cursor: pointer; font-size: 14px; font-weight: 700; }.grade-button:disabled { opacity: .5; cursor: not-allowed; }
.result-panel { min-height: 600px; }.score-card { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; padding: 15px; border-radius: 12px; background: #f0f6ff; }.score-card div { display: flex; flex-direction: column; gap: 4px; }.score-card small { color: #75839b; font-size: 12px; }.score-card b { font-size: 18px; }.score-card .score { color: #e2555f; font-size: 24px; }.score-card p { grid-column: span 2; color: #55647d; font-size: 13px; line-height: 1.6; }.graded-list { display: flex; height: 430px; flex-direction: column; gap: 18px; overflow-y: auto; padding-right: 4px; }.graded-item { overflow: hidden; border: 1px solid #e0e8f5; border-radius: 12px; }.graded-item header { display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; background: #f7f9fd; }.graded-item header strong { font-size: 13px; }.graded-item header button { padding: 6px 9px; border-radius: 7px; background: #e6efff; color: #3267ed; cursor: pointer; font-size: 12px; }.graded-image-viewer { height: 340px; overflow: auto; background: #f2f4f8; }.graded-image-viewer img { display: block; width: 100%; min-width: 720px; height: auto; background: #f2f4f8; }.empty-result { display: grid; min-height: 450px; place-items: center; border: 1px dashed #cbd8ed; border-radius: 13px; color: #8390a7; font-size: 13px; text-align: center; }
@media (max-width: 800px) { .grading-layout { grid-template-columns: 1fr; }.result-panel { min-height: 450px; } }
@media (max-width: 620px) { .grading-page { padding: 32px 16px 95px; }.graded-list { max-height: none; }.empty-result { min-height: 330px; } }
</style>
