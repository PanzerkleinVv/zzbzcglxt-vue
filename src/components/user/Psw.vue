<template>
  <el-dialog :visible.sync="infoDialog" destroy-on-close append-to-body @closed="handleClosed">
    <div slot="title" style="color: #ffffff; font-size: larger">修改密码</div>
    <el-form :model="infoData" ref="infoData" :rules="infoRules" label-position="right" label-width="80px"
             size="small">
      <el-row type="flex" justify="space-between">
        <el-col :span="24">
          <el-form-item label="新密码" prop="userPsw">
            <el-input type="password" v-model="infoData.userPsw" autocomplete="off" placeholder="请输入密码"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="space-between">
        <el-col :span="24">
          <el-form-item label="确认密码" prop="userPsw0">
            <el-input type="password" v-model="infoData.userPsw0" autocomplete="off" placeholder="请再次输入密码"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" align="center">
      <el-button @click="infoDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="formLoading">
        {{ formLoading?'提交中 ...':'确定'}}
      </el-button>
    </div>
  </el-dialog>
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
          userPsw: "",
          userPsw0: ""
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
        infoDialog: true,
        formLoading: false
      }
    },
    methods: {
      handleClosed() {
        this.$router.back()
      },
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
            this.$axios.post(
              "/user/changePsw", {
                userPsw: this.$sha256(this.infoData.userPsw)
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
