<template>
  <div>
    <el-card align="left">
      <el-button type="success" @click="onCreate" size="small">新增用户</el-button>
    </el-card>
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
            :loading="resetLoading[scope.$index]"
            @click="handleEdit(scope.$index, scope.row)">重置密码
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
      <div slot="title" style="color: #ffffff; font-size: larger">新增用户</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="infoData.userName" autocomplete="off" placeholder="请输入用户名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="infoData.userDesc" autocomplete="off" placeholder="请输入用户备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
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
    name: "User",
    data() {
      const checkUserName = (rule, value, callback) => {
        this.$axios.get("/user/checkUserName",
          {
            params:
              {
                'userName': value
              }
          }).then(resp => {
          if (resp.data === true) {
            callback()
          } else {
            return callback(new Error('用户名已存在'))
          }
        })
      }
      return {
        searchFrom: {
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "userName",
          label: "用户名",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "userDesc",
          label: "备注",
          showOverflowTooltip: true,
          sortable: true,
        }],
        infoData: {},
        infoRules: {
          userName: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {validator: checkUserName, trigger: 'blur'}
          ]
        },
        tableData: [],
        resetLoading: [],
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
          "/user/list", {
            params: {
              'userName': this.searchFrom.userName,
              'userDesc': this.searchFrom.userDesc,
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
            userName: "",
            userDesc: ""
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
        this.resetLoading[index] = true
        this.$axios.get("/user/reset", {
          params: {
            userId: row.userId
          }
        }).then(resp => {
          if (resp.data.result) {
            this.$message({
              message: resp.data.content,
              type: 'success'
            })
            this.init()
            this.resetLoading[index] = false
          } else {
            this.$message({
              message: resp.data.content,
              type: 'error'
            })
            this.resetLoading[index] = false
          }
        })
      },
      onSubmit() {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/user/create",
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
        this.$emit("title", "用户设置")
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
