// src/services/tripsService.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  increment,
} from 'firebase/firestore'
import { db } from 'boot/firebase'

// Pontos por tipo de transporte (por km)
const TRANSPORT_POINTS = {
  bicycle: 10,
  walk: 8,
  publicTransport: 6,
  carpool: 4,
  electricCar: 3,
  car: 0,
}

// CO2 economizado por tipo (gramas por km) comparado com carro convencional
const CO2_SAVINGS = {
  bicycle: 120,
  walk: 120,
  publicTransport: 80,
  carpool: 60,
  electricCar: 40,
  car: 0,
}

export const tripsService = {
  // Registar novo trajeto
  async registerTrip(userId, tripData) {
    try {
      const { transport, distance, startLocation, endLocation } = tripData

      // Calcular pontos
      const points = Math.round(distance * (TRANSPORT_POINTS[transport] || 0))

      // Calcular CO2 economizado (em gramas)
      const co2Saved = Math.round(distance * (CO2_SAVINGS[transport] || 0))

      // Criar o trajeto
      const trip = {
        userId: userId,
        transport: transport,
        distance: distance,
        startLocation: startLocation || '',
        endLocation: endLocation || '',
        points: points,
        co2Saved: co2Saved,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      // Adicionar à coleção de trajetos
      const docRef = await addDoc(collection(db, 'trips'), trip)

      // Atualizar pontos totais do utilizador
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        totalPoints: increment(points),
      })

      return { success: true, trip: { ...trip, id: docRef.id }, points }
    } catch (error) {
      console.error('Erro ao registar trajeto:', error)
      return { success: false, error: error.message }
    }
  },

  // Obter trajetos do utilizador
  async getUserTrips(userId) {
    try {
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
      )

      const querySnapshot = await getDocs(q)
      const trips = []

      querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, trips }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter estatísticas do utilizador
  async getUserStats(userId) {
    try {
      const tripsResult = await this.getUserTrips(userId)

      if (!tripsResult.success) {
        return { success: false, error: tripsResult.error }
      }

      const trips = tripsResult.trips

      const stats = {
        totalTrips: trips.length,
        totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
        totalPoints: trips.reduce((sum, trip) => sum + trip.points, 0),
        totalCO2Saved: trips.reduce((sum, trip) => sum + trip.co2Saved, 0),
        transportBreakdown: {},
      }

      // Contar por tipo de transporte
      trips.forEach((trip) => {
        if (!stats.transportBreakdown[trip.transport]) {
          stats.transportBreakdown[trip.transport] = {
            count: 0,
            distance: 0,
            points: 0,
          }
        }
        stats.transportBreakdown[trip.transport].count++
        stats.transportBreakdown[trip.transport].distance += trip.distance
        stats.transportBreakdown[trip.transport].points += trip.points
      })

      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter estatísticas globais
  async getGlobalStats() {
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'))
      const trips = []

      querySnapshot.forEach((doc) => {
        trips.push(doc.data())
      })

      const stats = {
        totalUsers: new Set(trips.map((t) => t.userId)).size,
        totalTrips: trips.length,
        totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
        totalCO2Saved: trips.reduce((sum, trip) => sum + trip.co2Saved, 0),
      }

      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter ranking de utilizadores
  async getRanking(limit = 100) {
    try {
      const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'))

      const querySnapshot = await getDocs(q)
      const ranking = []
      let position = 1

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ranking.push({
          position: position++,
          id: doc.id,
          name: data.name,
          totalPoints: data.totalPoints || 0,
          level: data.level || 1,
        })
      })

      return { success: true, ranking: ranking.slice(0, limit) }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter posição do utilizador no ranking
  async getUserRanking(userId) {
    try {
      const rankingResult = await this.getRanking(1000)

      if (!rankingResult.success) {
        return { success: false, error: rankingResult.error }
      }

      const userPosition = rankingResult.ranking.findIndex((u) => u.id === userId)

      if (userPosition === -1) {
        return { success: true, position: null }
      }

      return {
        success: true,
        position: userPosition + 1,
        totalUsers: rankingResult.ranking.length,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Informações sobre tipos de transporte
  getTransportInfo() {
    return {
      bicycle: {
        label: 'Bicicleta',
        icon: 'directions_bike',
        color: 'green',
        points: TRANSPORT_POINTS.bicycle,
        description: 'Melhor opção para o ambiente!',
      },
      walk: {
        label: 'A pé',
        icon: 'directions_walk',
        color: 'light-green',
        points: TRANSPORT_POINTS.walk,
        description: 'Saudável e sustentável',
      },
      publicTransport: {
        label: 'Transporte Público',
        icon: 'directions_bus',
        color: 'blue',
        points: TRANSPORT_POINTS.publicTransport,
        description: 'Ótima escolha coletiva',
      },
      carpool: {
        label: 'Boleia Partilhada',
        icon: 'people',
        color: 'orange',
        points: TRANSPORT_POINTS.carpool,
        description: 'Partilhar é cuidar',
      },
      electricCar: {
        label: 'Carro Elétrico',
        icon: 'electric_car',
        color: 'teal',
        points: TRANSPORT_POINTS.electricCar,
        description: 'Melhor que combustão',
      },
      car: {
        label: 'Carro Convencional',
        icon: 'directions_car',
        color: 'red',
        points: TRANSPORT_POINTS.car,
        description: 'Tenta uma opção mais verde!',
      },
    }
  },
}
