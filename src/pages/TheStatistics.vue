<template>
  <q-page class="bg-grey-1">
    <div class="bg-gradient q-pa-md text-white">
      <q-btn flat round icon="arrow_back" @click="$router.back()" color="white" class="q-mb-sm" />
      <div class="text-h5">Estatísticas 📊</div>
      <div class="text-caption">O seu impacto ambiental</div>
    </div>

    <q-tabs
      v-model="tab"
      dense
      class="text-grey bg-white"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="personal" label="Pessoal" />
      <q-tab name="global" label="Global" />
    </q-tabs>

    <div v-if="loading" class="q-pa-xl text-center">
      <q-spinner color="primary" size="48px" />
    </div>

    <div v-else class="q-pa-md">
      <div v-if="tab === 'personal'">
        <div class="text-h6 q-mb-md">🌍 Impacto Ambiental</div>

        <q-card class="q-mb-md bg-green-1">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="eco" color="green" size="48px" class="q-mr-md" />
              <div>
                <div class="text-h4 text-green">{{ formatCO2(personalStats.totalCO2Saved) }}</div>
                <div class="text-caption text-grey-7">CO₂ economizado</div>
              </div>
            </div>
            <q-separator class="q-my-md" />
            <div class="text-caption text-grey-8">
              Equivalente a {{ getTreesEquivalent(personalStats.totalCO2Saved) }} árvores plantadas!
              🌳
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="tour" color="primary" size="36px" />
                <div class="text-h5 q-mt-sm">{{ personalStats.totalTrips }}</div>
                <div class="text-caption">Trajetos</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="straighten" color="orange" size="36px" />
                <div class="text-h5 q-mt-sm">{{ personalStats.totalDistance.toFixed(1) }}</div>
                <div class="text-caption">km percorridos</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="attach_money" color="green" size="36px" />
                <div class="text-h5 q-mt-sm">
                  {{ calculateMoneySaved(personalStats.totalDistance) }}€
                </div>
                <div class="text-caption">Poupança estimada</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="local_fire_department" color="red" size="36px" />
                <div class="text-h5 q-mt-sm">
                  {{ calculateCalories(personalStats.totalDistance) }}
                </div>
                <div class="text-caption">Calorias queimadas</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-h6 q-mb-md">🚲 Por tipo de transporte</div>

        <q-list bordered separator>
          <q-item v-for="(data, transport) in personalStats.transportBreakdown" :key="transport">
            <q-item-section avatar>
              <q-avatar
                :color="getTransportInfo(transport).color"
                text-color="white"
                :icon="getTransportInfo(transport).icon"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ getTransportInfo(transport).label }}</q-item-label>
              <q-item-label caption>
                {{ data.count }} trajetos • {{ data.distance.toFixed(1) }} km
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-chip color="green" text-color="white" size="sm"> {{ data.points }} pts </q-chip>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card class="q-mt-lg bg-purple-1">
          <q-card-section>
            <div class="text-h6 q-mb-md">🏅 Conquistas desbloqueadas</div>
            <div class="row q-col-gutter-sm">
              <div
                class="col-4 text-center"
                v-for="achievement in getAchievements()"
                :key="achievement.id"
              >
                <q-avatar size="64px" :color="achievement.unlocked ? 'amber' : 'grey-4'">
                  <q-icon
                    :name="achievement.icon"
                    size="32px"
                    :color="achievement.unlocked ? 'white' : 'grey-6'"
                  />
                </q-avatar>
                <div class="text-caption q-mt-xs">{{ achievement.name }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="tab === 'global'">
        <div class="text-h6 q-mb-md">🌎 Impacto Coletivo</div>

        <q-card class="q-mb-md bg-blue-1">
          <q-card-section>
            <div class="text-center">
              <div class="text-h3 text-primary">{{ globalStats.totalUsers }}</div>
              <div class="text-subtitle1">Utilizadores ativos</div>
              <div class="text-caption text-grey-7">Fazendo a diferença juntos!</div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="tour" color="primary" size="36px" />
                <div class="text-h5 q-mt-sm">{{ globalStats.totalTrips.toLocaleString() }}</div>
                <div class="text-caption">Trajetos</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="public" color="blue" size="36px" />
                <div class="text-h5 q-mt-sm">{{ globalStats.totalDistance.toFixed(0) }}</div>
                <div class="text-caption">km totais</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="bg-green-1 q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="forest" color="green" size="56px" class="q-mr-md" />
              <div>
                <div class="text-h4 text-green">{{ formatCO2(globalStats.totalCO2Saved) }}</div>
                <div class="text-subtitle2">CO₂ total economizado</div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Equivalente a {{ getTreesEquivalent(globalStats.totalCO2Saved) }} árvores! 🌳
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="bg-amber-1">
          <q-card-section>
            <div class="text-h6 q-mb-md">💡 Comparação de Impacto</div>
            <div class="q-mb-sm">
              <div class="row items-center q-mb-xs">
                <q-icon name="lightbulb" color="amber-8" class="q-mr-sm" />
                <span class="text-body2"
                  >{{ calculateLightbulbs(globalStats.totalCO2Saved) }} horas de lâmpada
                  poupadas</span
                >
              </div>
              <div class="row items-center q-mb-xs">
                <q-icon name="home" color="blue-8" class="q-mr-sm" />
                <span class="text-body2"
                  >{{ calculateHomes(globalStats.totalCO2Saved) }} casas alimentadas por 1 dia</span
                >
              </div>
              <div class="row items-center">
                <q-icon name="local_gas_station" color="red-8" class="q-mr-sm" />
                <span class="text-body2"
                  >{{ calculateGasoline(globalStats.totalDistance) }}L de gasolina poupados</span
                >
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

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

const tab = ref('personal')
const currentTab = ref('stats')
const loading = ref(true)
const personalStats = ref({
  totalTrips: 0,
  totalDistance: 0,
  totalCO2Saved: 0,
  transportBreakdown: {},
})
const globalStats = ref({
  totalUsers: 0,
  totalTrips: 0,
  totalDistance: 0,
  totalCO2Saved: 0,
})

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  loading.value = true

  const user = authService.getCurrentUser()

  if (user) {
    // Carregar stats pessoais
    const statsResult = await tripsService.getUserStats(user.uid)
    if (statsResult.success) {
      personalStats.value = statsResult.stats
    }
  }

  // Carregar stats globais
  const globalResult = await tripsService.getGlobalStats()
  if (globalResult.success) {
    globalStats.value = globalResult.stats
  }

  loading.value = false
}

