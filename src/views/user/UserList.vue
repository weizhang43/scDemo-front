<template>
  <div class="user-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">用户列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="info" size="small" icon="el-icon-download" :loading="exporting" @click="handleExport">导出</el-button>
        </div>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="searchForm.key" placeholder="用户名/姓名/手机号" prefix-icon="el-icon-user" clearable @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.gender" placeholder="全部" clearable style="width: 120px;">
            <el-option label="保密" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="searchForm.birthdayRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 280px;"
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
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无用户数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="uName" label="用户名" min-width="140" align="center">
          <template slot-scope="scope">
            <i class="el-icon-user-solid cell-icon"></i>
            <span class="cell-strong">{{ scope.row.uName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" min-width="140" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.realName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="genderTagType(scope.row.gender)" size="small" effect="light">
              {{ genderText(scope.row.gender) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140" align="center">
          <template slot-scope="scope">
            <i class="el-icon-phone cell-icon"></i>
            <span class="cell-text">{{ scope.row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="生日" width="130" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.birthday || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goDetail(scope.row.uId)">详情</el-button>
            <el-button type="text" icon="el-icon-location-outline" @click="goAddress(scope.row.uId)">收货地址</el-button>
            <el-button type="text" icon="el-icon-s-check" @click="openRole(scope.row)">关联角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNo"
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

    <!-- 关联角色弹窗 -->
    <el-dialog
      :title="`关联角色 - ${currentRow ? (currentRow.realName || currentRow.uName || '') : ''}`"
      :visible.sync="roleDialogVisible"
      width="480px"
      :close-on-click-modal="false"
    >
      <div v-loading="roleLoading">
        <div v-if="roleOptions.length === 0 && !roleLoading" style="color:#999;text-align:center;padding:20px 0;">
          暂无可用角色
        </div>
        <el-checkbox-group v-model="checkedRoleIds" class="role-checkbox-group">
          <el-checkbox
            v-for="r in roleOptions"
            :key="r.id"
            :label="r.id"
            :disabled="r.status !== 1"
            class="role-checkbox-item"
          >
            <span class="role-name">{{ r.name }}</span>
            <span class="role-code">[{{ r.code }}]</span>
            <span v-if="r.status !== 1" class="role-disabled">禁用</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div slot="footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="roleSaving" @click="handleSaveRoles">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, exportUser } from '../../api/user';
import { getRoleList } from '../../api/role';
import { getUserRoleIds, assignUserRoles } from '../../api/userRole';
import { downloadBlob } from '../../utils/export';

const GENDER_MAP = {
  0: { label: '保密', type: 'info' },
  1: { label: '男', type: 'primary' },
  2: { label: '女', type: 'danger' }
};

export default {
  name: 'UserList',
  data() {
    return {
      searchForm: { key: '', gender: '', birthdayRange: [] },
      tableData: [],
      loading: false,
      exporting: false,
      pagination: { pageNo: 1, pageSize: 10, total: 0 },
      // 关联角色
      roleDialogVisible: false,
      roleLoading: false,
      roleSaving: false,
      roleOptions: [],
      checkedRoleIds: [],
      currentRow: null
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      const params = {
        key: this.searchForm.key || '',
        gender: this.searchForm.gender === '' || this.searchForm.gender === null ? '' : this.searchForm.gender,
        birthdayStart: (this.searchForm.birthdayRange && this.searchForm.birthdayRange[0]) || '',
        birthdayEnd: (this.searchForm.birthdayRange && this.searchForm.birthdayRange[1]) || '',
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize
      };
      getUserList(params)
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
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleReset() {
      this.searchForm.key = '';
      this.searchForm.gender = '';
      this.searchForm.birthdayRange = [];
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handlePageChange(pageNo) {
      this.pagination.pageNo = pageNo;
      this.fetchData();
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    indexMethod(index) {
      return (this.pagination.pageNo - 1) * this.pagination.pageSize + index + 1;
    },
    genderText(g) {
      return (GENDER_MAP[g] || {}).label || '未知';
    },
    genderTagType(g) {
      return (GENDER_MAP[g] || {}).type || 'info';
    },
    goDetail(uId) {
      this.$router.push({ path: '/profile', query: { id: uId } });
    },
    goAddress(uId) {
      this.$router.push(`/user/${uId}/address`);
    },
    openRole(row) {
      this.currentRow = row;
      this.checkedRoleIds = [];
      this.roleDialogVisible = true;
      this.roleLoading = true;
      Promise.all([
        this.roleOptions.length ? Promise.resolve({ dataList: this.roleOptions }) : getRoleList(),
        getUserRoleIds(row.uId)
      ])
        .then(([roleRes, idsRes]) => {
          this.roleOptions = roleRes.dataList || [];
          this.checkedRoleIds = idsRes.daoResult || [];
        })
        .finally(() => { this.roleLoading = false; });
    },
    handleSaveRoles() {
      this.roleSaving = true;
      assignUserRoles(this.currentRow.uId, this.checkedRoleIds)
        .then(() => {
          this.$message.success('关联成功');
          this.roleDialogVisible = false;
        })
        .finally(() => { this.roleSaving = false; });
    },
    handleExport() {
      const params = {
        key: this.searchForm.key || '',
        gender: this.searchForm.gender === '' || this.searchForm.gender === null ? '' : this.searchForm.gender,
        birthdayStart: (this.searchForm.birthdayRange && this.searchForm.birthdayRange[0]) || '',
        birthdayEnd: (this.searchForm.birthdayRange && this.searchForm.birthdayRange[1]) || ''
      };
      this.exporting = true;
      exportUser(params)
        .then(res => downloadBlob(res, '用户列表.xlsx'))
        .catch(() => {})
        .finally(() => { this.exporting = false; });
    }
  }
};
</script>

<style scoped>
.user-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2733;
  position: relative;
  padding-left: 12px;
  line-height: 1;
}
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.header-meta {
  font-size: 13px;
  color: #8a93a4;
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
.pagination-wrap {
  margin-top: 18px;
  padding: 14px 4px 4px;
  text-align: right;
  border-top: 1px dashed #e8ebf2;
}
.cell-id {
  font-family: 'Menlo', 'Consolas', monospace;
  color: #4c5163;
  font-size: 13px;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
}
.cell-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.cell-text {
  color: #4a5568;
  font-size: 13px;
}
</style>

<style>
.user-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.user-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.user-list .el-card__body {
  padding: 20px 24px 12px;
}
</style>
