<template>
  <body id="home">
  <el-container>
    <el-header>信息处资产管理系统</el-header>
    <el-container>
      <el-aside width="200px">
        <nav-menu :tabIndex="tabIndex"></nav-menu>
      </el-aside>
      <el-container>
        <el-main class="home-main-container">
          <el-card class="box-card">
            <el-page-header slot="header" class="main-card" @back="goBack">
              <div class="main-card" slot="content">{{cardHeader}}</div>
            </el-page-header>
            <router-view @title="title" @tabClick="tabClick"/>
          </el-card>
          <template>
            <el-backtop target=".home-main-container"></el-backtop>
          </template>
        </el-main>
      </el-container>
    </el-container>
    <el-footer height="30px">2020 &copy; DemStudio</el-footer>
  </el-container>
  </body>
</template>

<script>
  import NavMenu from './common/NavMenu'

  export default {
    name: 'Home',
    components: {NavMenu},
    data() {
      return {
        cardHeader: "栏目标题",
        tabIndex: ""
      }
    },
    methods: {
      title(str) {
        this.cardHeader = str
      },
      goBack() {
        this.$router.back()
      },
      tabClick(str) {
        this.tabIndex = str
      }
    }
  }
</script>

<style scoped>
  #home {
    height: 100%;
    width: 100%;
    background-color: #a61515;
    position: fixed;
  }

  .el-header {
    background-color: #750f0f;
    color: #ffffff;
    text-align: center;
    line-height: 60px;
    font-size: x-large;
  }

  .el-footer {
    background-color: #790f0f;
    color: #ec6868;
    text-align: left;
    line-height: 30px;
    font-size: x-small;
  }

  .el-aside {
    background-color: #a61515;
    color: #333;
    text-align: left;
    vertical-align: top;
    height: 100%;
  }

  .el-main {
    background-color: #FFFFFF;
    color: #333;
    text-align: center;
    height: 100%;
  }

  body > .el-container {
    height: 100%;
    width: 100%;
    position: fixed;
  }

  .main-card {
    font-size: x-large;
    text-align: left;
    height: 40px;
    line-height: 40px;
    color: #ffffff;
  }

</style>

<style>
  .el-card__header {
    background-color: #750f0f;
    padding: 10px 20px;
  }

  .el-dialog__header {
    background-color: #750f0f;
    color: #ffffff;
    padding: 10px 20px;
  }
</style>
