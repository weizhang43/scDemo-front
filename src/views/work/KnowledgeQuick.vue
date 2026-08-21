<template>
  <div class="knowledge-pane">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="mode" size="small" @change="handleModeChange">
          <el-radio-button label="recite"><i class="el-icon-reading" /> 背题模式</el-radio-button>
          <el-radio-button label="quiz"><i class="el-icon-edit-outline" /> 做题模式</el-radio-button>
        </el-radio-group>
        <el-select
          v-model="filterTag"
          size="small"
          class="tag-filter"
          placeholder="全部标签"
          clearable
          @change="handleTagFilterChange"
        >
          <el-option v-for="t in TAGS" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-autocomplete
          v-model="searchKeyword"
          size="small"
          class="search-input"
          prefix-icon="el-icon-search"
          placeholder="输入关键字搜索题干"
          :fetch-suggestions="querySearch"
          value-key="label"
          :trigger-on-focus="false"
          clearable
          @select="handleSearchSelect"
        />
      </div>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">添加知识点</el-button>
    </div>

    <div v-if="current" class="knowledge-card" :class="{ 'is-favorite': isFavorite }" v-loading="loading">
      <div class="question">
        <div class="section-label">
          <i class="el-icon-question" /> 题干
          <el-tag v-if="current.tag" size="small" :type="tagType(current.tag)" class="question-tag">{{ tagName(current.tag) }}</el-tag>
        </div>
        <div class="rich-text question-text" v-html="current.question" />
      </div>

      <el-divider class="qa-divider" />

      <div class="answer">
        <div class="section-label"><i class="el-icon-document" /> 答案</div>
        <transition name="el-fade-in">
          <div v-if="answerVisible" class="rich-text" v-html="boldAnswer(current.answer)" />
        </transition>
        <div v-if="!answerVisible" class="answer-hidden">
          <el-button type="primary" plain size="small" icon="el-icon-view" @click="handleShowAnswer">查看答案</el-button>
        </div>
      </div>

      <div class="meta">
        <el-tag v-if="isFavorite" type="danger" size="small" effect="dark">已收藏</el-tag>
        <span class="meta-item"><i class="el-icon-view" /> 已查看 {{ current.viewCount || 0 }} 次</span>
        <span v-if="current.lastViewTime" class="meta-item"><i class="el-icon-time" /> 最后查看 {{ current.lastViewTime }}</span>
        <span class="meta-item"><i class="el-icon-plus" /> 添加于 {{ current.addTime }}</span>
      </div>

      <div class="actions">
        <div class="actions-left">
          <el-button
            :type="isFavorite ? 'danger' : 'default'"
            size="small"
            :icon="isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"
            @click="handleFavorite"
          >{{ isFavorite ? '取消收藏' : '收藏' }}</el-button>
          <el-button type="warning" size="small" icon="el-icon-edit" @click="noteInputVisible = !noteInputVisible">添加笔记</el-button>
          <el-button type="danger" plain size="small" icon="el-icon-remove-outline" @click="handleIgnore">忽略此题</el-button>
        </div>
        <div class="actions-right">
          <el-button size="small" icon="el-icon-arrow-left" @click="handlePrev">上一题</el-button>
          <el-button type="primary" size="small" @click="handleNext">下一题<i class="el-icon-arrow-right el-icon--right" /></el-button>
        </div>
      </div>

      <div v-if="noteInputVisible" class="note-input">
        <el-input
          v-model="noteContent"
          type="textarea"
          :rows="3"
          placeholder="请输入笔记内容"
          maxlength="1000"
          show-word-limit
        />
        <el-button type="primary" size="small" :loading="noteSaving" @click="handleSaveNote">保存笔记</el-button>
      </div>

      <div v-if="notes.length" class="note-list">
        <div class="note-list-header">
          <i class="el-icon-edit-outline" /> 我的笔记
          <span class="note-count">{{ notes.length }}</span>
        </div>
        <el-timeline class="note-timeline">
          <el-timeline-item
            v-for="note in notes"
            :key="note.id"
            :timestamp="note.createTime"
            placement="top"
            color="var(--color-primary, #409eff)"
          >
            <div class="note-item">{{ note.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <div v-else class="empty-tip">
      <p>暂无知识点，点击右上角"添加知识点"开始刷题</p>
    </div>

    <el-dialog title="添加知识点" :visible.sync="addVisible" width="720px" top="6vh" :close-on-click-modal="false">
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="70px">
        <el-form-item label="标签" prop="tag">
          <el-select v-model="addForm.tag" placeholder="请选择标签" style="width: 100%;">
            <el-option v-for="t in TAGS" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="题干" prop="question">
          <el-input v-model="addForm.question" type="textarea" :rows="3" placeholder="请输入题干" maxlength="2000" show-word-limit />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="addForm.answer" type="textarea" :rows="6" placeholder="请输入答案，支持换行" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSaving" @click="handleAdd">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addKnowledge, getNextKnowledge, getPrevKnowledge, getKnowledgeById, viewKnowledge, favoriteKnowledge, ignoreKnowledge, addKnowledgeNote, getKnowledgeNotes, searchKnowledge } from '../../api/knowledge';

function plainText(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || '').trim();
}

function toHtml(text) {
  if (!text) return '';
  return `<p>${String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '</p><p>')}</p>`;
}

export default {
  name: 'KnowledgeQuick',
  data() {
    return {
      TAGS: [
        { value: 1, label: 'Java基础与核心特性', type: '' },
        { value: 2, label: '集合框架与数据结构', type: 'success' },
        { value: 3, label: '并发编程与多线程', type: 'warning' },
        { value: 4, label: 'JVM与性能调优', type: 'danger' },
        { value: 5, label: 'Spring全家桶', type: 'info' },
        { value: 6, label: '数据库与缓存', type: 'success' },
        { value: 7, label: '消息队列与分布式', type: 'warning' }
      ],
      loading: false,
      current: null,
      mode: localStorage.getItem('knowledge-mode') || 'quiz',
      filterTag: null,
      searchKeyword: '',
      answerVisible: false,
      notes: [],
      noteInputVisible: false,
      noteContent: '',
      noteSaving: false,
      addVisible: false,
      addSaving: false,
      addForm: { question: '', answer: '', tag: null },
      addRules: {
        tag: [{ required: true, message: '请选择标签', trigger: 'change' }],
        question: [{ required: true, message: '请输入题干', trigger: 'blur' }],
        answer: [{ required: true, message: '请输入答案', trigger: 'blur' }]
      }
    };
  },
  computed: {
    isFavorite() {
      return !!this.current && this.current.status === 2;
    }
  },
  created() {
    this.restore();
  },
  methods: {
    // 恢复上次浏览位置；记录的题已被忽略或不存在时回退到下一题
    restore() {
      const savedId = localStorage.getItem('knowledge-current-id');
      if (!savedId) {
        this.fetchNext();
        return;
      }
      getKnowledgeById(savedId).then(res => {
        if (res.daoResult) {
          this.applyCurrent(res.daoResult);
        } else {
          this.fetchNext(Number(savedId));
        }
      });
    },
    // 答案里"标题：内容"形式的段落，把冒号前的标题加粗
    boldAnswer(html) {
      if (!html) return '';
      const div = document.createElement('div');
      div.innerHTML = html;
      div.querySelectorAll('p').forEach(p => {
        const m = p.textContent.match(/^([^：:]{1,40})([：:])(.*)$/s);
        if (m) {
          p.innerHTML = `<strong>${m[1]}</strong>${m[2]}${m[3]}`;
        }
      });
      return div.innerHTML;
    },
    handleModeChange(mode) {
      localStorage.setItem('knowledge-mode', mode);
      this.answerVisible = mode === 'recite';
    },
    querySearch(keyword, cb) {
      if (!keyword || !keyword.trim()) {
        cb([]);
        return;
      }
      searchKnowledge(keyword.trim(), this.filterTag)
        .then(res => {
          const list = (res.dataList || []).map(k => ({ id: k.id, label: plainText(k.question) }));
          cb(list);
        })
        .catch(() => cb([]));
    },
    handleSearchSelect(item) {
      if (!item.id) return;
      getKnowledgeById(item.id).then(res => {
        if (res.daoResult) {
          this.loading = true;
          this.applyCurrent(res.daoResult);
          this.loading = false;
        }
      });
    },
    fetchNext(currentId) {
      this.fetch(getNextKnowledge, currentId, this.filterTag);
    },
    fetch(api, currentId, tag) {
      this.loading = true;
      api(currentId, tag)
        .then(res => {
          this.applyCurrent(res.daoResult);
        })
        .finally(() => { this.loading = false; });
    },
    tagName(tag) {
      const t = this.TAGS.find(x => x.value === tag);
      return t ? t.label : '';
    },
    tagType(tag) {
      const t = this.TAGS.find(x => x.value === tag);
      return t ? t.type : '';
    },
    // 切换标签后从头开始刷该标签的题
    handleTagFilterChange() {
      this.fetchNext();
    },
    applyCurrent(knowledge) {
      this.current = knowledge || null;
      // 背题模式切题后直接显示答案，做题模式隐藏
      this.answerVisible = this.mode === 'recite';
      this.notes = [];
      this.noteInputVisible = false;
      this.noteContent = '';
      if (this.current) {
        localStorage.setItem('knowledge-current-id', this.current.id);
        this.fetchNotes();
        this.recordView();
      }
    },
    // 每次刷到题目即记录查看进度，与查看答案按钮解耦，保证两种模式都统计
    recordView() {
      if (!this.current) return;
      viewKnowledge(this.current.id).then(res => {
        this.current = res.daoResult || this.current;
      });
    },
    handleShowAnswer() {
      this.answerVisible = true;
    },
    handleFavorite() {
      favoriteKnowledge(this.current.id).then(res => {
        this.current = res.daoResult || this.current;
        this.$message.success(this.isFavorite ? '已收藏' : '已取消收藏');
      });
    },
    handleIgnore() {
      this.$confirm('确认忽略这道题？忽略后不再显示。', '提示', { type: 'warning' })
        .then(() => ignoreKnowledge(this.current.id))
        .then(() => {
          this.$message.success('已忽略');
          this.fetchNext(this.current.id);
        })
        .catch(() => {});
    },
    handleNext() {
      this.fetchNext(this.current ? this.current.id : undefined);
    },
    handlePrev() {
      this.fetch(getPrevKnowledge, this.current ? this.current.id : undefined, this.filterTag);
    },
    handleSaveNote() {
      if (!this.noteContent.trim()) {
        this.$message.warning('请输入笔记内容');
        return;
      }
      this.noteSaving = true;
      addKnowledgeNote(this.current.id, this.noteContent.trim())
        .then(() => {
          this.$message.success('笔记已保存');
          this.noteContent = '';
          this.noteInputVisible = false;
          this.fetchNotes();
        })
        .finally(() => { this.noteSaving = false; });
    },
    fetchNotes() {
      if (!this.current) return;
      getKnowledgeNotes(this.current.id).then(res => {
        this.notes = res.dataList || [];
      });
    },
    openAdd() {
      this.addForm = { question: '', answer: '', tag: null };
      this.addVisible = true;
      this.$nextTick(() => this.$refs.addForm && this.$refs.addForm.clearValidate());
    },
    handleAdd() {
      this.$refs.addForm.validate(valid => {
        if (!valid) return;
        this.addSaving = true;
        addKnowledge({
          question: toHtml(this.addForm.question),
          answer: toHtml(this.addForm.answer),
          tag: this.addForm.tag
        })
          .then(() => {
            this.$message.success('添加成功');
            this.addVisible = false;
            if (!this.current) this.fetchNext();
          })
          .finally(() => { this.addSaving = false; });
      });
    }
  }
};
</script>

<style scoped>
.knowledge-pane .toolbar { margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.tag-filter { width: 170px; }
.question-tag { margin-left: 8px; }
.search-input { width: 420px; }
.toolbar-date { color: #4a5568; font-size: 14px; font-weight: 600; }
.toolbar-date i { margin-right: 4px; color: var(--color-primary); }
.knowledge-card {
  border: 1px solid #e4e7ed; border-radius: 10px; padding: 24px 28px;
  background: linear-gradient(180deg, #fdfefe 0%, #f8fafc 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); transition: border-color .2s;
}
.knowledge-card:hover { border-color: #c0c4cc; }
.knowledge-card.is-favorite { border-color: #f56c6c; background: linear-gradient(180deg, #fff7f7 0%, #fff1f1 100%); }
.knowledge-card.is-favorite:hover { border-color: #f56c6c; }
.section-label { font-size: 13px; color: #909399; margin-bottom: 8px; letter-spacing: 1px; }
.section-label i { margin-right: 4px; }
.question { margin-bottom: 0; }
.question-text { font-size: 17px; font-weight: 600; color: #303133; line-height: 1.7; }
.qa-divider { margin: 16px 0; }
.qa-divider >>> el-divider__text { background-color: transparent; }
.answer { min-height: 60px; }
.answer .rich-text { color: #4a5568; line-height: 1.8; }
.is-favorite .question .rich-text,
.is-favorite .answer .rich-text { color: #cf1322; }
.answer-hidden { padding: 6px 0; }
.rich-text >>> p { margin: 0 0 8px; }
.rich-text >>> p:last-child { margin-bottom: 0; }
.meta {
  display: flex; align-items: center; gap: 16px; margin-top: 18px; padding: 10px 14px;
  color: #909399; font-size: 12px; background: rgba(0, 0, 0, 0.02); border-radius: 6px;
}
.meta-item i { margin-right: 3px; }
.actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
.actions-left, .actions-right { display: flex; align-items: center; }
.note-input { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.note-list { margin-top: 22px; }
.note-list-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #909399; letter-spacing: 1px; margin-bottom: 12px;
  padding-bottom: 8px; border-bottom: 1px dashed #e4e7ed;
}
.note-list-header i { font-size: 15px; }
.note-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
  background: var(--color-primary, #409eff); color: #fff; font-size: 12px;
}
.note-timeline { padding-left: 4px; }
.note-timeline >>> .el-timeline-item__timestamp { font-size: 12px; color: #c0c4cc; }
.note-item {
  background: #fff; border: 1px solid #ebeef5; border-radius: 8px;
  padding: 12px 14px; color: #4a5568; font-size: 14px; line-height: 1.7;
  white-space: pre-wrap; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow .2s, border-color .2s;
}
.note-item:hover { border-color: var(--color-primary, #409eff); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); }
.empty-tip { text-align: center; color: #909399; padding: 40px 0; }
</style>
