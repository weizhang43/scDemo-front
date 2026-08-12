<template>
  <el-dialog
    :title="mode === 'add' ? '新增商品' : '编辑商品'"
    :visible="visible"
    width="560px"
    :close-on-click-modal="false"
    @update:visible="v => $emit('update:visible', v)"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="商品名称" prop="pName">
        <el-input v-model="form.pName" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" />
      </el-form-item>
      <el-form-item label="生产日期" prop="productionDate">
        <el-date-picker v-model="form.productionDate" type="date" value-format="yyyy-MM-dd" style="width:100%;" />
      </el-form-item>
      <el-form-item label="保质期(天)" prop="shelfLife">
        <el-input-number v-model="form.shelfLife" :min="1" />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-cascader
          v-model="form.categoryId"
          :options="categoryOptions"
          :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
          placeholder="请选择商品分类"
          clearable
          style="width:100%;"
        />
      </el-form-item>
      <el-form-item label="产地" prop="origin">
        <el-select v-model="form.origin" placeholder="请选择产地" style="width:100%;">
          <el-option v-for="o in originOptions" :key="o" :label="o" :value="o" />
        </el-select>
      </el-form-item>
      <el-form-item label="厂家名称" prop="manufacturer">
        <el-input v-model="form.manufacturer" placeholder="请输入厂家名称" />
      </el-form-item>
      <el-form-item label="商品图片">
        <el-upload
          class="image-uploader"
          action="/product/image/upload"
          :show-file-list="false"
          :headers="uploadHeaders"
          accept="image/png,image/jpeg,image/gif,image/webp"
          :before-upload="beforeImageUpload"
          :on-success="handleImageSuccess"
          :on-error="handleImageError"
        >
          <img v-if="form.imageUrl" :src="form.imageUrl" class="uploaded-image" alt="商品图片">
          <i v-else class="el-icon-plus image-uploader-icon" />
        </el-upload>
        <el-button v-if="form.imageUrl" type="text" icon="el-icon-delete" class="clear-image-btn text-danger" @click="form.imageUrl = ''">移除</el-button>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addProduct, updateProduct } from '../../../api/product';
import { getToken } from '../../../utils/auth';
import { formatDate } from '../../../utils/format';

function defaultForm() {
  return {
    pName: '',
    price: 0,
    stock: 0,
    productionDate: '',
    shelfLife: 365,
    origin: '北京',
    categoryId: null,
    manufacturer: '',
    imageUrl: ''
  };
}

export default {
  name: 'ProductFormDialog',
  props: {
    visible: { type: Boolean, default: false },
    mode: { type: String, default: 'add' },
    row: { type: Object, default: null },
    categoryOptions: { type: Array, default: () => [] },
    originOptions: { type: Array, default: () => [] }
  },
  data() {
    return {
      form: defaultForm(),
      submitting: false,
      uploadingImage: false,
      rules: {
        pName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
        shelfLife: [{ required: true, message: '请输入保质期', trigger: 'blur' }],
        origin: [{ required: true, message: '请选择产地', trigger: 'change' }],
        manufacturer: [{ required: true, message: '请输入厂家名称', trigger: 'blur' }]
      }
    };
  },
  computed: {
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      if (this.mode === 'edit' && this.row) {
        this.form = {
          pId: this.row.pId,
          pName: this.row.pName || '',
          price: this.row.price || 0,
          stock: this.row.stock == null ? 0 : this.row.stock,
          productionDate: formatDate(this.row.productionDate),
          shelfLife: this.row.shelfLife || 365,
          origin: this.row.origin || '北京',
          categoryId: this.row.categoryId || null,
          manufacturer: this.row.manufacturer || '',
          imageUrl: this.row.imageUrl || ''
        };
      } else {
        this.form = defaultForm();
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    }
  },
  methods: {
    beforeImageUpload(file) {
      const ok = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type);
      if (!ok) {
        this.$message.error('仅支持 png/jpg/jpeg/gif/webp 格式');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过 5MB');
        return false;
      }
      this.uploadingImage = true;
      return true;
    },
    handleImageSuccess(res) {
      this.uploadingImage = false;
      if (res && res.code === 200 && res.daoResult) {
        this.form.imageUrl = res.daoResult;
        this.$message.success('图片上传成功');
      } else {
        this.$message.error((res && res.msg) || '图片上传失败');
      }
    },
    handleImageError() {
      this.uploadingImage = false;
      this.$message.error('图片上传失败');
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const req = this.mode === 'add'
          ? addProduct(this.form)
          : updateProduct(this.form.pId, this.form);
        req
          .then(() => {
            this.$message.success(this.mode === 'add' ? '新增成功' : '修改成功');
            this.$emit('update:visible', false);
            this.$emit('saved');
          })
          .catch(() => {})
          .finally(() => {
            this.submitting = false;
          });
      });
    }
  }
};
</script>

<style scoped>
.image-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfd;
  transition: border-color 0.2s ease;
}
.image-uploader >>> .el-upload:hover {
  border-color: var(--color-primary);
}
.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.uploaded-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
}
.clear-image-btn {
  margin-top: 4px;
}
</style>
