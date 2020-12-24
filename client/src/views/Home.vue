<template>
  <div class="home">
    <a class="button is-danger" href="/login">Check in with Google</a>
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
    // If there is a google OAuth code in the HTTP query,
    // send the code to the backend to verify it
    if (this.oauthCode) {
      // GET request OAuth code to backend
      // I would prefer post, but passport js only uses GET for google OAuth
      const response = await fetch("/api/verifyoauth?code=" + this.oauthCode);
      const usable = await response.json();

      // Remove code from address bar
      let query = Object.assign({}, this.$route.query);
      delete query.code;
      delete query.scope;
      delete query.authuser;
      delete query.prompt;
      delete query.hd;
      this.$router.replace({ query });

      if (usable.success === true) {
        this.msg = "Success! You have been tracked!";
      } else if (usable.success === false) {
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
