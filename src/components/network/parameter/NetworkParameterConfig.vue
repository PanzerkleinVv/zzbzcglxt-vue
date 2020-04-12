<template>
  <div>
    <el-card align="left">
      <el-button type="success" @click="onCreate" size="small">新增参数</el-button>
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
      <div slot="title" style="color: #ffffff; font-size: larger">网络参数信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="参数名" prop="networkParameterName">
              <el-input v-model="infoData.networkParameterName" autocomplete="off" placeholder="请输入参数名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分组">
              <el-input v-model="infoData.groupName" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="参数值">
              <el-input v-model="infoData.networkParameterValue" autocomplete="off" placeholder="请输入参数值"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用途" prop="networkParameterUse" ref="networkParameterUse">
              <el-select v-model="infoData.networkParameterUse" placeholder="请选择" filterable>
                <el-option
                  v-for="(item,i) in useList"
                  :key="i"
                  :label="item"
                  :value="i">
                </el-option>
              </el-select>
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
    name: "NetworkParameterConfig",
    data() {
      return {
        currentGroup: 0,
        searchFrom: {
          networkParameterGroup: 0,
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "networkParameterName",
          label: "参数名",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "use",
          label: "适用范围",
          showOverflowTooltip: true,
          sortable: true
        }, {
          prop: "networkParameterValue",
          label: "参数值",
          showOverflowTooltip: true,
          sortable: true
        }],
        infoData: {},
        infoRules: {
          networkParameterName: [
            {required: true, message: '请输入参数名', trigger: 'blur'}
          ],
          networkParameterUse: [
            {required: true, message: '请选择参数使用范围', trigger: 'change'}
          ]
        },
        tableData: [],
        loading: true,
        infoDialog: false,
        formLoading: false,
        infoLoading: true,
        useList: ['全部可用', '仅服务器', '仅PC', '停用'],
        groupList: ['终端类型', '操作系统', '网段', '房号', '密级']
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/network/networkParameter/search", {
            params: {
              'networkParameterGroup': this.currentGroup,
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
            networkParameterId: "",
            networkParameterName: "",
            networkParameterValue: "",
            networkParameterGroup: this.currentGroup,
            groupName: this.groupList[this.currentGroup]
          }
          this.$refs.networkParameterUse.resetField()
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
          this.$axios.get("/network/networkParameter/info", {
            params: {
              networkParameterId: row.networkParameterId
            }
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.infoData = resp.data
              this.infoData.groupName = this.groupList[this.currentGroup]
              this.infoData.networkParameterUse = resp.data.networkParameterUse
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
              "/network/networkParameter/edit",
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
        this.currentGroup = this.$route.params.group
        this.onSearch()
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      '$route'(to, from) {
        this.init()
      }
    }
  }
</script>

<style scoped>
  .el-form {
    text-align: left;
  }

</style>
