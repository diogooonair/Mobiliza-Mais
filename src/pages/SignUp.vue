<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="q-pa-md q-ma-md full-width" style="max-width: 400px">
      <div class="text-center q-mb-lg">
        <div class="text-h4 text-primary">🚴 Mobiliza+</div>
        <div class="text-subtitle2 text-grey-7">Criar Nova Conta</div>
      </div>

      <q-form @submit="signup">
        <q-input
          filled
          v-model="name"
          label="Nome Completo"
          placeholder="Seu nome"
          class="q-mb-md"
          :rules="[(val) => !!val || 'Nome é obrigatório']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="email"
          label="Email"
          placeholder="seuemail@exemplo.com"
          type="email"
          class="q-mb-md"
          :rules="[
            (val) => !!val || 'Email é obrigatório',
            (val) => /.+@.+\..+/.test(val) || 'Email inválido',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="password"
          label="Password"
          placeholder="Mínimo 6 caracteres"
          :type="showPassword ? 'text' : 'password'"
          class="q-mb-md"
          :rules="[
            (val) => !!val || 'Password é obrigatória',
            (val) => val.length >= 6 || 'Mínimo 6 caracteres',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          filled
          v-model="confirmPassword"
          label="Confirmar Password"
          placeholder="Digite novamente"
          :type="showPassword ? 'text' : 'password'"
          class="q-mb-md"
          :rules="[
            (val) => !!val || 'Confirme a password',
            (val) => val === password || 'Passwords não coincidem',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-btn
          label="CRIAR CONTA"
          color="positive"
          class="full-width q-mb-md"
          type="submit"
          :loading="loading"
          size="lg"
        />

        <div class="text-center text-grey-7 q-mb-sm">Já tem conta?</div>

        <q-btn flat label="FAZER LOGIN" color="primary" class="full-width" to="/login" outline />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'

const router = useRouter()
const $q = useQuasar()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function signup() {
  loading.value = true

  const result = await authService.register(name.value, email.value, password.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Conta criada com sucesso! Bem-vindo ao Mobiliza+',
      icon: 'celebration',
    })
    router.push('/home')
  } else {
    let errorMessage = result.error

    if (errorMessage.includes('email-already-in-use')) {
      errorMessage = 'Este email já está registado'
    } else if (errorMessage.includes('weak-password')) {
      errorMessage = 'Password muito fraca'
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
    })
  }

  loading.value = false
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>
