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

      <div class="text-center text-caption q-mb-sm">Already have an account?</div>

      <q-btn flat label="LOGIN" color="primary" class="full-width" to="/login" />
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
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom right, #3a8efc, #8e44ad);
  min-height: 100vh;
}
</style>
