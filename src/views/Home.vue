<template>
  <main class="service-page">
    <section class="chat-card" aria-label="智能客服聊天">
      <header class="chat-header">
        <div class="brand-mark">✦</div>
        <div>
          <h1>智能客服</h1>
          <p><span class="online-dot"></span>在线为您服务</p>
        </div>
        <div class="header-actions">
          <button class="order-control" type="button" @click="showUserModal = true">切换会话</button>
          <button class="order-control" type="button" @click="showOrderModal = true">订单状态模拟</button>
        </div>
      </header>

      <div ref="chatBody" class="chat-body">
        <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role">
          <div v-if="message.role === 'assistant'" class="avatar">客服</div>
          <div class="message-bubble" :class="{ pending: message.pending }">{{ message.content }}</div>
        </div>
      </div>

      <div class="quick-questions">
        <button type="button" @click="sendQuestion('帮我查询订单状态')">查询订单</button>
        <button type="button" @click="sendQuestion('我想申请退货')">申请退货</button>
        <button type="button" @click="sendQuestion('我的商品什么时候发货？')">物流咨询</button>
      </div>
      <form class="composer" @submit.prevent="sendQuestion()">
        <input v-model="question" :disabled="isSending || isLoadingHistory" maxlength="500" placeholder="请输入您的问题…" aria-label="请输入您的问题" />
        <button class="voice-button" type="button" :class="{ recording: isRecording }" :disabled="isSending || isLoadingHistory" @pointerdown.prevent="startRecording" @pointerup.prevent="stopRecording" @pointercancel="stopRecording" @pointerleave="stopRecording">{{ isRecording ? '松开结束' : '按住说话' }}</button>
        <button type="submit" :disabled="isSending || isLoadingHistory || !question.trim()">{{ isLoadingHistory ? '加载中' : isSending ? '发送中' : '发送' }}</button>
      </form>
      <p v-if="voiceTip" class="voice-tip">{{ voiceTip }}</p>
    </section>

    <div v-if="showUserModal" class="modal-mask" @click.self="showUserModal = false">
      <section class="modal user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
        <div class="modal-heading">
          <div><p class="eyebrow">本地会话</p><h2 id="user-modal-title">切换聊天记录</h2></div>
          <button class="close-button" type="button" aria-label="关闭" @click="showUserModal = false">×</button>
        </div>
        <p class="user-modal-tip">选择一个用户 ID，即可加载该用户在 Agent 中保存的聊天记录。</p>
        <div class="user-id-list">
          <button v-for="id in AVAILABLE_USER_IDS" :key="id" class="user-id-item" :class="{ active: id === userId }" type="button" @click="switchUser(id)">
            <span>{{ id }}</span><small>{{ id === userId ? '当前会话' : '点击切换' }}</small>
          </button>
        </div>
      </section>
    </div>

    <div v-if="showOrderModal" class="modal-mask" @click.self="showOrderModal = false">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-heading">
          <div><p class="eyebrow">Webhook 调试工具</p><h2 id="modal-title">模拟订单状态</h2></div>
          <button class="close-button" type="button" aria-label="关闭" @click="showOrderModal = false">×</button>
        </div>
        <label class="order-label" for="order-no">订单号</label>
        <input id="order-no" v-model="orderNo" class="order-input" placeholder="例如：ORD20260810001" @keyup.enter="updateOrderState" />
        <p class="state-title">选择要触发的状态</p>
        <div class="state-switches">
          <button v-for="item in stateOptions" :key="item.value" class="state-switch" :class="{ active: orderState === item.value }" type="button" @click="orderState = item.value">
            <strong>{{ item.label }}</strong><small>{{ item.description }}</small>
          </button>
        </div>
        <p v-if="updateNotice" class="update-notice">{{ updateNotice }}</p>
        <button class="confirm-button" type="button" :disabled="isUpdating" @click="updateOrderState">{{ isUpdating ? '正在更新…' : `触发${selectedState.label}回调` }}</button>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

