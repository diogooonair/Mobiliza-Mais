<template>
  <q-page class="bg-grey-1">
    <div class="bg-gradient q-pa-md text-white">
      <q-btn flat round icon="arrow_back" @click="$router.back()" color="white" class="q-mb-sm" />
      <div class="text-h5">Registar Trajeto 🚴</div>
      <div class="text-caption">Ganhe pontos pela mobilidade sustentável</div>
    </div>

    <div class="q-pa-md">
      <q-form @submit="registerTrip">
        <div class="text-subtitle1 q-mb-md">Escolha o meio de transporte</div>

        <div class="row q-col-gutter-sm q-mb-lg">
          <div v-for="(info, key) in transportOptions" :key="key" class="col-6">
            <q-card
              class="transport-card"
              :class="{ selected: selectedTransport === key }"
              @click="selectedTransport = key"
              clickable
            >
              <q-card-section class="text-center">
                <q-icon
                  :name="info.icon"
                  size="48px"
                  :color="selectedTransport === key ? info.color : 'grey-5'"
                />
                <div class="text-body2 q-mt-sm">{{ info.label }}</div>
                <q-chip :color="info.color" text-color="white" size="sm" class="q-mt-xs">
                  +{{ info.points }} pts/km
                </q-chip>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ info.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-subtitle1 q-mb-sm">Distância percorrida</div>
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <q-slider
                  v-model="distance"
                  :min="0.1"
                  :max="50"
                  :step="0.1"
                  label
                  :label-value="distance + ' km'"
                  color="primary"
                />
              </div>
            </div>

            <q-input
              v-model.number="distance"
              type="number"
              filled
              label="Ou digite a distância exata"
              suffix="km"
              :rules="[(val) => val > 0 || 'Distância deve ser maior que 0']"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>

        <div class="text-subtitle1 q-mb-sm">Localizações (opcional)</div>
        <q-card class="q-mb-lg">
          <q-card-section>
            <q-input
              v-model="startLocation"
              filled
              label="Local de partida"
              icon="place"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="trip_origin" />
              </template>
            </q-input>

            <q-input v-model="endLocation" filled label="Local de chegada" icon="place">
              <template v-slot:prepend>
                <q-icon name="place" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>

        <q-card class="bg-green-1 q-mb-lg" v-if="selectedTransport && distance > 0">
          <q-card-section>
            <div class="text-h6 text-center text-green-9">
              Você vai ganhar {{ estimatedPoints }} pontos! 🎉
            </div>
            <div class="text-center text-caption text-grey-7 q-mt-xs">
              Economizando ~{{ estimatedCO2 }} de CO₂
            </div>
          </q-card-section>
        </q-card>

        <q-btn
          label="REGISTAR TRAJETO"
          color="primary"
          class="full-width"
          size="lg"
          type="submit"
          :loading="loading"
          :disable="!selectedTransport || distance <= 0"
        />
      </q-form>

      <q-card class="q-mt-lg bg-blue-1">
        <q-card-section>
          <div class="row items-center">
            <q-icon name="lightbulb" color="blue" size="24px" class="q-mr-sm" />
            <div class="text-subtitle2">Dica</div>
          </div>
          <div class="text-caption q-mt-sm text-grey-8">
            Quanto mais sustentável for o seu meio de transporte, mais pontos ganha! Bicicleta e
            caminhar são as melhores opções. 🌱
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'
import { tripsService } from 'src/services/tripsService'

const router = useRouter()
const $q = useQuasar()

const selectedTransport = ref(null)
const distance = ref(5)
const startLocation = ref('')
const endLocation = ref('')
const loading = ref(false)

const transportOptions = tripsService.getTransportInfo()

const estimatedPoints = computed(() => {
  if (!selectedTransport.value) return 0
  const info = transportOptions[selectedTransport.value]
  return Math.round(distance.value * info.points)
})

const estimatedCO2 = computed(() => {
  if (!selectedTransport.value) return '0g'

  const CO2_SAVINGS = {
    bicycle: 120,
    walk: 120,
    publicTransport: 80,
    carpool: 60,
    electricCar: 40,
    car: 0,
  }

  const grams = Math.round(distance.value * (CO2_SAVINGS[selectedTransport.value] || 0))

  if (grams < 1000) return `${grams}g`
  return `${(grams / 1000).toFixed(1)}kg`
})

async function registerTrip() {
  loading.value = true

  const user = authService.getCurrentUser()
  if (!user) {
    router.push('/login')
    return
  }

  const tripData = {
    transport: selectedTransport.value,
    distance: distance.value,
    startLocation: startLocation.value,
    endLocation: endLocation.value,
  }

  const result = await tripsService.registerTrip(user.uid, tripData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `🎉 Parabéns! Ganhou ${result.points} pontos!`,
      caption: 'Trajeto registado com sucesso',
      timeout: 3000,
      actions: [
        { label: 'Ver estatísticas', color: 'white', handler: () => router.push('/statistics') },
      ],
    })

    // Resetar formulário
    selectedTransport.value = null
    distance.value = 5
    startLocation.value = ''
    endLocation.value = ''

    // Voltar para a home após 2 segundos
    setTimeout(() => {
      router.push('/home')
    }, 2000)
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao registar trajeto',
      caption: result.error,
    })
  }

  loading.value = false
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.transport-card {
  transition: all 0.3s;
  border: 2px solid transparent;
}

.transport-card.selected {
  border-color: var(--q-primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.transport-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
