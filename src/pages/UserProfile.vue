<template>
  <q-page class="bg-grey-1">
    <div class="bg-gradient q-pa-md text-white">
      <div class="text-center">
        <q-avatar size="100px" color="white" text-color="primary" class="q-mb-md">
          <span class="text-h3">{{ userInitials }}</span>
        </q-avatar>
        <div class="text-h5">{{ userName }}</div>
        <div class="text-caption">{{ userEmail }}</div>

        <q-chip color="amber" text-color="white" class="q-mt-sm" size="lg">
          <q-icon name="stars" left />
          Nível {{ userLevel }}
        </q-chip>
      </div>
    </div>

    <div class="q-pa-md">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Resumo Geral</div>
          <div class="row q-col-gutter-sm">
            <div class="col-4 text-center">
              <div class="text-h6 text-primary">{{ totalPoints }}</div>
              <div class="text-caption">Pontos</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-h6 text-green">{{ totalTrips }}</div>
              <div class="text-caption">Trajetos</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-h6 text-orange">#{{ userRanking }}</div>
              <div class="text-caption">Ranking</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="text-h6 q-mb-md">📍 Histórico de Trajetos</div>

      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-else-if="trips.length === 0" class="text-center q-pa-lg text-grey-6">
        <q-icon name="directions" size="64px" />
        <div class="q-mt-md">Ainda não tem trajetos</div>
      </div>

      <q-list v-else bordered separator>
        <q-expansion-item
          v-for="trip in trips"
          :key="trip.id"
          :icon="getTransportInfo(trip.transport).icon"
          :label="getTransportInfo(trip.transport).label"
          :caption="`${trip.distance.toFixed(1)} km • ${formatDate(trip.date)}`"
          header-class="bg-white"
        >
          <q-card>
            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <div class="text-caption text-grey-6">Pontos Ganhos</div>
                  <div class="text-h6 text-green">+{{ trip.points }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">CO₂ Economizado</div>
                  <div class="text-subtitle1">{{ formatCO2(trip.co2Saved) }}</div>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div v-if="trip.startLocation" class="q-mb-xs">
                <q-icon name="trip_origin" size="xs" class="q-mr-xs" />
                <span class="text-caption">{{ trip.startLocation }}</span>
              </div>
              <div v-if="trip.endLocation">
                <q-icon name="place" size="xs" class="q-mr-xs" />
                <span class="text-caption">{{ trip.endLocation }}</span>
              </div>

              <div class="text-caption text-grey-6 q-mt-sm">
                {{ formatDateTime(trip.date) }}
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>

      <q-btn
        v-if="trips.length >= 10"
        flat
        label="Ver mais trajetos"
        color="primary"
        class="full-width q-mt-sm"
        @click="loadMoreTrips"
        :loading="loadingMore"
      />

      <div class="text-h6 q-mb-md q-mt-lg">🏆 Minhas Conquistas</div>

      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div
              v-for="achievement in achievements"
              :key="achievement.id"
              class="col-4 text-center"
            >
              <q-avatar size="72px" :color="achievement.unlocked ? 'amber' : 'grey-3'">
                <q-icon
                  :name="achievement.icon"
                  size="40px"
                  :color="achievement.unlocked ? 'white' : 'grey-5'"
                />
              </q-avatar>
              <div class="text-caption q-mt-xs" :class="achievement.unlocked ? '' : 'text-grey-5'">
                {{ achievement.name }}
              </div>
              <div class="text-caption text-grey-6" style="font-size: 10px">
                {{ achievement.description }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="text-h6 q-mb-md q-mt-lg">⚙️ Configurações</div>

      <q-list bordered>
        <q-item clickable @click="openEditProfile">
          <q-item-section avatar>
            <q-icon name="edit" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Editar Perfil</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="notifications" color="orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Notificações</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="notifications" color="primary" />
          </q-item-section>
        </q-item>

        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" color="red" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sair</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-dialog v-model="showEditProfile">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Editar Perfil</div>
        </q-card-section>

        <q-card-section>
          <q-input filled v-model="editName" label="Nome" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="saveProfile"
            :loading="savingProfile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-footer class="bg-white text-primary" style="box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1)">
      <q-tabs
        v-model="currentTab"
        active-color="primary"
        indicator-color="primary"
        class="text-grey"
      >
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'
import { tripsService } from 'src/services/tripsService'

const router = useRouter()
const $q = useQuasar()

const currentTab = ref('profile')
const loading = ref(true)
const loadingMore = ref(false)
const userName = ref('')
const userEmail = ref('')
const userLevel = ref(1)
const totalPoints = ref(0)
const totalTrips = ref(0)
const userRanking = ref('?')
const trips = ref([])
const notifications = ref(true)
const showEditProfile = ref(false)
const editName = ref('')
const savingProfile = ref(false)

const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const achievements = ref([
  { id: 1, name: 'Novato', icon: 'stars', description: 'Primeiro trajeto', unlocked: false },
  { id: 2, name: 'Explorador', icon: 'explore', description: '10 trajetos', unlocked: false },
  { id: 3, name: 'Maratonista', icon: 'directions_bike', description: '100 km', unlocked: false },
  { id: 4, name: 'Eco Warrior', icon: 'eco', description: '1kg CO₂', unlocked: false },
  { id: 5, name: 'Dedicado', icon: 'favorite', description: '50 trajetos', unlocked: false },
  { id: 6, name: 'Lenda', icon: 'emoji_events', description: '5000 pontos', unlocked: false },
])

onMounted(async () => {
  await loadProfile()
})

async function loadProfile() {
  loading.value = true

  const user = authService.getCurrentUser()
  if (!user) {
    router.push('/login')
    return
  }

  // Dados do utilizador
  const userData = await authService.getUserData(user.uid)
  if (userData.success) {
    userName.value = userData.data.name
    userEmail.value = userData.data.email
    totalPoints.value = userData.data.totalPoints || 0
    userLevel.value = Math.floor(totalPoints.value / 1000) + 1
  }

  // Estatísticas
  const statsResult = await tripsService.getUserStats(user.uid)
  if (statsResult.success) {
    totalTrips.value = statsResult.stats.totalTrips

    // Atualizar conquistas
    achievements.value[0].unlocked = totalTrips.value >= 1
    achievements.value[1].unlocked = totalTrips.value >= 10
    achievements.value[2].unlocked = statsResult.stats.totalDistance >= 100
    achievements.value[3].unlocked = statsResult.stats.totalCO2Saved >= 1000
    achievements.value[4].unlocked = totalTrips.value >= 50
    achievements.value[5].unlocked = totalPoints.value >= 5000
  }

  // Trajetos
  const tripsResult = await tripsService.getUserTrips(user.uid, 10)
  if (tripsResult.success) {
    trips.value = tripsResult.trips
  }

  // Ranking
  const rankingResult = await tripsService.getUserRanking(user.uid)
  if (rankingResult.success && rankingResult.position) {
    userRanking.value = rankingResult.position
  }

  loading.value = false
}

async function loadMoreTrips() {
  loadingMore.value = true
  const user = authService.getCurrentUser()
  const tripsResult = await tripsService.getUserTrips(user.uid, 50)
  if (tripsResult.success) {
    trips.value = tripsResult.trips
  }
  loadingMore.value = false
}

function getTransportInfo(transport) {
  const info = tripsService.getTransportInfo()
  return info[transport] || info.car
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

function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCO2(grams) {
  if (grams < 1000) return `${grams}g`
  return `${(grams / 1000).toFixed(1)}kg`
}

function openEditProfile() {
  editName.value = userName.value
  showEditProfile.value = true
}

async function saveProfile() {
  savingProfile.value = true

  const user = authService.getCurrentUser()
  if (!user) return

  const result = await authService.updateUser(user.uid, {
    name: editName.value,
  })

  if (result.success) {
    userName.value = editName.value
    $q.notify({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
    })
    showEditProfile.value = false
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar: ' + result.error,
    })
  }

  savingProfile.value = false
}

async function logout() {
  $q.dialog({
    title: 'Confirmar',
    message: 'Deseja realmente sair?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authService.logout()
    router.push('/login')
  })
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