// const SERVICE_URL = 'http://101.200.32.195:8000';
const SERVICE_URL = 'http://localhost:8000';
const AVAILABLE_USER_IDS = ['user_001', 'user_002', 'user_003','user_006', 'user_007',];

type Message = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  pending?: boolean;
};
type OrderState = 'unpaid' | 'paid' | 'shipped' | 'delivered';
type SseEvent = { type: 'start' | 'recognizing' | 'user_text' | 'content' | 'done' | 'error'; content?: string };
type HistoryItem = { role: 'human' | 'ai'; content: string };

function createWelcomeMessage(): Message {
  return { id: Date.now(), role: 'assistant', content: '您好，我是智能客服小助手。您可以咨询订单状态、物流信息，或申请退货。' };
}

const userId = ref(AVAILABLE_USER_IDS[0]);
const messages = ref<Message[]>([createWelcomeMessage()]);
const question = ref('');
const isSending = ref(false);
const isRecording = ref(false);
const voiceTip = ref('');
const isLoadingHistory = ref(false);
const chatBody = ref<HTMLElement>();
const showOrderModal = ref(false);
const showUserModal = ref(false);
const orderNo = ref('');
const orderState = ref<OrderState>('paid');
const isUpdating = ref(false);
const updateNotice = ref('');
let mediaRecorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;
let audioChunks: Blob[] = [];
let isVoicePressing = false;
let recordingStartedAt = 0;
let voiceTipTimer: number | undefined;

function showVoiceTip(message: string) {
  voiceTip.value = message;
  window.clearTimeout(voiceTipTimer);
  voiceTipTimer = window.setTimeout(() => {
    voiceTip.value = '';
  }, 3000);
}

const stateOptions: { value: OrderState; label: string; description: string }[] = [
  { value: 'unpaid', label: '未支付', description: '更新为待支付' },
  { value: 'paid', label: '支付成功', description: '更新为已支付' },
  { value: 'shipped', label: '商品发货', description: '更新为已发货' },
  { value: 'delivered', label: '确认签收', description: '更新为已签收' },
];
const selectedState = computed(() => stateOptions.find((item) => item.value === orderState.value)!);

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
  });
}

async function loadHistory(targetUserId: string) {
  isLoadingHistory.value = true;
  try {
    const response = await fetch(`${SERVICE_URL}/agent/history?user_id=${encodeURIComponent(targetUserId)}`);
    const result = await response.json();
    if (!response.ok || result.code !== 0) throw new Error(result.detail || '聊天记录加载失败');

    const history = (result.data?.history || []) as HistoryItem[];
    messages.value = history.length
      ? history.map((item, index) => ({
          id: Date.now() + index,
          role: item.role === 'human' ? 'user' : 'assistant',
          content: item.content,
        }))
      : [createWelcomeMessage()];
  } catch (error) {
    messages.value = [{
      id: Date.now(),
      role: 'assistant',
      content: error instanceof Error ? `抱歉，${error.message}` : '抱歉，聊天记录加载失败。',
    }];
  } finally {
    isLoadingHistory.value = false;
    scrollToBottom();
  }
}

async function switchUser(targetUserId: string) {
  if (targetUserId === userId.value) {
    showUserModal.value = false;
    return;
  }
  userId.value = targetUserId;
  showUserModal.value = false;
  await loadHistory(targetUserId);
}

onMounted(() => loadHistory(userId.value));

