<template>
  <div class="table-container">
    <h3>📊 Live {{ tableTitle }}</h3>
    
    <div class="table-scroll-wrapper">
      <table class="mock-table">
        <thead>
          <tr v-if="activeDatasetType === 'trends'">
            <th>Trend Date</th>
            <th>Invoice Count</th>
            <th>Total Financial Value</th>
          </tr>
          <tr v-else-if="activeDatasetType === 'blocks'">
            <th>Block Identifier</th>
            <th>Total Value</th>
          </tr>
          <tr v-else-if="activeDatasetType === 'products'">
            <th>Product Variant Code</th>
            <th>Aggregated Value</th>
          </tr>
          <tr v-else-if="activeDatasetType === 'groups'">
            <th>Logistical Group Class</th>
            <th>Aggregated Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows || rows.length === 0">
            <td :colspan="activeDatasetType === 'trends' ? 3 : 2" class="empty-row-cell">
              No records found. Trigger an active pipeline node above.
            </td>
          </tr>
          
          <template v-else>
            <tr v-if="activeDatasetType === 'trends'" v-for="(row, index) in rows" :key="'trend-' + index">
              <td class="product-name-cell">{{ row.trend_date }}</td>
              <td>{{ row.invoice_count }}</td>
              <td class="revenue-cell">₱{{ Number(row.total_financial_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
            </tr>

            <tr v-if="activeDatasetType === 'blocks'" v-for="(row, index) in rows" :key="'block-' + index">
              <td class="product-name-cell">{{ row.identifier }}</td>
              <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
            </tr>

            <tr v-if="activeDatasetType === 'products'" v-for="(row, index) in rows" :key="'prod-' + index">
              <td class="product-name-cell">{{ row.identifier || 'Unknown Product' }}</td>
              <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
            </tr>

            <tr v-if="activeDatasetType === 'groups'" v-for="(row, index) in rows" :key="'grp-' + index">
              <td class="product-name-cell">{{ row.group_name || row.identifier || 'Unknown Group' }}</td>
              <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeDatasetType: { type: String, required: true },
  tableTitle: { type: String, required: true },
  rows: { type: Array, default: () => [] }
})
</script>

<style scoped>
.table-container { text-align: left; display: flex; flex-direction: column; flex-grow: 1; width: 100%; }
.table-container h3 { font-size: 0.9rem; color: #334155; margin: 0 0 1rem 0; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; }
.table-scroll-wrapper { flex-grow: 1; max-height: 550px; overflow-y: auto; border: 1px solid #edf2f7; border-radius: 6px; background: #ffffff; }
.mock-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.mock-table th { background: #f8fafc; color: #64748b; padding: 12px; border-bottom: 1px solid #edf2f7; font-weight: 800; font-size: 0.68rem; letter-spacing: 0.03em; position: sticky; top: 0; z-index: 1; }
.mock-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.75rem; box-sizing: border-box; vertical-align: middle; }
.product-name-cell { font-family: system-ui, sans-serif !important; font-weight: 600; color: #0f172a !important; }
.revenue-cell { font-weight: 600; color: #16a34a; }
.mock-table tr:hover td { background: #f8fafc; }
.empty-row-cell { text-align: center; color: #94a3b8; padding: 30px; font-style: italic; }
</style>