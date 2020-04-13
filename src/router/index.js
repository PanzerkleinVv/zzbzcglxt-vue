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
import Consumable from "../components/consumable/Consumable";
import Ledger from "../components/consumable/Ledger";
import User from "../components/user/User";
import Psw from "../components/user/Psw";
import NetworkParameter from "../components/network/NetworkParameter";
import NetworkParameterConfig from "../components/network/parameter/NetworkParameterConfig";
import Terminal from "../components/network/Terminal";
import TerminalList from "../components/network/list/TerminalList";

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
          path: '/equipment/:equipmentType/:equipmentStatus',
          name: 'EquipmentQuery',
          component: Equipment,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/equipment',
          name: 'Equipment',
          component: Equipment,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/equipmentConfig',
          name: 'EquipmentConfig',
          component: EquipmentConfig,
          redirect: '/equipmentConfig/type',
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
        }, {
          path: '/consumable',
          name: 'Consumable',
          component: Consumable,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/ledger',
          name: 'Ledger',
          component: Ledger,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/user',
          name: 'User',
          component: User,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/psw',
          name: 'Psw',
          component: Psw,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/networkParameter',
          name: 'NetworkParameter',
          component: NetworkParameter,
          redirect: '/networkParameter/0',
          children: [
            {
              path: '/networkParameter/:group',
              name: 'NetworkParameterConfig',
              component: NetworkParameterConfig,
              meta: {
                requireAuth: true
              }
            }
          ]
        }, {
          path: '/terminal/:use',
          name: 'Terminal',
          component: Terminal,
          redirect: '/terminal/:use/list',
          children: [
            {
              path: '/terminal/:use/list',
              name: 'TerminalList',
              component: TerminalList,
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
    }, {
      path: '/',
      name: 'Root',
      redirect: '/statistics/'
    }
  ]
})
