<template>
  <div class="product-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
          <span v-if="selectedRows.length" class="header-meta header-meta--active">
            已选 {{ selectedRows.length }} 件
          </span>
        </div>
        <div class="header-actions">
          <el-button type="success" size="small" icon="el-icon-plus" @click="openAdd">新增商品</el-button>
          <el-button type="warning" size="small" icon="el-icon-shopping-cart-2" :disabled="!selectedRows.length" @click="handlePlaceOrder">
            批量下单 ({{ selectedRows.length }})
          </el-button>
          <el-button type="info" size="small" icon="el-icon-download" :disabled="exporting" @click="handleExport">
            {{ exporting ? `导出中 ${exportProgress}%` : '导出' }}
          </el-button>
          <el-button v-if="exporting" type="danger" size="small" icon="el-icon-close" @click="handleCancelExport">取消</el-button>
        </div>
      </div>
      <el-form :model="searchForm" class="search-form" label-width="80px">
        <div class="search-row">
          <el-form-item label="商品名称" class="search-item">
            <el-input v-model="searchForm.pName" placeholder="请输入商品名称" prefix-icon="el-icon-goods" clearable @keyup.enter.native="handleSearch" />
          </el-form-item>
          <el-form-item label="商品描述" class="search-item">
            <el-input v-model="searchForm.proDesc" placeholder="请输入商品描述" prefix-icon="el-icon-document" clearable @keyup.enter.native="handleSearch" />
          </el-form-item>
          <el-form-item label="生产日期" class="search-item">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              prefix-icon="el-icon-date"
              style="width:100%;"
            />
          </el-form-item>
        </div>
        <div class="search-row">
          <el-form-item label="产地" class="search-item">
            <el-select v-model="searchForm.origin" placeholder="全部" clearable prefix-icon="el-icon-location-outline" style="width:100%;">
              <el-option v-for="o in originOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" class="search-item">
            <el-radio-group v-model="searchForm.isExpired" size="small" class="status-radio">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button :label="0">正常</el-radio-button>
              <el-radio-button :label="1">过期</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <div class="search-actions">
            <el-button type="primary" size='small' icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button size='small' icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :row-class-name="rowClassName"
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600 }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" :selectable="canSelect" />
        <el-table-column type="index" label="序号" width="60" align="center"
                         :index="indexMethod" />
        <el-table-column label="图片" width="80" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.imageUrl"
              :src="scope.row.imageUrl"
              :preview-src-list="[scope.row.imageUrl]"
              fit="cover"
              class="product-thumb"
            />
            <i v-else class="el-icon-picture-outline no-image" />
          </template>
        </el-table-column>
        <el-table-column prop="pName" label="商品名称" min-width="160" align="center">
          <template slot-scope="scope">
            <span class="cell-strong" v-html="highlight(scope.row.pName, activeKeyword.pName)" />
          </template>
        </el-table-column>
        <el-table-column prop="proDesc" label="商品描述" min-width="220" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="cell-desc" v-html="highlight(scope.row.proDesc, activeKeyword.proDesc)" />
          </template>
        </el-table-column>
        <el-table-column prop="productionDate" label="生产日期" width="110" align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.productionDate) }}</template>
        </el-table-column>
        <el-table-column prop="shelfLife" label="保质期(天)" width="95" align="center" />
        <el-table-column prop="origin" label="产地" width="90" align="center" />
        <el-table-column prop="manufacturer" label="厂家名称" min-width="160" align="center"， show-overflow-tooltip />
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template slot-scope="scope">
            <span :class="{ 'stock-low': scope.row.stock !== null && scope.row.stock < 10 }">
              {{ scope.row.stock == null ? '-' : scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="110" align="center">
          <template slot-scope="scope">
            <span class="price-text">¥ {{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isExpired === 1 ? 'danger' : 'success'" size="mini" effect="light">
              {{ scope.row.isExpired === 1 ? '已过期' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点赞" width="110" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-thumb"
              :loading="likingId === scope.row.pId"
              @click="handleLike(scope.row)"
            >
              {{ scope.row.likeCount == null ? 0 : scope.row.likeCount }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="goDetail(scope.row.pId)">详情</el-button>
            <el-button v-if="scope.row.stock !== 0" type="text" icon="el-icon-edit" @click="openEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.stock === 0" type="text" icon="el-icon-plus" @click="openRestock(scope.row)">补货</el-button>
            <el-tooltip :disabled="canSeckill(scope.row)" :content="seckillReason(scope.row)" placement="top">
              <span>
                <el-button
                  type="text"
                  icon="el-icon-alarm-clock"
                  class="seckill-btn"
                  :disabled="!canSeckill(scope.row)"
                  :loading="seckillingId === scope.row.pId"
                  @click="handleSeckill(scope.row)"
                >秒杀</el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNo"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增商品弹窗 -->
    <el-dialog title="新增商品" :visible.sync="addVisible" width="520px" :close-on-click-modal="false">
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="商品名称" prop="pName">
          <el-input v-model="addForm.pName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="addForm.price" :min="0" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="addForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker v-model="addForm.productionDate" type="date" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="保质期(天)" prop="shelfLife">
          <el-input-number v-model="addForm.shelfLife" :min="1" />
        </el-form-item>
        <el-form-item label="产地" prop="origin">
          <el-select v-model="addForm.origin" placeholder="请选择产地">
            <el-option v-for="o in originOptions" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂家名称" prop="manufacturer">
          <el-input v-model="addForm.manufacturer" placeholder="请输入厂家名称" />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="image-uploader"
            action="/product/image/upload"
            :show-file-list="false"
            :headers="uploadHeaders"
            accept="image/png,image/jpeg,image/gif,image/webp"
            :before-upload="beforeImageUpload"
            :on-success="handleAddImageSuccess"
            :on-error="handleImageError"
          >
            <img v-if="addForm.imageUrl" :src="addForm.imageUrl" class="uploaded-image" alt="商品图片">
            <i v-else class="el-icon-plus image-uploader-icon" />
          </el-upload>
          <el-button v-if="addForm.imageUrl" type="text" icon="el-icon-delete" class="clear-image-btn" @click="addForm.imageUrl = ''">移除</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAdd">保存</el-button>
      </div>
    </el-dialog>

    <!-- 批量下单弹窗 -->
    <el-dialog title="批量下单" :visible.sync="orderVisible" width="760px" :close-on-click-modal="false">
      <el-form label-width="90px" class="order-addr-form">
        <el-form-item label="收货地址">
          <el-select
            v-model="orderAddressId"
            placeholder="请选择收货地址"
            style="width: 100%;"
            size="small"
          >
            <el-option
              v-for="addr in addressList"
              :key="addr.aId"
              :label="formatAddressLabel(addr)"
              :value="addr.aId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="orderItems" border size="small" style="width:100%;">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="pName" label="商品名称" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template slot-scope="scope">¥ {{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column label="下单数量" width="170" align="center">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.quantity"
              :min="1"
              :max="orderMax(scope.row)"
              size="small"
              controls-position="right"
              style="width:130px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="110" align="right">
          <template slot-scope="scope">
            <span class="price-text">¥ {{ subtotal(scope.row) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="order-total">合计：<span class="price-text">¥ {{ totalAmount }}</span></div>
      <div slot="footer">
        <el-button @click="orderVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingStatus === 0" :disabled="submittingStatus === 1" @click="submitOrder(0)">生成订单</el-button>
        <el-button type="primary" :loading="submittingStatus === 1" :disabled="submittingStatus === 0" @click="submitOrder(1)">提交订单</el-button>
      </div>
    </el-dialog>

    <!-- 编辑商品弹窗 -->
    <el-dialog title="编辑商品" :visible.sync="editVisible" width="520px" :close-on-click-modal="false">
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="商品名称" prop="pName">
          <el-input v-model="editForm.pName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker v-model="editForm.productionDate" type="date" value-format="yyyy-MM-dd" style="width:100%;" />
        </el-form-item>
        <el-form-item label="保质期(天)" prop="shelfLife">
          <el-input-number v-model="editForm.shelfLife" :min="1" />
        </el-form-item>
        <el-form-item label="产地" prop="origin">
          <el-select v-model="editForm.origin" placeholder="请选择产地" style="width:100%;">
            <el-option v-for="o in originOptions" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂家名称" prop="manufacturer">
          <el-input v-model="editForm.manufacturer" placeholder="请输入厂家名称" />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="image-uploader"
            action="/product/image/upload"
            :show-file-list="false"
            :headers="uploadHeaders"
            accept="image/png,image/jpeg,image/gif,image/webp"
            :before-upload="beforeImageUpload"
            :on-success="handleEditImageSuccess"
            :on-error="handleImageError"
          >
            <img v-if="editForm.imageUrl" :src="editForm.imageUrl" class="uploaded-image" alt="商品图片">
            <i v-else class="el-icon-plus image-uploader-icon" />
          </el-upload>
          <el-button v-if="editForm.imageUrl" type="text" icon="el-icon-delete" class="clear-image-btn" @click="editForm.imageUrl = ''">移除</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEdit">保存</el-button>
      </div>
    </el-dialog>

    <!-- 补货弹窗 -->
    <el-dialog title="商品补货" :visible.sync="restockVisible" width="420px" :close-on-click-modal="false">
      <el-form ref="restockForm" :model="restockForm" :rules="restockRules" label-width="100px">
        <el-form-item label="商品名称">
          <span class="restock-name">{{ restockRow && restockRow.pName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span class="restock-current">{{ restockRow && restockRow.stock }}</span>
        </el-form-item>
        <el-form-item label="补货数量" prop="quantity">
          <el-input-number v-model="restockForm.quantity" :min="1" :precision="0" controls-position="right" style="width:180px;" />
        </el-form-item>
        <el-form-item label="补货后库存">
          <span class="restock-after">{{ restockAfter }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="restockVisible = false">取消</el-button>
        <el-button type="primary" :loading="restockSubmitting" @click="submitRestock">确认补货</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageQuery, addProduct, updateProduct, likeProduct, exportProductAsync, getExportStatus, cancelExport, downloadExportFile } from '../../api/product';
import { placeOrderV2, seckill, getSeckillResult } from '../../api/order';
import { getAddressList } from '../../api/address';
import { downloadBlob } from '../../utils/export';
import { getToken } from '../../utils/auth';

export default {
  name: 'ProductList',
  data() {
    return {
      searchForm: {
        pName: '',
        proDesc: '',
        dateRange: [],
        origin: '',
        isExpired: ''
      },
      originOptions: ['北京', '上海', '广东', '浙江', '江苏', '四川'],
      // 与当前表格数据对应的搜索关键词快照，避免输入框边打字边变高亮
      activeKeyword: { pName: '', proDesc: '' },
      tableData: [],
      loading: false,
      selectedRows: [],
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      addVisible: false,
      submitting: false,
      addForm: this.defaultAddForm(),
      uploadingImage: false,
      orderVisible: false,
      submittingStatus: null,
      orderItems: [],
      addressList: [],
      orderAddressId: null,
      editVisible: false,
      editSubmitting: false,
      editForm: {
        pId: null,
        pName: '',
        price: 0,
        stock: 0,
        productionDate: '',
        shelfLife: 365,
        origin: '北京',
        manufacturer: '',
        imageUrl: ''
      },
      restockVisible: false,
      restockSubmitting: false,
      exporting: false,
      exportProgress: 0,
      exportTaskId: null,
      exportTimer: null,
      restockRow: null,
      restockForm: { quantity: 1 },
      likingId: null,
      hasDefaultAddress: false,
      defaultAddressId: null,
      seckillingId: null,
      seckillTimer: null,
      addRules: {
        pName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
        shelfLife: [{ required: true, message: '请输入保质期', trigger: 'blur' }],
        origin: [{ required: true, message: '请选择产地', trigger: 'change' }],
        manufacturer: [{ required: true, message: '请输入厂家名称', trigger: 'blur' }]
      },
      editRules: {
        pName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
        shelfLife: [{ required: true, message: '请输入保质期', trigger: 'blur' }],
        origin: [{ required: true, message: '请选择产地', trigger: 'change' }],
        manufacturer: [{ required: true, message: '请输入厂家名称', trigger: 'blur' }]
      },
      restockRules: {
        quantity: [{ required: true, message: '请输入补货数量', trigger: 'blur' }]
      }
    };
  },
  computed: {
    restockAfter() {
      const current = Number(this.restockRow && this.restockRow.stock) || 0;
      const add = Number(this.restockForm.quantity) || 0;
      return current + add;
    },
    totalAmount() {
      return this.orderItems.reduce((sum, it) => sum + Number(this.subtotal(it) || 0), 0).toFixed(2);
    },
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    }
  },
  created() {
    this.fetchData();
    this.loadDefaultAddress();
  },
  beforeDestroy() {
    this.stopPolling();
    this.stopSeckillPolling();
  },
  methods: {
    defaultAddForm() {
      return {
        pName: '',
        price: 0,
        stock: 0,
        productionDate: '',
        shelfLife: 365,
        origin: '北京',
        manufacturer: '',
        imageUrl: ''
      };
    },
    fetchData() {
      this.loading = true;
      const params = {
        pName: this.searchForm.pName || '',
        proDesc: this.searchForm.proDesc || '',
        productionDateStart: (this.searchForm.dateRange && this.searchForm.dateRange[0]) || '',
        productionDateEnd: (this.searchForm.dateRange && this.searchForm.dateRange[1]) || '',
        origin: this.searchForm.origin || '',
        isExpired: this.searchForm.isExpired === '' ? '' : this.searchForm.isExpired,
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize
      };
      pageQuery(params)
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.pagination.total = page.total || 0;
          this.activeKeyword = {
            pName: params.pName,
            proDesc: params.proDesc
          };
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
      this.searchForm.pName = '';
      this.searchForm.proDesc = '';
      this.searchForm.dateRange = [];
      this.searchForm.origin = '';
      this.searchForm.isExpired = '';
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
    handleSelectionChange(rows) {
      this.selectedRows = rows || [];
    },
    rowClassName({ row }) {
      if (row && row.stock === 0) return 'row-out-of-stock';
      if (row && row.isExpired === 1) return 'row-expired';
      return '';
    },
    canSelect(row) {
      return row && row.stock !== 0 && row.isExpired !== 1;
    },
    indexMethod(index) {
      return (this.pagination.pageNo - 1) * this.pagination.pageSize + index + 1;
    },
    formatDate(d) {
      if (!d) return '-';
      const s = String(d);
      return s.length >= 10 ? s.substring(0, 10) : s;
    },
    /**
     * 关键词高亮：先把文本转义防 XSS，再把命中的 keyword 包成 <mark>。
     * 后台是 ES match 分词检索，关键词按空白拆成多个 token 分别高亮，
     * 长 token 优先，避免短词截断长词的匹配。
     */
    highlight(text, keyword) {
      if (text === null || text === undefined) return '';
      const safe = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (!keyword) return safe;
      const tokens = String(keyword).trim().split(/\s+/).filter(t => t);
      if (!tokens.length) return safe;
      const escaped = tokens
        .sort((a, b) => b.length - a.length)
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return safe.replace(new RegExp(`(${escaped.join('|')})`, 'gi'), '<mark class="hl">$1</mark>');
    },
    goDetail(id) {
      this.$router.push(`/product/${id}`);
    },
    handleLike(row) {
      if (this.likingId) return;
      this.likingId = row.pId;
      likeProduct(row.pId)
        .then(res => {
          const updated = res.daoResult;
          if (updated && updated.likeCount != null) {
            row.likeCount = updated.likeCount;
          } else {
            row.likeCount = (row.likeCount || 0) + 1;
          }
        })
        .catch(() => {})
        .finally(() => {
          this.likingId = null;
        });
    },
    loadDefaultAddress() {
      const user = this.$store.state.userInfo || {};
      if (!user.uId) {
        this.hasDefaultAddress = false;
        this.defaultAddressId = null;
        return;
      }
      getAddressList(user.uId)
        .then(res => {
          const list = res.dataList || [];
          const def = Array.isArray(list) ? list.find(a => a.isDefault === 1) : null;
          this.hasDefaultAddress = !!def;
          this.defaultAddressId = def ? def.aId : null;
        })
        .catch(() => {
          this.hasDefaultAddress = false;
          this.defaultAddressId = null;
        });
    },
    canSeckill(row) {
      return !!row
        && row.stock != null && row.stock >= 1
        && row.isExpired !== 1
        && this.hasDefaultAddress;
    },
    seckillReason(row) {
      if (!this.hasDefaultAddress) return '请先维护默认收货地址';
      if (row && row.isExpired === 1) return '商品已过期';
      if (!row || row.stock == null || row.stock < 1) return '库存不足';
      return '';
    },
    handleSeckill(row) {
      if (this.seckillingId) return;
      const user = this.$store.state.userInfo || {};
      if (!user.uId) {
        this.$message.warning('请先登录');
        return;
      }
      if (!this.defaultAddressId) {
        this.$message.warning('请先维护默认收货地址');
        return;
      }
      this.seckillingId = row.pId;
      const payload = {
        uId: user.uId,
        pId: row.pId,
        addressId: this.defaultAddressId,
        addPerson: user.uName || user.realName || 'anonymous'
      };
      seckill(payload)
        .then(res => {
          const vo = res.daoResult || {};
          if (vo.status === 'PENDING') {
            this.pollSeckillResult(user.uId, row.pId);
          } else if (vo.status === 'SUCCESS') {
            this.$message.success(vo.msg || '下单成功');
            this.seckillingId = null;
            this.fetchData();
          } else {
            this.$message.warning(vo.msg || '秒杀失败');
            this.seckillingId = null;
          }
        })
        .catch(() => {
          this.seckillingId = null;
        });
    },
    pollSeckillResult(uId, pId) {
      this.stopSeckillPolling();
      let elapsed = 0;
      this.seckillTimer = setInterval(() => {
        elapsed += 1500;
        getSeckillResult(uId, pId)
          .then(res => {
            const vo = res.daoResult || {};
            if (vo.status === 'SUCCESS') {
              this.stopSeckillPolling();
              this.seckillingId = null;
              this.$message.success(`秒杀成功，订单号 ${vo.orderNo || ''}`);
              this.fetchData();
            } else if (vo.status === 'FAILED') {
              this.stopSeckillPolling();
              this.seckillingId = null;
              this.$message.warning(vo.msg || '秒杀失败');
            } else if (elapsed >= 15000) {
              // PENDING/NONE 超时兜底：不阻塞用户，提示去订单列表查看
              this.stopSeckillPolling();
              this.seckillingId = null;
              this.$message.info('订单处理中，请稍后在订单列表查看');
            }
          })
          .catch(() => {});
      }, 1500);
    },
    stopSeckillPolling() {
      if (this.seckillTimer) {
        clearInterval(this.seckillTimer);
        this.seckillTimer = null;
      }
    },
    openAdd() {
      this.addForm = this.defaultAddForm();
      this.addVisible = true;
      this.$nextTick(() => {
        this.$refs.addForm && this.$refs.addForm.clearValidate();
      });
    },
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
    handleAddImageSuccess(res) {
      this.uploadingImage = false;
      if (res && res.code === 200 && res.daoResult) {
        this.addForm.imageUrl = res.daoResult;
        this.$message.success('图片上传成功');
      } else {
        this.$message.error((res && res.msg) || '图片上传失败');
      }
    },
    handleEditImageSuccess(res) {
      this.uploadingImage = false;
      if (res && res.code === 200 && res.daoResult) {
        this.editForm.imageUrl = res.daoResult;
        this.$message.success('图片上传成功');
      } else {
        this.$message.error((res && res.msg) || '图片上传失败');
      }
    },
    handleImageError() {
      this.uploadingImage = false;
      this.$message.error('图片上传失败');
    },
    submitAdd() {
      this.$refs.addForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        addProduct(this.addForm)
          .then(() => {
            this.$message.success('新增成功');
            this.addVisible = false;
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    handlePlaceOrder() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先勾选要下单的商品');
        return;
      }
      this.orderItems = this.selectedRows.map(r => ({
        pId: r.pId,
        pName: r.pName,
        stock: r.stock,
        price: r.price,
        max: r.stock || 0,
        quantity: 1
      }));
      this.loadAddresses().finally(() => {
        this.orderVisible = true;
      });
    },
    loadAddresses() {
      const user = this.$store.state.userInfo || {};
      const uId = user.uId;
      if (!uId) {
        this.addressList = [];
        this.orderAddressId = null;
        return Promise.resolve();
      }
      return getAddressList(uId)
        .then(res => {
          const list = res.dataList || [];
          this.addressList = Array.isArray(list) ? list : [];
          const def = this.addressList.find(a => a.isDefault === 1);
          this.orderAddressId = def ? def.aId : (this.addressList[0] && this.addressList[0].aId) || null;
        })
        .catch(() => {
          this.addressList = [];
          this.orderAddressId = null;
        });
    },
    formatAddressLabel(addr) {
      if (!addr) return '';
      const region = [addr.province, addr.city, addr.district].filter(v => v).join('');
      return `${addr.consignee} ${addr.phone} ${region}${addr.detail || ''}${addr.isDefault === 1 ? '（默认）' : ''}`;
    },
    subtotal(row) {
      const price = Number(row && row.price) || 0;
      const qty = Number(row && row.quantity) || 0;
      return (price * qty).toFixed(2);
    },
    orderMax(row) {
      const max = row.stock == null ? 0 : Number(row.stock);
      return max < 0 ? 0 : max;
    },
    submitOrder(orderStatus) {
      if (!this.orderAddressId) {
        this.$message.warning('请选择收货地址');
        return;
      }
      const invalid = this.orderItems.find(it => !it.quantity || it.quantity < 1);
      if (invalid) {
        this.$message.warning(`请填写「${invalid.pName}」的下单数量`);
        return;
      }
      const over = this.orderItems.find(it => it.quantity > this.orderMax(it));
      if (over) {
        this.$message.warning(`「${over.pName}」下单数量不能大于库存（${this.orderMax(over)}）`);
        return;
      }
      const user = this.$store.state.userInfo || {};
      const payload = {
        uId: user.uId,
        addPerson: user.uName || (user.realName || 'anonymous'),
        addressId: this.orderAddressId,
        orderStatus: orderStatus,
        items: this.orderItems.map(it => ({
          pId: it.pId,
          quantity: it.quantity,
          price: it.price
        }))
      };
      this.submittingStatus = orderStatus;
      placeOrderV2(payload)
        .then(() => {
          this.$message.success('下单成功');
          this.orderVisible = false;
          this.fetchData();
        })
        .catch(() => {})
        .finally(() => {
          this.submittingStatus = null;
        });
    },
    formatDate(d) {
      if (!d) return '';
      const s = String(d);
      return s.length >= 10 ? s.substring(0, 10) : s;
    },
    openEdit(row) {
      this.editForm = {
        pId: row.pId,
        pName: row.pName || '',
        price: row.price || 0,
        stock: row.stock == null ? 0 : row.stock,
        productionDate: this.formatDate(row.productionDate),
        shelfLife: row.shelfLife || 365,
        origin: row.origin || '北京',
        manufacturer: row.manufacturer || '',
        imageUrl: row.imageUrl || ''
      };
      this.editVisible = true;
      this.$nextTick(() => {
        this.$refs.editForm && this.$refs.editForm.clearValidate();
      });
    },
    submitEdit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return;
        this.editSubmitting = true;
        updateProduct(this.editForm.pId, this.editForm)
          .then(() => {
            this.$message.success('修改成功');
            this.editVisible = false;
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => {
            this.editSubmitting = false;
          });
      });
    },
    openRestock(row) {
      this.restockRow = row;
      this.restockForm = { quantity: 1 };
      this.restockVisible = true;
      this.$nextTick(() => {
        this.$refs.restockForm && this.$refs.restockForm.clearValidate();
      });
    },
    submitRestock() {
      this.$refs.restockForm.validate(valid => {
        if (!valid) return;
        const add = Number(this.restockForm.quantity) || 0;
        const current = Number(this.restockRow.stock) || 0;
        const payload = {
          pId: this.restockRow.pId,
          pName: this.restockRow.pName,
          price: this.restockRow.price,
          stock: current + add,
          productionDate: this.formatDate(this.restockRow.productionDate),
          shelfLife: this.restockRow.shelfLife,
          origin: this.restockRow.origin,
          manufacturer: this.restockRow.manufacturer,
          imageUrl: this.restockRow.imageUrl || ''
        };
        this.restockSubmitting = true;
        updateProduct(this.restockRow.pId, payload)
          .then(() => {
            this.$message.success('补货成功');
            this.restockVisible = false;
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => {
            this.restockSubmitting = false;
          });
      });
    },
    handleExport() {
      const params = {
        pName: this.searchForm.pName || '',
        proDesc: this.searchForm.proDesc || '',
        productionDateStart: (this.searchForm.dateRange && this.searchForm.dateRange[0]) || '',
        productionDateEnd: (this.searchForm.dateRange && this.searchForm.dateRange[1]) || '',
        origin: this.searchForm.origin || '',
        isExpired: this.searchForm.isExpired === '' ? '' : this.searchForm.isExpired
      };
      this.exporting = true;
      this.exportProgress = 0;
      this.exportTaskId = null;
      exportProductAsync(params)
        .then(res => {
          const vo = res.daoResult;
          if (!vo || !vo.taskId) {
            this.exporting = false;
            return;
          }
          // 提交时已被拒（线程池满）
          if (vo.status === 'FAILED') {
            this.exporting = false;
            this.$message.error(vo.errorMsg || '导出失败');
            return;
          }
          this.exportTaskId = vo.taskId;
          this.startPolling();
        })
        .catch(() => { this.exporting = false; });
    },
    startPolling() {
      this.stopPolling();
      this.exportTimer = setInterval(() => {
        if (!this.exportTaskId) return;
        getExportStatus(this.exportTaskId)
          .then(res => {
            const vo = res.daoResult;
            if (!vo) {
              this.stopPolling();
              this.exporting = false;
              this.$message.error('任务不存在或已过期');
              return;
            }
            this.exportProgress = vo.progress || 0;
            if (vo.status === 'SUCCESS') {
              this.stopPolling();
              this.exporting = false;
              this.exportProgress = 100;
              this.triggerDownload();
            } else if (vo.status === 'FAILED') {
              this.stopPolling();
              this.exporting = false;
              this.$message.error(vo.errorMsg || '导出失败');
            } else if (vo.status === 'CANCELED') {
              this.stopPolling();
              this.exporting = false;
              this.$message.info('导出已取消');
            }
          })
          .catch(() => {});
      }, 2000);
    },
    stopPolling() {
      if (this.exportTimer) {
        clearInterval(this.exportTimer);
        this.exportTimer = null;
      }
    },
    triggerDownload() {
      downloadExportFile(this.exportTaskId)
        .then(res => downloadBlob(res, '商品列表.xlsx'))
        .catch(() => {})
        .finally(() => { this.exportTaskId = null; });
    },
    handleCancelExport() {
      if (!this.exportTaskId) return;
      cancelExport(this.exportTaskId)
        .then(() => {
          this.stopPolling();
          this.exporting = false;
          this.exportTaskId = null;
          this.$message.info('已取消导出');
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.product-list {
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
.header-meta--active {
  color: #fff;
  background: linear-gradient(135deg, #f6ad36 0%, #e8850e 100%);
}
.header-actions {
  display: flex;
  gap: 8px;
}
.header-actions .el-button {
  border-radius: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.header-actions .el-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.search-form {
  margin-bottom: 18px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(31, 41, 59, 0.03);
}
/* 两行布局：每行 flex 横向排列，行间留白 */
.search-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: nowrap;
  gap: 12px;
}
.search-row + .search-row {
  margin-top: 14px;
}
.search-form >>> .el-form-item {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}
.search-form >>> .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
  font-size: 13px;
}
.search-form >>> .el-form-item__content {
  margin-left: 0 !important;
  flex: 1;
}
.search-item {
  flex: 1 1 0;
  min-width: 0;
}
/* 第二行按钮区占位与条件等宽，内部右对齐，保证产地宽度与第一行字段一致 */
.search-actions {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2px;
}
.status-radio {
  width: 100%;
  display: flex;
}
.status-radio >>> .el-radio-button {
  flex: 1;
}
.status-radio >>> .el-radio-button__inner {
  width: 100%;
  padding-left: 0;
  padding-right: 0;
  text-align: center;
}
.status-radio >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
  color: #fff;
}
.search-actions .el-button {
  border-radius: 8px;
  min-width: 88px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.search-actions .el-button:not(.is-disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pagination-wrap {
  margin-top: 18px;
  padding: 14px 4px 4px;
  text-align: right;
  border-top: 1px dashed #e8ebf2;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
}
.cell-desc {
  color: #4a5568;
  font-size: 13px;
}
/* 搜索关键词高亮 */
.cell-strong mark.hl,
.cell-desc mark.hl {
  background: linear-gradient(180deg, transparent 55%, #ffe58f 55%);
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}
.price-text {
  color: #d97706;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.stock-low {
  color: #e6a23c;
  font-weight: 600;
}
.seckill-btn:not(.is-disabled) {
  color: #f56c6c;
  font-weight: 600;
}
.restock-name {
  font-weight: 600;
  color: #1f2733;
}
.restock-current {
  color: #cf1322;
  font-weight: 600;
}
.restock-after {
  color: #67c23a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.order-addr-form {
  margin-bottom: 8px;
  padding: 12px 16px;
  background: #fafbfd;
  border: 1px solid #eef0f4;
  border-radius: 10px;
}
.order-addr-form >>> .el-form-item {
  margin-bottom: 0;
}
.order-total {
  margin-top: 12px;
  text-align: right;
  font-size: 14px;
  color: #4a5568;
}
.order-total .price-text {
  font-size: 16px;
}
.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid #e8ecf5;
  object-fit: cover;
}
.no-image {
  font-size: 28px;
  color: #c0c4cc;
}
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
  border-color: #667eea;
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
  color: #f56c6c;
}
</style>

<style>
.product-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
}
.product-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  position: sticky;
  top: 0;
  z-index: 20;
}
.product-list .el-card__body {
  padding: 20px 24px 12px;
}
.product-list .search-form .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
}
.product-list .search-form .el-input__inner,
.product-list .search-form .el-select .el-input__inner,
.product-list .search-form .el-date-editor .el-range-input {
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.product-list .search-form .el-input__inner:focus,
.product-list .search-form .el-select .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
.product-list .search-form .el-date-editor--daterange.el-input__inner,
.product-list .search-form .el-date-editor--daterange {
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.product-list .search-form .el-date-editor--daterange.is-focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
.product-list .search-form .status-radio .el-radio-button__inner {
  border-radius: 0;
  transition: all 0.2s ease;
}
.product-list .search-form .status-radio .el-radio-button:first-child .el-radio-button__inner {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.product-list .search-form .status-radio .el-radio-button:last-child .el-radio-button__inner {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
.product-list .el-table {
  border-radius: 10px;
  overflow: hidden;
}
.product-list .el-table th.el-table__cell {
  background: #f3f5fa !important;
  color: #2d3748;
  font-weight: 600;
  padding: 12px 0;
}
.product-list .el-table td.el-table__cell {
  border-bottom: 1px solid #eef0f4;
  padding: 10px 0;
}
.product-list .el-table--border,
.product-list .el-table--group {
  border: 1px solid #eef0f4;
}
.product-list .el-table--border th.el-table__cell,
.product-list .el-table--border td.el-table__cell {
  border-right: 1px solid #eef0f4;
}
.product-list .el-table__row:hover > td.el-table__cell {
  background-color: #f0f4ff !important;
}
.product-list .el-table .el-tag--mini {
  border-radius: 10px;
  padding: 0 8px;
  height: 22px;
  line-height: 20px;
}
.product-list .el-table .el-button--text {
  padding: 4px 6px;
}
.product-list .el-table .row-expired {
  background-color: #fff5f5 !important;
}
.product-list .el-table .row-expired td {
  color: #cf1322 !important;
}
.product-list .el-table .row-expired:hover > td.el-table__cell {
  background-color: #ffe9e7 !important;
}
.product-list .el-table .row-out-of-stock {
  background-color: #f5f5f5 !important;
}
.product-list .el-table .row-out-of-stock td {
  color: #b0b0b0 !important;
}
.product-list .el-table .row-out-of-stock:hover > td.el-table__cell {
  background-color: #ebebeb !important;
}
</style>
