<template>
  <body id="login">
  <el-form class="login-container" label-position="left"
           label-width="0px">
    <h3 class="login_title">信息处资产管理系统</h3>
    <el-form-item>
      <el-input type="text" v-model="loginForm.userName"
                auto-complete="off" placeholder="账号" clearable></el-input>
    </el-form-item>
    <el-form-item>
      <el-input type="password" v-model="loginForm.userPsw"
                auto-complete="off" placeholder="密码" clearable></el-input>
    </el-form-item>
    <el-form-item style="width: 100%">
      <el-button type="primary" style="width: 100%;background: green;border: none" v-on:click="login">登录</el-button>
    </el-form-item>
  </el-form>
  </body>
</template>

<script>

  export default {
    name: 'Login',
    data() {
      return {
        loginForm: {
          userName: '',
          userPsw: ''
        },
        responseResult: []
      }
    },
    methods: {
      login() {
        let _this = this
        this.$axios
          .post('/login', {
            userName: this.loginForm.userName,
            userPsw: this.$sha256(this.loginForm.userPsw)
          }).then(successResponse => {
          if (successResponse.data.code === 200) {
            _this.$store.commit('login', _this.loginForm)
            let path = this.$route.query.redirect
            this.$router.replace({path: path === '/' || path === undefined ? '/statistics' : path})
          }
        }).catch(failResponse => {

        })
      },
      init() {
        if (this.$route.query.message) {
          this.$notify.error({
            title: '错误',
            message: this.$route.query.message,
            duration: 0
          });
        }
      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style>
  .login-container {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 240px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

  .login_title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }

  #login {
    background: url("../assets/login.jpg") no-repeat center;
    height: 100%;
    width: 100%;
    background-size: cover;
    position: fixed;
  }

  body {
    margin: 0;
  }

</style>
