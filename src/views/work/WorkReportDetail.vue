<template>
  <div class="work-report-detail">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-notebook-2" />
          {{ report.type === 2 ? '周报详情' : '日报详情' }}
        </div>
        <a class="back-link" @click="$router.push('/personal-work')">
          <i class="el-icon-back" />
          返回列表
        </a>
      </div>
    </div>

    <div class="page-body">
      <el-card v-loading="loading">
        <el-form ref="reportForm" :model="report" :rules="rules" label-width="90px">
          <el-form-item label="类型">
            <el-tag :type="report.type === 2 ? 'warning' : 'success'" size="small">
              {{ report.type === 2 ? '周报' : '日报' }}
            </el-tag>
          </el-form-item>
          <el-form-item label="生成人">
            <span>{{ report.createName }}</span>
          </el-form-item>
          <el-form-item label="生成时间">
            <span>{{ report.createTime }}</span>
          </el-form-item>
          <el-form-item label="修改时间">
            <span>{{ report.updateTime }}</span>
          </el-form-item>
          <el-form-item label="标题" prop="title">
            <el-input v-model="report.title" placeholder="请输入标题" maxlength="200" show-word-limit />
          </el-form-item>
          <el-form-item label="内容">
            <div v-if="contentReady" class="editor-wrap">
              <Toolbar :editor="editor" :defaultConfig="toolbarConfig" mode="default" style="border-bottom:1px solid #e4e7ed" />
              <Editor v-model="report.content" :defaultConfig="editorConfig" mode="default" style="height:360px;overflow-y:hidden" @onCreated="onEditorCreated" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
            <el-button @click="$router.push('/personal-work')">返回</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getReportDetail, updateReport } from '../../api/workReport';

export default {
  name: 'WorkReportDetail',
  components: { Editor, Toolbar },
  data() {
    return {
      loading: false,
      saving: false,
      // 编辑器只走"创建时带入初始内容"路径（异步 setHtml 回填不可靠），详情返回后再渲染
      contentReady: false,
      report: { reportId: null, title: '', content: '', type: 1, createName: '', createTime: '', updateTime: '' },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
      },
      editor: null,
      // 页面免登录，图片/视频上传接口需要登录态，故隐藏对应菜单
      toolbarConfig: { excludeKeys: ['group-image', 'group-video'] },
      editorConfig: { placeholder: '请输入内容...' }
    };
  },
  created() {
    this.fetchDetail();
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy();
  },
  methods: {
    onEditorCreated(editor) {
      this.editor = Object.seal(editor);
    },
    fetchDetail() {
      this.loading = true;
      getReportDetail(this.$route.params.id)
        .then(res => {
          this.report = res.daoResult || this.report;
        })
        .finally(() => {
          this.loading = false;
          this.contentReady = true;
        });
    },
    handleSave() {
      this.$refs.reportForm.validate(valid => {
        if (!valid) return;
        this.saving = true;
        updateReport({
          reportId: this.report.reportId,
          title: this.report.title,
          content: this.report.content
        })
          .then(res => {
            this.$message.success('保存成功');
            this.report = res.daoResult || this.report;
          })
          .finally(() => { this.saving = false; });
      });
    }
  }
};
</script>

<style scoped>
.work-report-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3effb 0%, #ece9fb 50%, #f7f5fd 100%);
}
.page-header {
  background: var(--gradient-brand);
  color: #fff;
  padding: 0 24px;
}
.header-inner {
  max-width: 900px;
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
.page-body { max-width: 900px; margin: 24px auto; padding: 0 24px; }
.editor-wrap { border: 1px solid #e4e7ed; border-radius: 4px; z-index: 1; }
</style>
