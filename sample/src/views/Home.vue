<template>
  <div class="home">
    <img src="../assets/logo.png">
    <HelloWorld :msg='msg'/>
    <button v-on:click="$adal.login()" >Sign In</button>
    <button v-on:click="$adal.logout()" >Sign Out</button>
    <div v-if="$adal.isAuthenticated()">You are signed in!</div>
    <div v-if="$adal.checkRoles(['Admin'])">You're also an admin</div>
    <div v-if="!$adal.checkRoles(['Admin'])">You're not an admin</div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  },
  data () {
    return {
      msg: "Signing in..."
    }
  },
  async created () {
    if (this.$adal.isAuthenticated()) {
      this.msg = "Hello, " + this.$adal.user.profile.roles + " " + this.$adal.user.profile.name 

      let userInfo = await this.getUserInfo()
      this.msg += '. It looks like your mail nickname is ' + userInfo.mailNickname + ' according to the Graph API'
    } else {
      this.msg = "Please sign in"
    }
  },

  methods: {
    async getUserInfo () {
      let res = await this.$graphApi.get(`me`, {
        params: {
          'api-version': 1.6
        }
      })
      console.log(res)
      return res.data
    }
  }
}
</script>
