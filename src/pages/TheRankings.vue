<template>
  <q-page class="bg-grey-1">
    <div class="bg-gradient q-pa-md text-white">
      <q-btn flat round icon="arrow_back" @click="$router.back()" color="white" class="q-mb-sm" />
      <div class="text-h5">Rankings 🏆</div>
      <div class="text-caption">Veja os campeões da sustentabilidade</div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey bg-white"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="global" label="Global" />
      <q-tab name="monthly" label="Mensal" />
    </q-tabs>

    <!-- Sua Posição -->
    <div class="q-pa-md" v-if="userRanking">
      <q-card class="bg-blue-1">
        <q-card-section class="row items-center">
          <q-avatar color="primary" text-color="white" size="48px">
            {{ userRanking.position }}
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold">Sua posição</div>
            <div class="text-caption">{{ userRanking.name }}</div>
          </div>
          <q-space />
          <div class="text-right">
            <div class="text-h6 text-primary">{{ userRanking.totalPoints }}</div>
            <div class="text-caption">pontos</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="q-pa-xl text-center">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">A carregar rankings...</div>
    </div>

    <!-- Rankings List -->
    <div v-else class="q-pa-md">
      <div v-if="ranking.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="emoji_events" size="64px" />
        <div class="q-mt-md">Ainda não há rankings disponíveis</div>
      </div>

      <q-list v-else bordered separator>
        <!-- Top 3 -->
        <q-item
          v-for="(user, index) in ranking.slice(0, 3)"
          :key="user.id"
          :class="getTopClass(index + 1)"
        >
          <q-item-section avatar>
            <q-avatar :color="getMedalColor(index + 1)" text-color="white" size="56px">
              <q-icon v-if="index < 3" :name="getMedalIcon(index + 1)" size="32px" />
              <span v-else class="text-h6">{{ index + 1 }}</span>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-h6">
              {{ user.name }}
            </q-item-label>
            <q-item-label caption>
              <q-badge :color="getLevelColor(user.level)" text-color="white">
                Nível {{ user.level }}
              </q-badge>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-h6 text-weight-bold">{{ user.totalPoints }}</div>
            <div class="text-caption text-grey-6">pontos</div>
          </q-item-section>
        </q-item>

        <!-- Resto do ranking -->
        <q-item
          v-for="user in ranking.slice(3)"
          :key="user.id"
          :class="{ 'bg-blue-1': user.id === currentUserId }"
        >
          <q-item-section avatar>
            <q-avatar color="grey-4" text-color="grey-8">
              {{ user.position }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>
              <q-badge color="grey-6" text-color="white"> Nível {{ user.level }} </q-badge>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-subtitle1 text-weight-medium">{{ user.totalPoints }}</div>
            <div class="text-caption text-grey-6">pontos</div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Motivational Message -->
      <q-card class="q-mt-lg bg-gradient-light">
        <q-card-section>
          <div class="text-center">
            <q-icon name="emoji_events" color="yellow-8" size="48px" />
            <div class="text-h6 q-mt-sm">Continue assim!</div>
            <div class="text-caption text-grey-7">
              Cada trajeto sustentável conta para um planeta melhor 🌍
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Navigation -->
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
import { ref, onMounted } from 'vue'
import { authService } from 'src/services/authService'
import { tripsService } from 'src/services/tripsService'

const tab = ref('global')
const currentTab = ref('ranking')
const loading = ref(true)
const ranking = ref([])
const userRanking = ref(null)
const currentUserId = ref(null)

onMounted(async () => {
  await loadRankings()
})

async function loadRankings() {
  loading.value = true

  const user = authService.getCurrentUser()
  if (user) {
    currentUserId.value = user.uid
  }

  // Carregar ranking
  const rankingResult = await tripsService.getRanking(100)
  if (rankingResult.success) {
    ranking.value = rankingResult.ranking

    // Encontrar posição do utilizador
    if (user) {
      const userIndex = ranking.value.findIndex((u) => u.id === user.uid)
      if (userIndex !== -1) {
        userRanking.value = ranking.value[userIndex]
      }
    }
  }

  loading.value = false
}

function getMedalIcon(position) {
  if (position === 1) return 'emoji_events'
  if (position === 2) return 'emoji_events'
  if (position === 3) return 'emoji_events'
  return 'person'
}

function getMedalColor(position) {
  if (position === 1) return 'yellow-7'
  if (position === 2) return 'grey-5'
  if (position === 3) return 'deep-orange-5'
  return 'grey-4'
}

function getTopClass(position) {
  const classes = ['q-pa-md']
  if (position === 1) classes.push('bg-yellow-1')
  else if (position === 2) classes.push('bg-grey-2')
  else if (position === 3) classes.push('bg-deep-orange-1')
  return classes.join(' ')
}

function getLevelColor(level) {
  if (level >= 10) return 'purple'
  if (level >= 5) return 'deep-orange'
  if (level >= 3) return 'orange'
  return 'blue'
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-light {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e7ff 100%);
}
</style>
