<template>
  <div>
    <el-form :inline="true" :model="searchFrom" ref="searchFrom" size="small">
      <el-form-item label="查找耗材">
        <el-select v-model="searchFrom.ledgerConsumable" placeholder="全部耗材" @change="onSearch"
                   :loading="consumableListLoading"
                   loading-text="载入中……" clearable filterable>
          <el-option
            v-for="(item,i) in consumableList"
            :key="i"
            :label="item.consumableName"
            :value="item.consumableId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="success" @click="handleReceive">领取</el-button>
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
        v-if="4!==i"
        :prop="item.prop"
        :label="item.label"
        :sortable="item.sortable"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.showOverflowTooltip"
        :key="i"
        :index="item.index">
      </el-table-column>
      <el-table-column
        v-else
        :label="item.label"
        :sortable="item.sortable"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.showOverflowTooltip"
        :key="i"
        :index="item.index">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" v-if="scope.row.ledgerPerson != null">
            <p>姓名: {{ scope.row.ledgerPerson }}</p>
            <p>处室: {{ scope.row.ledgerUnit }}</p>
            <div slot="reference">
              <el-tag size="small">{{ scope.row.ledgerPerson }}</el-tag>
            </div>
          </el-popover>
          <span style="font-size: x-small; color: #909399" v-else>无</span>
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
    <el-dialog :visible.sync="ledgerDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">台账登记</div>
      <el-form :model="ledgerData" ref="ledgerData" :rules="ledgerRules" label-position="right" label-width="80px"
               size="small" v-loading="ledgerLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="耗材" prop="ledgerConsumable" ref="ledgerConsumable">
              <el-select v-model="ledgerData.ledgerConsumable" placeholder="请选择"
                         :loading="consumableListLoading" @change="consumableChange"
                         loading-text="载入中……" clearable filterable>
                <el-option
                  v-for="(item,i) in consumableList"
                  :key="i"
                  :label="item.consumableName"
                  :value="item.consumableId">
                </el-option>
              </el-select>
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
            <el-form-item label="处室" prop="ledgerUnit" ref="ledgerUnit">
              <el-select v-model="ledgerData.ledgerUnit" placeholder="选择或填写处室" clearable filterable allow-create>
                <el-option
                  v-for="(item,i) in unitList"
                  :key="i"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="领取人" prop="ledgerPerson" ref="ledgerPerson">
              <el-input v-model="ledgerData.ledgerPerson" autocomplete="on" placeholder="请输入领取人" clearable
                        default-first-option></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="变更数量" prop="ledgerCount" ref="ledgerCount">
              <el-input-number v-model="ledgerData.ledgerCount" :min="1" :precision="0"
                               :max="ledgerData.ledgerCountMax"></el-input-number>
              <span>{{ledgerData.consumableUnit}}</span>
            </el-form-item>
          </el-col>
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
    name: "Ledger",
    data() {
      return {
        searchFrom: {
          ledgerConsumable: '',
          pageSize: 10,
          totalSize: 0,
          pageNum: 1
        },
        tableHeader: [{
          prop: "ledgerTime",
          label: "日期",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "consumableName",
          label: "耗材",
          showOverflowTooltip: true,
          sortable: true,
          fixed: true
        }, {
          prop: "typeName",
          label: "变动",
          showOverflowTooltip: true,
          sortable: true
        }, {
          prop: "countUnit",
          label: "数量",
          showOverflowTooltip: true,
          sortable: true
        }, {
          label: "领取人",
          showOverflowTooltip: true,
          sortable: true
        }, {
          prop: "userName",
          label: "经手人",
          showOverflowTooltip: true,
          sortable: true
        }],
        tableData: [],
        loading: true,
        formLoading: false,
        consumableListLoading: true,
        consumableList: [],
        ledgerData: {
          ledgerType: 2,
          ledgerConsumable: "",
          ledgerCount: 1,
          ledgerCountMax: Infinity,
          ledgerUnit: "",
          ledgerPerson: ""
        },
        ledgerLoading: false,
        ledgerDialog: false,
        ledgerRules: {
          ledgerConsumable: [
            {required: true, message: '请选择耗材类型', trigger: 'change'}
          ],
          ledgerUnit: [
            {required: true, message: '请选择或填写处室', trigger: 'change'}
          ],
          ledgerPerson: [
            {required: true, message: '请输入领取人', trigger: 'blur'}
          ],
          ledgerCount: [
            {required: true, message: '请填写变更数量', trigger: 'change'}
          ]
        },
        ledgerTypeNames: ['盘点', '进货', '领取', '拆分'],
        unitList: ['部领导', '办公室', '研究室（政策法规处）', '组织一处', '组织二处', '组织三处', '组织四处（党员教育中心）', '干部一处', '干部二处', '干部三处', '干部四处', '干部五处', '干部六处（干部队伍建设规划办）', '公务员一处', '公务员二处', '公务员三处', '人才一处', '人才二处', '干部监督室（举报中心）', '干部培训处', '信息处', '机关党委（人事处）', '驻部纪检监察组', '省党委系统干部培训中心', '工勤与其他']
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/consumable/ledger/search", {
            params: {
              'ledgerConsumable': this.searchFrom.ledgerConsumable,
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
              data0.countUnit = data0.ledgerCount + data0.consumableUnit
              data0.typeName = this.ledgerTypeNames[data0.ledgerType]
              this.tableData.push(data0)
            }
          } else {

          }
          this.loading = false
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
      handleReceive() {
        this.openLedger(2)
      },
      openLedger(type) {
        this.ledgerLoading = true
        this.ledgerDialog = true
        this.$nextTick(() => {
            this.ledgerData = {
              ledgerType: type,
              ledgerConsumable: "",
              ledgerCount: 1,
              ledgerCountMax: Infinity,
              ledgerUnit: "",
              ledgerPerson: "",
              userName: this.userName
            }
            this.$refs['ledgerData'].resetFields()
            this.ledgerLoading = false
          }
        )
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
      consumableChange(val) {
        for (let consumable of this.consumableList) {
          if (consumable.consumableId === val) {
            this.ledgerData.consumableUnit = consumable.consumableUnit
            this.ledgerData.ledgerCountMax = consumable.consumableCount
            break
          }
        }
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
        this.$emit("title", "耗材台账")
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
