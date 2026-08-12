<template>
  <div class="product-list list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">新增商品</el-button>
          <el-button type="info" size="small" icon="el-icon-download" :disabled="exporting" @click="handleExport">
            {{ exporting ? `导出中 ${exportProgress}%` : '导出' }}
          </el-button>
          <el-button v-if="exporting" type="danger" size="small" icon="el-icon-close" @click="handleCancelExport">取消</el-button>
        </div>
      </div>
      <el-form :model="searchForm" class="search-form" label-width="90px">
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
          <el-form-item label="商品分类" class="search-item">
            <el-cascader
              v-model="searchForm.categoryId"
              :options="categoryOptions"
              :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
              placeholder="全部"
              clearable
              style="width:100%;"
            />
          </el-form-item>
          <div class="search-actions">
            <el-button type="primary" size='small' icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button size='small' icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>

      <el-tabs v-model="activeTab" class="status-tabs pill-tabs" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in productTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :row-class-name="rowClassName"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600 }"
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
        <el-table-column label="分类" width="110" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain">{{ scope.row.categoryName || '未分类' }}</el-tag>
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
        <el-table-column prop="manufacturer" label="厂家名称" min-width="160" align="center" show-overflow-tooltip />
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

    <!-- 新增/编辑商品弹窗 -->
    <product-form-dialog
      :visible.sync="formVisible"
      :mode="formMode"
      :row="editRow"
      :category-options="categoryOptions"
      :origin-options="originOptions"
      @saved="fetchData"
    />

    <!-- 补货弹窗 -->
    <restock-dialog :visible.sync="restockVisible" :row="restockRow" @saved="fetchData" />

    <!-- 设折扣弹窗 -->
    <promotion-dialog :visible.sync="promotionVisible" :row="activityRow" @changed="fetchData" />

    <!-- 发布秒杀弹窗 -->
    <seckill-dialog :visible.sync="seckillVisible" :row="activityRow" />
  </div>
</template>

<script>
import {
  pageQuery, setShelfStatus,
  exportProductAsync, getExportStatus, cancelExport, downloadExportFile
} from '../../api/product';
import { seckillPageQuery } from '../../api/seckill';
import { downloadBlob } from '../../utils/export';
import { formatDate } from '../../utils/format';
import { getCategoryTree } from '../../api/category';
import { discountText, phaseOf } from './product-helpers';
import ProductFormDialog from './components/ProductFormDialog.vue';
import RestockDialog from './components/RestockDialog.vue';
import PromotionDialog from './components/PromotionDialog.vue';
import SeckillDialog from './components/SeckillDialog.vue';

// 三个 tab 就是三组固定的查询条件：在售 / 下架 都只看未过期的货，过期单独一档（不分上下架）
const PRODUCT_TABS = [
  { name: 'onSale', label: '在售', isExpired: 0, status: 1 },
  { name: 'offShelf', label: '下架', isExpired: 0, status: 0 },
  { name: 'expired', label: '过期', isExpired: 1, status: '' }
];

export default {
  name: 'ProductList',
  components: { ProductFormDialog, RestockDialog, PromotionDialog, SeckillDialog },
  data() {
    return {
      searchForm: {
        pName: '',
        proDesc: '',
        dateRange: [],
        origin: '',
        categoryId: null
      },
      productTabs: PRODUCT_TABS,
      activeTab: 'onSale',
      originOptions: ['北京', '上海', '广东', '浙江', '江苏', '四川'],
      categoryOptions: [],
      // 与当前表格数据对应的搜索关键词快照，避免输入框边打字边变高亮
      activeKeyword: { pName: '', proDesc: '' },
      tableData: [],
      loading: false,
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      // 新增/编辑共用一个表单弹窗
      formVisible: false,
      formMode: 'add',
      editRow: null,
      restockVisible: false,
      exporting: false,
      exportProgress: 0,
      exportTaskId: null,
      exportTimer: null,
      exportPollFails: 0,
      restockRow: null,
      // 设折扣 / 发布秒杀 共用同一个商品行
      activityRow: null,
      promotionVisible: false,
      seckillVisible: false
    };
  },
  computed: {
    /** 当前 tab 对应的过期 / 上下架过滤条件，列表与导出共用 */
    tabQuery() {
      return PRODUCT_TABS.find(t => t.name === this.activeTab) || PRODUCT_TABS[0];
    }
  },
  created() {
    this.fetchData();
    this.fetchCategoryTree();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  methods: {
    formatDate,
    discountText,
    fetchCategoryTree() {
      getCategoryTree()
        .then(res => {
          // 空 children 会让 cascader 出现可展开的空面板，去掉
          this.categoryOptions = (res.dataList || []).map(t => ({
            ...t,
            children: t.children && t.children.length ? t.children : undefined
          }));
        })
        .catch(() => {});
    },
    fetchData() {
      this.loading = true;
      const params = {
        pName: this.searchForm.pName || '',
        proDesc: this.searchForm.proDesc || '',
        productionDateStart: (this.searchForm.dateRange && this.searchForm.dateRange[0]) || '',
        productionDateEnd: (this.searchForm.dateRange && this.searchForm.dateRange[1]) || '',
        origin: this.searchForm.origin || '',
        categoryId: this.searchForm.categoryId || '',
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
      this.searchForm.categoryId = null;
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
          return (page.records || []).filter(a => a.status === 1 && phaseOf(a).text !== '已结束').length;
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
      this.promotionVisible = true;
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
      this.seckillVisible = true;
    },
    openAdd() {
      this.formMode = 'add';
      this.editRow = null;
      this.formVisible = true;
    },
    openEdit(row) {
      this.formMode = 'edit';
      this.editRow = row;
      this.formVisible = true;
    },
    openRestock(row) {
      this.restockRow = row;
      this.restockVisible = true;
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
      this.exportPollFails = 0;
      this.exportTimer = setInterval(() => {
        if (!this.exportTaskId) return;
        getExportStatus(this.exportTaskId)
          .then(res => {
            this.exportPollFails = 0;
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
              return;
            }
            // 连续失败（如断网）时终止轮询，避免定时器永不停止
            this.exportPollFails += 1;
            if (this.exportPollFails >= 5) {
              this.stopPolling();
              this.exporting = false;
              this.$message.error('导出状态查询多次失败，请稍后重试');
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
.card-header .header-actions {
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
  color: var(--color-price);
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
  color: var(--color-price);
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
</style>

<style>
/* 页面特有：卡片头吸顶（要求卡片 overflow 可见）、更紧凑的行高、行状态底色 */
.product-list .el-card {
  overflow: visible;
}
.product-list .el-card__header {
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  position: sticky;
  top: 0;
  z-index: 20;
}
.product-list .el-table td.el-table__cell {
  padding: 10px 0;
}
.product-list .el-table .el-tag--mini {
  border-radius: 10px;
  padding: 0 8px;
  height: 22px;
  line-height: 20px;
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
