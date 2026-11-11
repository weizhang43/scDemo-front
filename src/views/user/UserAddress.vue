<template>
  <div class="user-address list-page" :class="{ 'is-embedded': self }">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">收货地址管理</span>
          <span class="header-meta">
            <template v-if="!self">用户ID #{{ uId }} · </template>共 {{ tableData.length }} 条
          </span>
        </div>
        <div>
          <el-button type="primary" icon="el-icon-plus" class="action-add" @click="openAdd">新增地址</el-button>
          <el-button v-if="!self" type="default" plain icon="el-icon-back" @click="goBack">返回</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border stripe style="width:100%;"
        :header-cell-style="{ background:'#f5f7fb', color:'#4a5568', fontWeight:600 }"
        empty-text="暂无收货地址，点击右上角新增"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="consignee" label="收件人" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-user-solid cell-icon" />{{ scope.row.consignee }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140">
          <template slot-scope="scope"><i class="el-icon-phone cell-icon" />{{ scope.row.phone }}</template>
        </el-table-column>
        <el-table-column label="省市区" min-width="200">
          <template slot-scope="scope">{{ regionText(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="detail" label="详细地址" min-width="240" show-overflow-tooltip />
        <el-table-column prop="isDefault" label="默认" width="90" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isDefault === 1" type="success" size="small" effect="light">默认</el-tag>
            <span v-else class="cell-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" class-name="op-col">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button type="default" plain size="mini" icon="el-icon-edit" class="action-edit" @click="openEdit(scope.row)">编辑</el-button>
              <el-button v-if="scope.row.isDefault !== 1" type="default" plain size="mini" icon="el-icon-star-off" @click="handleSetDefault(scope.row)">设为默认</el-button>
              <el-button type="danger" plain size="mini" icon="el-icon-delete" class="action-delete" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" :close-on-click-modal="false">
      <el-form ref="addrForm" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="收件人" prop="consignee">
          <el-input v-model="form.consignee" placeholder="请输入收件人姓名" maxlength="32" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="省市区" prop="regionSelected">
          <el-cascader
            v-model="form.regionSelected"
            :options="regionOptions"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            placeholder="请选择省市区"
            clearable style="width:100%;"
            @change="handleRegionChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" type="textarea" :rows="2" placeholder="请输入详细地址" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="设为默认" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getMyAddressList, addMyAddress, updateMyAddress, deleteMyAddress, setMyDefaultAddress
} from '../../api/address';
import { getRegionTree } from '../../api/region';

export default {
  name: 'UserAddress',
  props: { self: { type: Boolean, default: false } },
  data() {
    const phoneValidator = (rule, value, callback) => {
      if (!value) { callback(new Error('请输入手机号')); }
      else if (!/^1[3-9]\d{9}$/.test(value)) { callback(new Error('手机号格式不正确')); }
      else { callback(); }
    };
    return {
      uId: null, loading: false, submitting: false,
      dialogVisible: false, isEdit: false, tableData: [], regionOptions: [],
      form: this.emptyForm(),
      rules: {
        consignee: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
        phone: [{ validator: phoneValidator, trigger: 'blur' }],
        regionSelected: [{ required: true, message: '请选择省市区', trigger: 'change' }],
        detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      }
    };
  },
  computed: {
    dialogTitle() { return this.isEdit ? '编辑收货地址' : '新增收货地址'; }
  },
  created() {
    if (!this.self) {
      const id = this.$route.params.id;
      if (!id) { this.$message.error('缺少用户ID'); this.goBack(); return; }
      this.uId = Number(id);
    }
    this.fetchData();
    this.loadRegions();
  },
  methods: {
    emptyForm() {
      return {
        aId: null, uId: null, consignee: '', phone: '',
        province: '', city: '', district: '', regionSelected: [], detail: '', isDefault: 0
      };
    },
    fetchData() {
      this.loading = true;
      const req = this.self ? getMyAddressList() : getAddressList(this.uId);
      req.then(res => { this.tableData = res.dataList || []; }).catch(() => {}).finally(() => { this.loading = false; });
    },
    regionText(row) {
      return [row.province, row.city, row.district].filter(v => v).join(' / ') || '-';
    },
    loadRegions() {
      getRegionTree().then(res => { this.regionOptions = res.daoResult || []; }).catch(() => {});
    },
    handleRegionChange(val) {
      this.form.province = this.regionNameById(val[0]);
      this.form.city = val.length > 1 ? this.regionNameById(val[1]) : '';
      this.form.district = val.length > 2 ? this.regionNameById(val[2]) : '';
    },
    regionNameById(id) {
      for (const p of this.regionOptions) {
        if (p.value === id) return p.label;
        if (p.children) for (const c of p.children) {
          if (c.value === id) return c.label;
          if (c.children) for (const d of c.children) {
            if (d.value === id) return d.label;
          }
        }
      }
      return '';
    },
    findRegionPath(row) {
      const find = (arr, name) => {
        for (const item of arr) {
          if (item.label === name) return [item.value];
          if (item.children) {
            const childPath = find(item.children, name);
            if (childPath) return [item.value].concat(childPath);
          }
        }
        return null;
      };
      return find(this.regionOptions, row.district)
        || find(this.regionOptions, row.city)
        || find(this.regionOptions, row.province)
        || [];
    },
    openAdd() {
      this.isEdit = false;
      this.form = { ...this.emptyForm(), uId: this.uId };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.addrForm && this.$refs.addrForm.clearValidate());
    },
    openEdit(row) {
      this.isEdit = true;
      this.form = { ...this.emptyForm(), ...row, regionSelected: this.findRegionPath(row) };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.addrForm && this.$refs.addrForm.clearValidate());
    },
    handleSubmit() {
      this.$refs.addrForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        let action;
        if (this.self) {
          action = this.isEdit ? updateMyAddress(this.form) : addMyAddress(this.form);
        } else {
          action = this.isEdit ? updateAddress(this.form) : addAddress(this.form);
        }
        action.then(() => { this.$message.success(this.isEdit ? '修改成功' : '新增成功'); this.dialogVisible = false; this.fetchData(); })
          .catch(() => {}).finally(() => { this.submitting = false; });
      });
    },
    handleSetDefault(row) {
      const req = this.self ? setMyDefaultAddress(row.aId) : setDefaultAddress(row.aId, this.uId);
      req.then(() => { this.$message.success('已设为默认'); this.fetchData(); }).catch(() => {});
    },
    handleDelete(row) {
      this.$confirm('确认删除该收货地址吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => (this.self ? deleteMyAddress(row.aId) : deleteAddress(row.aId)))
        .then(() => { this.$message.success('删除成功'); this.fetchData(); }).catch(() => {});
    },
    goBack() { this.$router.back(); }
  }
};
</script>