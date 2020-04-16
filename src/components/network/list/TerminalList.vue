<template>
  <div>
    <div style="margin-bottom: 10px" align="right">
      <el-button type="info" size="small" @click="onSearch">刷新</el-button>
      <el-button type="success" size="small" @click="onCreate">手动新增</el-button>
      <el-button type="warning" size="small" @click="onScan" :loading="scanning">扫描网段</el-button>
    </div>
    <el-card v-if="scanData != null && scanData.length > 0">
      <el-table
        :data="scanData"
        style="width: 100%"
        size="mini"
        border
        max-height="200"
        stripe>
        <el-table-column
          prop="terminalIp"
          label="新发现的终端"
          sortable>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              @click="handleEditScan(scope.$index, scope.row)">新增
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="scanData.splice(scope.$index, 1)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="padding-top: 5px;">
        <el-button size="mini" icon="el-icon-close" circle @click="scanData = null"></el-button>
      </div>
    </el-card>
    <el-card v-loading="loading">
      <el-row type="flex" justify="start" v-for="(row,i) in tableRow" :key="i"
              style="padding: 10px">
        <el-col v-for="(item,j) in row" :key="j" :span="colSpan" align="center">
          <el-card shadow="hover" :body-style="{ padding: '0px'}" style="width: 100px"
                   :title="item.title" @contextmenu.prevent.native="showMenu($event,i*rowSize+j)">
            <img :src="item.imageUrl" class="terminal-icon">
            <div class="terminal-icon-text">{{item.terminalName}}</div>
            <div class="terminal-icon-text">{{item.terminalIp}}</div>
            <vue-context-menu :contextMenuData="contextMenuData"
                              :transferIndex="transferIndex"
                              @handleEdit="handleEdit(i*rowSize+j)"
                              @handleDelete="handleDelete(i*rowSize+j)">
            </vue-context-menu>
          </el-card>
        </el-col>
      </el-row>
      <div v-if="tableData.length === 0" style="color: #909399; font-size: small" align="center">暂无数据</div>
    </el-card>
    <el-dialog :visible.sync="infoDialog" destroy-on-close append-to-body width="70%">
      <div slot="title" style="color: #ffffff; font-size: larger">编辑终端信息</div>
      <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
               size="small" v-loading="infoLoading">
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="终端名" prop="terminalName">
              <el-input v-model="infoData.terminalName" autocomplete="off" placeholder="请输入终端名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终端类型" prop="terminalType" ref="terminalType">
              <el-select v-model="infoData.terminalType" placeholder="请选择" filterable @change="changeType">
                <el-option
                  v-for="(item,i) in typeList"
                  :key="i"
                  :label="item.networkParameterName"
                  :value="item.networkParameterId"
                  :disabled="item.networkParameterUse !== currentUse && item.networkParameterUse !== 0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="网段" ref="segment">
              <el-input v-model="infoData.segment" readonly>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交换机" ref="terminalSwitch">
              <el-select v-model="infoData.terminalSwitch" placeholder="请选择" filterable>
                <el-option
                  v-for="(item,i) in switchList"
                  :key="i"
                  :label="item.terminalName"
                  :value="item.terminalId"
                  :disabled="item.ip3 === infoData.ip3 && item.ip2 === infoData.ip2 && item.ip1 === infoData.ip1 && item.ip0 === infoData.ip0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="IP" prop="terminalIp">
              <el-col :span="4">
                <el-input-number v-model="infoData.ip3" required :min="ip3.min" :max="ip3.max" :precision="0"
                                 controls-position="right" :readonly="infoData.ipLock"></el-input-number>
              </el-col>
              <el-col :span="1" align="center">.</el-col>
              <el-col :span="4">
                <el-input-number v-model="infoData.ip2" required :min="ip2.min" :max="ip2.max" :precision="0"
                                 controls-position="right" :readonly="infoData.ipLock"></el-input-number>
              </el-col>
              <el-col :span="1" align="center">.</el-col>
              <el-col :span="4">
                <el-input-number v-model="infoData.ip1" required :min="ip1.min" :max="ip1.max" :precision="0"
                                 controls-position="right" :readonly="infoData.ipLock"></el-input-number>
              </el-col>
              <el-col :span="1" align="center">.</el-col>
              <el-col :span="4">
                <el-input-number v-model="infoData.ip0" required :min="ip0.min" :max="ip0.max" :precision="0"
                                 controls-position="right" :readonly="infoData.ipLock"></el-input-number>
              </el-col>
              <el-col :span="4" align="center">
                <el-button type="warning" @click="ping">测试连接</el-button>
              </el-col>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input type="textarea" v-model="infoData.terminalDesc" autocomplete="off"
                        placeholder="请输入终端描述信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item label="所在地点" prop="terminalRoom" ref="terminalRoom">
              <el-select v-model="infoData.terminalRoom" placeholder="请选择" filterable>
                <el-option
                  v-for="(item,i) in roomList"
                  :key="i"
                  :label="item.networkParameterName"
                  :value="item.networkParameterId"
                  :disabled="item.networkParameterUse !== currentUse && item.networkParameterUse !== 0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密级" prop="terminalSecrecy" ref="terminalSecrecy">
              <el-select v-model="infoData.terminalSecrecy" placeholder="请选择" filterable>
                <el-option
                  v-for="(item,i) in secrecyList"
                  :key="i"
                  :label="item.networkParameterName"
                  :value="item.networkParameterId"
                  :disabled="item.networkParameterUse !== currentUse && item.networkParameterUse !== 0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-col :span="12" v-if="systemDisabled">
            <el-form-item label="操作系统" prop="terminalSystem" ref="terminalSystem">
              <el-select v-model="infoData.terminalSystem" placeholder="请选择" filterable>
                <el-option
                  v-for="(item,i) in systemList"
                  :key="i"
                  :label="item.networkParameterName"
                  :value="item.networkParameterId"
                  :disabled="item.networkParameterUse !== currentUse && item.networkParameterUse !== 0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用者" prop="terminalOwner">
              <el-input v-model="infoData.terminalOwner" autocomplete="off" placeholder="请输入所有人或处室"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" align="center">
        <el-button @click="infoDialog = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit(infoData.deleteIndex)" :loading="formLoading">
          {{ formLoading?'提交中 ...':'确定'}}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "TerminalList",
    data() {
      const checkIp = (rule, value, callback) => {
        if (this.infoData.ip3 == null || this.infoData.ip2 == null || this.infoData.ip1 == null || this.infoData.ip0 == null) {
          return callback(new Error('请输入终端IP地址'))
        } else {
          this.$axios.get("/network/terminal/checkIp",
            {
              params:
                {
                  'ip3': this.infoData.ip3,
                  'ip2': this.infoData.ip2,
                  'ip1': this.infoData.ip1,
                  'ip0': this.infoData.ip0,
                  'terminalId': this.infoData.terminalId
                }
            }).then(resp => {
            if (resp.data === true) {
              callback()
            } else {
              return callback(new Error('IP地址冲突'))
            }
          })
        }
      }
      return {
        currentSegmentId: "",
        currentUse: 4,
        currentSegment: {},
        rowSize: 6,
        searchFrom: {
          terminalSegment: ""
        },
        infoData: {},
        infoRules: {
          terminalName: [
            {required: true, message: '请输入终端名', trigger: 'blur'}
          ],
          terminalType: [
            {required: true, message: '请选择终端类型', trigger: 'change'}
          ],
          terminalIp: [
            {validator: checkIp, trigger: 'change'},
          ],
          terminalRoom: [
            {required: true, message: '请选择终端所在地点', trigger: 'change'}
          ],
          terminalSecrecy: [
            {required: true, message: '请选择终端所属密级', trigger: 'change'}
          ],
          terminalSystem: [
            {required: true, message: '请选择终端操作系统', trigger: 'change'}
          ],
          terminalOwner: [
            {required: true, message: '请输入所有人或处室', trigger: 'blur'}
          ]
        },
        tableData: [],
        transferIndex: null,
        loading: false,
        infoDialog: false,
        formLoading: false,
        infoLoading: true,
        contextMenuData: {
          // the contextmenu name(@1.4.1 updated)
          // The coordinates of the display(菜单显示的位置)
          axis: {
            x: null,
            y: null
          },
          // Menu options (菜单选项)
          menulists: [{
            fnHandler: 'handleConnect',
            btnName: 'shell',
            disabled: true
          }, {
            fnHandler: 'handleEdit', // Binding events(绑定事件)
            btnName: '编辑' // The name of the menu option (菜单名称)
          }, {
            fnHandler: 'handleShutdown',
            btnName: '关机',
            disabled: true
          }, {
            fnHandler: 'handleRestart',
            btnName: '重启',
            disabled: true
          }, {
            fnHandler: 'handleDelete',
            btnName: '删除'
          }]
        },
        ip3: {
          min: 0,
          max: 255
        },
        ip2: {
          min: 0,
          max: 255
        },
        ip1: {
          min: 0,
          max: 255
        },
        ip0: {
          min: 0,
          max: 255
        },
        typeList: [],
        switchList: [],
        roomList: [],
        secrecyList: [],
        systemList: [],
        systemDisabled: false,
        statusForm: {terminalIps: [], flag: true},
        timer: null,
        statusMap: {},
        scanData: null,
        scanning: false
      }
    },
    methods: {
      onSearch() {
        this.loading = true
        this.$axios.get(
          "/network/terminal/search", {
            params: {
              'terminalSegment': this.currentSegmentId,
            }
          }).then(resp => {
          this.terminalIps = []
          if (resp && resp.status === 200) {
            for (let data0 of resp.data) {
              data0.terminalIp = data0.ip3 + '.' + data0.ip2 + '.' + data0.ip1 + '.' + data0.ip0
              data0.title = data0.typeName + '：' + data0.terminalName + '（' + data0.terminalIp + '）\n使用：' + data0.roomName + '（' + data0.terminalOwner + '）\n描述：' + (data0.terminalDesc.length > 0 ? data0.terminalDesc : '无')
              data0.imageUrl = require('@/assets/off-' + data0.typeValue + '.png')
              this.statusForm.terminalIps.push(data0.terminalIp)
            }
            this.tableData = resp.data
            this.$nextTick(() => {
              clearInterval(this.timer);
              this.timer = null;
              if (this.statusForm.terminalIps.length > 0) {
                this.getStatus()
                this.timer = setInterval(() => {
                  this.getStatus()
                }, 10000);
              }
            })
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
            terminalId: "",
            terminalName: "",
            segment: this.currentSegment.networkParameterName + '（' + this.currentSegment.networkParameterValue + '）',
            terminalSegment: this.currentSegmentId,
            terminalDesc: "",
            terminalOwner: "",
            ipLock: false
          }
          this.$refs.infoData.resetFields()
          this.infoLoading = false
        })
      },
      handleEditScan(index, row) {
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          let ips = row.terminalIp.split(".")
          this.infoData = {
            terminalId: "",
            terminalName: "",
            segment: this.currentSegment.networkParameterName + '（' + this.currentSegment.networkParameterValue + '）',
            terminalSegment: this.currentSegmentId,
            terminalDesc: "",
            terminalOwner: "",
            ip3: ips[0],
            ip2: ips[1],
            ip1: ips[2],
            ip0: ips[3],
            ipLock: true,
            deleteIndex: index
          }
          this.$refs.infoData.resetFields()
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
      handleEdit(index) {
        this.infoLoading = true
        this.infoDialog = true
        this.$nextTick(() => {
          this.$refs.infoData.resetFields()
          this.$axios.get("/network/terminal/info", {
            params: {
              terminalId: this.tableData[index].terminalId
            }
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.infoData = resp.data
              this.infoData.ipLock = false
              this.infoData.segment = this.currentSegment.networkParameterName + '（' + this.currentSegment.networkParameterValue + '）'
              this.infoLoading = false
            }
          })
        })
      },
      handleDelete(index) {
        this.$confirm('将要删除【' + this.tableData[index].terminalName + '】，该操作不可撤回。', '确认删除', {
          distinguishCancelAndClose: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        }).then(() => {
          this.$axios.get("/network/terminal/delete", {
            params: {
              terminalId: this.tableData[index].terminalId
            }
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
            }
          })
        });
      },
      getStatus() {
        let formData = this.$querystring.stringify(this.statusForm)
        this.$axios.post(
          "/network/terminal/status",
          formData,
          {
            headers: {"content-type": "application/x-www-form-urlencoded;charset=utf-8"}
          }).then(resp => {
          if (resp && resp.status === 200) {
            this.statusMap = resp.data
          } else {
            this.$message({
              message: "网络异常，更新状态失败",
              type: 'error'
            })
          }
          this.formLoading = false
        })
      },
      onScan() {
        this.scanData = null
        this.scanning = true
        this.$axios.get("/network/terminal/scan", {
          params: {
            segment: this.currentSegment.networkParameterValue
          }
        }).then(resp => {
          this.scanData = []
          if (resp && resp.status === 200) {
            for (let item of resp.data) {
              let flag = true
              for (let ip of this.statusForm.terminalIps) {
                if (ip === item) {
                  flag = false
                  break
                }
              }
              if (flag) {
                let data0 = {
                  terminalIp: item
                }
                this.scanData.push(data0)
              }
            }
            this.scanning = false
          } else {
            this.$message({
              message: '连接失败',
              type: 'error'
            })
          }
        })
      },
      ping() {
        this.$axios.get("/network/terminal/ping", {
          params: {
            terminalIp: this.infoData.ip3 + '.' + this.infoData.ip2 + '.' + this.infoData.ip1 + '.' + this.infoData.ip0
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            if (resp.data) {
              this.$message({
                message: '连接成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: '连接失败',
                type: 'error'
              })
            }
          }
        })
      },
      showMenu(e, index) {
        this.transferIndex = index
        let x = e.clientX
        let y = e.clientY
        // Get the current location
        this.contextMenuData.axis = {
          x, y
        }
      },
      changeType(val) {
        this.systemDisabled = false
        for (let type of this.typeList) {
          if (val === type.networkParameterId) {
            if ('pc' === type.networkParameterValue || 'server' === type.networkParameterValue) {
              this.systemDisabled = true
            }
            break;
          }
        }
      },
      onSubmit(index) {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/network/terminal/edit",
              formData,
              {
                headers: {"content-type": "application/x-www-form-urlencoded;charset=utf-8"}
              }).then(resp => {
              if (resp && resp.status === 200) {
                if (resp.data.result) {
                  if (index != null) {
                    this.scanData.splice(index, 1)
                  }
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
            })
          } else {
            this.formLoading = false
          }
        })
      },
      getSegment(segmentId) {
        this.$axios.get("/network/networkParameter/info", {
          params: {
            networkParameterId: segmentId
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            this.currentSegment = resp.data
            let segmentArray = this.currentSegment.networkParameterValue.split(new RegExp(/[\.\/]/))
            let intArray = []
            for (let segment0 of segmentArray) {
              intArray.push(parseInt(segment0))
            }
            switch (intArray[4]) {
              case 24:
                intArray[4] = intArray[3] + 254
                break
              case 25:
                intArray[4] = intArray[3] + 126
                break
            }
            this.ip3.min = intArray[0]
            this.ip3.max = intArray[0]
            this.ip2.min = intArray[1]
            this.ip2.max = intArray[1]
            this.ip1.min = intArray[2]
            this.ip1.max = intArray[2]
            this.ip0.min = intArray[3]
            this.ip0.max = intArray[4]
          }
        })
      },
      getTypeList() {
        this.$axios.get("/network/networkParameter/list", {
          params: {
            networkParameterGroup: 0
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            this.typeList = resp.data
          }
        })
      },
      getSwitchList() {
        this.$axios.get("/network/terminal/switchList").then(resp => {
          if (resp && resp.status === 200) {
            this.switchList = resp.data
          }
        })
      },
      getRoomList() {
        this.$axios.get("/network/networkParameter/list", {
          params: {
            networkParameterGroup: 3
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            this.roomList = resp.data
          }
        })
      },
      getSecrecyList() {
        this.$axios.get("/network/networkParameter/list", {
          params: {
            networkParameterGroup: 4
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            this.secrecyList = resp.data
          }
        })
      },
      getSystemList() {
        this.$axios.get("/network/networkParameter/list", {
          params: {
            networkParameterGroup: 1
          }
        }).then(resp => {
          if (resp && resp.status === 200) {
            this.systemList = resp.data
          }
        })
      },
      init() {
        this.$emit("tab", this.$route.path)
        this.currentSegmentId = this.$route.query.segment
        this.getSegment(this.currentSegmentId)
        switch (this.$route.params.use) {
          case "switch":
            this.currentUse = 3
            break
          case "pc":
            this.currentUse = 2
            break
          case "server":
            this.currentUse = 1
            break
        }
        this.getTypeList()
        this.getSwitchList()
        this.getRoomList()
        this.getSecrecyList()
        this.getSystemList()
        this.onSearch()
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      '$route'(to, from) {
        this.init()
      },
      statusMap(newValue, oldValue) {
        if (newValue !== oldValue || (newValue != null && newValue.length > 0)) {
          for (let item of this.tableData) {
            if (newValue[item.terminalIp]) {
              item.imageUrl = require('@/assets/on-' + item.typeValue + '.png')
            } else {
              item.imageUrl = require('@/assets/off-' + item.typeValue + '.png')
            }
          }
        }
      }
    },
    computed: {
      tableRow: function () {
        const rowSize = document.body.clientWidth < 1281 ? 6 : 8
        this.rowSize = rowSize
        const tableRow = []
        this.tableData.forEach((item, index) => {
          const rowNum = Math.floor(index / rowSize)//4代表4条为一行，随意更改
          if (!tableRow[rowNum]) {
            tableRow[rowNum] = []
          }
          tableRow[rowNum].push(item)
        })
        return tableRow
      },
      colSpan() {
        return document.body.clientWidth < 1281 ? 4 : 3
      }
    },
    beforeDestroy() {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
</script>

<style scoped>
  .el-form {
    text-align: left;
  }

  .terminal-icon {
    width: 100px;
    display: block;
  }

  .terminal-icon-text {
    color: #909399;
    font-size: xx-small;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: default;
    white-space: nowrap;
  }

  .terminal-icon-text:first-of-type {
    margin-top: -16px;
    margin-left: 5px;
    margin-right: 5px;
  }

</style>
