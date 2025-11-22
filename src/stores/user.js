// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from 'src/services/authService'
import { statsService } from 'src/services/statsService'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const userData = ref(null)
  const userStats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!currentUser.value)
  const userName = computed(() => userData.value?.name || '')
  const userEmail = computed(() => userData.value?.email || '')
  const totalPoints = computed(() => userData.value?.totalPoints || 0)
  const userLevel = computed(() => statsService.calculateLevel(totalPoints.value))
  const levelProgress = computed(() => statsService.levelProgress(totalPoints.value))
  const pointsToNext = computed(() => statsService.pointsToNextLevel(totalPoints.value))

  // Actions
  async function loadUser(uid) {
    loading.value = true
    error.value = null

    try {
      // Carregar dados do utilizador
      const result = await authService.getUserData(uid)
      if (result.success) {
        userData.value = result.data
      }

      // Carregar estatísticas
      const statsResult = await statsService.calculateUserStats(uid)
      if (statsResult.success) {
        userStats.value = statsResult.stats
      }

      loading.value = false
      return true
    } catch (err) {
      error.value = err.message
      loading.value = false
      return false
    }
  }

  function setCurrentUser(user) {
    currentUser.value = user
    if (user) {
      loadUser(user.uid)
    } else {
      userData.value = null
      userStats.value = null
    }
  }

  async function refreshStats() {
    if (!currentUser.value) return

    const statsResult = await statsService.calculateUserStats(currentUser.value.uid)
    if (statsResult.success) {
      userStats.value = statsResult.stats
    }
  }

  async function refreshUserData() {
    if (!currentUser.value) return

    const result = await authService.getUserData(currentUser.value.uid)
    if (result.success) {
      userData.value = result.data
    }
  }

  function clearUser() {
    currentUser.value = null
    userData.value = null
    userStats.value = null
    error.value = null
  }

  return {
    // State
    currentUser,
    userData,
    userStats,
    loading,
    error,

    // Getters
    isAuthenticated,
    userName,
    userEmail,
    totalPoints,
    userLevel,
    levelProgress,
    pointsToNext,

    // Actions
    loadUser,
    setCurrentUser,
    refreshStats,
    refreshUserData,
    clearUser,
  }
})
