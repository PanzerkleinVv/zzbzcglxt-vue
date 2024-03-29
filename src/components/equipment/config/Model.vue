<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" size="small">
      <el-form-item label="查找型号">
        <el-input v-model="searchFrom.modelName" placeholder="查找设备型号" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item label="所属品牌">
        <el-cascader
          v-model="searchFrom.modelBrand" :props="{expandTrigger: 'hover', emitPath: false}" filterable
          :options="options" @change="onSearch" placeholder="全部品牌" :loading="typeListLoading" loading-text="载入中……"
          clearable></el-cascader>
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
      <div slot="title" style="color: #ffffff; font-size: larger">设备型号信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="设备型号" prop="modelName">
              <el-input v-model="infoData.modelName" autocomplete="off" placeholder="请输入设备型号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="所属品牌" prop="modelBrand" ref="modelBrand">
              <el-cascader
                v-model="infoData.modelBrand" :props="{expandTrigger: 'hover', emitPath: false}" filterable
                :options="options" placeholder="请选择" :loading="typeListLoading" loading-text="载入中……"></el-cascader>
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
    name: "Model",
    data() {
      return {
        searchFrom: {
          modelName: '',
          modelBrand: '',
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "modelName",
          label: "设备型号",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "typeName",
          label: "所属类型",
          showOverflowTooltip: true,
          sortable: true
        }, {
          prop: "brandName",
          label: "所属品牌",
          showOverflowTooltip: true,
          sortable: true
        }, {
          prop: "equipmentCount",
          label: "设备数量",
          showOverflowTooltip: true,
          sortable: true
        }],
        infoData: {},
        infoRules: {
          modelName: [
            {required: true, message: '请输入设备型号', trigger: 'blur'}
          ],
          modelBrand: [
            {required: true, message: '请选择', trigger: 'change'}
          ]
        },
        tableData: [],
        options: [],
        loading: true,
        infoDialog: false,
        infoLoading: true,
        formLoading: false,
        typeListLoading: true
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/equipment/model/search", {
            params: {
              'modelName': this.searchFrom.modelName,
              'modelBrand': this.searchFrom.modelBrand,
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
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          this.infoData = {
            modelId: "",
            modelName: "",
            modelBrand: ""
          }
          this.$refs["modelBrand"].resetField()
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
          this.$axios.get("/equipment/model/info", {
            params: {
              modelId: row.modelId
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
              "/equipment/model/edit",
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
      getTypeList() {
        this.$axios.get("/equipment/type/list").then(resp => {
          if (resp && resp.status === 200) {
            this.options = []
            for (let type of resp.data) {
              if (type.typeModel && type.brands.length > 0) {
                let typeOption = {
                  value: type.typeId,
                  label: type.typeName,
                  children: []
                }
                for (let brand of type.brands) {
                  let brandOption = {
                    value: brand.brandId,
                    label: brand.brandName
                  }
                  typeOption.children.push(brandOption)
                }
                this.options.push(typeOption)
              }
            }
            this.typeListLoading = false
          } else {

          }
        })
      },
      init() {
        this.$emit("tab", this.$route.path)
        this.getTypeList()
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
