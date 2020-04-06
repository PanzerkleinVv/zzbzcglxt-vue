import Vue from 'vue'
import Router from 'vue-router'
import Statistics from '../components/home/Statistics'
import EquipmentStatistics from '../components/home/table/EquipmentStatistics'
import LogStatistics from '../components/home/table/LogStatistics'
import ConsumableStatistics from '../components/home/table/ConsumableStatistics'
import LedgerStatistics from '../components/home/table/LedgerStatistics'
import Login from '../components/Login'
import Home from '../components/Home'
import Equipment from "../components/equipment/Equipment";
import EquipmentConfig from "../components/equipment/EquipmentConfig";
import Type from "../components/equipment/config/Type";
import Brand from "../components/equipment/config/Brand";
import Model from "../components/equipment/config/Model";
import Secrecy from "../components/equipment/config/Secrecy";
import RegistrationReason from "../components/equipment/config/RegistrationReason";

Vue.use(Router)
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home,
      // home页面并不需要被访问
      redirect: '/statistics',
      children: [
        {
          path: '/statistics',
          name: 'Statistics',
          component: Statistics,
          redirect: '/statistics/equipment',
          children: [
            {
              path: '/statistics/equipment',
              name: 'EquipmentStatistics',
              component: EquipmentStatistics,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/statistics/log/:logYear/:logMonth',
              name: 'LogStatistics',
              component: LogStatistics,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/statistics/consumable/',
              name: 'ConsumableStatistics',
              component: ConsumableStatistics,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/statistics/ledger/:logYear/:logMonth',
              name: 'LedgerStatistics',
              component: LedgerStatistics,
              meta: {
                requireAuth: true
              }
            }
          ]
        }, {
          path: '/equipment',
          name: 'Equipment',
          component: Equipment,
          meta: {
            requireAuth: true
          }
          //redirect: '/statistics'
        }, {
          path: '/equipmentConfig',
          name: 'EquipmentConfig',
          component: EquipmentConfig,
          redirect: '/type',
          children: [
            {
              path: '/equipmentConfig/type',
              name: 'Type',
              component: Type,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/equipmentConfig/brand',
              name: 'Brand',
              component: Brand,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/equipmentConfig/model',
              name: 'Model',
              component: Model,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/equipmentConfig/secrecy',
              name: 'Secrecy',
              component: Secrecy,
              meta: {
                requireAuth: true
              }
            }, {
              path: '/equipmentConfig/registrationReason',
              name: 'RegistrationReason',
              component: RegistrationReason,
              meta: {
                requireAuth: true
              }
            }
          ]
        }
      ]
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
