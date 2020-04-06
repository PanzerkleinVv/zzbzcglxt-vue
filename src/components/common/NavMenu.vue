<template>
  <el-menu
    :default-active="activeIndex"
    router
    background-color="#a61515"
    text-color="#ffffff"
    active-text-color="#8F1212"
    :unique-opened=true>
    <el-menu-item v-for="(item,i) in navList" v-if="!item.subNavList" :key="i" :index="item.name">
      <i :class="item.icon"></i>
      <span>{{ item.navItem }}</span>
    </el-menu-item>
    <el-submenu v-else :key="i" :index="item.name">
      <template slot="title">
        <i :class="item.icon"></i>
        <span slot="title">{{ item.navItem }}</span>
      </template>
      <el-menu-item v-for="(subItem,j) in item.subNavList" :key="i + '-' + j" :index="subItem.name"
                    :disabled="subItem.disabled" v-if="!subItem.subNavList">
        <i class='el-icon-caret-right'></i>
        <span>{{ subItem.navItem }}</span>
      </el-menu-item>
      <el-submenu v-else :key="i + '-' + j" :index="subItem.name">
        <template slot="title">
          <i class='el-icon-caret-right'></i>
          <span slot="title">{{ subItem.navItem }}</span>
        </template>
        <el-menu-item v-for="(subItem0,k) in subItem.subNavList" :key="i + '-' + j + '-' + k" :index="subItem0.name"
                      :disabled="subItem0.disabled">
          <i class='el-icon-caret-right'></i>
          <span>{{ subItem0.navItem }}</span>
        </el-menu-item>
      </el-submenu>
    </el-submenu>
  </el-menu>
</template>

<script>

  export default {
    name: 'NavMenu',
    props: ["tabIndex"],
    data() {
      return {
        navList: [
          {
            name: '/statistics', navItem: '资产统计', icon: "el-icon-s-data"
          }, {
            name: '#equipment', navItem: '设备管理', subNavList: [
              {name: '/equipment', navItem: '设备管理'},
              {
                name: '/equipmentConfig', navItem: '参数设置', subNavList: [
                  {name: '/equipmentConfig/type', navItem: '设备类型'},
                  {name: '/equipmentConfig/brand', navItem: '设备品牌'},
                  {name: '/equipmentConfig/model', navItem: '设备型号'},
                  {name: '/equipmentConfig/secrecy', navItem: '设备密级'},
                  {name: '/equipmentConfig/registrationReason', navItem: '入库原由'}]
              }
            ], icon: "el-icon-s-platform"
          }, {
            name: '#consumable', navItem: '耗材管理', subNavList: [
              {name: '/consumable', navItem: '耗材库存'},
              {name: '/ledger', navItem: '耗材台账'}
            ], icon: "el-icon-mouse"
          }, {
            name: '#network', navItem: '网络管理', subNavList: [
              {name: '/terminal', navItem: '终端管理', disabled: true},
              {name: '/application', navItem: '应用管理', disabled: true},
              {name: '/networkParameter', navItem: '参数设置'}
            ], icon: "el-icon-cpu"
          }, {
            name: '#user', navItem: '用户管理', subNavList: [
              {name: '/user', navItem: '用户设置'},
              {name: '/psw', navItem: '修改密码'}
            ], icon: "el-icon-s-custom"
          }
        ],
        activeIndex: "/statistics"
      }
    },
    methods: {
      init(index) {
        if (index === undefined) {
          index = this.$route.path
        }
        if (index.indexOf("statistics") > -1) {
          this.activeIndex = "/statistics"
        } else {
          this.activeIndex = index
        }
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      tabIndex: function(val) {
        if (val.length > 0) {
          this.init(val)
        }
      }
    }
  }
</script>

<style scoped>
  .el-menu-item {
    min-width: 200px;
  }

  .el-submenu {
    min-width: 200px;
  }

  .el-menu {
    margin-top: 40px;
  }

  .el-submenu .el-menu-item {
    color: #f8c2c2 !important;
  }

  .el-menu i {
    color: #ef7e7e !important;
  }

  .el-menu-item.is-active {
    background-color: #f8c2c2 !important;
    color: #8F1212 !important;
  }
</style>
