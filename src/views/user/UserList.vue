<template>
  <div class="user-list list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">用户列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">新增用户</el-button>
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

      <el-tabs v-model="activeUType" class="utype-tabs pill-tabs" @tab-click="handleUTypeTab">
        <el-tab-pane v-for="tab in uTypeTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
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
        <el-table-column prop="uType" label="用户类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="uTypeTagType(scope.row.uType)" size="small" effect="light">
              {{ uTypeText(scope.row.uType) }}
            </el-tag>
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
        <el-table-column prop="email" label="邮箱" min-width="180" align="center">
          <template slot-scope="scope">
            <i class="el-icon-message cell-icon"></i>
            <span class="cell-text">{{ scope.row.email || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="生日" width="130" align="center">
          <template slot-scope="scope">
            <span class="cell-text">{{ scope.row.birthday || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goDetail(scope.row.uId)">详情</el-button>
            <el-button type="text" icon="el-icon-location-outline" @click="goAddress(scope.row.uId)">收货地址</el-button>
            <el-button type="text" icon="el-icon-s-check" @click="openRole(scope.row)">关联角色</el-button>
            <el-button
              v-if="$store.getters.hasPerm('user:delete')"
              type="text"
              icon="el-icon-delete"
              class="danger-btn"
              @click="handleDelete(scope.row)"
            >删除</el-button>
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
            :class="{ 'is-checked-card': checkedRoleIds.includes(r.id) }"
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

    <!-- 新增用户弹窗 -->
    <el-dialog
      title="新增用户"
      :visible.sync="addDialogVisible"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetAddForm"
    >
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="90px">
        <el-form-item label="用户名" prop="uName">
          <el-input v-model="addForm.uName" placeholder="请输入用户名" maxlength="64" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="用户类型" prop="uType">
          <el-radio-group v-model="addForm.uType">
            <el-radio :label="1">商家</el-radio>
            <el-radio :label="2">顾客</el-radio>
            <el-radio :label="3">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="addForm.realName" placeholder="选填" maxlength="64" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="选填" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="addForm.gender">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSaving" @click="handleSaveAdd">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, exportUser, addUser, deleteUser } from '../../api/user';
import { getRoleList } from '../../api/role';
import { getUserRoleIds, assignUserRoles } from '../../api/userRole';
import { downloadBlob } from '../../utils/export';

const GENDER_MAP = {
  0: { label: '保密', type: 'info' },
  1: { label: '男', type: 'primary' },
  2: { label: '女', type: 'danger' }
};

const U_TYPE_MAP = {
  1: { label: '商家', type: 'warning' },
  2: { label: '顾客', type: 'success' },
  3: { label: '管理员', type: 'primary' }
};

export default {
  name: 'UserList',
  data() {
    return {
      searchForm: { key: '', uType: '', gender: '', birthdayRange: [] },
      activeUType: 'all',
      uTypeTabs: [
        { name: 'all', label: '全部' },
        { name: '1', label: '商家' },
        { name: '2', label: '顾客' },
        { name: '3', label: '管理员' }
      ],
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
      currentRow: null,
      // 新增用户
      addDialogVisible: false,
      addSaving: false,
      addForm: { uName: '', password: '', uType: 2, realName: '', phone: '', email: '', gender: 0 },
      addRules: {
        uName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少 6 位', trigger: 'blur' }
        ],
        uType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        phone: [{ pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }],
        email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
      }
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
        uType: this.searchForm.uType === '' || this.searchForm.uType === null ? '' : this.searchForm.uType,
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
      this.searchForm.uType = '';
      this.activeUType = 'all';
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
    handleUTypeTab(tab) {
      this.searchForm.uType = tab.name === 'all' ? '' : Number(tab.name);
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
    uTypeText(t) {
      return (U_TYPE_MAP[t] || {}).label || '-';
    },
    uTypeTagType(t) {
      return (U_TYPE_MAP[t] || {}).type || 'info';
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
          this.checkedRoleIds = idsRes.dataList || [];
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
    openAdd() {
      this.addDialogVisible = true;
    },
    resetAddForm() {
      this.addForm = { uName: '', password: '', uType: 2, realName: '', phone: '', email: '', gender: 0 };
      if (this.$refs.addForm) {
        this.$refs.addForm.clearValidate();
      }
    },
    handleSaveAdd() {
      this.$refs.addForm.validate(valid => {
        if (!valid) return;
        this.addSaving = true;
        addUser({ ...this.addForm })
          .then(() => {
            this.$message.success('新增成功');
            this.addDialogVisible = false;
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => { this.addSaving = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确定删除用户「${row.realName || row.uName}」吗？删除后该账号将无法登录。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .then(() => deleteUser(row.uId))
        .then(res => {
          if (!res) return;
          this.$message.success('删除成功');
          if (this.tableData.length === 1 && this.pagination.pageNo > 1) {
            this.pagination.pageNo -= 1;
          }
          this.fetchData();
        })
        .catch(() => {});
    },
    handleExport() {
      const params = {
        key: this.searchForm.key || '',
        uType: this.searchForm.uType === '' || this.searchForm.uType === null ? '' : this.searchForm.uType,
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
.search-form {
  margin-bottom: 18px;
  padding: 18px 20px 2px;
  background: #fafbfd;
  border: 1px solid #eef0f4;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-sm);
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
.cell-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.cell-text {
  color: #4a5568;
  font-size: 13px;
}
.danger-btn {
  color: #f56c6c;
}
.danger-btn:hover,
.danger-btn:focus {
  color: #f78989;
}
/* 关联角色弹框：整行可点的边框卡片 */
.role-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding: 2px;
}
.role-checkbox-item {
  display: flex;
  align-items: center;
  margin: 0 !important;
  padding: 12px 14px;
  border: 1px solid #e6e9f0;
  border-radius: var(--radius-md);
  background: #fafbfd;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.role-checkbox-item:hover {
  border-color: var(--color-primary, var(--color-primary));
}
.role-checkbox-item.is-checked-card {
  border-color: var(--color-primary, var(--color-primary));
  background: rgba(102, 126, 234, 0.06);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
}
.role-checkbox-item.is-disabled {
  opacity: 0.6;
}
.role-name {
  font-weight: 600;
  color: #1f2733;
}
.role-code {
  margin-left: 8px;
  font-size: 12px;
  color: #9aa3b2;
  font-family: var(--font-mono);
}
.role-disabled {
  margin-left: 8px;
  font-size: 12px;
  color: #f56c6c;
}
</style>

<style>
.user-list .utype-tabs {
  margin-bottom: 18px;
}
</style>
