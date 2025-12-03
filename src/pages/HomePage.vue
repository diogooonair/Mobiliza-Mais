<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="bg-gradient q-pa-md text-white">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h5">Olá, {{ userName }}! 👋</div>
          <div class="text-caption">Bem-vindo ao Mobiliza+</div>
        </div>
        <q-btn flat round icon="logout" @click="logout" color="white">
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </div>

      <!-- Pontos Card -->
      <q-card class="q-mt-md bg-white text-dark">
        <q-card-section class="text-center">
          <div class="text-h3 text-green">{{ userPoints }}</div>
          <div class="text-subtitle1">Pontos Totais</div>
          <q-linear-progress :value="levelProgress" color="green" class="q-mt-sm" />
          <div class="text-caption q-mt-xs">
            Nível {{ userLevel }} - {{ pointsToNextLevel }} pontos para o próximo nível
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Quick Stats -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <q-icon name="tour" size="32px" color="primary" />
              <div class="text-h6 q-mt-sm">{{ stats.totalTrips }}</div>
              <div class="text-caption">Trajetos</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <q-icon name="landscape" size="32px" color="green" />
              <div class="text-h6 q-mt-sm">{{ formatCO2(stats.totalCO2Saved) }}</div>
              <div class="text-caption">CO₂ Poupado</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Últimos Trajetos -->
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Últimos Trajetos</div>

      <div v-if="recentTrips.length === 0" class="text-center q-pa-lg text-grey-6">
        <q-icon name="directions" size="64px" />
        <div class="q-mt-md">Ainda não tem trajetos registados</div>
        <div class="text-caption">Comece agora a ganhar pontos!</div>
      </div>

      <q-list v-else bordered separator>
        <q-item v-for="trip in recentTrips.slice(0, 5)" :key="trip.id" clickable>
          <q-item-section avatar>
            <q-avatar
              :color="getTransportInfo(trip.transport).color"
              text-color="white"
              :icon="getTransportInfo(trip.transport).icon"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ getTransportInfo(trip.transport).label }}</q-item-label>
            <q-item-label caption>
              {{ trip.distance.toFixed(1) }} km • {{ formatDate(trip.date) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip color="green" text-color="white" size="sm"> +{{ trip.points }} pts </q-chip>
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn
        v-if="recentTrips.length > 5"
        flat
        label="Ver todos"
        color="primary"
        class="full-width q-mt-sm"
        @click="$router.push('/profile')"
      />
    </div>

    <!-- Botão de Registar Trajeto -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add_location"
        color="primary"
        @click="$router.push('/register-trip')"
        size="lg"
      >
        <q-tooltip>Registar Trajeto</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <!-- Bottom Navigation -->
    <q-footer class="bg-white text-primary" style="box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1)">
      <q-tabs v-model="tab" active-color="primary" indicator-color="primary" class="text-grey">
        <q-tab name="home" icon="home" label="Início" @click="$router.push('/home')" />
        <q-tab
          name="stats"
          icon="bar_chart"
          label="Estatísticas"
          @click="$router.push('/statistics')"
        />
        <q-tab
          name="ranking"
          icon="emoji_events"
          label="Rankings"
          @click="$router.push('/rankings')"
        />
        <q-tab name="profile" icon="person" label="Perfil" @click="$router.push('/profile')" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getUser, getUserTripCount, getUserTotals, getData, signOut } from 'src/stores/APICalls.js'

const router = useRouter()
const $q = useQuasar()

const tab = ref('home')
const userName = ref('')
const userPoints = ref(0)
const userLevel = ref(1)
const recentTrips = ref([])
const stats = ref({
  totalTrips: 0,
  totalDistance: 0,
  totalCO2Saved: 0,
})

const levelProgress = computed(() => {
  const pointsPerLevel = 1000
  const currentLevelPoints = userPoints.value % pointsPerLevel
  return currentLevelPoints / pointsPerLevel
})

const pointsToNextLevel = computed(() => {
  const pointsPerLevel = 1000
  const currentLevelPoints = userPoints.value % pointsPerLevel
  return pointsPerLevel - currentLevelPoints
})

onMounted(async () => {
  await loadUserData()
})

async function loadUserData() {
  try {
    const { user, error } = await getUser()
    if (error || !user) {
      router.push('/login')
      return
    }

    userName.value = user.user_metadata?.name || 'Utilizador'

    // Number of trajetos
    const { count: numTrips, error: tripsError } = await getUserTripCount(user.id)
    stats.value.totalTrips = tripsError ? 0 : numTrips

    // Total points and CO2
    const { totalPoints, totalCO2, error: totalsError } = await getUserTotals(user.id)
    userPoints.value = totalsError ? 0 : totalPoints
    stats.value.totalCO2Saved = totalsError ? 0 : totalCO2

    // Calculate user level
    userLevel.value = Math.floor(userPoints.value / 1000) + 1

    // Load recent trips (latest 5)
    const { data: tripsData, error: tripsDataError } = await getData()
    if (!tripsDataError && tripsData) {
      // Sort by tempo descending
      recentTrips.value = tripsData.sort((a, b) => new Date(b.tempo) - new Date(a.tempo)).slice(0, 5)
      // Total distance
      stats.value.totalDistance = tripsData.reduce((sum, trip) => sum + (trip.distance || 0), 0)
    }
  } catch (err) {
    console.error('Error loading user data:', err)
    router.push('/login')
  }
}

function getTransportInfo(transport) {
  const infoMap = {
    car: { label: 'Carro', icon: 'directions_car', color: 'grey' },
    bike: { label: 'Bicicleta', icon: 'directions_bike', color: 'green' },
    walk: { label: 'A pé', icon: 'directions_walk', color: 'orange' },
    bus: { label: 'Autocarro', icon: 'directions_bus', color: 'blue' },
  }
  return infoMap[transport] || infoMap.car
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`

  return date.toLocaleDateString('pt-PT')
}

function formatCO2(grams) {
  if (grams < 1000) return `${grams}g`
  return `${(grams / 1000).toFixed(1)}kg`
}

async function logout() {
  $q.dialog({
    title: 'Confirmar',
    message: 'Deseja realmente sair?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await signOut()
    router.push('/login')
  })
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: scale(1.05);
}
</style>
