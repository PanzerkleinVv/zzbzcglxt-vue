<template>
  <div>
    <el-tabs v-model="activeIndex" type="border-card" @tab-click="tabClick">
      <el-tab-pane v-for="(item, i) in terminalTabs" :key="i" :name="item.router" :label="item.label">
      </el-tab-pane>
      <router-view/>
      <div v-if="terminalTabs.length === 0" style="color: #909399; font-size: small" align="center">暂无数据，请先设置网段参数</div>
    </el-tabs>
  </div>
</template>

<script>

  export default {
    name: 'Terminal',
    data() {
      return {
        currentUse: 0,
        activeIndex: "",
        terminalTabs: []
      };
    },
    methods: {
      init() {
        if (this.$route.params.use === 'pc' && this.currentUse !== 2) {
          this.$emit("title", "用户网段终端")
          this.currentUse = 2
          this.getTabs()
        } else if (this.$route.params.use === 'server' && this.currentUse !== 1) {
          this.$emit("title", "机房网段终端")
          this.currentUse = 1
          this.getTabs()
        } else if (this.$route.params.use === 'switch' && this.currentUse !== 3) {
          this.$emit("title", "管理网段")
          this.currentUse = 3
          this.getTabs()
        } else if (this.$route.params.use == null) {
          this.$route.params.use = 'server'
        }
      },
      getTabs() {
        this.$axios
          .get('/network/networkParameter/list', {
            params: {
              networkParameterUse: this.currentUse,
              networkParameterGroup: 2
            }
          })
          .then(successResponse => {
            this.terminalTabs = []
            for (let i = 0; i < successResponse.data.length; i++) {
              let data0 = successResponse.data[i]
              data0.label = data0.networkParameterName
              data0.router = data0.networkParameterId
              if (i === 0) {
                this.activeIndex = data0.router
                let path = '/terminal/' + this.$route.params.use + '/list'
                this.$router.push({ path:path, query: {segment: this.$route.query.segment}});
              }
            }
            this.terminalTabs = successResponse.data
          })
          .catch(failResponse => {
          })
      },
      tabClick() {
        let path = '/terminal/' + this.$route.params.use + '/list'
        this.$router.push(path);
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      '$route'(to, from) {
        this.init()
      },
      activeIndex(newValue, oldValue) {
        this.$route.query.segment = newValue;
      }
    }
  }
</script>

<style scoped>
  .el-collapse-item span, i {
    color: #8F1212;
  }
</style>
