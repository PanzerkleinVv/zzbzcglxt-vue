<template>
  <el-row type="flex">
    <el-col :span="7"></el-col>
    <el-col :span="10">
      <el-card>
        <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
                 size="small">
          <el-row type="flex" justify="space-between">
            <el-col :span="24">
              <el-form-item label="新密码" prop="psw">
                <el-input type="password" v-model="infoData.psw" autocomplete="off" placeholder="请输入密码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" justify="space-between">
            <el-col :span="24">
              <el-form-item label="确认密码" prop="psw0">
                <el-input type="password" v-model="infoData.psw0" autocomplete="off"
                          placeholder="请再次输入密码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" justify="space-between">
            <el-col :span="24" align="center">
              <el-button type="primary" @click="onSubmit" :loading="formLoading">
                {{ formLoading?'提交中 ...':'确定'}}
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="7"></el-col>
  </el-row>
</template>

<script>
  export default {
    name: "Psw",
    data() {
      const validatePsw0 = (rule, value, callback) => {
        if (value !== this.infoData.userPsw) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        infoData: {
          psw: "",
          psw0: ""
        },
        infoRules: {
          userPsw: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ],
          userPsw0: [
            {required: true, message: '请再次输入密码', trigger: 'blur'},
            {validator: validatePsw0, trigger: 'blur'}
          ],
        },
        formLoading: false
      }
    },
    methods: {
      logout() {
        this.$axios.get(
          '/logout'
        ).then(successResponse => {
          this.$store.commit('logout')
          this.$router.go(0)
        }).catch(failResponse => {
          this.$store.commit('logout')
          this.$router.go(0)
        })
      },
      onSubmit() {
        this.formLoading = true
        this.$refs.infoData.validate((valid) => {
          if (valid) {
            this.infoData.userPsw = this.$sha256(this.infoData.psw)
            let formData = this.$querystring.stringify(this.infoData)
            this.$axios.post(
              "/user/changePsw",
              formData, {
                headers: {"content-type": "application/x-www-form-urlencoded;charset=utf-8"}
              }).then(resp => {
                if (resp && resp.status === 200) {
                  if (resp.data.result) {
                    this.$message({
                      message: resp.data.content,
                      type: 'success'
                    })
                    this.logout()
                  } else {
                    this.$message({
                      message: resp.data.content,
                      type: 'error'
                    })
                  }
                } else {

                }
                this.formLoading = false
              }
            )
          } else {
            this.formLoading = false
          }
        })
      },
      init() {
        this.$emit("title", "修改密码")
      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style scoped>
  .el-form {
    text-align: left;
  }

</style>
