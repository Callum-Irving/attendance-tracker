<template>
  <h1>Admin Page</h1>
  <form v-if="!loggedIn" @submit.prevent="tryLogin">
    <input placeholder="Admin password" type="password" v-model="password" />
    <button type="submit">Login</button>
  </form>
  <p>{{ msg }}</p>
  <div v-if="loggedIn">
    <p>{{attendanceOpen}}</p>
    <table>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Attended</th>
      </tr>
      <tr v-for="user in userList" :key="user.name">
        <th>{{ user.name }}</th>
        <th>{{ user.email }}</th>
        <th>{{ user.attended }}</th>
      </tr>
    </table>
    <button id="refresh" @click="getUserData">Refresh</button>
    <button id="toggleOpen" @click="toggleAttendanceOpen">Toggle attendance open</button>
    <button id="resetAttendance" @click="resetUserAttendance">Reset user attendance</button>
  </div>
</template>

<script>
export default {
  name: "Admin",
  data() {
    return {
      password: "",
      msg: "",
      loggedIn: false,
      userList: [],
      attendanceOpen: null
    };
  },
  methods: {
    async tryLogin() {
      // Send fetch request to login
      console.log("login");
      const result = await fetch("/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          password: this.password
        })
      });
      const usableResult = await result.json();
      this.loggedIn = usableResult.success;
      if (usableResult.success) {
        this.msg = "Login successful";
        this.getUserData();
      } else {
        this.msg = usableResult.errorMsg;
      }
    },
    async getUserData() {
      const result = await fetch("/api/getuserdata", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          password: this.password
        })
      });
      const usableResult = await result.json();
      if (usableResult.success) {
        this.attendanceOpen = usableResult.attendanceOpen;
        this.userList = usableResult.userList;
      } else {
        this.msg = usableResult.errorMsg;
      }
    },
    async toggleAttendanceOpen() {
      const result = await fetch("api/openattendance", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          password: this.password
        })
      });
      const usableResult = await result.json();
      if (usableResult.success) {
        this.getUserData();
      } else {
        this.msg = usableResult.errorMsg;
      }
    },
    async resetUserAttendance() {
      const result = await fetch("api/resetuserattendance", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          password: this.password
        })
      });
      const usableResult = await result.json();
      if (usableResult.success) {
        this.getUserData();
      } else {
        this.msg = usableResult.errorMsg;
      }
    }
  }
};
</script>
