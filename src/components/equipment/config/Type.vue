<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" class="demo-form-inline">
      <el-form-item label="查找类型">
        <el-input v-model="searchFrom.typeName" placeholder="查找设备类型"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="success" @click="onCreate">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      stripe>
      <el-table-column
        v-for="(item, i) in tableHeader"
        :prop="item.prop"
        :label="item.label"
        :sortable="item.sortable"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.showOverflowTooltip"
        :key="i">
      </el-table-column>
      <el-table-column label="操作" align="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">编辑
          </el-button>
        </template>
      </el-table-column>
      <div slot="default"
           v-loading="loading"></div>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :hide-on-single-page=true
      :current-page="searchFrom.pageNum"
      :page-sizes="[15, 30]"
      :page-size="searchFrom.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchFrom.totalSize">
    </el-pagination>
  </div>
</template>

<script>
  export default {
    name: "Type",
    data() {
      return {
        searchFrom: {
          typeName: '',
          pageSize: 0,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "typeName",
          label: "设备类型",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "equipmentCount",
          label: "设备数量",
          showOverflowTooltip: true,
          sortable: true
        }],
        tableData: [],
        loading: true
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        let form = this.$refs['searchFrom'].$el
        let formData = new FormData(form)
        formData.append("typeName", this.searchFrom.typeName)
        formData.append("pageNum", this.searchFrom.pageNum)
        formData.append("pageSize", this.searchFrom.pageSize)
        console.log(formData)
        this.$axios.get(
          "/equipment/type/search",
          formData,
          {headers: {'Content-Type': 'multipart/form-data'}}
        ).then(resp => {
          if (resp && resp.status === 200) {
            this.searchFrom.pageNum = resp.data.pageNum
            this.searchFrom.pageSize = resp.data.pageSize
            this.searchFrom.totalSize = resp.data.totalSize
            this.tableData = []
            for (let data0 of resp.data.content) {
              data0.equipmentCount = data0.equipmentCount ? data0.equipmentCount : 0
              this.tableData.push(data0)
            }
            this.loading = false
          } else {

          }
        })
      },
      onCreate() {

      },
      handleSizeChange() {

      },
      handleCurrentChange() {

      },
      handleEdit() {

      },
      init() {

      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style scoped>
  .el-form {
    text-align: left;
  }

</style>
