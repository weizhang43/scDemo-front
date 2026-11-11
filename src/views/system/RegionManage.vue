<template>
  <div class="region-manage list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left"><span class="card-title">区域维护</span></div>
        <div class="header-actions">
          <el-input v-model="keyword" placeholder="输入名称关键字检索" clearable size="small" style="width:220px;" @input="onSearch" />
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd(null)">新增省份</el-button>
          <el-button type="default" size="small" icon="el-icon-magic-stick" @click="handleInit">初始化省市区数据</el-button>
        </div>
      </div>
      <el-table ref="table" :key="tableKey" v-loading="loading" :data="displayData" row-key="value"
        :tree-props="{ children: 'children', indent: 28 }" :default-expand-all="allExpanded"
        :header-cell-style="{ background:'#f8f9fc', color:'#303133', fontWeight:600, fontSize:'14px' }"
        :cell-style="{ padding: '10px 0' }"
        style="width:100%;">
        <el-table-column prop="label" min-width="220">
          <template slot="header">
            <span class="col-header">
              <i class="el-icon-location-outline" />
              名称
              <el-button type="text" class="toggle-tree-btn"
                :icon="allExpanded ? 'el-icon-remove-outline' : 'el-icon-circle-plus-outline'"
                @click="toggleAll(!allExpanded)" />
            </span>
          </template>
          <template slot-scope="scope">
            <span :class="['region-label', 'level-' + scope.row.level]">
              <i :class="['el-icon-' + levelIcon(scope.row.level)]" />
              <span v-if="keyword" v-html="highlightText(scope.row.label)" />
              <span v-else>{{ scope.row.label }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="90" align="center">
          <template slot-scope="scope">
            <span :class="['level-badge', 'badge-' + scope.row.level]">{{ levelText(scope.row.level) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.level < 3" type="text" size="mini" icon="el-icon-plus" @click="openAdd(scope.row)">添加下级</el-button>
            <el-button type="text" size="mini" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" icon="el-icon-delete" class="btn-danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="420px" :close-on-click-modal="false">
      <el-form ref="regionForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" placeholder="区域名称" maxlength="64" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width:120px;" /></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRegionTree, addRegion, updateRegion, deleteRegion, initRegion } from '../../api/region';

const LEVEL_TEXT = ['', '省', '市', '区'];
const LEVEL_ICON = ['', 'location', 'map-location', 'office-building'];

export default {
  name: 'RegionManage',
  data() {
    return {
      loading: false, regionTree: [], allFlat: [], keyword: '', allExpanded: false, tableKey: 0,
      dialogVisible: false, dialogTitle: '', submitting: false,
      form: { id: null, name: '', parentId: null, level: 1, sortOrder: 0 },
      rules: { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }
    };
  },
  computed: {
    displayData() {
      if (!this.keyword) return this.regionTree;
      const kw = this.keyword.toLowerCase();
      const hitIds = new Set();
      this.allFlat.forEach(r => { if (r.label.toLowerCase().includes(kw)) hitIds.add(r.value); });
      const collectAncestors = (list, ancestors) => {
        list.forEach(r => {
          r._ancestors = [...ancestors, r.value];
          if (hitIds.has(r.value)) r._ancestors.forEach(id => hitIds.add(id));
          if (r.children) collectAncestors(r.children, r._ancestors);
        });
      };
      collectAncestors(this.regionTree, []);
      const filterTree = (list) => {
        return list.reduce((acc, r) => {
          if (!hitIds.has(r.value)) return acc;
          const copy = { ...r };
          if (copy.children) copy.children = filterTree(copy.children);
          return [...acc, copy];
        }, []);
      };
      return filterTree(this.regionTree);
    }
  },
  created() { this.fetchData(); },
  methods: {
    levelText(l) { return LEVEL_TEXT[l] || ''; },
    levelIcon(l) { return LEVEL_ICON[l] || ''; },
    fetchData() {
      this.loading = true;
      getRegionTree().then(res => {
        this.regionTree = res.daoResult || [];
        this.allFlat = [];
        const walk = (list) => { list.forEach(r => { this.allFlat.push(r); if (r.children) walk(r.children); }); };
        walk(this.regionTree);
      }).catch(() => {}).finally(() => { this.loading = false; });
    },
    toggleAll(expanded) {
      this.allExpanded = expanded;
      this.tableKey++;
    },
    onSearch() {
      if (this.keyword && !this.allExpanded) this.toggleAll(true);
    },
    highlightText(text) {
      return text.replace(new RegExp(this.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<em style="color:#f56c6c;font-style:normal;">${m}</em>`);
    },
    openAdd(parent) {
      this.dialogTitle = parent ? `在「${parent.label}」下新增` : '新增省份';
      this.form = { id: null, name: '', parentId: parent ? parent.value : 0, level: parent ? parent.level + 1 : 1, sortOrder: 0 };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.regionForm && this.$refs.regionForm.clearValidate());
    },
    openEdit(row) {
      this.dialogTitle = `编辑「${row.label}」`;
      this.form = { id: row.value, name: row.label, parentId: null, level: row.level, sortOrder: row.sortOrder || 0 };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.regionForm && this.$refs.regionForm.clearValidate());
    },
    handleSubmit() {
      this.$refs.regionForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const data = { name: this.form.name, parentId: this.form.parentId, level: this.form.level, sortOrder: this.form.sortOrder };
        const api = this.form.id ? updateRegion(this.form.id, data) : addRegion(data);
        api.then(() => { this.$message.success(this.form.id ? '修改成功' : '新增成功'); this.dialogVisible = false; this.fetchData(); })
          .catch(() => {}).finally(() => { this.submitting = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除「${row.label}」及其下级？`, '删除确认', { type: 'warning' })
        .then(() => deleteRegion(row.value))
        .then(() => { this.$message.success('已删除'); this.fetchData(); })
        .catch(() => {});
    },
    handleInit() {
      this.$confirm('将初始化中国省市区数据（已有数据将跳过），确认？', '提示', { type: 'info' })
        .then(() => initRegion())
        .then(res => { this.$message.success(res.daoResult || '初始化成功'); this.fetchData(); })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.col-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.toggle-tree-btn {
  font-size: 20px;
  padding: 2px;
  margin-left: 8px;
  line-height: 1;
}
.region-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.region-label i { color: #909399; font-size: 14px; }
.level-1 { font-weight: 600; }
.level-1 i { color: #e6a23c; }
.level-2 i { color: #409eff; }
.level-3 i { color: #67c23a; }

.level-badge {
  display: inline-block;
  min-width: 32px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.badge-1 { background: #fdf6ec; color: #e6a23c; }
.badge-2 { background: #ecf5ff; color: #409eff; }
.badge-3 { background: #f0f9eb; color: #67c23a; }

.btn-danger { color: #f56c6c !important; }
.btn-danger:hover { color: #e04040 !important; }
</style>