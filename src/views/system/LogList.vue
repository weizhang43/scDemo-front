<template>
  <div class="log-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">操作日志</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="info" size="small" icon="el-icon-download" :loading="exporting" @click="handleExport">导出</el-button>
        </div>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.uName" placeholder="操作人用户名" prefix-icon="el-icon-user" clearable style="width: 160px;" @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="searchForm.module" placeholder="所属模块" clearable style="width: 140px;" @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.opType" placeholder="全部" clearable style="width: 130px;">
            <el-option v-for="(item, key) in opTypeMap" :key="key" :label="item.label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 110px;">
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            style="width: 360px;"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button size="small" icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无日志数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="uName" label="操作人" min-width="110" align="center">
          <template slot-scope="scope">
            <span class="cell-strong">{{ scope.row.uName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" min-width="110" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.module || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="opType" label="操作类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="opTypeTag(scope.row.opType)" size="small" effect="light">
              {{ opTypeText(scope.row.opType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="140" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="requestUri" label="请求地址" min-width="170" align="center">
          <template slot-scope="scope">
            <span class="cell-id">{{ scope.row.requestMethod }} {{ scope.row.requestUri }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" min-width="120" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.ip || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="costMs" label="耗时" width="90" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.costMs == null ? '-' : scope.row.costMs + 'ms' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="结果" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="160" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="openDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 日志详情弹窗 -->
    <el-dialog title="日志详情" :visible.sync="detailVisible" width="560px">
      <el-descriptions v-if="currentRow" :column="2" border size="small">
        <el-descriptions-item label="操作人">{{ currentRow.uName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人ID">{{ currentRow.uId == null ? '-' : currentRow.uId }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentRow.module || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ opTypeText(currentRow.opType) }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ currentRow.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求地址" :span="2">{{ currentRow.requestMethod }} {{ currentRow.requestUri }}</el-descriptions-item>
        <el-descriptions-item label="目标方法" :span="2">{{ currentRow.method || '-' }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ currentRow.ip || '-' }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentRow.costMs == null ? '-' : currentRow.costMs + 'ms' }}</el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="currentRow.status === 1 ? 'success' : 'danger'" size="small">
            {{ currentRow.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatTime(currentRow.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="detail-pre">{{ currentRow.requestParams || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <pre class="detail-pre">{{ currentRow.responseSummary || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.status !== 1" label="异常信息" :span="2">
          <pre class="detail-pre detail-error">{{ currentRow.errorMsg || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOperationLogPage, exportOperationLog } from '../../api/log';
import { downloadBlob } from '../../utils/export';

const OP_TYPE_MAP = {
  QUERY: { label: '查询', type: 'info' },
  ADD: { label: '新增', type: 'success' },
  UPDATE: { label: '修改', type: 'primary' },
  DELETE: { label: '删除', type: 'danger' },
  LOGIN: { label: '登录', type: 'warning' },
  EXPORT: { label: '导出', type: 'info' },
  OTHER: { label: '其他', type: 'info' }
};

export default {
  name: 'LogList',
  data() {
    return {
      opTypeMap: OP_TYPE_MAP,
      searchForm: { uName: '', module: '', opType: '', status: '', timeRange: [] },
      tableData: [],
      loading: false,
      pagination: { pageNum: 1, pageSize: 10, total: 0 },
      detailVisible: false,
      currentRow: null,
      exporting: false
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      const params = {
        uName: this.searchForm.uName || '',
        module: this.searchForm.module || '',
        opType: this.searchForm.opType || '',
        status: this.searchForm.status === '' || this.searchForm.status === null ? '' : this.searchForm.status,
        beginTime: (this.searchForm.timeRange && this.searchForm.timeRange[0]) || '',
        endTime: (this.searchForm.timeRange && this.searchForm.timeRange[1]) || '',
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      };
      getOperationLogPage(params)
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.pagination.total = page.total || 0;
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    handleSearch() {
      this.pagination.pageNum = 1;
      this.fetchData();
    },
    handleReset() {
      this.searchForm = { uName: '', module: '', opType: '', status: '', timeRange: [] };
      this.pagination.pageNum = 1;
      this.fetchData();
    },
    handleExport() {
      const params = {
        uName: this.searchForm.uName || '',
        module: this.searchForm.module || '',
        opType: this.searchForm.opType || '',
        status: this.searchForm.status === '' || this.searchForm.status === null ? '' : this.searchForm.status,
        beginTime: (this.searchForm.timeRange && this.searchForm.timeRange[0]) || '',
        endTime: (this.searchForm.timeRange && this.searchForm.timeRange[1]) || ''
      };
      this.exporting = true;
      exportOperationLog(params)
        .then(res => downloadBlob(res, '操作日志.xlsx'))
        .catch(() => {})
        .finally(() => { this.exporting = false; });
    },
    handlePageChange(pageNum) {
      this.pagination.pageNum = pageNum;
      this.fetchData();
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.pageNum = 1;
      this.fetchData();
    },
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    opTypeText(t) {
      return (OP_TYPE_MAP[t] || {}).label || t || '-';
    },
    opTypeTag(t) {
      return (OP_TYPE_MAP[t] || {}).type || 'info';
    },
    formatTime(t) {
      if (!t) return '-';
      if (typeof t === 'string') return t.replace('T', ' ').substring(0, 19);
      const d = new Date(t);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    openDetail(row) {
      this.currentRow = row;
      this.detailVisible = true;
    }
  }
};
</script>

<style scoped>
.log-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.header-meta {
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.4;
}
.search-form {
  margin-bottom: 18px;
  padding: 18px 20px 2px;
  background: #fafbfd;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: flex-start;
}
.search-form >>> .el-form-item {
  margin-bottom: 16px;
}
.search-actions {
  margin-left: auto !important;
}
.search-actions >>> .el-form-item__content {
  margin-left: 0 !important;
}
.search-form .el-button {
  border-radius: 8px;
}
.cell-id {
  font-family: var(--font-mono);
  color: #4c5163;
  font-size: 13px;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
}
.cell-text {
  color: #4a5568;
  font-size: 13px;
}
.detail-pre {
  margin: 0;
  max-height: 160px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  color: #4a5568;
}
.detail-error {
  color: #e53e3e;
}
</style>

<style>
.log-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.log-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.log-list .el-card__body {
  padding: 20px 24px 12px;
}
</style>
