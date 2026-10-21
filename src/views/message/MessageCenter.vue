<template>
  <div class="message-center list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">消息中心</span>
          <span class="header-meta">未读 {{ unreadCount }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-check" :disabled="unreadCount === 0" @click="handleReadAll">全部已读</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="status-tabs pill-tabs" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name">
          <span slot="label" class="tab-label">
            {{ tab.label }}
            <el-badge v-if="tab.name === 'unread'" :value="unreadCount" :max="999" class="tab-badge" />
          </span>
        </el-tab-pane>
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无消息"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column label="类型" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="typeTagType(scope.row.msgType)" size="small" effect="light">
              <i :class="typeIcon(scope.row.msgType)" /> {{ typeText(scope.row.msgType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消息内容" min-width="380" align="left">
          <template slot-scope="scope">
            <div class="msg-cell" :class="{ unread: !scope.row.isRead }" @click="openMessage(scope.row)">
              <div class="msg-cell-title">
                <span class="unread-dot" v-if="!scope.row.isRead" />
                {{ scope.row.title }}
              </div>
              <div class="msg-cell-desc">{{ scope.row.content || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon"></i>
            <span class="cell-time">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button v-if="!scope.row.isRead" type="primary" plain size="mini" icon="el-icon-check" @click="handleMarkRead(scope.row)">已读</el-button>
              <el-button v-if="scope.row.bizId && scope.row.msgType === 'order'" type="text" size="mini" class="text-btn" @click="goOrder(scope.row)">查看订单</el-button>
              <el-button v-else-if="scope.row.bizId && scope.row.msgType === 'aftersale'" type="text" size="mini" class="text-btn" @click="goAfterSale">查看售后</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page.sync="pagination.pageNum"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { Message } from 'element-ui';
import { getMessagePage, markRead, markAllRead } from '../../api/message';
import { formatTime } from '../../utils/format';

const TYPE_META = {
  order: { label: '订单', icon: 'el-icon-s-order', tag: '' },
  aftersale: { label: '售后', icon: 'el-icon-refresh-left', tag: 'warning' },
  system: { label: '系统', icon: 'el-icon-message-solid', tag: 'info' }
};

export default {
  name: 'MessageCenter',
  data() {
    return {
      loading: false,
      activeTab: 'all',
      tabs: [
        { name: 'all', label: '全部消息' },
        { name: 'unread', label: '未读消息' }
      ],
      tableData: [],
      pagination: { pageNum: 1, pageSize: 10, total: 0 }
    };
  },
  computed: {
    unreadCount() { return this.$store.state.unreadCount; },
    userType() { return this.$store.getters.userType; }
  },
  activated() {
    this.loadData();
  },
  created() {
    this.loadData();
  },
  methods: {
    formatTime,
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    typeText(type) { return (TYPE_META[type] || TYPE_META.system).label; },
    typeIcon(type) { return (TYPE_META[type] || TYPE_META.system).icon; },
    typeTagType(type) { return (TYPE_META[type] || TYPE_META.system).tag; },
    handleTabChange() {
      this.pagination.pageNum = 1;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      };
      if (this.activeTab === 'unread') params.isRead = 0;
      getMessagePage(params).then(res => {
        const page = (res && res.dataList && res.dataList[0]) || {};
        this.tableData = page.records || [];
        this.pagination.total = Number(page.total) || 0;
      }).finally(() => {
        this.loading = false;
      });
    },
    openMessage(row) {
      if (!row.isRead) this.handleMarkRead(row);
    },
    handleMarkRead(row) {
      if (row.isRead) return;
      markRead(row.id).then(() => {
        row.isRead = 1;
        this.$store.commit('SET_UNREAD_COUNT', Math.max(0, this.unreadCount - 1));
      }).catch(() => {});
    },
    handleReadAll() {
      markAllRead().then(() => {
        this.$store.commit('SET_UNREAD_COUNT', 0);
        Message.success('已全部标记为已读');
        this.loadData();
      }).catch(() => {});
    },
    goOrder(row) {
      this.$router.push(`/order/${row.bizId}`).catch(() => {});
    },
    goAfterSale() {
      const path = this.userType === 2 ? '/my-aftersale' : '/aftersale';
      this.$router.push(path).catch(() => {});
    }
  }
};
</script>

<style scoped>
.msg-cell { text-align: left; cursor: pointer; }
.msg-cell-title { font-size: 13px; color: #4a5568; display: flex; align-items: center; gap: 6px; }
.msg-cell.unread .msg-cell-title { color: #1e3c72; font-weight: 650; }
.msg-cell-desc { font-size: 12px; color: #8c97ad; margin-top: 3px; }
.unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #f56c6c; flex: 0 0 7px; }
.text-btn { padding: 0; }
</style>
