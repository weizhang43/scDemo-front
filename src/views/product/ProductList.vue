<template>
  <div class="product-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="success" size="small" icon="el-icon-plus" @click="openAdd">新增商品</el-button>
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
          <div class="search-actions">
            <el-button type="primary" size='small' icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button size='small' icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>

      <el-tabs v-model="activeTab" class="status-tabs" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in productTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :row-class-name="rowClassName"
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600 }"
      >
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
        <el-table-column label="折扣" width="120" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.discount" class="discount-cell">
              <el-tag type="danger" size="mini" effect="dark">{{ discountText(scope.row.discount) }}</el-tag>
              <span class="discount-price">¥ {{ scope.row.effectivePrice }}</span>
            </div>
            <span v-else class="cell-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="上架" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'info' : 'success'" size="mini" effect="plain">
              {{ scope.row.status === 0 ? '已下架' : '在售' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="保质" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isExpired === 1 ? 'danger' : 'success'" size="mini" effect="light">
              {{ scope.row.isExpired === 1 ? '已过期' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点赞" width="90" align="center">
          <template slot-scope="scope">
            <i class="el-icon-thumb like-icon"></i>{{ scope.row.likeCount == null ? 0 : scope.row.likeCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="goDetail(scope.row.pId)">详情</el-button>
            <!-- 过期商品只留详情：编辑/补货/上架/折扣/秒杀对已过期的货都没有意义 -->
            <el-dropdown v-if="scope.row.isExpired !== 1" trigger="click" @command="cmd => handleCommand(cmd, scope.row)">
              <el-button type="text" icon="el-icon-more">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit" icon="el-icon-edit">编辑</el-dropdown-item>
                <el-dropdown-item command="restock" icon="el-icon-plus">补货</el-dropdown-item>
                <el-dropdown-item command="shelf" divided :icon="scope.row.status === 0 ? 'el-icon-top' : 'el-icon-bottom'">
                  {{ scope.row.status === 0 ? '上架' : '下架' }}
                </el-dropdown-item>
                <el-dropdown-item command="promotion" icon="el-icon-price-tag">设折扣</el-dropdown-item>
                <el-dropdown-item
                  command="seckill"
                  icon="el-icon-alarm-clock"
                  :disabled="!canSeckill(scope.row)"
                >发布秒杀</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <!-- 设折扣弹窗 -->
    <el-dialog title="商品折扣" :visible.sync="promotionVisible" width="680px" :close-on-click-modal="false">
      <el-form ref="promotionForm" :model="promotionForm" :rules="promotionRules" label-width="100px">
        <el-form-item label="商品">
          <span class="dialog-name">{{ activityRow && activityRow.pName }}</span>
          <span class="dialog-hint">原价 ¥ {{ activityRow && activityRow.price }}</span>
        </el-form-item>
        <el-form-item label="折扣率" prop="discount">
          <el-input-number v-model="promotionForm.discount" :min="1" :max="99" :precision="0" controls-position="right" style="width:150px;" />
          <span class="dialog-hint">
            {{ discountText(promotionForm.discount) }}，折后 <b class="dialog-strong">¥ {{ promotionPreview }}</b>
          </span>
        </el-form-item>
        <el-form-item label="活动时间" prop="range">
          <el-date-picker
            v-model="promotionForm.range"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width:100%;"
          />
        </el-form-item>
      </el-form>

      <div class="sub-title">该商品已有折扣</div>
      <el-table v-loading="promotionLoading" :data="promotionList" size="mini" border empty-text="暂无折扣活动">
        <el-table-column label="折扣" width="80" align="center">
          <template slot-scope="scope">{{ discountText(scope.row.discount) }}</template>
        </el-table-column>
        <el-table-column label="折后价" width="90" align="center">
          <template slot-scope="scope"><span class="price-text">¥ {{ scope.row.effectivePrice }}</span></template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="140" align="center" />
        <el-table-column prop="endTime" label="结束时间" min-width="140" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="phaseOf(scope.row).type" size="mini" effect="plain">{{ phaseOf(scope.row).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template slot-scope="scope">
            <el-button type="text" class="text-danger" @click="handleCancelPromotion(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer">
        <el-button @click="promotionVisible = false">关闭</el-button>
        <el-button type="primary" :loading="promotionSubmitting" @click="submitPromotion">创建折扣</el-button>
      </div>
    </el-dialog>

    <!-- 发布秒杀弹窗 -->
    <el-dialog title="发布秒杀活动" :visible.sync="seckillVisible" width="560px" :close-on-click-modal="false">
      <el-form ref="seckillForm" :model="seckillForm" :rules="seckillRules" label-width="100px">
        <el-form-item label="商品">
          <span class="dialog-name">{{ activityRow && activityRow.pName }}</span>
          <span class="dialog-hint">原价 ¥ {{ activityRow && activityRow.price }} · 库存 {{ activityRow && activityRow.stock }}</span>
        </el-form-item>
        <el-form-item label="秒杀价" prop="seckillPrice">
          <el-input-number v-model="seckillForm.seckillPrice" :min="0.01" :precision="2" :step="1" controls-position="right" style="width:150px;" />
          <span class="dialog-hint">必须低于原价</span>
        </el-form-item>
        <el-form-item label="秒杀名额" prop="seckillStock">
          <el-input-number v-model="seckillForm.seckillStock" :min="1" :precision="0" controls-position="right" style="width:150px;" />
          <span class="dialog-hint">从商品库存中划出的上限，不预扣库存</span>
        </el-form-item>
        <el-form-item label="活动时间" prop="range">
          <el-date-picker
            v-model="seckillForm.range"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width:100%;"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="seckillVisible = false">取消</el-button>
        <el-button type="primary" :loading="seckillSubmitting" @click="submitSeckill">发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageQuery, addProduct, updateProduct, setShelfStatus,
  promotionPageQuery, createPromotion, cancelPromotion,
  exportProductAsync, getExportStatus, cancelExport, downloadExportFile
} from '../../api/product';
import { createSeckill, seckillPageQuery } from '../../api/seckill';
import { downloadBlob } from '../../utils/export';
import { getToken } from '../../utils/auth';

// 三个 tab 就是三组固定的查询条件：在售 / 下架 都只看未过期的货，过期单独一档（不分上下架）
const PRODUCT_TABS = [
  { name: 'onSale', label: '在售', isExpired: 0, status: 1 },
  { name: 'offShelf', label: '下架', isExpired: 0, status: 0 },
  { name: 'expired', label: '过期', isExpired: 1, status: '' }
];

export default {
  name: 'ProductList',
  data() {
    return {
      searchForm: {
        pName: '',
        proDesc: '',
        dateRange: [],
        origin: ''
      },
      productTabs: PRODUCT_TABS,
      activeTab: 'onSale',
      originOptions: ['北京', '上海', '广东', '浙江', '江苏', '四川'],
      // 与当前表格数据对应的搜索关键词快照，避免输入框边打字边变高亮
      activeKeyword: { pName: '', proDesc: '' },
      tableData: [],
      loading: false,
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      addVisible: false,
      submitting: false,
      addForm: this.defaultAddForm(),
      uploadingImage: false,
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
      // 设折扣 / 发布秒杀 共用同一个商品行
      activityRow: null,
      promotionVisible: false,
      promotionSubmitting: false,
      promotionLoading: false,
      promotionList: [],
      promotionForm: { discount: 90, range: [] },
      seckillVisible: false,
      seckillSubmitting: false,
      seckillForm: { seckillPrice: 1, seckillStock: 10, range: [] },
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
      },
      promotionRules: {
        discount: [{ required: true, message: '请输入折扣率', trigger: 'blur' }],
        range: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
      },
      seckillRules: {
        seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'blur' }],
        seckillStock: [{ required: true, message: '请输入秒杀名额', trigger: 'blur' }],
        range: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
      }
    };
  },
  computed: {
    /** 当前 tab 对应的过期 / 上下架过滤条件，列表与导出共用 */
    tabQuery() {
      return PRODUCT_TABS.find(t => t.name === this.activeTab) || PRODUCT_TABS[0];
    },
    restockAfter() {
      const current = Number(this.restockRow && this.restockRow.stock) || 0;
      const add = Number(this.restockForm.quantity) || 0;
      return current + add;
    },
    /** 折后价预览。price 是整数元，85 折可能除不尽，保留两位与后端 HALF_UP 一致 */
    promotionPreview() {
      const price = Number(this.activityRow && this.activityRow.price) || 0;
      const discount = Number(this.promotionForm.discount) || 0;
      return (price * discount / 100).toFixed(2);
    },
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    }
  },
  created() {
    this.fetchData();
  },
  beforeDestroy() {
    this.stopPolling();
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
        isExpired: this.tabQuery.isExpired,
        status: this.tabQuery.status,
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
    handleTabChange() {
      this.pagination.pageNo = 1;
      this.fetchData();
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
    rowClassName({ row }) {
      if (row && row.stock === 0) return 'row-out-of-stock';
      if (row && row.isExpired === 1) return 'row-expired';
      return '';
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
    /** 折扣率转中文：85 → 8.5 折，90 → 9 折 */
    discountText(discount) {
      const d = Number(discount) || 0;
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    },
    /** 活动所处阶段。后端返回 'yyyy-MM-dd HH:mm:ss'，替换成 '/' 兼容 Safari 解析 */
    phaseOf(row) {
      const now = Date.now();
      const start = new Date(String(row.startTime || '').replace(/-/g, '/')).getTime();
      const end = new Date(String(row.endTime || '').replace(/-/g, '/')).getTime();
      if (now < start) return { text: '未开始', type: 'info' };
      if (now > end) return { text: '已结束', type: '' };
      return { text: '进行中', type: 'success' };
    },
    handleCommand(command, row) {
      if (command === 'edit') this.openEdit(row);
      else if (command === 'restock') this.openRestock(row);
      else if (command === 'shelf') this.handleShelf(row);
      else if (command === 'promotion') this.openPromotion(row);
      else if (command === 'seckill') this.openSeckill(row);
    },
    handleShelf(row) {
      const off = row.status === 0;
      if (off) {
        this.$confirm('上架后顾客即可看到并购买该商品，是否继续？', '确认上架', { type: 'warning' })
          .then(() => this.doShelf(row, 1))
          .catch(() => {});
        return;
      }
      // 下架会连带结束未完结的秒杀（后端 setShelfStatus 做的），确认框里得把这个后果说出来
      seckillPageQuery({ pId: row.pId, pageNo: 1, pageSize: 50 })
        .then(res => {
          const page = res.daoResult || {};
          return (page.records || []).filter(a => a.status === 1 && this.phaseOf(a).text !== '已结束').length;
        })
        // 活动查不出来不该挡住下架，按「没有活动」继续
        .catch(() => 0)
        .then(count => this.$confirm(
          count > 0
            ? `该商品有 ${count} 场未结束的秒杀活动，下架后这些活动会一并结束且无法恢复，是否继续？`
            : '下架后顾客将查不到该商品，是否继续？',
          '确认下架',
          { type: 'warning' }
        ))
        .then(() => this.doShelf(row, 0))
        .catch(() => {});
    },
    doShelf(row, next) {
      return setShelfStatus(row.pId, next).then(() => {
        this.$message.success(next === 0 ? '已下架' : '已上架');
        this.fetchData();
      });
    },
    openPromotion(row) {
      this.activityRow = row;
      this.promotionForm = { discount: 90, range: [] };
      this.promotionList = [];
      this.promotionVisible = true;
      this.$nextTick(() => {
        this.$refs.promotionForm && this.$refs.promotionForm.clearValidate();
      });
      this.fetchPromotions();
    },
    fetchPromotions() {
      if (!this.activityRow) return;
      this.promotionLoading = true;
      promotionPageQuery({ pId: this.activityRow.pId, pageNo: 1, pageSize: 50 })
        .then(res => {
          const page = res.daoResult || {};
          this.promotionList = page.records || [];
        })
        .catch(() => {})
        .finally(() => { this.promotionLoading = false; });
    },
    submitPromotion() {
      this.$refs.promotionForm.validate(valid => {
        if (!valid) return;
        const range = this.promotionForm.range || [];
        if (range.length !== 2) {
          this.$message.warning('请选择完整的活动起止时间');
          return;
        }
        this.promotionSubmitting = true;
        createPromotion({
          pId: this.activityRow.pId,
          discount: this.promotionForm.discount,
          startTime: range[0],
          endTime: range[1]
        })
          .then(() => {
            this.$message.success('折扣活动已创建');
            this.promotionForm.range = [];
            this.fetchPromotions();
            // 折扣可能立即生效，刷新列表让折扣列同步
            this.fetchData();
          })
          .catch(() => {})
          .finally(() => { this.promotionSubmitting = false; });
      });
    },
    handleCancelPromotion(row) {
      this.$confirm('取消后该折扣立即失效，是否继续？', '确认取消折扣', { type: 'warning' })
        .then(() => cancelPromotion(row.id))
        .then(() => {
          this.$message.success('已取消');
          this.fetchPromotions();
          this.fetchData();
        })
        .catch(() => {});
    },
    /**
     * 秒杀名额是从商品库存里划出来的，零库存划不出；过期品也不该再上活动。
     * 下架商品同样不行 —— 后端 create 会以「商品已下架，请先上架再发布秒杀」拒绝，这里提前置灰。
     * status 为 null 是存量数据，列表按「在售」显示，这里也放行。
     */
    canSeckill(row) {
      return !!row && row.isExpired !== 1 && row.stock !== 0 && row.status !== 0;
    },
    openSeckill(row) {
      this.activityRow = row;
      const price = Number(row.price) || 1;
      this.seckillForm = {
        // 默认给一个必然低于原价的建议值，避免商家一提交就撞「秒杀价必须低于原价」
        seckillPrice: Number(Math.max(price * 0.5, 0.01).toFixed(2)),
        seckillStock: Math.min(10, Number(row.stock) || 1),
        range: []
      };
      this.seckillVisible = true;
      this.$nextTick(() => {
        this.$refs.seckillForm && this.$refs.seckillForm.clearValidate();
      });
    },
    submitSeckill() {
      this.$refs.seckillForm.validate(valid => {
        if (!valid) return;
        const range = this.seckillForm.range || [];
        if (range.length !== 2) {
          this.$message.warning('请选择完整的活动起止时间');
          return;
        }
        this.seckillSubmitting = true;
        createSeckill({
          pId: this.activityRow.pId,
          seckillPrice: this.seckillForm.seckillPrice,
          seckillStock: this.seckillForm.seckillStock,
          startTime: range[0],
          endTime: range[1]
        })
          .then(() => {
            this.$message.success('秒杀活动已发布');
            this.seckillVisible = false;
          })
          .catch(() => {})
          .finally(() => { this.seckillSubmitting = false; });
      });
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
        // 导出接口只认 isExpired，不带上下架：在售 / 下架 两个 tab 导出的都是全部未过期商品
        isExpired: this.tabQuery.isExpired
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
          .catch(err => {
            if (err && err.response && err.response.status === 401) {
              this.stopPolling();
              this.exporting = false;
            }
          });
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
/* 第二行只剩产地一个条件，按钮区占两格，保证产地宽度与第一行字段一致 */
.search-actions {
  flex: 2 1 0;
  min-width: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2px;
}
.status-tabs {
  margin: 16px 0 4px;
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
.cell-muted {
  color: #c0c4cc;
}
.like-icon {
  color: #9aa3b2;
  margin-right: 5px;
}
.discount-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.discount-price {
  color: #cf1322;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dialog-name {
  font-weight: 600;
  color: #1f2733;
}
.dialog-hint {
  margin-left: 10px;
  font-size: 12px;
  color: #8a93a4;
}
.dialog-strong {
  color: #cf1322;
}
.sub-title {
  margin: 4px 0 10px;
  padding-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  border-left: 3px solid #667eea;
  line-height: 1.2;
}
.text-danger {
  color: #f56c6c;
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
.product-list .status-tabs .el-tabs__header {
  margin: 0;
}
.product-list .status-tabs .el-tabs__content {
  display: none;
}
.product-list .status-tabs .el-tabs__nav-wrap::after {
  display: none;
}
.product-list .status-tabs .el-tabs__active-bar {
  display: none;
}
.product-list .status-tabs .el-tabs__nav {
  display: inline-flex;
  gap: 8px;
  padding: 5px;
  background: #f3f5fa;
  border: 1px solid #eef0f4;
  border-radius: 12px;
}
.product-list .status-tabs .el-tabs__item {
  height: 34px;
  line-height: 34px;
  padding: 0 22px !important;
  color: #6b7280;
  border-radius: 9px;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.product-list .status-tabs .el-tabs__item:hover {
  color: #667eea;
}
.product-list .status-tabs .el-tabs__item.is-active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.32);
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
