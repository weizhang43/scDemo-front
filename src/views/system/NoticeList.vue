<template>
  <div class="notice-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">通知管理</span>
          <span class="header-meta">共 {{ total }} 条</span>
        </div>
        <div class="header-actions">
          <el-input v-model="query.title" placeholder="标题搜索" size="small" clearable style="width:180px;margin-right:8px;" @keyup.enter.native="handleSearch" />
          <el-select v-model="query.status" placeholder="状态" size="small" clearable style="width:110px;margin-right:8px;">
            <el-option label="发布" :value="1" />
            <el-option label="草稿" :value="0" />
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">发布通知</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无通知"
      >
        <el-table-column prop="noticeId" label="ID" width="70" />
        <el-table-column label="封面" width="90">
          <template slot-scope="s">
            <el-image v-if="s.row.coverImage" :src="s.row.coverImage" style="width:48px;height:36px" fit="cover" :preview-src-list="[s.row.coverImage]" />
            <span v-else style="color:#bbb">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template slot-scope="s">
            <el-tag :type="s.row.status === 1 ? 'success' : 'info'" size="mini">{{ s.row.status === 1 ? '发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createName" label="创建人" width="110" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="toggleStatus(scope.row)">{{ scope.row.status === 1 ? '下架' : '发布' }}</el-button>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="820px" top="6vh" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form ref="noticeForm" :model="noticeForm" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入通知标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="noticeForm.sortOrder" :min="0" :max="9999" controls-position="right" />
              <span class="tip">值越大越靠前</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="noticeForm.status">
                <el-radio :label="1">发布</el-radio>
                <el-radio :label="0">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="封面图">
          <el-upload
            class="cover-uploader"
            action="/user/image/upload"
            :show-file-list="false"
            :headers="uploadHeaders"
            accept="image/png,image/jpeg,image/gif,image/webp"
            :before-upload="beforeImageUpload"
            :on-success="handleCoverSuccess"
            :on-error="handleImageError"
          >
            <img v-if="noticeForm.coverImage" :src="noticeForm.coverImage" class="cover-image" alt="封面">
            <i v-else class="el-icon-plus cover-uploader-icon" />
          </el-upload>
          <el-button v-if="noticeForm.coverImage" type="text" icon="el-icon-delete" @click="noticeForm.coverImage = ''">移除</el-button>
        </el-form-item>
        <el-form-item label="内容">
          <div v-if="dialogVisible" class="editor-wrap">
            <Toolbar :editor="editor" :defaultConfig="toolbarConfig" mode="default" style="border-bottom:1px solid #e4e7ed" />
            <Editor v-model="noticeForm.content" :defaultConfig="editorConfig" mode="default" style="height:320px;overflow-y:hidden" @onCreated="onEditorCreated" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getToken } from '../../utils/auth';
import request from '../../utils/request';
import { getNoticePage, addNotice, updateNotice, deleteNotice, changeNoticeStatus } from '../../api/notice';

export default {
  name: 'NoticeList',
  components: { Editor, Toolbar },
  data() {
    const self = this;
    return {
      loading: false,
      saving: false,
      tableData: [],
      total: 0,
      query: { pageNum: 1, pageSize: 10, title: '', status: '' },
      dialogVisible: false,
      dialogTitle: '发布通知',
      noticeForm: { noticeId: null, title: '', content: '', coverImage: '', status: 1, sortOrder: 0 },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
      },
      editor: null,
      toolbarConfig: {},
      editorConfig: {
        placeholder: '请输入通知内容...',
        MENU_CONF: {
          uploadImage: {
            async customUpload(file, insertFn) {
              const form = new FormData();
              form.append('file', file);
              try {
                const res = await request({
                  url: '/user/image/upload',
                  method: 'post',
                  data: form,
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res && res.daoResult) {
                  insertFn(res.daoResult, file.name, res.daoResult);
                }
              } catch (e) {
                self.$message.error('图片上传失败');
              }
            }
          }
        }
      }
    };
  },
  computed: {
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
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
      const params = {
        pageNum: this.query.pageNum,
        pageSize: this.query.pageSize,
        title: this.query.title || undefined,
        status: this.query.status === '' ? undefined : this.query.status
      };
      getNoticePage(params)
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.total = page.total || 0;
        })
        .finally(() => { this.loading = false; });
    },
    handleSearch() {
      this.query.pageNum = 1;
      this.fetchList();
    },
    handlePageChange(p) {
      this.query.pageNum = p;
      this.fetchList();
    },
    onEditorCreated(editor) {
      this.editor = Object.seal(editor);
    },
    onDialogClosed() {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    },
    openAdd() {
      this.dialogTitle = '发布通知';
      this.noticeForm = { noticeId: null, title: '', content: '', coverImage: '', status: 1, sortOrder: 0 };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.noticeForm && this.$refs.noticeForm.clearValidate());
    },
    openEdit(row) {
      this.dialogTitle = '编辑通知';
      this.noticeForm = {
        noticeId: row.noticeId,
        title: row.title,
        content: row.content || '',
        coverImage: row.coverImage || '',
        status: row.status,
        sortOrder: row.sortOrder || 0
      };
      this.dialogVisible = true;
    },
    handleSave() {
      this.$refs.noticeForm.validate(valid => {
        if (!valid) return;
        this.saving = true;
        const action = this.noticeForm.noticeId ? updateNotice : addNotice;
        action(this.noticeForm)
          .then(() => {
            this.$message.success('保存成功');
            this.dialogVisible = false;
            this.fetchList();
          })
          .finally(() => { this.saving = false; });
      });
    },
    toggleStatus(row) {
      const next = row.status === 1 ? 0 : 1;
      changeNoticeStatus(row.noticeId, next).then(() => {
        this.$message.success(next === 1 ? '已发布' : '已下架');
        this.fetchList();
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除通知 [${row.title}]?`, '提示', { type: 'warning' })
        .then(() => {
          deleteNotice(row.noticeId).then(() => {
            this.$message.success('删除成功');
            this.fetchList();
          });
        })
        .catch(() => {});
    },
    beforeImageUpload(file) {
      const ok = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type);
      if (!ok) this.$message.error('仅支持 png/jpg/gif/webp 格式');
      const lt5 = file.size / 1024 / 1024 < 5;
      if (!lt5) this.$message.error('图片不能超过 5MB');
      return ok && lt5;
    },
    handleCoverSuccess(res) {
      if (res && res.code === 200) {
        this.noticeForm.coverImage = res.daoResult;
      } else {
        this.$message.error((res && res.msg) || '上传失败');
      }
    },
    handleImageError() {
      this.$message.error('图片上传失败');
    }
  }
};
</script>

<style scoped>
.notice-list { width: 100%; }
.tip { margin-left: 10px; color: #909399; font-size: 12px; }
.editor-wrap { border: 1px solid #e4e7ed; border-radius: 4px; z-index: 1; }
.cover-uploader { display: inline-block; }
.cover-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer;
  width: 148px; height: 100px; display: flex; align-items: center; justify-content: center;
}
.cover-uploader >>> .el-upload:hover { border-color: #409eff; }
.cover-uploader-icon { font-size: 26px; color: #8c939d; }
.cover-image { width: 148px; height: 100px; object-fit: cover; display: block; }
</style>
