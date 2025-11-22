<template>
  <q-card class="stat-card" :class="cardClass" @click="handleClick" :clickable="clickable">
    <q-card-section class="text-center">
      <q-icon :name="icon" :size="iconSize" :color="iconColor" class="q-mb-sm" />

      <div class="stat-value" :style="{ fontSize: valueSize }">
        {{ formattedValue }}
      </div>

      <div class="stat-label text-caption" :class="labelClass">
        {{ label }}
      </div>

      <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">
        {{ subtitle }}
      </div>

      <!-- Progress bar (opcional) -->
      <q-linear-progress
        v-if="showProgress"
        :value="progress"
        :color="progressColor"
        class="q-mt-sm"
        rounded
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Valor principal
  value: {
    type: [Number, String],
    required: true,
  },

  // Label/descrição
  label: {
    type: String,
    required: true,
  },

  // Subtítulo (opcional)
  subtitle: {
    type: String,
    default: '',
  },

  // Ícone
  icon: {
    type: String,
    default: 'analytics',
  },

  // Cor do ícone
  iconColor: {
    type: String,
    default: 'primary',
  },

  // Cor de fundo do card
  bgColor: {
    type: String,
    default: '',
  },

  // Tamanho do ícone
  iconSize: {
    type: String,
    default: '40px',
  },

  // Tamanho do valor
  valueSize: {
    type: String,
    default: '1.5rem',
  },

  // Formato do valor
  format: {
    type: String,
    default: 'number', // 'number', 'currency', 'percentage', 'none'
    validator: (value) => ['number', 'currency', 'percentage', 'none'].includes(value),
  },

  // Progress bar
  showProgress: {
    type: Boolean,
    default: false,
  },

  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 1,
  },

  progressColor: {
    type: String,
    default: 'primary',
  },

  // Clickable
  clickable: {
    type: Boolean,
    default: false,
  },

  // Classes adicionais
  customClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  switch (props.format) {
    case 'currency':
      return `${props.value.toFixed(2)}€`
    case 'percentage':
      return `${(props.value * 100).toFixed(0)}%`
    case 'number':
      return props.value.toLocaleString('pt-PT')
    default:
      return props.value
  }
})

const cardClass = computed(() => {
  const classes = ['q-pa-sm']
  if (props.bgColor) classes.push(`bg-${props.bgColor}`)
  if (props.customClass) classes.push(props.customClass)
  return classes.join(' ')
})

const labelClass = computed(() => {
  return props.bgColor ? 'text-white' : 'text-grey-7'
})

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  cursor: default;
}

.stat-card[clickable] {
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
