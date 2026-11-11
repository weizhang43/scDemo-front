<template>
  <div class="dict-manage list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">数据字典</span>
        </div>
        <div>
          <el-button type="primary" icon="el-icon-plus" @click="openTypeAdd">新增</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent="handleSearch">
        <el-form-item label="字典名称">
          <el-input v-model="searchForm.dictName" placeholder="搜索字典名称" clearable style="width:180px;" />
        </el-form-item>
        <el-form-item label="字典编码">
          <el-input v-model="searchForm.dictType" placeholder="搜索字典编码" clearable style="width:180px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="typeList"
        border stripe
        style="width:100%;"
        :header-cell-style="{ background:'#f5f7fb', color:'#4a5568', fontWeight:600 }"
        empty-text="暂无字典类型"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="dictName" label="字典名称" min-width="140" />
        <el-table-column label="字典编码" min-width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="goDictData(scope.row)">{{ scope.row.dictType }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small" effect="light">{{ scope.row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" class-name="op-col">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button type="default" plain size="mini" icon="el-icon-edit" @click="openTypeEdit(scope.row)">编辑</el-button>
              <el-button type="default" plain size="mini" icon="el-icon-setting" @click="goDictData(scope.row)">管理</el-button>
              <el-button type="danger" plain size="mini" icon="el-icon-delete" @click="handleDeleteType(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="pagination.total" class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page.sync="pagination.pageNum"
          @current-change="loadTypes"
        />
      </div>

      <el-dialog :title="typeDialogTitle" :visible.sync="typeDialogVisible" width="480px" :close-on-click-modal="false">
        <el-form ref="typeForm" :model="typeForm" :rules="typeRules" label-width="90px">
          <el-form-item label="字典名称" prop="dictName">
            <el-input v-model="typeForm.dictName" placeholder="如：商品产地" maxlength="64" />
          </el-form-item>
          <el-form-item label="字典编码" prop="dictType">
            <el-input v-model="typeForm.dictType" placeholder="如：product_origin" maxlength="64" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="typeForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="typeForm.remark" placeholder="备注" maxlength="200" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="typeDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="typeSubmitting" @click="handleTypeSubmit">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getDictTypePage, addDictType, updateDictType, deleteDictType } from '../../api/dict';
import { formatTime } from '../../utils/format';
import { clearDictCache } from '../../utils/dictCache';

export default {
  name: 'DictManage',
  data() {
    return {
      loading: false,
      searchForm: { dictName: '', dictType: '' },
      typeList: [],
      pagination: { pageNum: 1, pageSize: 10, total: 0 },
      typeDialogVisible: false, typeDialogTitle: '', typeSubmitting: false, isTypeEdit: false,
      typeForm: { dictId: null, dictName: '', dictType: '', status: 1, remark: '' },
      typeRules: {
        dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        dictType: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
      }
    };
  },
  created() { this.loadTypes(); },
  methods: {
    formatTime,
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    loadTypes() {
      this.loading = true;
      const params = { pageNum: this.pagination.pageNum, pageSize: this.pagination.pageSize };
      if (this.searchForm.dictName) params.dictName = this.searchForm.dictName;
      if (this.searchForm.dictType) params.dictType = this.searchForm.dictType;
      getDictTypePage(params)
        .then(res => {
          const page = (res && res.daoResult) || {};
          this.typeList = page.records || [];
          this.pagination.total = Number(page.total) || 0;
        }).catch(() => {}).finally(() => { this.loading = false; });
    },
    handleSearch() { this.pagination.pageNum = 1; this.loadTypes(); },
    handleReset() {
      this.searchForm = { dictName: '', dictType: '' };
      this.pagination.pageNum = 1;
      this.loadTypes();
    },
    goDictData(row) {
      this.$router.push({ path: '/admin/dict/data', query: { dictType: row.dictType, dictName: row.dictName } });
    },
    openTypeAdd() {
      this.isTypeEdit = false; this.typeDialogTitle = '新增字典类型';
      this.typeForm = { dictId: null, dictName: '', dictType: '', status: 1, remark: '' };
      this.typeDialogVisible = true;
      this.$nextTick(() => this.$refs.typeForm && this.$refs.typeForm.clearValidate());
    },
    openTypeEdit(row) {
      this.isTypeEdit = true; this.typeDialogTitle = '编辑字典类型';
      this.typeForm = { ...row };
      this.typeDialogVisible = true;
      this.$nextTick(() => this.$refs.typeForm && this.$refs.typeForm.clearValidate());
    },
    handleTypeSubmit() {
      this.$refs.typeForm.validate(valid => {
        if (!valid) return;
        this.typeSubmitting = true;
        const api = this.isTypeEdit ? updateDictType(this.typeForm) : addDictType(this.typeForm);
        api.then(() => { this.$message.success(this.isTypeEdit ? '修改成功' : '新增成功'); clearDictCache(); this.typeDialogVisible = false; this.loadTypes(); })
          .catch(() => {}).finally(() => { this.typeSubmitting = false; });
      });
    },
    handleDeleteType(row) {
      this.$confirm(`确认删除字典类型「${row.dictName}」及其所有数据？`, '删除确认', { type: 'warning' })
        .then(() => deleteDictType(row.dictId))
        .then(() => { this.$message.success('已删除'); clearDictCache(); this.loadTypes(); })
        .catch(() => {});
    }
  }
};
</script>