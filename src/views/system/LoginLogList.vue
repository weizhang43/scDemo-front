<template>
  <div class="login-log list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">登录日志</span>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-bar" @submit.native.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.uName" placeholder="搜索用户名" clearable style="width:160px;" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.ip" placeholder="搜索IP" clearable style="width:160px;" />
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width:260px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tableData"
        border stripe
        style="width:100%;"
        :header-cell-style="{ background:'#f5f7fb', color:'#4a5568', fontWeight:600, textAlign:'center' }"
        :cell-style="{ textAlign:'center' }"
        empty-text="暂无登录记录"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="uName" label="用户名" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-user cell-icon" />{{ scope.row.uName }}
          </template>
        </el-table-column>
        <el-table-column prop="uType" label="角色" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="roleTagType(scope.row.uType)" size="mini" effect="light">{{ roleText(scope.row.uType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" min-width="160">
          <template slot-scope="scope">
            <i class="el-icon-monitor cell-icon" />{{ scope.row.ip || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="登录时间" width="180" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon" />{{ formatTime(scope.row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small" effect="light">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="备注" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.msg || '-' }}</template>
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
    </el-card>
  </div>
</template>

<script>
import { getLoginLogPage } from '../../api/loginLog';
import { formatTime } from '../../utils/format';

export default {
  name: 'LoginLogList',
  data() {
    return {
      loading: false,
      searchForm: { uName: '', ip: '', dateRange: null },
      tableData: [],
      pagination: { pageNum: 1, pageSize: 10, total: 0 }
    };
  },
  created() { this.fetchData(); },
  methods: {
    formatTime,
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    fetchData() {
      this.loading = true;
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      };
      if (this.searchForm.uName) params.uName = this.searchForm.uName;
      if (this.searchForm.ip) params.ip = this.searchForm.ip;
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        params.loginTimeStart = this.searchForm.dateRange[0];
        params.loginTimeEnd = this.searchForm.dateRange[1];
      }
      getLoginLogPage(params)
        .then(res => {
          const page = (res && res.daoResult) || {};
          this.tableData = page.records || [];
          this.pagination.total = Number(page.total) || 0;
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    handleSearch() { this.pagination.pageNum = 1; this.fetchData(); },
    handleReset() {
      this.searchForm = { uName: '', ip: '', dateRange: null };
      this.pagination.pageNum = 1;
      this.fetchData();
    },
    roleText(t) { return ['', '商家', '顾客', '管理员'][t] || '-'; },
    roleTagType(t) { return ['', 'warning', 'success', 'danger'][t] || 'info'; }
  }
};
</script>

<style scoped>
.cell-icon { color: #9aa3b2; margin-right: 6px; }
</style>