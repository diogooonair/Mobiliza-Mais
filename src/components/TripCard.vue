<template>
  <q-card class="trip-card" :class="{ 'q-mb-md': !dense }">
    <q-card-section horizontal>
      <q-card-section class="col-auto flex flex-center">
        <q-avatar size="56px" :color="transportColor" text-color="white">
          <q-icon :name="transportIcon" size="32px" />
        </q-avatar>
      </q-card-section>

      <q-card-section class="col">
        <div class="text-subtitle1 text-weight-medium">
          {{ transportLabel }}
        </div>
        <div class="text-caption text-grey-7">
          <q-icon name="straighten" size="xs" />
          {{ trip.distance.toFixed(1) }} km
          <span class="q-mx-xs">•</span>
          <q-icon name="schedule" size="xs" />
          {{ formattedDate }}
        </div>

        <div v-if="trip.startLocation || trip.endLocation" class="q-mt-xs">
          <div v-if="trip.startLocation" class="text-caption text-grey-6">
            <q-icon name="trip_origin" size="xs" />
            {{ trip.startLocation }}
          </div>
          <div v-if="trip.endLocation" class="text-caption text-grey-6">
            <q-icon name="place" size="xs" />
            {{ trip.endLocation }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="col-auto flex flex-center">
        <div class="text-center">
          <q-chip :color="pointsColor" text-color="white" size="md">
            <q-icon name="add" size="xs" left />
            {{ trip.points }}
          </q-chip>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ formatCO2(trip.co2Saved) }}
          </div>
        </div>
      </q-card-section>
    </q-card-section>

    <!-- Expandable Details (opcional) -->
    <q-separator v-if="expandable" />

    <q-card-actions v-if="expandable">
      <q-btn
        flat
        dense
        :label="expanded ? 'Menos detalhes' : 'Mais detalhes'"
        :icon="expanded ? 'expand_less' : 'expand_more'"
        @click="expanded = !expanded"
        color="primary"
        size="sm"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">CO₂ Economizado</div>
              <div class="text-subtitle1">{{ formatCO2(trip.co2Saved) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Pontos Ganhos</div>
              <div class="text-subtitle1 text-green">+{{ trip.points }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-6">Data e Hora</div>
              <div class="text-body2">{{ fullDateTime }}</div>
            </div>
          </div>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { tripsService } from 'src/services/tripsService'

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
  dense: {
    type: Boolean,
    default: false,
  },
  expandable: {
    type: Boolean,
    default: false,
  },
})

const expanded = ref(false)

const transportInfo = computed(() => {
  const info = tripsService.getTransportInfo()
  return info[props.trip.transport] || info.car
})

const transportLabel = computed(() => transportInfo.value.label)
const transportIcon = computed(() => transportInfo.value.icon)
const transportColor = computed(() => transportInfo.value.color)

const pointsColor = computed(() => {
  if (props.trip.points >= 50) return 'green'
  if (props.trip.points >= 30) return 'light-green'
  if (props.trip.points >= 10) return 'orange'
  return 'grey'
})

const formattedDate = computed(() => {
  const date = new Date(props.trip.date)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`

  return date.toLocaleDateString('pt-PT')
})

const fullDateTime = computed(() => {
  const date = new Date(props.trip.date)
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function formatCO2(grams) {
  if (grams < 1000) return `${grams}g CO₂`
  return `${(grams / 1000).toFixed(1)}kg CO₂`
}
</script>

<style scoped>
.trip-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