async function sendQuestion(content = question.value) {
  const text = content.trim();
  if (!text || isSending.value) return;

  messages.value.push({ id: Date.now(), role: 'user', content: text });
  question.value = '';
  isSending.value = true;
  const pendingId = Date.now() + 1;
  messages.value.push({ id: pendingId, role: 'assistant', content: '正在查询，请稍候…', pending: true });
  scrollToBottom();

  try {
    const formData = new FormData();
    formData.append('input_type', 'text');
    formData.append('user_id', userId.value);
    formData.append('text', text);

    const response = await fetch(`${SERVICE_URL}/agent/chat/stream`, {
      method: 'POST',
      headers: { Accept: 'text/event-stream' },
      body: formData,
    });

    if (!response.ok || !response.body) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.detail || '客服服务暂时不可用');
    }
    
    // 他这个写的很简单，messages里，第一条push的就是用户发的消息对象，第二条push的是客服发的消息对象，加载中，状态 pending: true
    // 当接收到服务端发来的消息时，就把 messages里第二条消息对象message的pending变为false，content拼接接收到的流数据
    const message = messages.value.find((item) => item.id === pendingId);
    if (!message) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamError = '';

    const handleEvent = (rawEvent: string) => {
      // data: {...}\n\n 末尾的 \n   整个\n\n已经切了     这个 split(/\r?\n/) 切的是 内容换行，但实际每个内容只有一个字，那这个split就是多余的
      const dataLine = rawEvent.split(/\r?\n/).find((line) => line.startsWith('data:'));
      if (!dataLine) return;

      const event = JSON.parse(dataLine.slice(5).trim()) as SseEvent;
      if (event.type === 'start') {
        message.content = '';
        message.pending = false;
      }
      if (event.type === 'content') {
        message.content += event.content || '';
        scrollToBottom();
      }
      if (event.type === 'error') streamError = event.content || '客服服务暂时不可用';
    };

    while (true) {
      // data: {"type":"content","content":"你"}\n\ndata: {"type":"content","content":"好"}\n\n
      // 这称作为一个数据块(chunk)

      // 示例：
      // buffer = 'data: {"type":"content","content":"好"}\n\ndata: {"type":"content","conten'
      // events = buffer.split(/\r?\n\r?\n/) 
      // // → ['data: {"type":"content","content":"好"}', 'data: {"type":"content","conten']
      // events.pop() // → 'data: {"type":"content","conten'（不完整，留着下次拼）
      const { value, done } = await reader.read();  // reader.read() 读取一块流数据（二进制）  value：当前这块数据   done：true 表示数据已读完，false 表示还有后续
      buffer += decoder.decode(value, { stream: !done }); // decoder.decode() 把二进制 value 转成字符串   { stream: !done }：如果 done 是 false（还没读完），保留未解码完的字节（比如多字节 UTF-8 字符被切了一半）等待下次拼接；如果 done 是 true（读完），彻底解码
      const events = buffer.split(/\r?\n\r?\n/); // ? 表示 \r 可有可无
      buffer = events.pop() || '';  // pop() 是取出最后一个元素（可能是不完整，留着下次拼）
      events.forEach(handleEvent); // 遍历数组，每个元素作为 rawEvent 传给 handleEvent
      if (done) break;
    }
    if (buffer.trim()) handleEvent(buffer);  // 可能还剩最后一个不完整的，那就在这里处理
    if (streamError) throw new Error(streamError);
    if (!message.content) message.content = '暂时没有查询到结果，请稍后再试。';
    message.pending = false;
  } catch (error) {
    const message = messages.value.find((item) => item.id === pendingId);
    if (message) {
      message.content = error instanceof Error ? `抱歉，${error.message}` : '抱歉，服务连接失败，请稍后重试。';
      message.pending = false;
    }
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
}

