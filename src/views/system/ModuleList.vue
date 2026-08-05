<template>
  <div class="module-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">权限列表</span>
          <span class="header-meta">共 {{ total }} 个权限节点</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd(null)">新增顶级权限</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="fetchTree">刷新</el-button>
        </div>
      </div>

      <div class="tree-wrap">
        <el-tree
          v-loading="loading"
          :data="treeData"
          :props="treeProps"
          node-key="id"
          :default-expand-all="true"
          :expand-on-click-node="false"
          @node-contextmenu="onContextMenu"
        >
          <span class="tree-node" slot-scope="{ data }">
            <span class="node-name">
              <i :class="data.type === 'MENU' ? 'el-icon-menu' : 'el-icon-c-scale-to-original'" />
              <span class="name-text">{{ data.name }}</span>
              <el-tag :type="data.type === 'MENU' ? 'primary' : 'warning'" size="mini" effect="light">
                {{ data.type === 'MENU' ? '菜单' : '按钮' }}
              </el-tag>
              <span v-if="data.permission" class="node-perm">{{ data.permission }}</span>
              <span v-if="data.url" class="node-url">{{ data.url }}</span>
              <el-tag :type="data.status === 1 ? 'success' : 'info'" size="mini" effect="plain">
                {{ data.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </span>
          </span>
        </el-tree>
      </div>

      <!-- 右键菜单 -->
      <ul
        v-show="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <li @click="onMenuAdd">
          <i class="el-icon-plus" />新增子项
        </li>
        <li @click="onMenuEdit">
          <i class="el-icon-edit" />编辑
        </li>
        <li class="danger" @click="onMenuDelete">
          <i class="el-icon-delete" />删除
        </li>
      </ul>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" :close-on-click-modal="false">
      <el-form ref="moduleForm" :model="moduleForm" :rules="rules" label-width="90px">
        <el-form-item label="父节点">
          <el-cascader
            v-model="moduleForm.parentPath"
            :options="parentOptions"
            :props="{ checkStrictly: true, emitPath: false, value: 'id', label: 'name', children: 'children' }"
            placeholder="顶级节点"
            clearable
            style="width:100%;"
            @change="val => { moduleForm.parentId = val || 0; }"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="moduleForm.name" placeholder="菜单或按钮名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="moduleForm.type">
            <el-radio label="MENU">菜单</el-radio>
            <el-radio label="BTN">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="moduleForm.permission" placeholder="如 user:list" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="moduleForm.url" placeholder="菜单访问路径" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="moduleForm.icon" placeholder="可选" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="moduleForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="moduleForm.status">
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
  </div>
</template>

<script>
import { getModuleTree, addModule, updateModule, deleteModule } from '../../api/module';

export default {
  name: 'ModuleList',
  data() {
    return {
      loading: false,
      saving: false,
      treeData: [],
      total: 0,
      dialogVisible: false,
      dialogTitle: '新增权限',
      moduleForm: this.emptyForm(),
      treeProps: { label: 'name', children: 'children' },
      contextMenu: { visible: false, x: 0, y: 0, node: null },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    };
  },
  computed: {
    parentOptions() {
      // 仅菜单可作为父节点
      const filter = nodes => (nodes || []).map(n => ({
        id: n.id,
        name: n.name,
        children: n.children && n.children.length ? filter(n.children) : undefined
      }));
      return filter(this.treeData);
    }
  },
  created() {
    this.fetchTree();
    window.addEventListener('click', this.closeContextMenu);
    window.addEventListener('resize', this.closeContextMenu);
  },
  beforeDestroy() {
    window.removeEventListener('click', this.closeContextMenu);
    window.removeEventListener('resize', this.closeContextMenu);
  },
  methods: {
    onContextMenu(event, data) {
      event.preventDefault();
      this.contextMenu.node = data;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
    },
    closeContextMenu() {
      this.contextMenu.visible = false;
    },
    onMenuAdd(e) {
      e && e.stopPropagation();
      const node = this.contextMenu.node;
      this.closeContextMenu();
      this.openAdd(node);
    },
    onMenuEdit(e) {
      e && e.stopPropagation();
      const node = this.contextMenu.node;
      this.closeContextMenu();
      this.openEdit(node);
    },
    onMenuDelete(e) {
      e && e.stopPropagation();
      const node = this.contextMenu.node;
      this.closeContextMenu();
      this.handleDelete(node);
    },
    emptyForm() {
      return { id: null, parentId: 0, parentPath: null, name: '', type: 'MENU', permission: '', url: '', icon: '', sort: 0, status: 1 };
    },
    fetchTree() {
      this.loading = true;
      getModuleTree()
        .then(res => {
          this.treeData = res.dataList || [];
          this.total = this.countNodes(this.treeData);
        })
        .finally(() => { this.loading = false; });
    },
    countNodes(nodes) {
      let n = 0;
      for (const m of (nodes || [])) {
        n += 1;
        if (m.children && m.children.length) n += this.countNodes(m.children);
      }
      return n;
    },
    openAdd(row) {
      this.dialogTitle = row ? `新增子项到 [${row.name}]` : '新增顶级权限';
      this.moduleForm = this.emptyForm();
      if (row) {
        this.moduleForm.parentId = row.id;
        this.moduleForm.parentPath = row.id;
      }
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.moduleForm && this.$refs.moduleForm.clearValidate());
    },
    openEdit(row) {
      this.dialogTitle = '编辑权限';
      this.moduleForm = Object.assign(this.emptyForm(), {
        id: row.id,
        parentId: row.parentId || 0,
        parentPath: row.parentId && row.parentId !== 0 ? row.parentId : null,
        name: row.name,
        type: row.type,
        permission: row.permission,
        url: row.url,
        icon: row.icon,
        sort: row.sort,
        status: row.status
      });
      this.dialogVisible = true;
    },
    handleSave() {
      this.$refs.moduleForm.validate(valid => {
        if (!valid) return;
        if (!this.moduleForm.parentId) this.moduleForm.parentId = 0;
        this.saving = true;
        const action = this.moduleForm.id ? updateModule : addModule;
        const payload = Object.assign({}, this.moduleForm);
        delete payload.parentPath;
        action(payload)
          .then(() => {
            this.$message.success('保存成功');
            this.dialogVisible = false;
            this.fetchTree();
          })
          .finally(() => { this.saving = false; });
      });
    },
    handleDelete(row) {
      this.$confirm(`确认删除权限 [${row.name}]?若有子节点请先处理。`, '提示', { type: 'warning' })
        .then(() => {
          deleteModule(row.id).then(() => {
            this.$message.success('删除成功');
            this.fetchTree();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.module-list { max-width: 1200px; margin: 0 auto; }

.tree-wrap {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px;
  min-height: 240px;
}
.tree-wrap >>> .el-tree-node__content {
  height: 40px;
  border-radius: 4px;
  padding-right: 8px;
  transition: background-color 0.15s ease;
}
.tree-wrap >>> .el-tree-node__content:hover {
  background-color: #f3f6fb;
}
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 12px;
}
.node-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.node-name > i {
  color: #2a5298;
  font-size: 15px;
}
.name-text {
  font-weight: 600;
  color: #2d3748;
  min-width: 120px;
}
.node-perm {
  color: #718096;
  font-size: 12px;
  font-family: Consolas, Monaco, monospace;
  background: #f1f3f7;
  padding: 1px 8px;
  border-radius: 3px;
}
.node-url {
  color: #409eff;
  font-size: 12px;
  font-family: Consolas, Monaco, monospace;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 3000;
  margin: 0;
  padding: 6px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0,0,0.12);
  min-width: 140px;
  user-select: none;
}
.context-menu li {
  padding: 8px 16px;
  font-size: 13px;
  color: #2d3748;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.context-menu li:hover {
  background: #f3f6fb;
  color: #2a5298;
}
.context-menu li.danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
