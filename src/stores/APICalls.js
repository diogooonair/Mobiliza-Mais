import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://hnmhmllwqdxqjufbsblg.supabase.co'
//Chave publica feita para usar em apps pois o apk tem possibilidade de descriptacao
const supabaseKey = "sb_publishable_bIBMYC4DOPyTJF3b7P5dyQ_ZnVGkoul"
const supabase = createClient(supabaseUrl, supabaseKey)

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err }
  }
}

export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      return { user: null, error }
    }
    return { user: data.user, error: null }
  } catch (err) {
    return { user: null, error: err }
  }
}


export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }
}

export async function register(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name } // user metadata
    }
  })

  return { data, error }
}

export async function forgotPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)

  return { data, error }
}


export async function getData() {
  try {
    const { user, error: userError } = await getUser()
    if (userError || !user) {
      return { data: null, error: new Error('No logged-in user') }
    }

    const { data, error } = await supabase
      .from('data')
      .select('*')
      .eq('id_user', user.id)
      .order('tempo', { ascending: false })

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}


//Get qnt linhas
export async function getUserTripCount(userId) {
  try {
    const { count, error } = await supabase
      .from('data')
      .select('id', { count: 'exact', head: true }) // only count, no data
      .eq('id_user', userId)

    if (error) throw error
    return { count, error: null }
  } catch (err) {
    return { count: 0, error: err }
  }
}

// Get CO2 e pontos
export async function getUserTotals(userId) {
  try {
    const { data, error } = await supabase
      .from('data')
      .select('pontos, co2') // select columns to sum
      .eq('id_user', userId)

    if (error) throw error

    const totalPoints = data.reduce((sum, row) => sum + (row.pontos || 0), 0)
    const totalCO2 = data.reduce((sum, row) => sum + (row.co2 || 0), 0)

    return { totalPoints, totalCO2, error: null }
  } catch (err) {
    return { totalPoints: 0, totalCO2: 0, error: err }
  }
}
