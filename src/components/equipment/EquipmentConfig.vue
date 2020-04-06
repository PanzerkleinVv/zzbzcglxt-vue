<template>
  <el-tabs v-model="activeIndex" type="border-card" @tab-click="tabClick">
    <el-tab-pane v-for="(item, i) in equipmentTabs" :key="i" :name="item.router" :label="item.label">
    </el-tab-pane>
    <router-view @tab="tab"/>
  </el-tabs>
</template>

<script>
  export default {
    name: "EquipmentConfig",
    data() {
      return {
        activeIndex: "/equipmentConfig/type",
        equipmentTabs: [
          {label: "类型", router: "/equipmentConfig/type"},
          {label: "品牌", router: "/equipmentConfig/brand"},
          {label: "型号", router: "/equipmentConfig/model"},
          {label: "密级", router: "/equipmentConfig/secrecy"},
          {label: "入库原因", router: "/equipmentConfig/registrationReason"}
        ]
      };
    },
    methods: {
      init() {
        this.$emit("title", "设备信息参数设置")
        this.activeIndex = this.$route.path
      },
      tab(str) {
        this.activeIndex = str
      },
      tabClick() {
        this.$router.push({path: this.activeIndex});
        this.$emit("tabClick", this.activeIndex)
      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style scoped>

</style>
