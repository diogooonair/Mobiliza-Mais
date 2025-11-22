// src/stores/trips.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tripsService } from 'src/services/tripsService'

export const useTripsStore = defineStore('trips', () => {
  // State
  const trips = ref([])
  const rankings = ref([])
  const globalStats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalTrips = computed(() => trips.value.length)
  const recentTrips = computed(() => trips.value.slice(0, 5))
  const transportBreakdown = computed(() => {
    const breakdown = {}
    trips.value.forEach((trip) => {
      if (!breakdown[trip.transport]) {
        breakdown[trip.transport] = {
          count: 0,
          distance: 0,
          points: 0,
        }
      }
      breakdown[trip.transport].count++
      breakdown[trip.transport].distance += trip.distance
      breakdown[trip.transport].points += trip.points
    })
    return breakdown
  })

  // Actions
  async function loadUserTrips(userId) {
    loading.value = true
    error.value = null

    try {
      const result = await tripsService.getUserTrips(userId)
      if (result.success) {
        trips.value = result.trips
      } else {
        error.value = result.error
      }
      loading.value = false
      return result.success
    } catch (err) {
      error.value = err.message
      loading.value = false
      return false
    }
  }

  async function registerTrip(userId, tripData) {
    loading.value = true
    error.value = null

    try {
      const result = await tripsService.registerTrip(userId, tripData)
      if (result.success) {
        // Adicionar o novo trajeto à lista
        trips.value.unshift(result.trip)
      } else {
        error.value = result.error
      }
      loading.value = false
      return result
    } catch (err) {
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  async function loadRankings(limit = 100) {
    loading.value = true
    error.value = null

    try {
      const result = await tripsService.getRanking(limit)
      if (result.success) {
        rankings.value = result.ranking
      } else {
        error.value = result.error
      }
      loading.value = false
      return result.success
    } catch (err) {
      error.value = err.message
      loading.value = false
      return false
    }
  }

  async function loadGlobalStats() {
    loading.value = true
    error.value = null

    try {
      const result = await tripsService.getGlobalStats()
      if (result.success) {
        globalStats.value = result.stats
      } else {
        error.value = result.error
      }
      loading.value = false
      return result.success
    } catch (err) {
      error.value = err.message
      loading.value = false
      return false
    }
  }

  function getUserRankPosition(userId) {
    const index = rankings.value.findIndex((r) => r.id === userId)
    return index !== -1 ? index + 1 : null
  }

  function clearTrips() {
    trips.value = []
    rankings.value = []
    globalStats.value = null
    error.value = null
  }

  return {
    // State
    trips,
    rankings,
    globalStats,
    loading,
    error,

    // Getters
    totalTrips,
    recentTrips,
    transportBreakdown,

    // Actions
    loadUserTrips,
    registerTrip,
    loadRankings,
    loadGlobalStats,
    getUserRankPosition,
    clearTrips,
  }
})
