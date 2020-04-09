import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: sessionStorage.getItem('state') ? JSON.parse(sessionStorage.getItem('state')) : {
    user: {
      userName: sessionStorage.getItem('user' || '[]') == null ? '' : JSON.parse(sessionStorage.getItem('user' || '[]')).userName
    }
  },
  getters: {
    getUser: state => state.user
  },
  mutations: {
    login(state, user) {
      state.user = user
      sessionStorage.setItem('user', JSON.stringify(user))
    },
    logout(state) {
      state.user = null
      sessionStorage.removeItem("user")
    }
  }
})
