<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" size="small">
      <el-form-item label="查找类型">
        <el-input v-model="searchFrom.typeName" placeholder="查找设备类型" clearable @change="onSearch"></el-input>
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
      <div slot="title" style="color: #ffffff; font-size: larger">设备类型信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="设备类型" prop="typeName">
              <el-input v-model="infoData.typeName" autocomplete="off" placeholder="请输入设备类型"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="需要品牌">
              &emsp;
              <el-switch v-model="infoData.typeBrand" active-text="是" inactive-text="否" @change="typeBrandChange">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需要型号">
              &emsp;
              <el-switch v-model="infoData.typeModel" active-text="是" inactive-text="否" :disabled="typeModelDisabled"
                         ref="typeModel">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="需要密级">
              &emsp;
              <el-switch v-model="infoData.typeSecrecy" active-text="是" inactive-text="否">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需要IP">
              &emsp;
              <el-switch v-model="infoData.typeIp" active-text="是" inactive-text="否">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="需要sn码">
              &emsp;
              <el-switch v-model="infoData.typeSn" active-text="是" inactive-text="否">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需要mac">
              &emsp;
              <el-switch v-model="infoData.typeMac" active-text="是" inactive-text="否">
              </el-switch>
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
    name: "Type",
    data() {
      return {
        searchFrom: {
          typeName: '',
          pageSize: 10,
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
        infoData: {},
        infoRules: {
          typeName: [
            {required: true, message: '请输入设备类型', trigger: 'blur'}
          ]
        },
        tableData: [],
        loading: true,
        infoDialog: false,
        infoLoading: true,
        typeModelDisabled: true,
        formLoading: false
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/equipment/type/search", {
            params: {
              'typeName': this.searchFrom.typeName,
              'pageNum': this.searchFrom.pageNum,
              'pageSize': this.searchFrom.pageSize
            }
          }).then(resp => {
          if (resp && resp.status === 200) {
            this.searchFrom.pageNum = resp.data.pageNum
            this.searchFrom.pageSize = resp.data.pageSize
            this.searchFrom.totalSize = resp.data.totalSize
            this.tableData = []
            for (let data0 of resp.data.content) {
              data0.equipmentCount = data0.equipmentCount ? data0.equipmentCount : 0
              this.tableData.push(data0)
            }
          } else {

          }
          this.loading = false
        })
      },
      onCreate() {
        this.typeModelDisabled = true
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          this.infoData = {
            typeId: "",
            typeName: "",
            typeBrand: false,
            typeModel: false,
            typeSecrecy: false,
            typeIp: false,
            typeSn: false,
            typeMac: false
          }
          this.infoLoading = false
        })
      },
      typeBrandChange(val) {
        if (val) {
          this.typeModelDisabled = false
        } else {
          this.infoData.typeModel = false
          this.typeModelDisabled = true
        }
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
          this.$axios.get("/equipment/type/info", {
            params: {
              typeId: row.typeId
            }
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.typeModelDisabled = !row.typeBrand
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
              "/equipment/type/edit",
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
