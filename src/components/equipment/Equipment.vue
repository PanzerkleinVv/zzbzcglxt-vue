<template>
  <div>
    <el-form :model="searchFrom" ref="searchFrom" size="small" label-width="50px" label-position="center">
      <el-row type="flex" :gutter="20" justify="space-around">
        <el-col :span="8">
          <el-form-item label="编号">
            <el-input v-model="searchFrom.equipmentName" placeholder="查找设备编号" clearable @change="onSearch"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="分类">
            <el-cascader
              v-model="searchFrom.typeBrandModel" :props="{expandTrigger: 'hover', checkStrictly: true}" filterable
              :options="options" @change="onSearch" placeholder="全部" :loading="typeListLoading" loading-text="载入中……"
              clearable></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="8">
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
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20" justify="space-around">
        <el-col :span="8">
          <el-form-item label="mac">
            <el-input v-model="searchFrom.equipmentMac" placeholder="查找设备mac" clearable @change="onSearch"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="sn码">
            <el-input v-model="searchFrom.equipmentSn" placeholder="查找设备sn码" clearable @change="onSearch"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所在">
            <el-input v-model="searchFrom.logTarget" placeholder="查找存放地点" clearable @change="onSearch"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col align="center">
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button type="success" @click="onCreate">新增</el-button>
            <el-button type="info" @click="onMultipleAdmin">批量管理</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table
      :data="tableData"
      style="width: 100%"
      size="small"
      border
      stripe
      @selection-change="changeSelectRows">
      <el-table-column
        type="selection"
        width="40"
        align="center">
      </el-table-column>
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
      :current-page="searchFrom.pageNum"
      :page-sizes="[10, 20, 30]"
      :page-size="searchFrom.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchFrom.totalSize">
    </el-pagination>
    <el-dialog :visible.sync="infoDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">设备信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="设备编号" prop="equipmentName" ref="equipmentName">
              <el-input v-model="infoData.equipmentName" autocomplete="off" placeholder="请输入设备编号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="设备分类" prop="typeBrandModel" ref="typeBrandModel">
              <el-cascader
                v-model="infoData.typeBrandModel" :props="{expandTrigger: 'hover'}" filterable @change="switchType"
                :options="options" placeholder="请选择" :loading="typeListLoading" loading-text="载入中……"></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12" :hidden="!currentType.typeSecrecy" v-if="currentType.typeSecrecy">
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
          <el-col :span="12" :hidden="!currentType.typeIp" v-if="currentType.typeIp">
            <el-form-item label="IP" prop="equipmentIp" ref="equipmentIp">
              <el-input v-model="infoData.equipmentIp" autocomplete="off" placeholder="请输入设备IP"
                        :disabled="!currentType.typeIp" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12" :hidden="!currentType.typeMac" v-if="currentType.typeMac">
            <el-form-item label="mac" prop="equipmentMac" ref="equipmentMac">
              <el-input v-model="infoData.equipmentMac" autocomplete="off" placeholder="请输入设备mac"
                        :disabled="!currentType.typeMac"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :hidden="!currentType.typeSn" v-if="currentType.typeSn">
            <el-form-item label="sn码" prop="equipmentSn" ref="equipmentSn">
              <el-input v-model="infoData.equipmentSn" autocomplete="off" placeholder="请输入设备sn码"
                        :disabled="!currentType.typeSn"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="入库原因" prop="equipmentRegistrationReason" ref="equipmentRegistrationReason">
              <el-select v-model="infoData.equipmentRegistrationReason" placeholder="请选择"
                         :loading="registrationReasonListLoading" loading-text="载入中……"
                         filterable @change="switchRegistrationReason">
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
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24" :hidden="!equipmentRegistrationNoteDisabled" v-if="equipmentRegistrationNoteDisabled">
            <el-form-item label="入库备注" prop="equipmentRegistrationNote" ref="equipmentRegistrationNote">
              <el-input v-model="infoData.equipmentRegistrationNote" autocomplete="on" placeholder="设备入库来源备注"
                        :disabled="!equipmentRegistrationNoteDisabled"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input type="textarea" v-model="infoData.equipmentNote" autocomplete="on"
                        placeholder="设备备注"></el-input>
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
    <el-dialog :visible.sync="adminDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">设备管理</div>
      <el-card>
        <div v-loading="adminLoading" style="line-height:1.5;">
          <el-row>
            <el-col :span="2"><b>编号:</b></el-col>
            <el-col :span="22">{{adminData.equipmentName}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="2"><b>分类:</b></el-col>
            <el-col :span="10">{{adminData.typeName}}</el-col>
            <el-col :span="2"><b>型号:</b></el-col>
            <el-col :span="10">{{adminData.brandName + " " + adminData.modelName}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="2"><b>状态:</b></el-col>
            <el-col :span="10">{{equipmentStatusCode[adminData.equipmentStatus]}}</el-col>
            <el-col :span="2"><b>所在:</b></el-col>
            <el-col :span="10">{{adminData.logTarget == null ? "未定" : adminData.logTarget}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="2"><b>来源:</b></el-col>
            <el-col :span="10">{{adminData.equipmentRegistrationDate + " " + adminData.registrationReasonName +
              (adminData.equipmentRegistrationNote!=null?"（" + adminData.equipmentRegistrationNote +
              "）":"")}}
            </el-col>
            <el-col :span="2"><b>密级:</b></el-col>
            <el-col :span="10">{{adminData.secrecyName == null ? "" : adminData.secrecyName}}</el-col>
          </el-row>
        </div>
      </el-card>
      <div style="max-height: 400px; overflow: auto;">
        <el-divider content-position="left" style="font-size: large">管理操作</el-divider>
        <el-card v-loading="adminLoading">
          <el-row type="flex" justify="space-between">
            <el-col :span="24" align="center">
            <span :hidden="adminButtonHidden[0]">
              <el-button size="mini" @click="adminType = 0" type="success">借出
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[1]">
              <el-button size="mini" @click="adminType = 1" type="success">归还
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[2]">
              <el-button size="mini" @click="adminType = 2" type="warning">报修
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[3]">
              <el-button size="mini" @click="adminType = 3" type="primary">报废
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[4]">
              <el-button size="mini" @click="adminType = 4" type="info">存放
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[5]">
              <el-button size="mini" @click="adminType = 5" type="success">调拨
              </el-button>
            </span>
              <span :hidden="adminButtonHidden[6]">
              <el-popconfirm title="确定销毁？(该操作将彻底删除这个设备)" iconColor="#A61515" @onConfirm="deleteEquipment">
                 <el-button size="mini" slot="reference" type="warning">销毁</el-button>
              </el-popconfirm>
            </span>
            </el-col>
          </el-row>
          <el-form :model="adminForm[adminType]" ref="adminForm" :rules="adminRules" label-position="left"
                   label-width="65px"
                   size="mini" style="margin-top: 10px"
                   :hidden="adminForm[adminType].adminFormHidden">
            <el-row type="flex" justify="space-between" :gutter="10">
              <el-col :span="24">
                <el-form-item label="日期" prop="logOperationDate" ref="logOperationDate">
                  <el-date-picker
                    v-model="adminForm[adminType].logOperationDate"
                    type="date"
                    placeholder="选择操作日期"
                    format="yyyy 年 MM 月 dd 日"
                    value-format="yyyy-MM-dd">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row type="flex" justify="space-between" :gutter="10">
              <el-col :span="12" :hidden="adminForm[adminType].logTargetDisabled"
                      v-if="!adminForm[adminType].logTargetDisabled">
                <el-form-item :label="adminForm[adminType].targetName" prop="logTarget" ref="logTarget">
                  <el-input v-model="adminForm[adminType].logTarget" autocomplete="on"
                            :disabled="adminForm[adminType].logTargetDisabled"
                            :placeholder="adminForm[adminType].targetPlaceholder"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="经手人">
                  <el-input v-model="adminForm[adminType].userName" readonly></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row type="flex" justify="space-between">
              <el-col :span="24" align="center">
                <el-button @click="adminType = 6" size="mini">取 消</el-button>
                <el-button type="primary" @click="adminSubmit" :loading="formLoading" size="mini">
                  {{ formLoading?'提交中 ...':'确定'}}
                </el-button>
              </el-col>
            </el-row>
          </el-form>
          <template v-if="adminData.equipmentStatus === 4">
            <div align="center" style="font-size: x-small; color: #909399">无可用操作</div>
          </template>
        </el-card>
        <el-divider content-position="left" style="font-size: large">管理日志</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(item, i) in adminData.logs"
            :key="i"
            :type="logStatusCode[item.logStatus].type"
            size="large"
            placement="top"
            :timestamp="item.logOperationDate">
            <el-card>
              <el-row>
                <el-col :span="24"><h4>{{logStatusCode[item.logStatus].name}}</h4></el-col>
              </el-row>
              <el-row>
                <el-col :span="3" style="font-size: x-small"><b>{{logStatusCode[item.logStatus].targetName ?
                  logStatusCode[item.logStatus].targetName + "：" : ''}}</b></el-col>
                <el-col :span="9" style="font-size: x-small">{{item.logTarget}}</el-col>
                <el-col :span="3" style="font-size: x-small"><b>经手人:</b></el-col>
                <el-col :span="9" style="font-size: x-small">{{item.userName}}</el-col>
              </el-row>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div slot="footer" align="center">
        <el-button @click="adminDialog = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="multipleDialog" destroy-on-close append-to-body>
      <div slot="title" style="color: #ffffff; font-size: larger">设备信息</div>
      <el-form :model="multipleData" ref="multipleData" :rules="multipleRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-popover
              trigger="hover">
              <el-table size="mini" :data="multipleSelection" :show-header="false">
                <el-table-column property="equipmentName"></el-table-column>
                <el-table-column property="typeName"></el-table-column>
                <el-table-column property="brandName"></el-table-column>
                <el-table-column property="modelName"></el-table-column>
              </el-table>
              <el-form-item label="已选设备" slot="reference">
                <el-input v-model="'已选择' + multipleSelection.length + '台设备'" readonly></el-input>
              </el-form-item>
            </el-popover>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="可用操作" prop="logStatus" ref="logStatus">
              <el-select v-model="multipleData.logStatus" placeholder="请选择" filterable @change="multipleAdminChange">
                <el-option
                  v-for="(item,i) in logStatusCode"
                  :key="i"
                  :label="item.name"
                  :value="i"
                  :disabled="multipleAdminDisabled[i]">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经手人">
              <el-input v-model="multipleData.userName" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12" :hidden="multipleLogTargetDisable"
                  v-if="multipleData.logStatus != null && !multipleLogTargetDisable">
            <el-form-item :label="multipleTargetName" prop="logTarget" ref="logTarget">
              <el-input v-model="multipleData.logTarget" autocomplete="on"
                        :placeholder="'请输入' + multipleTargetName"
                        :disabled="multipleLogTargetDisable"
                        clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作日期" prop="logOperationDate" ref="logOperationDate">
              <el-date-picker
                v-model="multipleData.logOperationDate"
                type="date"
                placeholder="选择入库日期"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" align="center">
        <el-button @click="multipleDialog = false">取 消</el-button>
        <el-button type="primary" @click="multipleSubmit" :loading="formLoading">
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
      const validCodeIp = (rule, value, callback) => {
        const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if (reg.test(value)) {
          callback()
        } else {
          return callback(new Error('IP格式错误'))
        }
      }
      const checkEquipmentName = (rule, value, callback) => {
        this.$axios.get("/equipment/checkEquipmentName",
          {
            params:
              {
                'equipmentName': value,
                'equipmentId': this.infoData.equipmentId
              }
          }).then(resp => {
          if (resp.data === true) {
            callback()
          } else {
            return callback(new Error('设备编号已存在'))
          }
        })
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
        infoData: {
          equipmentRegistrationDate: ""
        },
        infoRules: {
          equipmentName: [
            {required: true, message: '请输入设备编号', trigger: 'blur'},
            {validator: checkEquipmentName, trigger: 'blur'}
          ],
          typeBrandModel: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          equipmentSecrecy: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          equipmentIp: [
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
            {required: true, message: '请输入入库来源', trigger: 'blur'}
          ]
        },
        tableData: [],
        options: [],
        typeList: [],
        currentType: {
          typeSecrecy: false,
          typeIp: false,
          typeMac: false,
          typeSn: false
        },
        loading: true,
        infoDialog: false,
        infoLoading: false,
        formLoading: false,
        typeListLoading: true,
        equipmentRegistrationNoteDisabled: false,
        registrationReasonList: [],
        registrationReasonListLoading: true,
        secrecyList: [],
        secrecyListLoading: true,
        statusList: [
          {statusName: "所有设备状态", statusValue: 5},
          {statusName: "库存", statusValue: 2},
          {statusName: "借出", statusValue: 1},
          {statusName: "维修", statusValue: 3},
          {statusName: "报废", statusValue: 0},
          {statusName: "调拨", statusValue: 4}
        ],
        equipmentStatusCode: ['报废', '借出', '库存', '维修', '调拨'],
        adminDialog: false,
        adminLoading: true,
        adminData: {},
        adminType: 6,
        adminForm: [
          {
            targetName: "借出人",
            logTargetDisabled: false,
            targetPlaceholder: "请填写借出人",
            logOperationDate: "",
            adminFormHidden: false
          },
          {
            targetName: "存放地",
            logTargetDisabled: false,
            targetPlaceholder: "请填写存放地",
            logOperationDate: "",
            adminFormHidden: false
          },
          {
            targetName: "",
            logTargetDisabled: true,
            targetPlaceholder: "",
            logOperationDate: "",
            adminFormHidden: false
          },
          {
            targetName: "存放地",
            logTargetDisabled: false,
            targetPlaceholder: "请填写存放地",
            logOperationDate: "",
            adminFormHidden: false
          },
          {
            targetName: "存放地",
            logTargetDisabled: false,
            targetPlaceholder: "请填写存放地",
            logOperationDate: "",
            adminFormHidden: false
          },
          {
            targetName: "接收方",
            logTargetDisabled: false,
            targetPlaceholder: "请填写接收方",
            logOperationDate: "",
            adminFormHidden: false
          },
          {targetName: "", logTargetDisabled: true, targetPlaceholder: "", logOperationDate: "", adminFormHidden: true}
        ],
        adminButtonHidden: [false, true, false, true, false, false, true],
        adminRules: {
          logTarget: [
            {required: true, message: "请填写", trigger: 'blur'}
          ],
          logOperationDate: [
            {required: true, message: '请选择操作日期', trigger: 'change'}
          ]
        },
        logStatusCode: [
          {name: "借出", type: 'success', targetName: '借出人'},
          {name: "归还", type: 'success', targetName: '存放地'},
          {name: "报修", type: 'warning'},
          {name: "报废", type: 'primary', targetName: '存放地'},
          {name: "存放", type: 'info', targetName: '存放地'},
          {name: "调拨", type: 'success', targetName: '接收方'}
        ],
        multipleSelection: [],
        multipleDialog: false,
        multipleData: {},
        multipleRules: {
          logTarget: [
            {required: true, message: "请填写", trigger: 'blur'}
          ],
          logOperationDate: [
            {required: true, message: '请选择操作日期', trigger: 'change'}
          ],
          logStatus: [
            {required: true, message: '请选择', trigger: 'change'}
          ]
        },
        multipleAdminDisabled: [false, false, false, false, false, false],
        multipleLogTargetDisable: true,
        multipleTargetName: "",
        userName: "",
        firstLoadFlag: true
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
              data0.logTarget = (data0.equipmentStatus == null ? "入库" : this.equipmentStatusCode[data0.equipmentStatus]) + "：" + (data0.logTarget == null ? "未定" : data0.logTarget)
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
            equipmentId: "",
            typeBrandModel: []
          }
          this.$refs['infoData'].resetFields()
          this.currentType = {
            typeSecrecy: false,
            typeIp: false,
            typeMac: false,
            typeSn: false
          }
          this.equipmentRegistrationNoteDisabled = false
          this.infoLoading = false
        })
      },
      onMultipleAdmin() {
        if (this.multipleSelection.length < 1) {
          this.$message({
            message: "请至少选择一个设备",
            type: 'error'
          })
          return false
        } else {
          this.infoLoading = true
          this.multipleDialog = true
          this.$nextTick(() => {
            this.multipleData = {
              logStatus: "",
              logOperationDate: ""
            }
            this.$refs.logOperationDate.resetField()
            this.$refs.logStatus.resetField()
            this.multipleData.userName = this.userName
            this.multipleAdminDisabled = [false, false, false, false, false, false]
            this.multipleData.multipleLogEquipment = []
            for (let equipment of this.multipleSelection) {
              this.multipleData.multipleLogEquipment.push(equipment.equipmentId)
              switch (equipment.equipmentStatus) {
                case 0:
                  this.multipleAdminDisabled[0] = true
                  this.multipleAdminDisabled[1] = true
                  this.multipleAdminDisabled[2] = true
                  this.multipleAdminDisabled[3] = true
                  this.multipleAdminDisabled[4] = true
                  break
                case 1:
                  this.multipleAdminDisabled[0] = true
                  this.multipleAdminDisabled[4] = true
                  this.multipleAdminDisabled[5] = true
                  break
                case 2:
                case 3:
                  this.multipleAdminDisabled[1] = true
                  break
                case 4:
                  this.multipleAdminDisabled[0] = true
                  this.multipleAdminDisabled[1] = true
                  this.multipleAdminDisabled[2] = true
                  this.multipleAdminDisabled[3] = true
                  this.multipleAdminDisabled[4] = true
                  this.multipleAdminDisabled[5] = true
                default:
                  this.multipleAdminDisabled[1] = true
                  this.multipleAdminDisabled[3] = true
              }
              this.infoLoading = false
            }
          })
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
          this.$axios.get("/equipment/info", {
            params: {'equipmentId': row.equipmentId}
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.infoData = resp.data
              this.infoData.typeBrandModel = []
              if (resp.data.equipmentType) {
                this.infoData.typeBrandModel.push(resp.data.equipmentType)
                if (resp.data.equipmentBrand) {
                  this.infoData.typeBrandModel.push(resp.data.equipmentBrand)
                  if (resp.data.equipmentModel) {
                    this.infoData.typeBrandModel.push(resp.data.equipmentModel)
                  }
                }
              }
            }
            this.switchRegistrationReason(this.infoData.equipmentRegistrationReason)
            this.switchType(this.infoData.typeBrandModel)
            this.infoLoading = false
          })
        })
      },
      switchRegistrationReason(val) {
        for (let registrationReason of this.registrationReasonList) {
          if (registrationReason.registrationReasonId === val) {
            this.equipmentRegistrationNoteDisabled = registrationReason.registrationReasonNote
            break
          }
        }
      },
      switchType(val) {
        for (let type of this.typeList) {
          if (type.typeId === val[0]) {
            this.currentType = type
            break
          }
        }
      },
      handleAdmin(index, row) {
        this.adminLoading = true
        this.adminDialog = true
        this.$nextTick(() => {
          this.$axios.get(
            "/equipment/admin",
            {params: {'equipmentId': row.equipmentId}}
          ).then(resp => {
            if (resp && resp.status === 200) {
              this.adminData = resp.data
              this.adminLoading = false
              this.adminType = 6
              switch (this.adminData.equipmentStatus) {
                case 0:
                  this.adminButtonHidden = [true, true, true, true, false, true, false]
                  break
                case 1:
                  this.adminButtonHidden = [true, false, false, false, true, true, true]
                  break
                case 2:
                case 3:
                  this.adminButtonHidden = [false, true, false, false, false, false, true]
                  break
                case 4:
                  this.adminButtonHidden = [true, true, true, true, true, true, true]
                  break
                default:
                  this.adminButtonHidden = [false, true, false, true, false, false, true]
                  break
              }
            }
          })
        })
      },
      onSubmit() {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            this.infoData.equipmentType = this.infoData.typeBrandModel[0]
            this.infoData.equipmentBrand = this.infoData.typeBrandModel[1]
            this.infoData.equipmentModel = this.infoData.typeBrandModel[2]
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/equipment/edit",
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
      deleteEquipment() {
        this.formLoading = true
        this.$axios.get(
          "/equipment/log/delete",
          {
            params: {equipmentId: this.adminData.equipmentId}
          }
        ).then(resp => {
          if (resp && resp.status === 200) {
            if (resp.data.result) {
              this.$message({
                message: resp.data.content,
                type: 'success'
              })
              this.init()
              this.adminDialog = false
              this.formLoading = false
            } else {
              this.$message({
                message: resp.data.content,
                type: 'error'
              })
              this.formLoading = false
            }
          }
          this.formLoading = false
        })
      },
      adminSubmit() {
        this.formLoading = true
        this.$refs.adminForm.validate((valid) => {
          if (valid) {
            this.adminForm[this.adminType].logEquipment = this.adminData.equipmentId
            this.adminForm[this.adminType].logStatus = this.adminType
            let formData = this.$querystring.stringify(this.adminForm[this.adminType])
            this.$axios.post(
              "/equipment/log/save",
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
                    this.adminDialog = false
                    this.formLoading = false
                  } else {
                    this.$message({
                      message: resp.data.content,
                      type: 'error'
                    })
                  }
                } else {
                  this.formLoading = false
                }
              }
            )
          } else {
            this.formLoading = false
          }
        })
      },
      multipleSubmit() {
        this.formLoading = true
        this.$refs.multipleData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.multipleData)
            this.$axios.post(
              "/equipment/log/multipleSave",
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
                    this.multipleDialog = false
                    this.formLoading = false
                  } else {
                    this.$message({
                      message: resp.data.content,
                      type: 'error'
                    })
                  }
                } else {
                  this.formLoading = false
                }
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
            this.typeList = resp.data
            for (let type of resp.data) {
              let typeOption = {
                value: type.typeId,
                label: type.typeName
              }
              if (type.typeBrand) {
                typeOption.children = []
                for (let brand of type.brands) {
                  let brandOption = {
                    value: brand.brandId,
                    label: brand.brandName
                  }
                  if (type.typeModel) {
                    brandOption.children = []
                    for (let model of brand.models) {
                      let modelOption = {
                        value: model.modelId,
                        label: model.modelName
                      }
                      brandOption.children.push(modelOption)
                    }
                  }
                  typeOption.children.push(brandOption)
                }
              }
              this.options.push(typeOption)
            }
            this.typeListLoading = false
          } else {

          }
        })
      },
      getRegistrationReasonList() {
        this.$axios.get("/equipment/registrationReason/list").then(resp => {
          if (resp && resp.status === 200) {
            this.registrationReasonList = resp.data
            this.registrationReasonListLoading = false
          } else {

          }
        })
      },
      getSecrecyList() {
        this.$axios.get("/equipment/secrecy/list").then(resp => {
          if (resp && resp.status === 200) {
            this.secrecyList = resp.data
            this.secrecyListLoading = false
          } else {

          }
        })
      },
      getUser() {
        this.$axios.get("/user/me").then(resp => {
          if (resp && resp.status === 200) {
            for (let adminForm0 of this.adminForm) {
              adminForm0.userName = resp.data.userName
            }
            this.userName = resp.data.userName
          } else {

          }
        })
      },
      changeSelectRows(val) {
        this.multipleSelection = val
      },
      multipleAdminChange(val) {
        if (this.logStatusCode[val].targetName == null) {
          this.multipleLogTargetDisable = true
          this.multipleTargetName = ""
        } else {
          this.multipleLogTargetDisable = false
          this.multipleTargetName = this.logStatusCode[val].targetName
        }
        this.multipleData.userName = this.userName
      },
      init() {
        if (this.firstLoadFlag) {
          this.$emit("title", "设备管理")
          this.getTypeList()
          this.getSecrecyList()
          this.getRegistrationReasonList()
          this.getUser()
          this.searchFrom.typeBrandModel[0] = this.$route.params.equipmentType
          this.searchFrom.equipmentStatus = this.$route.params.equipmentStatus
          this.firstLoadFlag = false
        }
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

