<template>
  <el-tabs v-model="activeIndex" type="border-card" @tab-click="tabClick">
    <el-tab-pane v-for="(item, i) in networkParameterTabs" :key="i" :name="item.router" :label="item.label">
    </el-tab-pane>
    <router-view @tab="tab"/>
  </el-tabs>
</template>

<script>
  export default {
    name: "NetworkParameter",
    data() {
      return {
        activeIndex: "/networkParameter/0",
        networkParameterTabs: [
          {label: "终端类型", router: "/networkParameter/0"},
          {label: "操作系统", router: "/networkParameter/1"},
          {label: "网段", router: "/networkParameter/2"},
          {label: "房号", router: "/networkParameter/3"},
          {label: "密级", router: "/networkParameter/4"}
        ]
      };
    },
    methods: {
      init() {
        this.$emit("title", "网络参数设置")
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