async function startRecording() {
  isVoicePressing = true;
  if (isSending.value || isRecording.value || !navigator.mediaDevices?.getUserMedia) return;

  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 根本没开始录音，解决 首次授权麦克风时用户已松开按钮 会报错的情况
    if (!isVoicePressing) {
      recordingStream.getTracks().forEach((track) => track.stop());
      recordingStream = null;
      showVoiceTip('未识别到有效语音，请再试。');
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
    mediaRecorder = mimeType ? new MediaRecorder(recordingStream, { mimeType }) : new MediaRecorder(recordingStream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioType = mediaRecorder?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: audioType });
      recordingStream?.getTracks().forEach((track) => track.stop());
      recordingStream = null;
      mediaRecorder = null;
      isRecording.value = false;

      if (audioBlob.size < 1024 || Date.now() - recordingStartedAt < 1000) {
        showVoiceTip('录音时间太短，请再试。');
        return;
      }

      await sendVoice(audioBlob);
    };

    mediaRecorder.start();
    recordingStartedAt = Date.now();
    isRecording.value = true;
  } catch {
    showVoiceTip('无法使用麦克风，请确认已允许浏览器访问麦克风。');
  }
}

function stopRecording() {
  isVoicePressing = false;
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
}

async function sendVoice(audioBlob: Blob) {
  isSending.value = true;
  const voiceMessageId = Date.now();
  const pendingId = voiceMessageId + 1;
  messages.value.push({ id: voiceMessageId, role: 'user', content: '🎙️ 正在识别语音…', pending: true });
  messages.value.push({ id: pendingId, role: 'assistant', content: '正在查询，请稍候…', pending: true });
  scrollToBottom();

  try {
    const formData = new FormData();
    formData.append('input_type', 'voice');
    formData.append('user_id', userId.value);
    formData.append('audio', audioBlob, 'voice.webm');

    const response = await fetch(`${SERVICE_URL}/agent/chat/stream`, {
      method: 'POST',
      headers: { Accept: 'text/event-stream' },
      body: formData,
    });
    if (!response.ok || !response.body) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.detail || '客服服务暂时不可用');
    }

    const voiceMessage = messages.value.find((item) => item.id === voiceMessageId);
    const answerMessage = messages.value.find((item) => item.id === pendingId);
    if (!voiceMessage || !answerMessage) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamError = '';
    let isInvalidVoice = false;

    const handleEvent = (rawEvent: string) => {
      const dataLine = rawEvent.split(/\r?\n/).find((line) => line.startsWith('data:'));
      if (!dataLine) return;

      const event = JSON.parse(dataLine.slice(5).trim()) as SseEvent;
      if (event.type === 'recognizing') voiceMessage.content = '🎙️ 正在识别语音…';
      if (event.type === 'user_text') {
        voiceMessage.content = event.content || '语音识别失败';
        voiceMessage.pending = false;
        scrollToBottom();
      }
      if (event.type === 'start') {
        answerMessage.content = '';
        answerMessage.pending = false;
      }
      if (event.type === 'content') {
        answerMessage.content += event.content || '';
        scrollToBottom();
      }
      if (event.type === 'error') {
        if (event.content === '输入类型或内容不正确') {
          isInvalidVoice = true;
          showVoiceTip('语音识别失败，请重试。');
        } else {
          streamError = event.content || '客服服务暂时不可用';
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      events.forEach(handleEvent);
      if (done) break;
    }
    if (buffer.trim()) handleEvent(buffer);
    if (isInvalidVoice) {
      messages.value = messages.value.filter((item) => item.id !== voiceMessageId && item.id !== pendingId);
      return;
    }
    if (streamError) throw new Error(streamError);
    if (voiceMessage.pending) voiceMessage.content = '语音识别失败，请重试。';
    if (!answerMessage.content) answerMessage.content = '暂时没有查询到结果，请稍后再试。';
    voiceMessage.pending = false;
    answerMessage.pending = false;
  } catch (error) {
    const voiceMessage = messages.value.find((item) => item.id === voiceMessageId);
    const answerMessage = messages.value.find((item) => item.id === pendingId);
    if (voiceMessage?.pending) {
      voiceMessage.content = '语音识别失败，请重试。';
      voiceMessage.pending = false;
    }
    if (answerMessage) {
      answerMessage.content = error instanceof Error ? `抱歉，${error.message}` : '抱歉，服务连接失败，请稍后重试。';
      answerMessage.pending = false;
    }
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
}

async function updateOrderState() {
  const currentOrderNo = orderNo.value.trim();
  if (!currentOrderNo || isUpdating.value) {
    updateNotice.value = '请先输入订单号。';
    return;
  }

  isUpdating.value = true;
  updateNotice.value = '';
  const payloads: Record<OrderState, Record<string, string | number>> = {
    unpaid: { order_no: currentOrderNo },
    paid: { order_no: currentOrderNo, transaction_id: `WEB-${Date.now()}`, paid_amount: 0.01 },
    shipped: { order_no: currentOrderNo, logistics_company: '客服模拟物流', tracking_no: `WEB-${Date.now()}` },
    delivered: { order_no: currentOrderNo, logistics_company: '客服模拟物流', tracking_no: `WEB-${Date.now()}` },
  };

  try {
    const response = await fetch(`${SERVICE_URL}/webhook/${orderState.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloads[orderState.value]),
    });
    const result = await response.json();
    if (!response.ok || result.code !== 0) throw new Error(result.detail || '状态更新失败');
    updateNotice.value = `${currentOrderNo} 已${selectedState.value.description.replace('更新为', '')}。`;
  } catch (error) {
    updateNotice.value = error instanceof Error ? error.message : '状态更新失败，请重试。';
  } finally {
    isUpdating.value = false;
  }
}
</script>

<style scoped lang="less">
.service-page { min-height: 100%; display: grid; place-items: center; padding: 32px 18px; background: radial-gradient(circle at 8% 5%, #dff7f0, transparent 31%), linear-gradient(135deg, #f8fbff, #edf3ff); color: #17213a; }
.chat-card { width: min(100%, 820px); height: min(780px, calc(100vh - 64px)); min-height: 590px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,.8); border-radius: 24px; background: rgba(255,255,255,.9); box-shadow: 0 20px 60px rgba(42,72,129,.16); }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px; color: white; background: linear-gradient(120deg, #2769f0, #4a38cc); }
.brand-mark { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 14px; background: rgba(255,255,255,.18); font-size: 22px; }
h1 { font-size: 19px; font-weight: 700; } .chat-header p { margin-top: 3px; color: #dfe7ff; font-size: 13px; } .online-dot { display: inline-block; width: 7px; height: 7px; margin-right: 5px; border-radius: 50%; background: #6df0b2; }
.header-actions { display: flex; gap: 8px; margin-left: auto; }.order-control { padding: 9px 13px; border: 1px solid rgba(255,255,255,.5); border-radius: 9px; background: transparent; color: white; cursor: pointer; font-size: 13px; }
.chat-body { flex: 1; overflow-y: auto; padding: 25px 24px; background: #f8faff; }
.message-row { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 18px; } .message-row.user { justify-content: flex-end; } .avatar { display: grid; flex: 0 0 auto; width: 34px; height: 34px; place-items: center; border-radius: 11px; background: #dde8ff; color: #325dc2; font-size: 11px; font-weight: 700; }
.message-bubble { max-width: min(78%, 550px); padding: 12px 15px; border-radius: 5px 16px 16px 16px; background: white; box-shadow: 0 3px 12px rgba(34,58,102,.07); white-space: pre-wrap; line-height: 1.6; font-size: 14px; }.user .message-bubble { border-radius: 16px 5px 16px 16px; background: #336af2; color: white; }.pending { color: #74809a; }
.quick-questions { display: flex; gap: 9px; overflow-x: auto; padding: 13px 24px 3px; background: white; }.quick-questions button { flex: 0 0 auto; padding: 7px 11px; border: 1px solid #d7e1f5; border-radius: 99px; background: #f8faff; color: #3b5689; cursor: pointer; font-size: 12px; }
.composer { display: flex; gap: 12px; padding: 14px 24px 22px; background: white; }.composer input { flex: 1; min-width: 0; padding: 13px 15px; border: 1px solid #d9e2f2; border-radius: 11px; font-size: 14px; }.composer button, .confirm-button { padding: 0 21px; border-radius: 11px; background: #3267ed; color: white; cursor: pointer; font-size: 14px; }.composer button:disabled, .confirm-button:disabled { opacity: .55; cursor: not-allowed; }
.voice-button { flex: 0 0 auto; border: 1px solid #cbd8f3 !important; background: #eef3ff !important; color: #3267ed !important; white-space: nowrap; }.voice-button.recording { border-color: #efb4be !important; background: #fff0f2 !important; color: #d5495d !important; animation: voice-pulse 1s ease-in-out infinite; }@keyframes voice-pulse { 50% { opacity: .65; } }
.voice-tip { margin: -10px 24px 12px; color: #d5495d; font-size: 12px; }
.modal-mask { position: fixed; z-index: 10; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(17,29,54,.45); }.modal { width: min(100%, 460px); padding: 26px; border-radius: 20px; background: white; box-shadow: 0 24px 70px rgba(13,25,53,.3); }.modal-heading { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }.eyebrow { margin-bottom: 5px; color: #71809d; font-size: 12px; }.modal h2 { font-size: 20px; font-weight: 700; }.close-button { width: 30px; height: 30px; border-radius: 50%; background: #f1f4fa; color: #53617b; cursor: pointer; font-size: 22px; }.order-label, .state-title { display: block; margin-bottom: 8px; color: #37445e; font-size: 13px; font-weight: 700; }.order-input { width: 100%; padding: 12px; border: 1px solid #d7e1f0; border-radius: 10px; font-size: 14px; }.state-title { margin-top: 22px; }.state-switches { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }.state-switch { min-height: 72px; padding: 8px 4px; border: 1px solid #dbe4f4; border-radius: 10px; background: #fff; color: #54627c; cursor: pointer; }.state-switch strong, .state-switch small { display: block; }.state-switch strong { margin-bottom: 5px; font-size: 13px; }.state-switch small { font-size: 11px; }.state-switch.active { border-color: #3267ed; background: #edf3ff; color: #285aca; }.update-notice { min-height: 20px; margin-top: 13px; color: #38845f; font-size: 13px; }.confirm-button { width: 100%; height: 44px; margin-top: 12px; }
.user-modal { max-height: min(620px, calc(100vh - 40px)); display: flex; flex-direction: column; }.user-modal-tip, .empty-user-ids { margin-bottom: 14px; color: #66738d; font-size: 13px; line-height: 1.6; }.user-id-list { display: flex; max-height: 290px; flex-direction: column; gap: 8px; overflow-y: auto; }.user-id-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 12px; border: 1px solid #dbe4f4; border-radius: 10px; background: #fff; color: #3f4f6e; cursor: pointer; text-align: left; }.user-id-item span { overflow: hidden; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.user-id-item small { flex: 0 0 auto; color: #7b879e; font-size: 11px; }.user-id-item.active { border-color: #3267ed; background: #edf3ff; color: #285aca; }.user-id-item.active small { color: #285aca; }.clear-button { display: flex; align-items: center; justify-content: center; width: 100%; height: 42px; margin-top: 18px; overflow: hidden; border: 1px solid #f1bdc5; border-radius: 10px; background: #fff8f8; color: #bc4759; cursor: pointer; font-size: 14px; line-height: 1; white-space: nowrap; }.clear-button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 560px) { .service-page { padding: 0; }.chat-card { width: 100%; height: 100vh; min-height: 0; border-radius: 0; }.chat-header, .chat-body, .composer, .quick-questions { padding-left: 16px; padding-right: 16px; }.order-control { padding: 8px; font-size: 12px; }.header-actions { gap: 5px; }.state-switches { gap: 6px; } }
</style>