function getTransportInfo(transport) {
  const info = tripsService.getTransportInfo()
  return info[transport] || info.car
}

function formatCO2(grams) {
  if (grams < 1000) return `${grams}g`
  if (grams < 1000000) return `${(grams / 1000).toFixed(1)}kg`
  return `${(grams / 1000000).toFixed(2)}t`
}

function getTreesEquivalent(gramsC02) {
  // Uma árvore absorve ~21kg de CO2 por ano
  const trees = Math.round(gramsC02 / 21000)
  return trees || 1
}

function calculateMoneySaved(km) {
  // Custo médio de 0.15€ por km de carro
  return (km * 0.15).toFixed(2)
}

function calculateCalories(km) {
  // Média de 50 calorias por km (bicicleta/caminhada)
  return Math.round(km * 50)
}

function calculateLightbulbs(gramsC02) {
  // 1kg CO2 = ~200h de lâmpada LED
  return Math.round((gramsC02 / 1000) * 200)
}

function calculateHomes(gramsC02) {
  // Casa média consome ~30kg CO2/dia
  return Math.round(gramsC02 / 30000) || 1
}

function calculateGasoline(km) {
  // Consumo médio 7L/100km
  return Math.round(km * 0.07)
}

function getAchievements() {
  const stats = personalStats.value
  return [
    {
      id: 1,
      name: 'Primeiro Passo',
      icon: 'stars',
      unlocked: stats.totalTrips >= 1,
    },
    {
      id: 2,
      name: 'Eco Guerreiro',
      icon: 'eco',
      unlocked: stats.totalCO2Saved >= 1000,
    },
    {
      id: 3,
      name: 'Maratonista',
      icon: 'directions_bike',
      unlocked: stats.totalDistance >= 100,
    },
    {
      id: 4,
      name: 'Dedicado',
      icon: 'favorite',
      unlocked: stats.totalTrips >= 10,
    },
    {
      id: 5,
      name: 'Explorador',
      icon: 'explore',
      unlocked: stats.totalDistance >= 500,
    },
    {
      id: 6,
      name: 'Lenda Verde',
      icon: 'emoji_events',
      unlocked: stats.totalPoints >= 5000,
    },
  ]
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
