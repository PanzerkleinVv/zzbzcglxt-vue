<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" size="small">
      <el-form-item label="查找密级">
        <el-input v-model="searchFrom.secrecyName" placeholder="查找设备密级" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="success" @click="onCreate">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
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
           :loading="loading"></div>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :hide-on-single-page=true
      :current-page="searchFrom.pageNum"
      :page-sizes="[10, 20, 30]"
      :page-size="searchFrom.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchFrom.totalSize">
    </el-pagination>
    <el-dialog :visible.sync="infoDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">设备密级信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-form-item label="设备类型" prop="secrecyName">
          <el-input v-model="infoData.secrecyName" autocomplete="off" placeholder="请输入设备密级"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" align="center">
        <el-button @click="infoDialog = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="formLoading">
          {{ formLoading?'提交中 ...':'确定'}}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Secrecy",
    data() {
      return {
        searchFrom: {
          secrecyName: '',
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "secrecyName",
          label: "设备密级",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }],
        infoData: {},
        infoRules: {
          secrecyName: [
            {required: true, message: '请输入设备密级', trigger: 'blur'}
          ]
        },
        tableData: [],
        loading: true,
        infoDialog: false,
        formLoading: false,
        infoLoading: true
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/equipment/secrecy/search", {
            params: {
              'secrecyName': this.searchFrom.secrecyName,
              'pageNum': this.searchFrom.pageNum,
              'pageSize': this.searchFrom.pageSize
            }
          }).then(resp => {
          if (resp && resp.status === 200) {
            this.searchFrom.pageNum = resp.data.pageNum
            this.searchFrom.pageSize = resp.data.pageSize
            this.searchFrom.totalSize = resp.data.totalSize
            this.tableData = resp.data.content
          } else {

          }
          this.loading = false
        })
      },
      onCreate() {
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          this.infoData = {
            secrecyId: "",
            secrecyName: ""
          }
          this.infoLoading = false
        })
      },
      handleSizeChange(val) {
        this.searchFrom.pageSize = val
        this.onSearch()
      },
      handleCurrentChange(val) {
        this.searchFrom.pageNum = val
        this.onSearch()
      },
      handleEdit(index, row) {
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          this.$axios.get("/equipment/secrecy/info", {
            params: {
              secrecyId: row.secrecyId
            }
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.infoData = resp.data
              this.infoLoading = false
            }
          })
        })
      },
      onSubmit() {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/equipment/secrecy/edit",
              formData,
              {
                headers: {"content-type": "application/x-www-form-urlencoded;charset=utf-8"}
              }).then(resp => {
                if (resp && resp.status === 200) {
                  if (resp.data.result) {
                    this.$message({
                      message: resp.data.content,
                      type: 'success'
                    })
                    this.init()
                    this.infoDialog = false
                  } else {
                    this.$message({
                      message: resp.data.content,
                      type: 'error'
                    })
                  }
                } else {

                }
                this.formLoading = false
              }
            )
          } else {
            this.formLoading = false
          }
        })
      },
      init() {
        this.$emit("tab", this.$route.path)
        this.onSearch()
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
