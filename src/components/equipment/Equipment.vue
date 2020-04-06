<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom">
      <el-form-item label="编号">
        <el-input v-model="searchFrom.equipmentName" placeholder="查找设备编号" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item label="类型/品牌/型号">
        <el-cascader
          v-model="searchFrom.typeBrandModel" :props="{expandTrigger: 'hover', checkStrictly: true}" filterable
          :options="options" @change="onSearch" placeholder="全部" :loading="typeListLoading" loading-text="载入中……"
          clearable></el-cascader>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchFrom.equipmentStatus" @change="onSearch" filterable>
          <el-option
            v-for="(item,i) in statusList"
            :key="i"
            :label="item.statusName"
            :value="item.statusValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="mac">
        <el-input v-model="searchFrom.equipmentMac" placeholder="查找设备mac" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item label="sn码">
        <el-input v-model="searchFrom.equipmentSn" placeholder="查找设备sn码" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item label="所在">
        <el-input v-model="searchFrom.logTarget" placeholder="查找存放地点" clearable @change="onSearch"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="success" @click="onCreate">新增</el-button>
        <el-button @click="onMultipleAdmin">批量管理</el-button>
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
            type="success"
            size="mini"
            @click="handleAdmin(scope.$index, scope.row)">管理
          </el-button>
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
      <div slot="title" style="color: #ffffff; font-size: larger">设备信息</div>
      <el-form inline :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备编号" prop="equipmentName" ref="equipmentName">
              <el-input v-model="infoData.equipmentName" autocomplete="off" placeholder="请输入设备编号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备分类" prop="typeBrandModel" ref="typeBrandModel">
              <el-cascader
                v-model="infoData.typeBrandModel" :props="{expandTrigger: 'hover'}" filterable
                :options="options" placeholder="请选择" :loading="typeListLoading" loading-text="载入中……"></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!currentType.typeSecrecy">
            <el-form-item label="设备密级" prop="equipmentSecrecy" ref="equipmentSecrecy">
              <el-select v-model="infoData.equipmentSecrecy" placeholder="请选择" :loading="secrecyListLoading"
                         loading-text="载入中……" :disabled="!currentType.typeSecrecy"
                         filterable>
                <el-option
                  v-for="(item,i) in secrecyList"
                  :key="i"
                  :label="item.secrecyName"
                  :value="item.secrecyId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!currentType.typeIp">
            <el-form-item label="IP" prop="ipStr" ref="ipStr">
              <el-input v-model="infoData.ipStr" autocomplete="off" placeholder="请输入设备IP"
                        :disabled="!currentType.typeIp"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!currentType.typeMac">
            <el-form-item label="mac" prop="equipmentMac" ref="equipmentMac">
              <el-input v-model="infoData.equipmentMac" autocomplete="off" placeholder="请输入设备mac"
                        :disabled="!currentType.typeMac"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!currentType.typeSn">
            <el-form-item label="sn码" prop="equipmentSn" ref="equipmentSn">
              <el-input v-model="infoData.equipmentSn" autocomplete="off" placeholder="请输入设备sn码"
                        :disabled="!currentType.typeSn"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="入库原因" prop="equipmentRegistrationReason" ref="equipmentRegistrationReason">
              <el-select v-model="infoData.equipmentRegistrationReason" placeholder="请选择"
                         :loading="registrationReasonListLoading" loading-text="载入中……"
                         filterable>
                <el-option
                  v-for="(item,i) in registrationReasonList"
                  :key="i"
                  :label="item.registrationReasonName"
                  :value="item.registrationReasonId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库日期" prop="equipmentRegistrationDate" ref="equipmentRegistrationDate">
              <el-date-picker
                v-model="infoData.equipmentRegistrationDate"
                type="date"
                placeholder="选择入库日期"
                format="yyyy 年 MM 月 dd 日">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!equipmentRegistrationNoteDisabled">
            <el-form-item label="入库备注" prop="equipmentRegistrationNote" ref="equipmentRegistrationNote">
              <el-input v-model="infoData.equipmentRegistrationNote" autocomplete="on" placeholder="设备入库来源备注"
                        :disabled="!equipmentRegistrationNoteDisabled"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="equipmentRegistrationNote" ref="equipmentRegistrationNote">
            <el-input type="textarea" v-model="infoData.equipmentRegistrationNote" autocomplete="on"
                      placeholder="设备入库来源备注"></el-input>
          </el-form-item>
        </el-col>
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
    name: "Equipment",
    data() {
      let validCodeIp = (rule, value, callback) => {
        const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if (reg.test(value)) {
          callback()
        } else {
          return callback(new Error('IP格式错误'))
        }
      }
      return {
        searchFrom: {
          equipmentName: '',
          typeBrandModel: [],
          equipmentStatus: 5,
          equipmentMac: '',
          equipmentSn: '',
          logTarget: '',
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
          prop: "brandModel",
          label: "品牌型号",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "equipmentName",
          label: "设备编号",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "logTarget",
          label: "存放地点",
          showOverflowTooltip: true,
          sortable: true
        }],
        infoData: {},
        infoRules: {
          equipmentName: [
            {required: true, message: '请输入设备编号', trigger: 'blur'}
          ],
          typeBrandModel: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          equipmentSecrecy: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          ipStr: [
            {required: true, message: '请输入IP地址，如127.0.0.1', trigger: 'blur'},
            {validator: validCodeIp, trigger: 'blur'}
          ],
          equipmentMac: [
            {required: true, message: '请输入mac地址', trigger: 'blur'}
          ],
          equipmentSn: [
            {required: true, message: '请输入sn码', trigger: 'blur'}
          ],
          equipmentRegistrationReason: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          equipmentRegistrationDate: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          equipmentRegistrationNote: [
            {required: true, message: '请输入sn码', trigger: 'blur'}
          ]
        },
        tableData: [],
        options: [],
        currentType: {
          typeSecrecy: false,
          typeIp: false,
          typeMac: false,
          typeSn: false
        },
        loading: true,
        infoDialog: false,
        formLoading: false,
        typeListLoading: true,
        equipmentRegistrationNoteDisabled: false,
        registrationReasonList: [],
        registrationReasonListLoading: true,
        secrecyList: [],
        secrecyListLoading: true,
        statusList: [
          {statusName: "所有设备状态", statusValue: 5},
          {statusName: "暂存", statusValue: 2},
          {statusName: "借出", statusValue: 1},
          {statusName: "维修", statusValue: 3},
          {statusName: "报废", statusValue: 0},
          {statusName: "调拨", statusValue: 4}
        ],
        equipmentStatusCode: ['报废', '借出', '暂存', '维修', '调拨']
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/equipment/search", {
            params: {
              'equipmentName': this.searchFrom.equipmentName,
              'equipmentType': this.searchFrom.typeBrandModel[0],
              'equipmentBrand': this.searchFrom.typeBrandModel[1],
              'equipmentModel': this.searchFrom.typeBrandModel[2],
              'equipmentStatus': this.searchFrom.equipmentStatus,
              'equipmentMac': this.searchFrom.equipmentMac,
              'equipmentSn': this.searchFrom.equipmentSn,
              'logTarget': this.searchFrom.logTarget,
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
              data0.brandModel = data0.brandName + ' ' + data0.modelName
              data0.logTarget = (!data0.equipmentStatus ? "入库" : this.equipmentStatusCode[data0.equipmentStatus]) + "：" + (!(data0.logs.length === 0 ? null : data0.logs[0].logTarget) ? "未定" : (data0.logs.length === 0 ? null : data0.logs[0].logTarget))
              this.tableData.push(data0)
            }
          } else {

          }
          this.loading = false
        })
      },
      onCreate() {
        this.infoDialog = true
        this.$nextTick(() => {
          this.infoData = {
            modelId: "",
            modelName: "",
            modelBrand: ""
          }
          this.$refs["modelBrand"].resetField()
        })
      },
      onMultipleAdmin() {

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
        this.infoDialog = true
        this.$nextTick(() => {
          this.infoData = row
        })
      },
      handleAdmin(index, row) {

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
                    });
                    this.init()
                    this.infoDialog = false
                  } else {
                    this.$message({
                      message: resp.data.content,
                      type: 'error'
                    });
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
