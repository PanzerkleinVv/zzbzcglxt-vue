<template>
  <div>
    <el-collapse v-model="activeName" accordion @change="handleChange">
      <el-collapse-item name="1">
        <template slot="title">
          <h3>
            <i class="el-icon-s-platform"></i>
            <span slot="title">设备统计与月流水</span>
          </h3>
        </template>
        <el-tabs v-model="activeIndex" type="border-card" @tab-click="tabClick">
          <el-tab-pane v-for="(item, i) in equipmentTabs" :key="i" :name="item.router" :label="item.label">
          </el-tab-pane>
          <router-view/>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <h3>
            <i class="el-icon-mouse"></i>
            <span>耗材存量与台账</span>
          </h3>
        </template>
        <el-tabs v-model="activeIndex" type="border-card" @tab-click="tabClick">
          <el-tab-pane v-for="(item, i) in consumableTabs" :key="i" :name="item.router" :label="item.label">
          </el-tab-pane>
          <router-view/>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>

  export default {
    name: 'Statistics',
    data() {
      return {
        activeName: "1",
        activeIndex: "/statistics/equipment",
        equipmentTabs: [
          {label: "在库统计", router: "/statistics/equipment"}
        ],
        consumableTabs: [
          {label: "存量", router: "/statistics/consumable"}
        ],
      };
    },
    methods: {
      init() {
        this.$emit("title", "资产统计")
        this.activeIndex = this.$route.path
        if (this.activeIndex.indexOf("consumable") > -1 || this.activeIndex.indexOf("ledger") > -1) {
          this.activeName = "2"
        } else {
          this.activeName = "1"
        }
      },
      logPeriod() {
        this.$axios
          .get('/statistics/logPeriod')
          .then(successResponse => {
            for (let data0 of successResponse.data) {
              let obj = new Object()
              obj.label = data0.period
              obj.router = "/statistics/log/" + data0.logYear + "/" + data0.logMonth
              this.equipmentTabs.push(obj)
            }
          })
          .catch(failResponse => {
          })
      },
      ledgerPeriod() {
        this.$axios
          .get('/statistics/ledgerPeriod')
          .then(successResponse => {
            for (let data0 of successResponse.data) {
              let obj = new Object()
              obj.label = data0.period
              obj.router = "/statistics/ledger/" + data0.logYear + "/" + data0.logMonth
              this.consumableTabs.push(obj)
            }
          })
          .catch(failResponse => {
          })
      },
      tabClick() {
        this.$router.push({path: this.activeIndex});
      },
      handleChange(val) {
        if (val === "1") {
          if (this.activeIndex.indexOf("consumable") > -1 || this.activeIndex.indexOf("ledger") > -1) {
            this.activeIndex = "/statistics/equipment"
            this.$router.push({path: this.activeIndex});
          }
        } else if (val === "2") {
          if (this.activeIndex.indexOf("equipment") > -1 || this.activeIndex.indexOf("log") > -1) {
            this.activeIndex = "/statistics/consumable"
            this.$router.push({path: this.activeIndex});
          }
        }
      }
    },
    mounted() {
      this.init()
      this.logPeriod()
      this.ledgerPeriod()
    }
  }
</script>

<style scoped>
  .el-collapse-item span, i {
    color: #8F1212;
  }
</style>
