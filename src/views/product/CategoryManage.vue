<template>
  <div class="category-manage list-page">
    <el-card class="list-card category-card">
      <div slot="header" class="card-header">
        <div class="header-left">
          <div class="title-icon"><i class="el-icon-menu" /></div>
          <span class="card-title">分类管理</span>
          <span class="header-meta">两级分类，初始 7 条对应原商品类型</span>
        </div>
        <div class="header-actions">
          <el-button type="text" size="small" icon="el-icon-refresh" @click="fetchTree">刷新</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd(null)">新增一级分类</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tree"
        class="category-table"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        :header-cell-style="{ background: '#f7f8fc', color: '#344054', fontWeight: 600, height: '46px' }"
        :row-style="{ height: '58px' }"
        empty-text="暂无分类"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="220">
          <template slot-scope="s">
            <span class="category-name">{{ s.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="层级" width="100" align="center">
          <template slot-scope="s">
            <el-tag class="level-tag" :type="s.row.parentId === 0 ? 'primary' : 'info'" size="mini" effect="plain">
              {{ s.row.parentId === 0 ? '一级' : '二级' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="s">
            <div class="table-actions">
              <el-button
                v-if="s.row.parentId === 0"
                type="text"
                size="mini"
                @click="openAdd(s.row)"
              >添加子分类</el-button>
              <el-button type="text" size="mini" @click="openEdit(s.row)">编辑</el-button>
              <el-button type="text" size="mini" class="text-danger" @click="handleDelete(s.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item v-if="form.parentId !== 0" label="父级分类">
          <el-input :value="parentName" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width:160px" />
          <span class="tip">越小越靠前</span>
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
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from '../../api/category';

export default {
  name: 'CategoryManage',
  data() {
    return {
      loading: false,
      saving: false,
      tree: [],
      dialogVisible: false,
      parentName: '',
      form: { id: null, parentId: 0, name: '', sort: 0 },
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      }
    };
  },
  computed: {
    dialogTitle() {
      if (this.form.id) return '编辑分类';
      return this.form.parentId === 0 ? '新增一级分类' : '新增子分类';
    }
  },
  created() {
    this.fetchTree();
  },
  methods: {
    fetchTree() {
      this.loading = true;
      getCategoryTree()
        .then(res => { this.tree = res.dataList || []; })
        .finally(() => { this.loading = false; });
    },
    openAdd(parent) {
      this.form = { id: null, parentId: parent ? parent.id : 0, name: '', sort: 0 };
      this.parentName = parent ? parent.name : '';
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    openEdit(row) {
      this.form = { id: row.id, parentId: row.parentId, name: row.name, sort: row.sort || 0 };
      this.parentName = this.nameOf(row.parentId);
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    nameOf(id) {
      const top = this.tree.find(t => t.id === id);
      return top ? top.name : '';
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        this.saving = true;
        const action = this.form.id
          ? updateCategory({ id: this.form.id, name: this.form.name.trim(), sort: this.form.sort })
          : addCategory({ parentId: this.form.parentId, name: this.form.name.trim(), sort: this.form.sort });
        action
          .then(() => {
            this.$message.success('保存成功');
            this.dialogVisible = false;
            this.fetchTree();
          })
          .finally(() => { this.saving = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除分类 [${row.name}]？仅当该分类无子分类且无商品引用时可删除。`, '提示', { type: 'warning' })
        .then(() => {
          deleteCategory(row.id).then(() => {
            this.$message.success('已删除');
            this.fetchTree();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style>
.category-manage { width: 100%; }
.category-card { overflow: visible; }
.category-manage .category-card.el-card {
  border: 1px solid #e8ecf3 !important;
  border-radius: 14px !important;
  box-shadow: 0 8px 26px rgba(31, 41, 59, 0.07) !important;
  background: #fff !important;
}
.category-card .el-card__header {
  padding: 20px 24px !important;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%) !important;
  border-bottom: 1px solid #edf0f5;
}
.category-card .el-card__body { padding: 18px 24px 24px !important; background: #fff !important; }
.category-manage .title-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 6px 14px rgba(102, 126, 234, 0.24);
}
.category-manage .title-icon i { font-size: 17px; }
.category-manage .card-header .header-left { gap: 10px; }
.category-manage .card-title { padding-left: 0; font-size: 17px; font-weight: 700; }
.category-manage .card-title::before { display: none; }
.category-manage .header-meta { padding-left: 10px; border-left: 1px solid #e7eaf0; color: #98a2b3; font-size: 12px; }
.category-manage .header-actions { display: flex; align-items: center; gap: 8px; }
.category-manage .header-actions .el-button {
  margin-left: 0;
  border-radius: var(--radius-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.category-manage .header-actions .el-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 41, 59, 0.1);
}
.category-manage .category-table.el-table {
  width: 100%;
  border: 1px solid #edf0f5 !important;
  border-radius: 10px !important;
  overflow: hidden;
  background: #fff !important;
}
.category-manage .category-table th.el-table__cell {
  height: 46px;
  padding: 0 !important;
  background: #f7f8fc !important;
  border-bottom: 1px solid #e9edf4;
  color: #344054;
  font-weight: 600;
}
.category-manage .category-table td.el-table__cell {
  height: 58px;
  padding: 0 !important;
  border-bottom: 1px solid #f0f2f6;
  color: #475467;
}
.category-table .el-table__row:hover > td.el-table__cell { background: #f4f7ff !important; }
.category-table .el-table__expand-icon { color: #667eea; font-size: 14px; }
.category-table .category-name { color: #1f2937; font-weight: 600; }
.category-table .level-tag { min-width: 44px; border-radius: 999px; padding: 0 9px; }
.category-table .table-actions { display: inline-flex; align-items: center; justify-content: center; gap: 2px; white-space: nowrap; }
.category-table .el-button--text { margin-left: 0; padding: 6px 8px; border-radius: 6px; transition: background 0.15s, color 0.15s; }
.category-table .el-button--text:hover { background: #f0f3ff; }
.category-table .el-button--text.text-danger:hover { background: #fff1f1; }
.category-manage .tip { margin-left: 10px; color: #909399; font-size: 12px; }
.category-manage >>> .el-dialog { border-radius: 14px; overflow: hidden; }
.category-manage >>> .el-dialog__header { padding: 20px 24px 16px; border-bottom: 1px solid #edf0f5; }
.category-manage >>> .el-dialog__title { color: #1f2937; font-size: 17px; font-weight: 700; }
.category-manage >>> .el-dialog__body { padding: 24px; }
.category-manage >>> .el-dialog__footer { padding: 14px 24px 20px; border-top: 1px solid #edf0f5; }
.category-manage >>> .el-dialog .el-button { border-radius: var(--radius-sm); }
.category-manage >>> .el-dialog .el-input__inner { border-radius: var(--radius-sm); }
.category-manage >>> .el-dialog .el-input-number .el-input__inner { text-align: left; }
@media (max-width: 768px) {
  .category-card .el-card__header { padding: 16px !important; }
  .category-card .el-card__body { padding: 12px !important; }
  .category-manage .card-header { align-items: flex-start; }
  .category-manage .card-header .header-left { flex: 1 1 100%; align-items: flex-start; }
  .category-manage .header-meta { display: block; margin-left: 46px; padding-left: 0; border-left: 0; font-size: 12px; line-height: 1.5; }
  .category-manage .header-actions { width: 100%; justify-content: flex-end; }
  .category-manage .category-table { overflow-x: auto; }
  .category-manage .category-table .table-actions { gap: 0; }
}
@media (max-width: 480px) {
  .category-table th.el-table__cell,
  .category-table td.el-table__cell { font-size: 12px; }
  .category-table th:nth-child(1),
  .category-table td:nth-child(1),
  .category-table th:nth-child(4),
  .category-table td:nth-child(4) { display: none; }
  .category-manage .header-actions .el-button { padding-left: 10px; padding-right: 10px; }
  .category-manage .card-title { font-size: 16px; }
  .category-manage >>> .el-dialog { width: calc(100% - 24px) !important; }
  .category-manage >>> .el-dialog__body { padding: 20px 16px; }
}
</style>
