<template>
  <main class="report-page">
    <header class="page-header">
      <p class="eyebrow">智能财报分析</p>
      <h1>上传 PDF，生成财务报告</h1>
      <p>选择半年度或年度报告，系统会提取关键指标并生成分析结论。</p>
    </header>

    <section class="report-grid">
      <article class="panel upload-panel">
        <div class="panel-title"><span>1</span><div><h2>上传 PDF</h2><p>仅支持 PDF 格式</p></div></div>
        <input ref="fileInput" class="file-input" type="file" accept="application/pdf,.pdf" @change="handleFileChange" />
        <div class="upload-dropzone" @dragover.prevent @drop="handleDrop" @click="chooseFile">
          <div class="upload-icon">↑</div>
          <strong>点击选择或拖入 PDF 文件</strong>
          <small>上传后可生成并预览分析报告</small>
        </div>
        <div v-if="selectedFile" class="file-info"><span>PDF</span><div><strong>{{ selectedFile.name }}</strong><small>{{ fileSize }}</small></div></div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="primary-button" type="button" :disabled="!selectedFile || isAnalyzing" @click="analyzePdf">{{ isAnalyzing ? '正在解析并生成报告…' : '开始分析' }}</button>
      </article>

      <article class="panel preview-panel">
        <div class="panel-title"><span>2</span><div><h2>预览报告</h2><p>查看接口生成的财务分析</p></div></div>
        <section v-if="result" class="result-preview">
          <h3>分析报告</h3>
          <pre>{{ result.report }}</pre>
        </section>
        <div v-else class="empty-preview">完成分析后，生成的报告将在此处预览</div>
      </article>

      <article class="panel download-panel">
        <div class="panel-title"><span>3</span><div><h2>下载报告</h2><p>生成后可下载 Markdown 文件</p></div></div>
        <div class="download-status" :class="{ ready: !!result }"><b>{{ result ? '报告已生成' : '等待分析完成' }}</b><span>{{ result ? '包含分析结论和提取的关键数据' : '完成上传与分析后可下载' }}</span></div>
        <button class="download-button" type="button" :disabled="!result" @click="downloadReport">下载分析报告 .md</button>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const REPORT_API_URL = 'http://101.200.32.195:8000/report/analyze';

type ReportResult = {
  raw_text: string;
  extracted_data: string;
  report: string;
};

const selectedFile = ref<File>();
const result = ref<ReportResult>();
const errorMessage = ref('');
const isAnalyzing = ref(false);
const fileInput = ref<HTMLInputElement>();

const fileSize = computed(() => {
  if (!selectedFile.value) return '';
  return `${(selectedFile.value.size / 1024 / 1024).toFixed(2)} MB`;
});

function chooseFile() {
  fileInput.value?.click();
}

function setFile(file?: File) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    errorMessage.value = '请选择 PDF 文件。';
    return;
  }
  selectedFile.value = file;
  result.value = undefined;
  errorMessage.value = '';
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  setFile(input.files?.[0]);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  setFile(event.dataTransfer?.files[0]);
}

async function analyzePdf() {
  if (!selectedFile.value || isAnalyzing.value) return;
  isAnalyzing.value = true;
  errorMessage.value = '';
  result.value = undefined;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    const response = await fetch(REPORT_API_URL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok || payload.code !== 0) throw new Error(payload.msg || payload.detail || '报告生成失败');
    result.value = payload.data as ReportResult;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '报告生成失败，请稍后重试。';
  } finally {
    isAnalyzing.value = false;
  }
}

function downloadReport() {
  if (!result.value?.report) return;
  const content = `${result.value.report}\n\n---\n\n提取数据：\n${result.value.extracted_data}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${selectedFile.value?.name.replace(/\.pdf$/i, '') || '财务'}-分析报告.md`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}
</script>


<!-- 
      他这个三端自适应咋做的，解了：
      1、媒体查询，通过这个 grid-template-columns: 1fr 1fr 设置一行几列
      2、父级设置最小宽度 width: min(1180px, 100%)，高度固定，子级100%继承宽高
      3、文字单位用px，设置自动换行
