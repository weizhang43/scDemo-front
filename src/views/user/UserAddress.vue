<template>
  <div class="user-address" :class="{ 'is-embedded': self }">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">收货地址管理</span>
          <span class="header-meta">
            <template v-if="!self">用户ID #{{ uId }} · </template>共 {{ tableData.length }} 条
          </span>
        </div>
        <div>
          <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增地址</el-button>
          <el-button v-if="!self" type="text" icon="el-icon-back" @click="goBack">返回</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600 }"
        empty-text="暂无收货地址，点击右上角新增"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="consignee" label="收件人" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-user-solid cell-icon"></i>
            <span class="cell-strong">{{ scope.row.consignee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140">
          <template slot-scope="scope">
            <i class="el-icon-phone cell-icon"></i>
            <span class="cell-text">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="省市区" min-width="200">
          <template slot-scope="scope">
            <span class="cell-text">{{ regionText(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="详细地址" min-width="240" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-location-outline cell-icon"></i>
            <span class="cell-text">{{ scope.row.detail }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isDefault" label="默认" width="90" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isDefault === 1" type="success" size="small" effect="light">默认</el-tag>
            <span v-else class="cell-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" class-name="op-col">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.isDefault !== 1"
              type="text"
              icon="el-icon-star-off"
              @click="handleSetDefault(scope.row)"
            >设为默认</el-button>
            <el-button type="text" icon="el-icon-delete" class="btn-danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="addrForm" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="收件人" prop="consignee">
          <el-input v-model="form.consignee" placeholder="请输入收件人姓名" maxlength="32" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="省" prop="province">
          <el-input v-model="form.province" placeholder="如：广东省" maxlength="32" clearable />
        </el-form-item>
        <el-form-item label="市" prop="city">
          <el-input v-model="form.city" placeholder="如：深圳市" maxlength="32" clearable />
        </el-form-item>
        <el-form-item label="区/县" prop="district">
          <el-input v-model="form.district" placeholder="如：南山区" maxlength="32" clearable />
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
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getMyAddressList,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setMyDefaultAddress
} from '../../api/address';

export default {
  name: 'UserAddress',
  props: {
    // 嵌在个人主页里时为 true：走 /user/me/address/*，uId 由后端从 X-User-Id 取
    self: { type: Boolean, default: false }
  },
  data() {
    const phoneValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'));
      } else {
        callback();
      }
    };
    return {
      uId: null,
      loading: false,
      submitting: false,
      dialogVisible: false,
      isEdit: false,
      tableData: [],
      form: this.emptyForm(),
      rules: {
        consignee: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
        phone: [{ validator: phoneValidator, trigger: 'blur' }],
        detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑收货地址' : '新增收货地址';
    }
  },
  created() {
    if (!this.self) {
      const id = this.$route.params.id;
      if (!id) {
        this.$message.error('缺少用户ID');
        this.goBack();
        return;
      }
      this.uId = Number(id);
    }
    this.fetchData();
  },
  methods: {
    emptyForm() {
      return {
        aId: null,
        uId: null,
        consignee: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: 0
      };
    },
    fetchData() {
      this.loading = true;
      const req = this.self ? getMyAddressList() : getAddressList(this.uId);
      req
        .then(res => {
          this.tableData = res.dataList || [];
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    regionText(row) {
      return [row.province, row.city, row.district].filter(v => v).join(' / ') || '-';
    },
    openAdd() {
      this.isEdit = false;
      this.form = { ...this.emptyForm(), uId: this.uId };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.addrForm && this.$refs.addrForm.clearValidate());
    },
    openEdit(row) {
      this.isEdit = true;
      this.form = { ...this.emptyForm(), ...row };
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
        action
          .then(() => {
            this.$message.success(this.isEdit ? '修改成功' : '新增成功');
            this.dialogVisible = false;
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    handleSetDefault(row) {
      const req = this.self ? setMyDefaultAddress(row.aId) : setDefaultAddress(row.aId, this.uId);
      req
        .then(() => {
          this.$message.success('已设为默认');
          this.fetchData();
        })
        .catch(() => {});
    },
    handleDelete(row) {
      this.$confirm(`确认删除该收货地址吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => (this.self ? deleteMyAddress(row.aId) : deleteAddress(row.aId)))
        .then(() => {
          this.$message.success('删除成功');
          this.fetchData();
        })
        .catch(() => {});
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.user-address {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
/* 嵌入个人主页时，整页背景与内边距由外层容器接管 */
.user-address.is-embedded {
  min-height: 0;
  padding: 0;
  background: none;
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
.cell-muted {
  color: #a0aec0;
}
.btn-danger {
  color: #f56c6c !important;
}
.btn-danger:hover {
  color: #d9363e !important;
}
</style>

<style>
.user-address .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.user-address .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.user-address .el-card__body {
  padding: 20px 24px;
}
/* 操作列按钮不换行，避免部分行被撑高导致行高错乱 */
.user-address .el-table td.op-col .cell {
  white-space: nowrap;
}
</style>
