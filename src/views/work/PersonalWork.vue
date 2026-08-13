<template>
  <div class="personal-work work-page">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-notebook-2" />
          个人工作
        </div>
        <router-link to="/login" class="back-link">
          <i class="el-icon-back" />
          返回登录
        </router-link>
      </div>
    </div>

    <div class="page-body">
      <el-card>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="工作日报" name="daily" />
          <el-tab-pane label="工作周报" name="weekly" />
          <el-tab-pane label="学习计划" name="study" />
          <el-tab-pane label="定时任务" name="jobs" />
        </el-tabs>

        <div v-if="activeTab === 'daily' || activeTab === 'weekly'">
          <div class="toolbar">
            <span class="toolbar-date"><i class="el-icon-date" /> {{ todayText }}</span>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="goAdd">
              {{ activeTab === 'daily' ? '添加日报' : '添加周报' }}
            </el-button>
          </div>

          <el-table
            v-loading="loading"
            :data="tableData"
            border
            stripe
            style="width: 100%;"
            :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }"
            :empty-text="activeTab === 'daily' ? '暂无日报' : '暂无周报'"
          >
            <el-table-column type="index" label="序号" width="70" :index="indexMethod" />
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column label="内容" min-width="220" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ plainText(scope.row.content) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createName" label="生成人" width="120" />
            <el-table-column prop="createTime" label="生成时间" width="170" />
            <el-table-column prop="updateTime" label="修改时间" width="170" />
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" @click="goDetail(scope.row)">编辑</el-button>
                <el-button type="text" icon="el-icon-s-promotion" @click="handleSend(scope.row)">发送</el-button>
                <el-button type="text" icon="el-icon-delete" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            style="margin-top:16px;text-align:right;"
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="query.pageSize"
            :current-page="query.pageNum"
            @current-change="handlePageChange"
          />
        </div>

        <div v-else-if="activeTab === 'study'">
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="toolbar-date"><i class="el-icon-date" /> {{ todayText }}</span>
              <el-date-picker
                v-model="planQuery.planDate"
                type="date"
                size="small"
                value-format="yyyy-MM-dd"
                placeholder="按计划日期查找"
                clearable
                style="width: 170px;"
                @change="handlePlanDateChange"
              />
              <el-radio-group v-model="planQuery.scope" size="small" @change="handlePlanScopeChange">
                <el-radio-button label="future">今日及以后</el-radio-button>
                <el-radio-button label="all">全部</el-radio-button>
              </el-radio-group>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openPlanAdd">发布计划</el-button>
          </div>

          <el-table
            v-loading="planLoading"
            :data="planTableData"
            border
            stripe
            style="width: 100%;"
            :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }"
            :row-class-name="planRowClassName"
            empty-text="暂无学习计划"
          >
            <el-table-column type="index" label="序号" width="70" :index="planIndexMethod" />
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column label="计划内容" min-width="220" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ plainText(scope.row.content) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="planDate" label="计划日期" width="120" />
            <el-table-column prop="publishDate" label="发布日期" width="120" />
            <el-table-column prop="publishName" label="发布人" width="110" />
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="finishDate" label="完成日期" width="120" />
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" @click="openPlanEdit(scope.row)">编辑</el-button>
                <el-button
                  type="text"
                  icon="el-icon-circle-check"
                  :disabled="scope.row.status === 2"
                  @click="handleComplete(scope.row)"
                >完成</el-button>
                <el-button type="text" icon="el-icon-delete" class="text-danger" @click="handlePlanDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            style="margin-top:16px;text-align:right;"
            background
            layout="total, prev, pager, next, jumper"
            :total="planTotal"
            :page-size="planQuery.pageSize"
            :current-page="planQuery.pageNum"
            @current-change="handlePlanPageChange"
          />
        </div>

        <div v-else-if="activeTab === 'jobs'" class="jobs-pane">
          <!-- v-if 惰性渲染，避免未进入该 tab 就加载 xxl-job iframe -->
          <JobScheduler v-if="jobsVisited" />
        </div>
      </el-card>
    </div>

    <el-dialog
      :title="planDialogTitle"
      :visible.sync="planDialogVisible"
      width="820px"
      top="6vh"
      :close-on-click-modal="false"
      @closed="onPlanDialogClosed"
    >
      <el-form ref="planForm" :model="planForm" :rules="planRules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="planForm.title" placeholder="请输入计划标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="计划日期" prop="planDate">
          <el-date-picker
            v-model="planForm.planDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择计划日期"
          />
          <span class="tip">每个计划日期只能发布一个计划</span>
        </el-form-item>
        <el-form-item label="计划内容">
          <div v-if="planDialogVisible" class="editor-wrap">
            <Toolbar :editor="editor" :defaultConfig="toolbarConfig" mode="default" style="border-bottom:1px solid #e4e7ed" />
            <Editor v-model="planForm.content" :defaultConfig="editorConfig" mode="default" style="height:320px;overflow-y:hidden" @onCreated="onEditorCreated" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="planDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="planSaving" @click="handlePlanSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getReportPage, deleteReport, sendReport } from '../../api/workReport';