-->
<style scoped>
.report-page { min-height: 100%; padding: 54px 24px 105px; background: linear-gradient(135deg, #f7faff 0%, #eef4ff 48%, #f9fbff 100%); color: #17213a; }
.page-header, .report-grid { width: min(1180px, 100%); margin: 0 auto; }.page-header { margin-bottom: 28px; }.eyebrow { margin-bottom: 9px; color: #3267ed; font-size: 13px; font-weight: 700; letter-spacing: .08em; }.page-header h1 { margin-bottom: 10px; font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -.03em; }.page-header > p:last-child { color: #65738e; font-size: 15px; }
.report-grid { display: grid; grid-template-columns: minmax(250px, .8fr) minmax(370px, 1.45fr) minmax(245px, .75fr); gap: 18px; align-items: start; }.panel { padding: 22px; border: 1px solid #dbe5f5; border-radius: 18px; background: rgba(255,255,255,.92); box-shadow: 0 12px 35px rgba(29, 61, 121, .08); }.panel-title { display: flex; gap: 10px; align-items: center; margin-bottom: 18px; }.panel-title > span { display: grid; width: 26px; height: 26px; flex: 0 0 26px; place-items: center; border-radius: 50%; background: #eaf1ff; color: #2e62df; font-size: 13px; font-weight: 800; }.panel h2 { font-size: 17px; font-weight: 800; }.panel-title p { margin-top: 3px; color: #78859d; font-size: 12px; }.file-input { display: none; }
.upload-dropzone { display: flex; min-height: 185px; flex-direction: column; align-items: center; justify-content: center; gap: 9px; border: 1.5px dashed #a9c2f5; border-radius: 14px; background: #f8fbff; cursor: pointer; text-align: center; }.upload-dropzone:hover { border-color: #3267ed; background: #f1f6ff; }.upload-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #dce8ff; color: #3267ed; font-size: 26px; font-weight: 300; }.upload-dropzone strong { font-size: 14px; }.upload-dropzone small { color: #8190a8; font-size: 12px; }.file-info { display: flex; gap: 10px; align-items: center; margin-top: 15px; padding: 10px; border-radius: 10px; background: #f4f7fd; }.file-info > span { padding: 5px; border-radius: 5px; background: #e95b66; color: white; font-size: 10px; font-weight: 800; }.file-info div { min-width: 0; }.file-info strong, .file-info small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.file-info strong { font-size: 12px; }.file-info small { margin-top: 3px; color: #7b889e; font-size: 11px; }.error-message { margin-top: 12px; color: #cf4055; font-size: 12px; }.primary-button, .download-button { width: 100%; height: 44px; margin-top: 18px; border-radius: 10px; background: #3267ed; color: white; cursor: pointer; font-size: 14px; font-weight: 700; }.primary-button:disabled, .download-button:disabled { opacity: .5; cursor: not-allowed; }
.preview-panel { min-height: 500px; }.empty-preview { display: grid; height: 340px; place-items: center; border: 1px dashed #ccd8ec; border-radius: 12px; color: #8390a7; font-size: 13px; }.result-preview { margin-top: 18px; }.result-preview h3 { margin-bottom: 10px; font-size: 15px; font-weight: 800; }.result-preview pre { max-height: 410px; overflow: auto; padding: 14px; border-radius: 11px; background: #17213a; color: #e5ecff; font: 12px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
.download-status { display: flex; min-height: 168px; flex-direction: column; justify-content: center; padding: 20px; border-radius: 14px; background: #f5f7fb; color: #718099; text-align: center; }.download-status b { margin-bottom: 8px; color: #4f5c73; font-size: 15px; }.download-status span { font-size: 12px; line-height: 1.6; }.download-status.ready { background: #ecfaf4; }.download-status.ready b { color: #238653; }.download-button { background: #1e9d61; }.download-button:disabled { background: #8794aa; }
@media (max-width: 940px) { .report-grid { grid-template-columns: 1fr 1fr; }.preview-panel { grid-column: span 2; }.download-panel { grid-column: span 2; }.download-status { min-height: auto; } }
@media (max-width: 620px) { .report-page { padding: 32px 16px 95px; }.report-grid { grid-template-columns: 1fr; }.preview-panel, .download-panel { grid-column: auto; }.empty-preview { height: 280px; } }
</style>
