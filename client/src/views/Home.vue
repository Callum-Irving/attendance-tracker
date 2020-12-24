<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <a href="/login">Check in with Google</a>
    <p v-if="msg">{{ msg }}</p>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    success: null,
    errorMsg: null,
    oauthCode: null
  },
  data() {
    return {
      msg: ""
    };
  },
  async mounted() {
    if (this.oauthCode) {
      // GET oauthcode to backend
      const response = await fetch("/oauthcallback?code=" + this.oauthCode);
      const usable = await response.json();

      // Remove code from address bar
      let query = Object.assign({}, this.$route.query);
      delete query.code;
      delete query.scope;
      delete query.authuser;
      delete query.prompt;
      delete query.hd;
      this.$router.replace({ query });

      if (usable.success == true) {
        this.msg = "Success! You have been tracked!";
      } else if (usable.success == false) {
        this.msg = usable.errorMsg;
      } else {
        this.msg = "An unknown error occured.";
      }
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
