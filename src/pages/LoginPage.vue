<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="q-pa-md q-ma-md full-width" style="max-width: 400px">
      <div class="text-center q-mb-lg">
        <div class="text-h4 text-primary">🚴 Mobiliza+</div>
        <div class="text-subtitle2 text-grey-7">Mobilidade Sustentável</div>
      </div>

      <q-form @submit="login">
        <q-input
          filled
          v-model="email"
          label="Email"
          placeholder="seuemail@exemplo.com"
          type="email"
          class="q-mb-md"
          :rules="[(val) => !!val || 'Email é obrigatório']"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="password"
          label="Password"
          placeholder="Digite sua password"
          :type="showPassword ? 'text' : 'password'"
          class="q-mb-sm"
          :rules="[(val) => !!val || 'Password é obrigatória']"
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

        <div class="text-right q-mb-md">
          <q-btn
            flat
            label="Esqueceu a password?"
            color="primary"
            size="sm"
            @click="showRecoverDialog = true"
          />
        </div>

        <q-btn
          label="ENTRAR"
          color="positive"
          class="full-width q-mb-md"
          type="submit"
          :loading="loading"
          size="lg"
        />

        <div class="text-center text-grey-7 q-mb-sm">Não tem conta?</div>

        <q-btn flat label="CRIAR CONTA" color="primary" class="full-width" to="/signup" outline />
      </q-form>
    </q-card>

    <q-dialog v-model="showRecoverDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Recuperar Password</div>
        </q-card-section>

        <q-card-section>
          <q-input filled v-model="recoverEmail" label="Email" type="email" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Enviar"
            color="primary"
            @click="recoverPassword"
            :loading="loadingRecover"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const showRecoverDialog = ref(false)
const recoverEmail = ref('')
const loadingRecover = ref(false)

async function login() {
  loading.value = true

  const result = await authService.login(email.value, password.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      icon: 'check_circle',
    })
    router.push('/home')
  } else {
    $q.notify({
      type: 'negative',
      message: result.error,
      icon: 'error',
    })
  }

  loading.value = false
}

async function recoverPassword() {
  if (!recoverEmail.value) {
    $q.notify({
      type: 'warning',
      message: 'Digite seu email',
      icon: 'warning',
    })
    return
  }

  loadingRecover.value = true

  const result = await authService.resetPassword(recoverEmail.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Email de recuperação enviado!',
      icon: 'mail',
    })
    showRecoverDialog.value = false
    recoverEmail.value = ''
  } else {
    $q.notify({
      type: 'negative',
      message: result.error,
      icon: 'error',
    })
  }

  loadingRecover.value = false
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>
