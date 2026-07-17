<template>
  <div class="chat-page">
    <header class="chat-header">
      <div class="chat-brand">
        <div class="chat-mark">SC</div>
        <span class="chat-title">客服咨询</span>
      </div>
      <div class="chat-actions">
        <el-select
          v-model="clientType"
          size="small"
          class="service-select"
          :disabled="loading"
        >
          <el-option label="小千" value="qianwen" />
          <el-option label="小D" value="deepseek" />
        </el-select>
        <span class="back-link" @click="goBack">
          <i class="el-icon-back" />{{ backLabel }}
        </span>
      </div>
    </header>

    <main ref="scroller" class="chat-body">
      <div v-if="messages.length === 0" class="empty">
        <i class="el-icon-chat-dot-round" />
        <p>你好，有什么可以帮你的吗？在下方输入你的问题。</p>
      </div>
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="bubble-row"
        :class="msg.role"
      >
        <div class="bubble">
          <img
            v-if="msg.image"
            :src="msg.image"
            class="gen-image"
            alt="生成的图片"
          />
          <span v-else-if="msg.content">{{ msg.content }}</span>
          <span v-else class="typing">思考中…</span>
        </div>
      </div>
    </main>

    <footer class="chat-input">
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden-file"
        @change="handleImageChange"
      />
      <el-button
        class="upload-btn"
        icon="el-icon-picture-outline"
        :loading="parsing"
        :disabled="loading"
        title="上传图片，自动识别文字"
        @click="triggerUpload"
      />
      <el-input
        v-model="input"
        type="textarea"
        :rows="2"
        resize="none"
        placeholder="请输入你的问题，回车发送"
        :disabled="loading"
        @keydown.enter.native.prevent="handleSend"
      />
      <el-button
        type="primary"
        class="send-btn"
        :loading="loading"
        :disabled="!input.trim()"
        @click="handleSend"
      >发送</el-button>
    </footer>
  </div>
</template>

<script>
import { parseImageText, generateImage } from '../../api/user';

export default {
  name: 'CustomerChat',
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      source: null,
      clientType: 'qianwen',
      parsing: false
    };
  },
  computed: {
    fromProduct() {
      return this.$route.query.from === 'product';
    },
    backLabel() {
      return this.fromProduct ? '返回商品' : '返回登录';
    }
  },
  beforeDestroy() {
    this.closeSource();
  },
  methods: {
    goBack() {
      if (this.fromProduct) {
        const id = this.$route.query.id;
        this.$router.push(id ? `/product/${id}` : '/products');
      } else {
        this.$router.push('/login');
      }
    },
    triggerUpload() {
      this.$refs.imageInput.click();
    },
    async handleImageChange(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.$message.warning('请选择图片文件');
        return;
      }
      if (this.loading) return;
      this.parsing = true;
      try {
        const res = await parseImageText(file, this.clientType);
        const text = (res && (res.daoResult || res.data)) || '';
        if (text) {
          this.sendText(text.trim());
        } else {
          this.$message.info('未识别到文字');
        }
      } catch (e) {
        // 错误已由请求拦截器统一提示
      } finally {
        this.parsing = false;
      }
    },
    handleSend() {
      const text = this.input.trim();
      if (!text || this.loading) return;
      this.input = '';
      this.sendText(text);
    },
    isImagePrompt(text) {
      const t = text.trim();
      // "生成/画/绘制…图片/图像/照片" 视为文生图意图，例如"生成一张小猫的图片"
      if (/生成[\s\S]{0,10}(图片|图像|照片|图)/.test(t)) return true;
      if (/^(画|绘制|帮我画|给我画|画一)/.test(t)) return true;
      return false;
    },
    sendText(text) {
      if (!text || this.loading) return;
      this.messages.push({ role: 'user', content: text });
      const reply = { role: 'assistant', content: '' };
      this.messages.push(reply);
      this.loading = true;
      this.scrollToBottom();

      if (this.isImagePrompt(text)) {
        this.generatePicture(text, reply);
        return;
      }

      const url = `/user/chat?message=${encodeURIComponent(text)}&clientType=${encodeURIComponent(this.clientType)}`;
      const source = new EventSource(url);
      this.source = source;

      source.onmessage = event => {
        if (event.data === '[DONE]') {
          this.finish();
          return;
        }
        reply.content += event.data;
        this.scrollToBottom();
      };
      source.onerror = () => {
        if (!reply.content) {
          reply.content = '抱歉，服务暂时不可用，请稍后再试。';
        }
        this.finish();
      };
    },
    async generatePicture(text, reply) {
      reply.content = '正在生成图片…';
      this.scrollToBottom();
      try {
        const res = await generateImage(text, this.clientType);
        const imageUrl = (res && (res.daoResult || res.data)) || '';
        if (imageUrl) {
          reply.content = '';
          reply.image = imageUrl;
        } else {
          reply.content = '抱歉，图片生成失败，请稍后再试。';
        }
      } catch (e) {
        reply.content = '抱歉，图片生成失败，请稍后再试。';
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },
    finish() {
      this.closeSource();
      this.loading = false;
      this.scrollToBottom();
    },
    closeSource() {
      if (this.source) {
        this.source.close();
        this.source = null;
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scroller;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fb;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
}
.chat-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 1px;
}
.chat-title {
  font-size: 17px;
  font-weight: 600;
}
.chat-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.service-select {
  width: 120px;
}
.service-select >>> .el-input__inner {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 18px;
  color: #fff;
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s;
}
.service-select >>> .el-input__inner:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.6);
}
.service-select >>> .el-input.is-focus .el-input__inner {
  border-color: #fff;
}
.service-select >>> .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
.service-select >>> .el-input .el-select__caret {
  color: rgba(255, 255, 255, 0.85);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}
.back-link:hover {
  color: #fff;
  text-decoration: underline;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.empty {
  text-align: center;
  color: #9aa5b5;
  margin-top: 80px;
}
.empty i {
  font-size: 48px;
  margin-bottom: 12px;
}
.bubble-row {
  display: flex;
  margin-bottom: 16px;
}
.bubble-row.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.bubble-row.user .bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 2px;
}
.bubble-row.assistant .bubble {
  background: #fff;
  color: #2f3846;
  border: 1px solid #eaeef5;
  border-bottom-left-radius: 2px;
}
.typing {
  color: #9aa5b5;
}
.gen-image {
  display: block;
  width: 256px;
  height: 256px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f2f7;
}
.chat-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #eaeef5;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.chat-input >>> .el-textarea__inner {
  border-radius: 10px;
}
.hidden-file {
  display: none;
}
.upload-btn {
  height: 44px;
  width: 44px;
  padding: 0;
  border-radius: 10px;
  font-size: 18px;
  color: #667eea;
  border: 1px solid #dfe4f0;
}
.upload-btn:hover {
  color: #764ba2;
  border-color: #764ba2;
  background: #f5f3fb;
}
.send-btn {
  height: 44px;
  border: none;
  border-radius: 10px;
  padding: 0 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
