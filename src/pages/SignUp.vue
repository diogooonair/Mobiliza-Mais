<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="q-pa-md q-ma-md full-width" style="max-width: 400px">
      <div class="text-h5 text-center q-mb-md">Sign Up</div>

      <q-input filled v-model="name" label="Name" placeholder="Type your name" class="q-mb-md" />

      <q-input
        filled
        v-model="email"
        label="Email"
        placeholder="Type your email"
        type="email"
        class="q-mb-md"
      />

      <q-input
        filled
        v-model="password"
        label="Password"
        placeholder="Create a password"
        type="password"
        class="q-mb-md"
      />

      <q-btn label="SIGN UP" color="primary" class="full-width q-mb-md" @click="signup" />

      <div class="text-center text-caption q-mb-sm">Or Sign Up Using</div>

      <div class="row justify-around q-mb-md">
        <q-btn round icon="fab fa-facebook" color="blue-8" @click="socialSignup('facebook')" />
        <q-btn round icon="fab fa-twitter" color="blue-5" @click="socialSignup('twitter')" />
        <q-btn round icon="fab fa-google" color="red-5" @click="socialSignup('google')" />
      </div>

      <div class="text-center text-caption q-mb-sm">Already have an account?</div>

      <q-btn flat label="LOGIN" color="primary" class="full-width" @click="goToLogin" />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')

function signup() {
  // lógica de registo
}

function goToLogin() {
  // navegação para página de login
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom right, #3a8efc, #8e44ad);
  min-height: 100vh;
}
</style>
