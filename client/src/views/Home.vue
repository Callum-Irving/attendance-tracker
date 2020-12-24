<template>
  <div class="home">
    <a class="login-button" href="/login">Check in with Google</a>
    <p class="message" v-bind:class="success ? 'success' : 'failure'" v-if="msg">{{ msg }}</p>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    oauthCode: null
  },
  data() {
    return {
      success: null,
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
        this.success = usable.success;
      } else if (usable.success === false) {
        this.msg = usable.errorMsg;
        this.success = usable.success;
      } else {
        this.msg = "An unknown error occured.";
        this.success = false;
      }
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.login-button {
  text-decoration: none;
  font-weight: bold;
  padding: 10px;
  background: #42b983;
  color: white;
  border-radius: 5px;
}

.login-button:hover {
  background: #389c6f;
}

.message {
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  border: none;
  animation: fadeIn ease 1s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translate(0, -50px);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}

.success {
  background: green;
}

.failure {
  background: red;
}
</style>
