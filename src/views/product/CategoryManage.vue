<template>
  <div class="category-manage">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">分类管理</span>
          <span class="header-meta">两级分类，初始 7 条对应原商品类型</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-refresh" @click="fetchTree">刷新</el-button>
          <el-button type="success" size="small" icon="el-icon-plus" @click="openAdd(null)">新增一级分类</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tree"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600 }"
        empty-text="暂无分类"
      >
        <el-table-column prop="name" label="分类名称" min-width="220" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="层级" width="100" align="center">
          <template slot-scope="s">
            <el-tag :type="s.row.parentId === 0 ? 'primary' : 'info'" size="mini">
              {{ s.row.parentId === 0 ? '一级' : '二级' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="s">
            <el-button
              v-if="s.row.parentId === 0"
              type="text"
              size="mini"
              @click="openAdd(s.row)"
            >添加子分类</el-button>
            <el-button type="text" size="mini" @click="openEdit(s.row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#f56c6c" @click="handleDelete(s.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false">
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

<style scoped>
.category-manage { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.card-title { font-size: 16px; font-weight: 600; color: #2d3748; }
.header-meta { font-size: 13px; color: #718096; }
.tip { margin-left: 10px; color: #909399; font-size: 12px; }
</style>
