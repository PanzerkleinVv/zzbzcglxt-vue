<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    provide() {
      return {
        reload: this.reload
      }
    },
    data() {
      return {
        isRouterAlive: true
      }
    },
    mounted() {
      window.addEventListener('unload', this.saveState)
    },
    methods: {
      saveState() {
        sessionStorage.setItem('state', JSON.stringify(this.$store.state))
      },
      reload() {
        this.isRouterAlive = false
        this.$nextTick(function () {
          this.isRouterAlive = true
        })
      }
    }
  }
</script>

