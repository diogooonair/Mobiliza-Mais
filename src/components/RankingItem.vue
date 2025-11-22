<template>
  <q-item class="ranking-item" :class="itemClass">
    <!-- Posição/Medal -->
    <q-item-section avatar>
      <q-avatar :size="avatarSize" :color="medalColor" text-color="white">
        <q-icon v-if="showMedal" :name="medalIcon" :size="medalIconSize" />
        <span v-else :class="positionClass">
          {{ user.position }}
        </span>
      </q-avatar>
    </q-item-section>

    <!-- Informação do Utilizador -->
    <q-item-section>
      <q-item-label :class="nameClass">
        {{ user.name }}
        <q-icon v-if="isCurrentUser" name="person" color="primary" size="sm" class="q-ml-xs" />
      </q-item-label>

      <q-item-label caption>
        <q-badge :color="levelBadgeColor" text-color="white">
          <q-icon name="stars" size="xs" left />
          Nível {{ user.level || 1 }}
        </q-badge>

        <span v-if="showStats" class="q-ml-sm text-grey-6">
          {{ user.totalTrips || 0 }} trajetos
        </span>
      </q-item-label>
    </q-item-section>

    <!-- Pontos -->
    <q-item-section side>
      <div class="text-right">
        <div :class="pointsClass">
          {{ formattedPoints }}
        </div>
        <div class="text-caption text-grey-6">pontos</div>
      </div>
    </q-item-section>

    <!-- Ações (opcional) -->
    <q-item-section v-if="showActions" side>
      <q-btn flat round dense icon="more_vert" @click.stop="$emit('action', user)">
        <q-menu>
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="$emit('view-profile', user)">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Ver Perfil</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$emit('compare', user)">
              <q-item-section avatar>
                <q-icon name="compare_arrows" />
              </q-item-section>
              <q-item-section>Comparar</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value.position !== undefined && value.name !== undefined && value.totalPoints !== undefined
      )
    },
  },

  currentUserId: {
    type: String,
    default: null,
  },

  showMedals: {
    type: Boolean,
    default: true,
  },

  showStats: {
    type: Boolean,
    default: false,
  },

  showActions: {
    type: Boolean,
    default: false,
  },

  compact: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['action', 'view-profile', 'compare'])

// Computed
const isCurrentUser = computed(() => {
  return props.currentUserId && props.user.id === props.currentUserId
})

const isTopThree = computed(() => props.user.position <= 3)

const showMedal = computed(() => {
  return props.showMedals && isTopThree.value
})

const medalColor = computed(() => {
  if (!isTopThree.value) return 'grey-4'

  switch (props.user.position) {
    case 1:
      return 'yellow-7'
    case 2:
      return 'grey-5'
    case 3:
      return 'deep-orange-5'
    default:
      return 'grey-4'
  }
})

const medalIcon = computed(() => {
  return 'emoji_events'
})

const medalIconSize = computed(() => {
  return props.compact ? '24px' : '32px'
})

const avatarSize = computed(() => {
  if (props.compact) return '40px'
  return isTopThree.value ? '56px' : '48px'
})

const itemClass = computed(() => {
  const classes = []

  if (isTopThree.value) {
    classes.push('top-three')
    if (props.user.position === 1) classes.push('bg-yellow-1')
    else if (props.user.position === 2) classes.push('bg-grey-2')
    else if (props.user.position === 3) classes.push('bg-deep-orange-1')
  }

  if (isCurrentUser.value) {
    classes.push('current-user bg-blue-1')
  }

  return classes.join(' ')
})

const nameClass = computed(() => {
  const classes = []

  if (isTopThree.value) {
    classes.push('text-weight-bold')
    if (!props.compact) classes.push('text-h6')
  }

  return classes.join(' ')
})

const positionClass = computed(() => {
  return isTopThree.value ? 'text-h6 text-weight-bold' : 'text-body1'
})

const pointsClass = computed(() => {
  const classes = ['text-weight-medium']

  if (isTopThree.value) {
    classes.push('text-h6')
  } else {
    classes.push('text-subtitle1')
  }

  return classes.join(' ')
})

const formattedPoints = computed(() => {
  return props.user.totalPoints.toLocaleString('pt-PT')
})

const levelBadgeColor = computed(() => {
  const level = props.user.level || 1

  if (level >= 10) return 'purple'
  if (level >= 5) return 'deep-orange'
  if (level >= 3) return 'orange'
  return 'blue'
})
</script>

<style scoped>
.ranking-item {
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.ranking-item.top-three {
  padding: 1rem;
}

.ranking-item.current-user {
  border-left: 4px solid var(--q-primary);
}
</style>
