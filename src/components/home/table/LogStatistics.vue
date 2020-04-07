<template>
  <div>
    <el-table
      id="tableData"
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      size="small"
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
    name: "LogStatistics",
    props: ["logYear", "logMonth"],
    data() {
      return {
        tableHeader: [{
          prop: "typeName",
          label: "类型",
          sortable: true,
          fixed: true
        }, {
          prop: "lend",
          label: "借出",
          sortable: true
        }, {
          prop: "back",
          label: "归还",
          sortable: true
        }, {
          prop: "repair",
          label: "报修",
          sortable: true
        }, {
          prop: "abandon",
          label: "报废",
          sortable: true
        }, {
          prop: "move",
          label: "存放",
          sortable: true
        }, {
          prop: "give",
          label: "调拨",
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
        this.$axios.get("/statistics/log", {
          params: {
            'logYear': this.$route.params.logYear,
            'logMonth': this.$route.params.logMonth
          }
        }).then(resp => {
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
    },
    watch: {
      $route(to, from) {
        this.init()
      }
    }
  }
</script>

<style scoped>
  .el-button {
    margin-top: 10px;
  }
</style>
