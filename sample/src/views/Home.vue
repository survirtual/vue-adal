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
  created () {
    if (this.$adal.isAuthenticated()) {
      this.msg = "Hello, " + this.$adal.user.profile.roles + " " + this.$adal.user.profile.name 
    } else {
      this.msg = "Please sign in"
    }
  }
}
</script>
