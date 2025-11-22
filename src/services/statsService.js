// src/services/statsService.js
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

export const statsService = {
  // Calcular estatísticas de um utilizador
  async calculateUserStats(userId) {
    try {
      const tripsQuery = query(collection(db, 'trips'), where('userId', '==', userId))

      const querySnapshot = await getDocs(tripsQuery)
      const trips = []

      querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() })
      })

      // Estatísticas básicas
      const stats = {
        totalTrips: trips.length,
        totalDistance: 0,
        totalPoints: 0,
        totalCO2Saved: 0,
        totalCalories: 0,
        totalMoneySaved: 0,
        transportTypes: {},
        recentTrips: [],
        achievements: [],
      }

      // Processar cada trajeto
      trips.forEach((trip) => {
        stats.totalDistance += trip.distance || 0
        stats.totalPoints += trip.points || 0
        stats.totalCO2Saved += trip.co2Saved || 0

        // Calcular calorias (aproximação: 50 cal/km para bike/walk)
        if (trip.transport === 'bicycle' || trip.transport === 'walk') {
          stats.totalCalories += (trip.distance || 0) * 50
        }

        // Calcular dinheiro poupado (0.15€/km vs carro)
        if (trip.transport !== 'car') {
          stats.totalMoneySaved += (trip.distance || 0) * 0.15
        }

        // Agrupar por tipo de transporte
        if (!stats.transportTypes[trip.transport]) {
          stats.transportTypes[trip.transport] = {
            count: 0,
            distance: 0,
            points: 0,
            co2Saved: 0,
          }
        }
        stats.transportTypes[trip.transport].count++
        stats.transportTypes[trip.transport].distance += trip.distance || 0
        stats.transportTypes[trip.transport].points += trip.points || 0
        stats.transportTypes[trip.transport].co2Saved += trip.co2Saved || 0
      })

      // Trajetos recentes (últimos 5)
      stats.recentTrips = trips.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

      // Calcular conquistas
      stats.achievements = this.calculateAchievements(stats)

      return { success: true, stats }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      return { success: false, error: error.message }
    }
  },

  // Calcular estatísticas globais
  async calculateGlobalStats() {
    try {
      const tripsSnapshot = await getDocs(collection(db, 'trips'))
      const usersSnapshot = await getDocs(collection(db, 'users'))

      const stats = {
        totalUsers: usersSnapshot.size,
        totalTrips: tripsSnapshot.size,
        totalDistance: 0,
        totalCO2Saved: 0,
        totalPoints: 0,
        transportBreakdown: {},
      }

      tripsSnapshot.forEach((doc) => {
        const trip = doc.data()
        stats.totalDistance += trip.distance || 0
        stats.totalCO2Saved += trip.co2Saved || 0
        stats.totalPoints += trip.points || 0

        // Breakdown por transporte
        if (!stats.transportBreakdown[trip.transport]) {
          stats.transportBreakdown[trip.transport] = 0
        }
        stats.transportBreakdown[trip.transport]++
      })

      return { success: true, stats }
    } catch (error) {
      console.error('Erro ao calcular estatísticas globais:', error)
      return { success: false, error: error.message }
    }
  },

  // Calcular conquistas desbloqueadas
  calculateAchievements(stats) {
    const achievements = [
      {
        id: 'first_trip',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro trajeto',
        icon: 'stars',
        unlocked: stats.totalTrips >= 1,
        progress: Math.min(stats.totalTrips, 1),
      },
      {
        id: 'explorer',
        name: 'Explorador',
        description: 'Complete 10 trajetos',
        icon: 'explore',
        unlocked: stats.totalTrips >= 10,
        progress: Math.min(stats.totalTrips / 10, 1),
      },
      {
        id: 'marathoner',
        name: 'Maratonista',
        description: 'Percorra 100 km',
        icon: 'directions_bike',
        unlocked: stats.totalDistance >= 100,
        progress: Math.min(stats.totalDistance / 100, 1),
      },
      {
        id: 'eco_warrior',
        name: 'Eco Guerreiro',
        description: 'Economize 1kg de CO₂',
        icon: 'eco',
        unlocked: stats.totalCO2Saved >= 1000,
        progress: Math.min(stats.totalCO2Saved / 1000, 1),
      },
      {
        id: 'dedicated',
        name: 'Dedicado',
        description: 'Complete 50 trajetos',
        icon: 'favorite',
        unlocked: stats.totalTrips >= 50,
        progress: Math.min(stats.totalTrips / 50, 1),
      },
      {
        id: 'legend',
        name: 'Lenda Verde',
        description: 'Alcance 5000 pontos',
        icon: 'emoji_events',
        unlocked: stats.totalPoints >= 5000,
        progress: Math.min(stats.totalPoints / 5000, 1),
      },
    ]

    return achievements
  },

  // Comparações de impacto ambiental
  calculateEnvironmentalImpact(co2SavedGrams) {
    return {
      trees: Math.round(co2SavedGrams / 21000) || 1, // 1 árvore absorve ~21kg/ano
      lightbulbs: Math.round((co2SavedGrams / 1000) * 200), // 1kg CO2 = ~200h LED
      homes: Math.round(co2SavedGrams / 30000) || 1, // Casa média ~30kg/dia
      cars: Math.round(co2SavedGrams / 4600), // Carro médio emite ~4.6kg/dia
    }
  },

  // Calcular nível do utilizador
  calculateLevel(totalPoints) {
    return Math.floor(totalPoints / 1000) + 1
  },

  // Pontos para o próximo nível
  pointsToNextLevel(totalPoints) {
    const currentLevelPoints = totalPoints % 1000
    return 1000 - currentLevelPoints
  },

  // Progresso do nível atual
  levelProgress(totalPoints) {
    const currentLevelPoints = totalPoints % 1000
    return currentLevelPoints / 1000
  },
}
