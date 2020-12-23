<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <a href="/login">Check in with Google</a>
    <p v-if="success == 'true'">Success!</p>
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

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
