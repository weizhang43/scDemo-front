<template>
  <div class="work-report-add">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-notebook-2" />
          {{ isWeekly ? '添加周报' : '添加日报' }}
        </div>
        <a class="back-link" @click="$router.push('/personal-work')">
          <i class="el-icon-back" />
          返回列表
        </a>
      </div>
    </div>

    <div class="page-body">
      <el-card>
        <el-form ref="reportForm" :model="form" :rules="rules" label-width="90px">
          <el-form-item label="类型">
            <el-tag :type="isWeekly ? 'warning' : 'success'" size="small">
              {{ isWeekly ? '周报' : '日报' }}
            </el-tag>
          </el-form-item>
          <el-form-item label="日期">
            <el-input :value="todayStr" disabled style="width:220px;" />
          </el-form-item>
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" show-word-limit />
          </el-form-item>
          <el-form-item label="内容">
            <div v-if="contentReady" class="editor-wrap">
              <Toolbar :editor="editor" :defaultConfig="toolbarConfig" mode="default" style="border-bottom:1px solid #e4e7ed" />
              <Editor v-model="form.content" :defaultConfig="editorConfig" mode="default" style="height:360px;overflow-y:hidden" @onCreated="onEditorCreated" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
            <el-button @click="$router.push('/personal-work')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { addReport, getDailyTemplate, getWeeklyTemplate } from '../../api/workReport';

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default {
  name: 'WorkReportAdd',
  components: { Editor, Toolbar },
  data() {
    const type = Number(this.$route.query.type) === 2 ? 2 : 1;
    const now = new Date();
    let title;
    if (type === 1) {
      title = `张伟-工作日报-${fmt(now)}`;
    } else {
      // 当前周周一至周五
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      title = `张伟-周报-${fmt(monday)}至${fmt(friday)}`;
    }
    return {
      type,
      todayStr: fmt(now),
      saving: false,
      // 编辑器只走"创建时带入初始内容"路径（异步 setHtml 回填不可靠），
      // 需等模板接口返回后再渲染编辑器
      contentReady: false,
      form: { title, content: '' },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
      },
      editor: null,
      // 页面免登录，图片/视频上传接口需要登录态，故隐藏对应菜单
      toolbarConfig: { excludeKeys: ['group-image', 'group-video'] },
      editorConfig: { placeholder: this.$route.query.type === '2' ? '请输入周报内容...' : '请输入日报内容...' }
    };
  },
  computed: {
    isWeekly() {
      return this.type === 2;
    }
  },
  created() {
    const fetchTpl = this.type === 1 ? getDailyTemplate() : getWeeklyTemplate(this.form.title);
    fetchTpl
      .then(res => {
        if (res.daoResult) {
          this.form.content = res.daoResult;
        }
      })
      .catch(() => {})
      .finally(() => { this.contentReady = true; });
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy();
  },
  methods: {
    onEditorCreated(editor) {
      this.editor = Object.seal(editor);
    },
    handleSave() {
      this.$refs.reportForm.validate(valid => {
        if (!valid) return;
        this.saving = true;
        addReport({ type: this.type, title: this.form.title, content: this.form.content })
          .then(() => {
            this.$message.success('保存成功');
            this.$router.push('/personal-work');
          })
          .finally(() => { this.saving = false; });
      });
    }
  }
};
</script>

<style scoped>
.work-report-add {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3effb 0%, #ece9fb 50%, #f7f5fd 100%);
}
.page-header {
  background: var(--gradient-brand);
  color: #fff;
  padding: 0 24px;
}
.header-inner {
  max-width: 1000px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-title { font-size: 18px; font-weight: 600; }
.header-title i { margin-right: 6px; }
.back-link { color: rgba(255, 255, 255, 0.9); text-decoration: none; font-size: 14px; cursor: pointer; }
.back-link:hover { color: #fff; }
.page-body { max-width: 1000px; margin: 24px auto; padding: 0 24px; }
.editor-wrap { border: 1px solid #e4e7ed; border-radius: 4px; z-index: 1; }
</style>
