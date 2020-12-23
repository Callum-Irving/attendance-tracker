<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <a href="/login">Check in with Google</a>
    <p v-if="success">Success!</p>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    success: null
  }
};
</script>