import { getPlanPage, getPlanDetail, addPlan, updatePlan, deletePlan, completePlan } from '../../api/studyPlan';
import JobScheduler from '../system/JobScheduler.vue';

export default {
  name: 'PersonalWork',
  components: { Editor, Toolbar, JobScheduler },
  data() {
    return {
      // 周五默认显示周报，其他日期默认显示日报
      activeTab: new Date().getDay() === 5 ? 'weekly' : 'daily',
      loading: false,
      tableData: [],
      total: 0,
      query: { pageNum: 1, pageSize: 10 },
      planLoading: false,
      planTableData: [],
      planTotal: 0,
      planQuery: { pageNum: 1, pageSize: 10, scope: 'future', planDate: '' },
      jobsVisited: false,
      planDialogVisible: false,
      planDialogTitle: '发布计划',
      planSaving: false,
      planForm: { planId: null, title: '', content: '', planDate: '' },
      planRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        planDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
      },
      editor: null,
      // 页面免登录，图片/视频上传接口需要登录态，故隐藏对应菜单
      toolbarConfig: { excludeKeys: ['group-image', 'group-video'] },
      editorConfig: { placeholder: '请输入计划内容...' }
    };
  },
  computed: {
    currentType() {
      return this.activeTab === 'daily' ? 1 : 2;
    },
    todayText() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];
      return `${y}-${m}-${d} ${week}`;
    }
  },
  created() {
    this.fetchList();
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy();
  },
  methods: {
    fetchList() {
      this.loading = true;
      getReportPage({
        pageNum: this.query.pageNum,
        pageSize: this.query.pageSize,
        type: this.currentType
      })
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.total = page.total || 0;
        })
        .finally(() => { this.loading = false; });
    },
    handleTabClick() {
      if (this.activeTab === 'jobs') {
        this.jobsVisited = true;
        return;
      }
      if (this.activeTab === 'study') {
        this.planQuery.pageNum = 1;
        this.fetchPlanList();
        return;
      }
      this.query.pageNum = 1;
      this.fetchList();
    },
    handlePageChange(p) {
      this.query.pageNum = p;
      this.fetchList();
    },
    indexMethod(index) {
      return (this.query.pageNum - 1) * this.query.pageSize + index + 1;
    },
    plainText(html) {
      if (!html) return '';
      const div = document.createElement('div');
      div.innerHTML = html;
      return (div.textContent || '').trim();
    },
    goAdd() {
      this.$router.push({ path: '/work-report/add', query: { type: this.currentType } });
    },
    goDetail(row) {
      this.$router.push(`/work-report/${row.reportId}`);
    },
    handleSend(row) {
      this.$prompt('请输入收件邮箱', '发送' + (row.type === 2 ? '周报' : '日报'), {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
        inputPattern: /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/,
        inputErrorMessage: '邮箱格式不正确'
      })
        .then(({ value }) => sendReport(row.reportId, value))
        .then(res => {
          if (res) this.$message.success('发送成功');
        })
        .catch(() => {});
    },
    handleDelete(row) {
      this.$confirm(`确认删除 [${row.title}]?`, '提示', { type: 'warning' })
        .then(() => {
          deleteReport(row.reportId).then(() => {
            this.$message.success('删除成功');
            if (this.tableData.length === 1 && this.query.pageNum > 1) {
              this.query.pageNum -= 1;
            }
            this.fetchList();
          });
        })
        .catch(() => {});
    },
    fetchPlanList() {
      this.planLoading = true;
      const params = {
        pageNum: this.planQuery.pageNum,
        pageSize: this.planQuery.pageSize
      };
      // 指定了计划日期就只查那一天，否则按 scope 决定是否限定今日及以后
      if (this.planQuery.planDate) {
        params.planDate = this.planQuery.planDate;
      } else {
        params.scope = this.planQuery.scope;
      }
      getPlanPage(params)
        .then(res => {
          const page = res.daoResult || {};
          this.planTableData = page.records || [];
          this.planTotal = page.total || 0;
        })
        .finally(() => { this.planLoading = false; });
    },
    handlePlanDateChange() {
      this.planQuery.pageNum = 1;
      this.fetchPlanList();
    },
    handlePlanScopeChange() {
      this.planQuery.pageNum = 1;
      this.fetchPlanList();
    },
    handlePlanPageChange(p) {
      this.planQuery.pageNum = p;
      this.fetchPlanList();
    },
    planIndexMethod(index) {
      return (this.planQuery.pageNum - 1) * this.planQuery.pageSize + index + 1;
    },
    statusText(status) {
      if (status === 2) return '已完成';
      if (status === 3) return '已超期';
      return '已发布';
    },
    statusTagType(status) {
      if (status === 2) return 'success';
      if (status === 3) return 'danger';
      return 'info';
    },
    planRowClassName({ row }) {
      if (row.status === 2) return 'row-finished';
      if (row.status === 3) return 'row-expired';
      return '';
    },
    onEditorCreated(editor) {
      this.editor = Object.seal(editor);
    },
    onPlanDialogClosed() {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    },
    openPlanAdd() {
      this.planDialogTitle = '发布计划';
      this.planForm = { planId: null, title: '', content: '', planDate: '' };
      this.planDialogVisible = true;
      this.$nextTick(() => this.$refs.planForm && this.$refs.planForm.clearValidate());
    },
    openPlanEdit(row) {
      // 编辑器只走"创建时带入初始内容"路径（异步 setHtml 回填不可靠），故先取到内容再开弹窗
      getPlanDetail(row.planId).then(res => {
        const plan = res.daoResult || {};
        this.planDialogTitle = '编辑计划';
        this.planForm = {
          planId: plan.planId,
          title: plan.title || '',
          content: plan.content || '',
          planDate: plan.planDate || ''
        };
        this.planDialogVisible = true;
        this.$nextTick(() => this.$refs.planForm && this.$refs.planForm.clearValidate());
      });
    },
    handlePlanSave() {
      this.$refs.planForm.validate(valid => {
        if (!valid) return;
        this.planSaving = true;
        const action = this.planForm.planId ? updatePlan : addPlan;
        action(this.planForm)
          .then(() => {
            this.$message.success('保存成功');
            this.planDialogVisible = false;
            this.fetchPlanList();
          })
          .finally(() => { this.planSaving = false; });
      });
    },
    handleComplete(row) {
      this.$confirm(`确认将 [${row.title}] 标记为已完成?`, '提示', { type: 'warning' })
        .then(() => {
          completePlan(row.planId).then(() => {
            this.$message.success('已标记为完成');
            this.fetchPlanList();
          });
        })
        .catch(() => {});
    },
    handlePlanDelete(row) {
      this.$confirm(`确认删除 [${row.title}]?`, '提示', { type: 'warning' })
        .then(() => {
          deletePlan(row.planId).then(() => {
            this.$message.success('删除成功');
            if (this.planTableData.length === 1 && this.planQuery.pageNum > 1) {
              this.planQuery.pageNum -= 1;
            }
            this.fetchPlanList();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.header-inner,
.page-body {
  max-width: 1500px;
}
.toolbar { margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.toolbar-date { color: #4a5568; font-size: 14px; font-weight: 600; }
.toolbar-date i { margin-right: 4px; color: var(--color-primary); }
.tip { margin-left: 12px; color: #909399; font-size: 12px; }
.jobs-pane { height: calc(100vh - 220px); min-height: 480px; }
</style>

<style>
/* el-table 行由子组件渲染，scoped 选择器命中不到，故单独非 scoped 声明并用页面类名限定作用域 */
/* stripe 会把背景色直接刷在隔行的 td 上盖住 tr，因此行着色必须落在 td 而不是 tr */
.personal-work .el-table .row-finished > td.el-table__cell { background-color: #f0f9eb !important; }
.personal-work .el-table .row-finished:hover > td.el-table__cell { background-color: #e1f3d8 !important; }
.personal-work .el-table .row-expired > td.el-table__cell { background-color: #fff5f5 !important; color: #cf1322 !important; }
.personal-work .el-table .row-expired:hover > td.el-table__cell { background-color: #ffe9e7 !important; }
</style>
