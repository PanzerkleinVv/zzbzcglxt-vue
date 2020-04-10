import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import './theme/index.css'
import sha256 from 'js-sha256';
import querystring from 'querystring'

// 设置反向代理，前端请求默认发送到 http://localhost:80/rest 代理
var axios = require('axios')
axios.defaults.baseURL = '/rest/'
// 全局注册，之后可在其他组件中通过 this.$axios 发送数据
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.prototype.$sha256 = sha256
Vue.prototype.$querystring = querystring

Vue.use(ElementUI)

router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth) {
      if (store.state.user && store.state.user.userName) {
        next()
      } else {
        next({
          path: 'login',
          query: {redirect: to.fullPath}
        })
      }
    } else {
      next()
    }
  }
)

axios.interceptors.response.use(response => Promise.resolve(response),
  error => { // 这里对 error 预期结果是包含具体错误信息和状态码
    if (error) {
      store.commit('logout')
      router.push({
        path: '/login',
        query: {message: '登录超时，请重新登陆'}
      })
    }
  })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  components: {App},
  template: '<App/>'
})
