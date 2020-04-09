<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" size="small">
      <el-form-item label="查找耗材">
        <el-input v-model="searchFrom.consumableName" placeholder="查找耗材" clearable @change="onSearch"></el-input>
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
            type="info"
            size="mini"
            @click="handleSplit(scope.$index, scope.row)"
            v-if="scope.row.subConsumable.length > 0 && scope.row.consumableCount > 0">拆散
          </el-button>
          <el-button
            type="warning"
            size="mini"
            @click="handleCheck(scope.$index, scope.row)">盘点
          </el-button>
          <el-button
            type="success"
            size="mini"
            @click="handleBuy(scope.$index, scope.row)">进货
          </el-button>
        </template>
      </el-table-column>
      <div slot="default"
           :loading="loading"></div>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchFrom.pageNum"
      :page-sizes="[10, 20, 30]"
      :page-size="searchFrom.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchFrom.totalSize">
    </el-pagination>
    <el-dialog :visible.sync="infoDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">耗材信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="耗材名" prop="consumableName" ref="consumableName">
              <el-input v-model="infoData.consumableName" autocomplete="off" placeholder="请输入耗材名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耗材单位" prop="consumableUnit" ref="consumableUnit">
              <el-input v-model="infoData.consumableUnit" autocomplete="on" placeholder="请输入耗材单位" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="整包耗材" prop="packageId" ref="packageId">
              <el-select v-model="infoData.packageId" placeholder="请选择" :loading="consumableListLoading"
                         loading-text="载入中……" filterable>
                <el-option
                  v-for="(item,i) in consumableList"
                  :key="i"
                  :label="item.consumableName"
                  :value="item.consumableId">
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
    <el-dialog :visible.sync="ledgerDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">台账登记</div>
      <el-form :model="ledgerData" ref="ledgerData" :rules="ledgerRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="耗材">
              <el-input v-model="ledgerData.consumableName" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作">
              <el-input v-model="ledgerTypeNames[ledgerData.ledgerType]" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="变更数量" prop="ledgerCount" ref="ledgerCount">
              <el-input-number v-model="ledgerData.ledgerCount" :min="ledgerData.ledgerCountMin" :precision="0"
                               :max="ledgerData.ledgerCountMax"></el-input-number>
              <span>{{ledgerData.consumableUnit}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包装规格" prop="subCount" ref="subCount" v-if="ledgerData.ledgerType === 3">
              <el-input-number v-model="ledgerData.subCount" :min="1" :precision="0"></el-input-number>
              <span>{{ledgerData.ledgerSubUnit + "/每" + ledgerData.consumableUnit}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="经手人">
              <el-input v-model="ledgerData.userName" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" align="center">
        <el-button @click="ledgerDialog = false">取 消</el-button>
        <el-button type="primary" @click="ledgerSubmit" :loading="formLoading">
          {{ formLoading?'提交中 ...':'确定'}}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    name: "Consumable",
    data() {
      let validateCount = (rule, value, callback) => {
        if (value === 0) {
          callback(new Error('不能为0'));
        } else {
          callback();
        }
      }
      return {
        searchFrom: {
          consumableName: '',
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "consumableNameUnit",
          label: "耗材",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "countUnit",
          label: "存量",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }],
        infoData: {},
        infoRules: {
          consumableName: [
            {required: true, message: '请输入耗材名', trigger: 'blur'}
          ],
          consumableUnit: [
            {required: true, message: '请输入耗材单位', trigger: 'blur'}
          ]
        },
        tableData: [],
        loading: true,
        infoDialog: false,
        infoLoading: false,
        formLoading: false,
        consumableListLoading: true,
        consumableList: [],
        ledgerData: {
          consumableName: "",
          ledgerType: 0,
          ledgerConsumable: "",
          ledgerCount: 1,
          ledgerCountMin: 0,
          ledgerCountMax: 1,
          consumableUnit: "",
          subCount: 1,
          ledgerSubUnit: ""
        },
        ledgerDialog: false,
        ledgerRules: {
          ledgerCount: [
            {required: true, message: '请输入变动数量', trigger: 'change'},
            {validator: validateCount, trigger: 'change'}
          ],
          subCount: [
            {required: true, message: '请输入包装规格', trigger: 'change'}
          ]
        },
        ledgerTypeNames: ['盘点', '进货', '领取', '拆分']
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/consumable/search", {
            params: {
              'consumableName': this.searchFrom.consumableName,
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
              data0.consumableNameUnit = data0.consumableName + (data0.subConsumable.length === 0 && data0.packageId == null ? "" : "（" + data0.consumableUnit + "）")
              data0.countUnit = data0.consumableCount + data0.consumableUnit
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
            consumableId: ""
          }
          this.$refs['infoData'].resetFields()
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
      handleCheck(index, row) {
        this.openLedger(row, 0)
      },
      handleBuy(index, row) {
        this.openLedger(row, 1)
      },
      handleSplit(index, row) {
        this.openLedger(row, 3)
      },
      openLedger(row, type) {
        this.infoLoading = true
        this.ledgerDialog = true
        this.$nextTick(() => {
            this.ledgerData = {
              ledgerType: type,
              ledgerConsumable: row.consumableId,
              consumableName: row.consumableName,
              consumableUnit: row.consumableUnit,
              ledgerCount: 1,
              userName: this.userName
            }
            if (this.ledgerData.ledgerType === 0) {
              this.ledgerData.ledgerCountMin = -(row.consumableCount)
            } else if (this.ledgerData.ledgerType === 1) {
              this.ledgerData.ledgerCountMin = 1
              this.ledgerData.ledgerCountMax = Infinity
            } else if (this.ledgerData.ledgerType === 3) {
              this.ledgerData.ledgerCountMin = 1
              this.ledgerData.ledgerCountMax = row.consumableCount
              this.ledgerData.ledgerSubUnit = row.subConsumable[0].consumableUnit
              this.ledgerData.subCount = 1
            }
            this.infoLoading = false
          }
        )
      },
      onSubmit() {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/consumable/edit",
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
                    this.formLoading = false
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
      ledgerSubmit() {
        this.formLoading = true
        this.$refs.ledgerData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.ledgerData)
            this.$axios.post(
              "/consumable/ledger/edit",
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
                    this.ledgerDialog = false
                    this.formLoading = false
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
      getConsumableList() {
        this.$axios.get("/consumable/list").then(resp => {
          if (resp && resp.status === 200) {
            for (let n of resp.data) {
              n.consumableName = n.consumableName + (n.packageId !== "0" ? "（" + n.consumableUnit + "）" : "")
            }
            this.consumableList = resp.data
            this.consumableListLoading = false
          } else {

          }
        })
      },
      getUser() {
        this.userName = this.$store.getters.getUser.userName
      },
      init() {
        this.$emit("title", "耗材库存管理")
        this.getConsumableList()
        this.getUser()
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
