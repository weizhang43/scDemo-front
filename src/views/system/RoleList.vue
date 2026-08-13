<template>
  <div class="role-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">角色列表</span>
          <span class="header-meta">共 {{ tableData.length }} 个角色</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">新增角色</el-button>
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
        empty-text="暂无角色数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="code" label="角色编码" min-width="140" />
        <el-table-column prop="name" label="角色名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="mini" effect="light">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button type="text" icon="el-icon-set-up" @click="openAssign(scope.row)">授权</el-button>
            <el-button type="text" icon="el-icon-delete" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" :close-on-click-modal="false">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="如 admin" :disabled="!!roleForm.id" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>

    <!-- 授权弹窗 -->
    <el-dialog
      :title="`角色授权 - ${currentRole ? currentRole.name : ''}`"
      :visible.sync="assignVisible"
      width="560px"
      :close-on-click-modal="false"
    >
      <div class="assign-tip">
        为 <b>{{ currentRole && currentRole.name }}</b> 勾选需要授予的权限:
      </div>
      <div class="assign-tree-wrap">
        <el-tree
          ref="moduleTree"
          :data="moduleTree"
          :props="treeProps"
          node-key="id"
          show-checkbox
          :default-expand-all="true"
          :default-checked-keys="checkedKeys"
          :check-strictly="false"
        >
          <span slot-scope="{ data }" class="assign-node">
            <span>{{ data.name }}</span>
            <span class="assign-node-meta">[{{ data.type }}] {{ data.permission }}</span>
          </span>
        </el-tree>
      </div>
      <div slot="footer">
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleAssign">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, addRole, updateRole, deleteRole, getRoleModuleIds, assignRoleModules } from '../../api/role';
import { getModuleTree } from '../../api/module';

export default {
  name: 'RoleList',
  data() {
    return {
      loading: false,
      saving: false,
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增角色',
      roleForm: { id: null, code: '', name: '', description: '', status: 1 },
      rules: {
        code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      assignVisible: false,
      currentRole: null,
      moduleTree: [],
      checkedKeys: [],
      treeProps: { label: 'name', children: 'children' }
    };
  },
  created() {
    this.fetchList();
  },
  methods: {
    fetchList() {
      this.loading = true;
      getRoleList()
        .then(res => {
          this.tableData = res.dataList || [];
        })
        .finally(() => { this.loading = false; });
    },
    openAdd() {
      this.dialogTitle = '新增角色';
      this.roleForm = { id: null, code: '', name: '', description: '', status: 1 };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.roleForm && this.$refs.roleForm.clearValidate());
    },
    openEdit(row) {
      this.dialogTitle = '编辑角色';
      this.roleForm = Object.assign({}, row);
      this.dialogVisible = true;
    },
    handleSave() {
      this.$refs.roleForm.validate(valid => {
        if (!valid) return;
        this.saving = true;
        const action = this.roleForm.id ? updateRole : addRole;
        action(this.roleForm)
          .then(() => {
            this.$message.success('保存成功');
            this.dialogVisible = false;
            this.fetchList();
          })
          .finally(() => { this.saving = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除角色 [${row.name}]?该角色已绑定的用户和权限将解除关联。`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteRole(row.id).then(() => {
          this.$message.success('删除成功');
          this.fetchList();
        });
      }).catch(() => {});
    },
    openAssign(row) {
      this.currentRole = row;
      this.assignVisible = true;
      this.checkedKeys = [];
      Promise.all([getModuleTree(), getRoleModuleIds(row.id)])
        .then(([treeRes, idsRes]) => {
          this.moduleTree = treeRes.dataList || [];
          // 已存 ID 含半选父节点，直接 setCheckedKeys 会把父节点下未授权的子节点全勾上，只回显叶子
          const leafIds = this.collectLeafIds(this.moduleTree);
          this.checkedKeys = (idsRes.dataList || []).filter(id => leafIds.has(id));
          this.$nextTick(() => {
            if (this.$refs.moduleTree) {
              this.$refs.moduleTree.setCheckedKeys(this.checkedKeys);
            }
          });
        });
    },
    collectLeafIds(nodes) {
      const ids = new Set();
      const walk = list => {
        (list || []).forEach(n => {
          if (n.children && n.children.length) {
            walk(n.children);
          } else {
            ids.add(n.id);
          }
        });
      };
      walk(nodes);
      return ids;
    },
    handleAssign() {
      const checked = this.$refs.moduleTree.getCheckedKeys();
      const half = this.$refs.moduleTree.getHalfCheckedKeys();
      const all = checked.concat(half);
      this.saving = true;
      assignRoleModules(this.currentRole.id, all)
        .then(() => {
          this.$message.success('授权成功');
          this.assignVisible = false;
        })
        .finally(() => { this.saving = false; });
    }
  }
};
</script>

<style scoped>
.role-list { max-width: 1200px; margin: 0 auto; }
.assign-tip {
  margin-bottom: 10px;
  color: #666;
}
.assign-tree-wrap {
  max-height: 420px;
  overflow-y: auto;
  padding: 10px 8px;
  border: 1px solid #eef0f4;
  border-radius: var(--radius-md);
  background: #fafbfd;
}
.assign-tree-wrap >>> .el-tree {
  background: transparent;
}
.assign-tree-wrap >>> .el-tree-node__content {
  height: 32px;
  border-radius: 6px;
}
.assign-tree-wrap >>> .el-tree-node__content:hover {
  background: rgba(102, 126, 234, 0.08);
}
.assign-node-meta {
  color: #9aa3b2;
  font-size: 12px;
  margin-left: 6px;
}
</style>
