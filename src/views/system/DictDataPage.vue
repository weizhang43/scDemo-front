<template>
  <div class="dict-data list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <el-button type="default" plain icon="el-icon-back" @click="goBack">返回</el-button>
          <span class="card-title">字典数据管理 — {{ dictName }}</span>
        </div>
        <div>
          <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent="handleSearch">
        <el-form-item label="字典标签">
          <el-input v-model="searchForm.dictLabel" placeholder="搜索字典标签" clearable style="width:200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="dataList"
        border stripe
        style="width:100%;"
        :header-cell-style="{ background:'#f5f7fb', color:'#4a5568', fontWeight:600 }"
        empty-text="暂无字典数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="140" />
        <el-table-column prop="dictValue" label="字典键值" min-width="140" />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small" effect="light">{{ scope.row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" class-name="op-col">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button type="default" plain size="mini" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="danger" plain size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
          @current-change="fetchData"
        />
      </div>

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" :close-on-click-modal="false">
        <el-form ref="dataForm" :model="form" :rules="rules" label-width="90px">
          <el-form-item label="字典标签" prop="dictLabel">
            <el-input v-model="form.dictLabel" placeholder="如：广东" maxlength="64" />
          </el-form-item>
          <el-form-item label="字典键值" prop="dictValue">
            <el-input v-model="form.dictValue" placeholder="如：guangdong" maxlength="64" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width:120px;" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" placeholder="备注" maxlength="200" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getDictDataList, addDictData, updateDictData, deleteDictData } from '../../api/dict';
import { formatTime } from '../../utils/format';
import { clearDictCache } from '../../utils/dictCache';

export default {
  name: 'DictDataPage',
  data() {
    return {
      loading: false, submitting: false,
      dictType: '', dictName: '',
      searchForm: { dictLabel: '' },
      dataList: [],
      pagination: { pageNum: 1, pageSize: 10, total: 0 },
      dialogVisible: false, dialogTitle: '', isEdit: false,
      form: { dataId: null, dictLabel: '', dictValue: '', sortOrder: 0, status: 1, remark: '' },
      rules: {
        dictLabel: [{ required: true, message: '请输入标签', trigger: 'blur' }],
        dictValue: [{ required: true, message: '请输入键值', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.dictType = this.$route.query.dictType || '';
    this.dictName = this.$route.query.dictName || '';
    if (!this.dictType) {
      this.$message.error('缺少字典类型参数');
      this.goBack();
      return;
    }
    this.fetchData();
  },
  methods: {
    formatTime,
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    fetchData() {
      this.loading = true;
      getDictDataList(this.dictType)
        .then(res => {
          let list = res.dataList || [];
          if (this.searchForm.dictLabel) {
            list = list.filter(d => d.dictLabel && d.dictLabel.indexOf(this.searchForm.dictLabel) > -1);
          }
          this.pagination.total = list.length;
          const start = (this.pagination.pageNum - 1) * this.pagination.pageSize;
          this.dataList = list.slice(start, start + this.pagination.pageSize);
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    handleSearch() { this.pagination.pageNum = 1; this.fetchData(); },
    handleReset() {
      this.searchForm = { dictLabel: '' };
      this.pagination.pageNum = 1;
      this.fetchData();
    },
    openAdd() {
      this.isEdit = false; this.dialogTitle = '新增字典数据';
      this.form = { dataId: null, dictLabel: '', dictValue: '', sortOrder: 0, status: 1, remark: '' };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.dataForm && this.$refs.dataForm.clearValidate());
    },
    openEdit(row) {
      this.isEdit = true; this.dialogTitle = '编辑字典数据';
      this.form = { ...row };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.dataForm && this.$refs.dataForm.clearValidate());
    },
    handleSubmit() {
      this.$refs.dataForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const payload = { ...this.form, dictType: this.dictType };
        const api = this.isEdit ? updateDictData(payload) : addDictData(payload);
        api.then(() => { this.$message.success(this.isEdit ? '修改成功' : '新增成功'); clearDictCache(); this.dialogVisible = false; this.fetchData(); })
          .catch(() => {}).finally(() => { this.submitting = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除「${row.dictLabel}」？`, '提示', { type: 'warning' })
        .then(() => deleteDictData(row.dataId))
        .then(() => { this.$message.success('已删除'); clearDictCache(); this.fetchData(); })
        .catch(() => {});
    },
    goBack() {
      this.$router.push('/admin/dict');
    }
  }
};
</script>