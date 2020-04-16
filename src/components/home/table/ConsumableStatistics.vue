<template>
  <div>
    <el-table
      id="tableData"
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      size="small"
      max-height="400"
      border
      stripe>
      <el-table-column
        v-for="(item, i) in tableHeader"
        :prop="item.prop"
        :label="item.label"
        :sortable="item.sortable"
        :fixed="item.fixed"
        :key="i">
      </el-table-column>
    </el-table>
    <el-button type="primary" @click="exportExcel()" :loading="exportLoading">{{ exportLoading ? '导出中 ...' : '导 出' }}</el-button>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: "ConsumableStatistics",
    data() {
      return {
        tableHeader: [{
          prop: "consumableName",
          label: "耗材",
          sortable: true,
          fixed: true
        }, {
          prop: "consumableUnit",
          label: "单位"
        }, {
          prop: "consumableCount",
          label: "存量",
          sortable: true
        }],
        tableData: [],
        loading: true,
        exportLoading: false
      };
    },
    methods: {
      init() {
        this.loading = true
        this.$axios.get('/statistics/consumable').then(resp => {
          if (resp && resp.status === 200) {
            this.tableData = resp.data.result
            this.loading = false
          } else {

          }
        })
      },
      exportExcel() {
        this.exportLoading = true
        /* out-table关联导出的dom节点  */
        let wb = XLSX.utils.table_to_book(document.querySelector('#tableData'))
        /* get binary string as output */
        let wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'})
        try {
          FileSaver.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '设备在库统计.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        this.exportLoading = false
        return wbout
      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style scoped>
  .el-button {
    margin-top: 10px;
  }
</style>
