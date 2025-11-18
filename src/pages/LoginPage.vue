<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="q-pa-md q-ma-md full-width" style="max-width: 400px">
      <div class="text-h5 text-center q-mb-md">Login</div>

      <q-input
        filled
        v-model="username"
        label="Username"
        placeholder="Type your username"
        class="q-mb-md"
      />

      <q-input
        filled
        v-model="password"
        label="Password"
        placeholder="Type your password"
        type="password"
        class="q-mb-sm"
      />

      <div class="text-right text-caption text-blue-5 q-mb-md">
        <q-btn flat label="Forgot password?" @click="recoverPassword" />
      </div>

      <q-btn label="LOGIN" color="primary" class="full-width q-mb-md" @click="login" />

      <div class="text-center text-caption q-mb-sm">Or Sign Up Using</div>

      <q-btn flat label="SIGN UP" color="primary" class="full-width" to="/signup" />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')

function login() {
  // lógica de login
}

function recoverPassword() {
  // lógica de recuperação
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom right, #3a8efc, #8e44ad);
  min-height: 100vh;
}
</style>
