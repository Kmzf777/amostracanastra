'use server'

import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export async function getDashboardData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch all confirmed sales
  const { data: sales, error } = await supabase
    .from('vendas_amostra')
    .select('*')
    .eq('payment_link_status', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching dashboard data:', error)
    return { error: error.message }
  }

  // Adjust for Brazil Time (UTC-3) for "Today" calculation
  const now = new Date()
  const brazilOffset = 3 * 60 * 60 * 1000
  const nowBrazil = new Date(now.getTime() - brazilOffset)
  
  // Start of today in Brazil
  const todayStart = new Date(nowBrazil)
  todayStart.setUTCHours(0, 0, 0, 0)
  
  const sevenDaysAgoStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000) // 7 days inclusive

  const processedSales = sales.map(s => {
    const date = new Date(s.created_at) // UTC
    const brazilDate = new Date(date.getTime() - brazilOffset)
    return {
      ...s,
      customer_name: s.nome_completo || 'N/A', // Map nome_completo directly
      brazilDate
    }
  })

  const todaySales = processedSales.filter(s => s.brazilDate >= todayStart)
  const last7DaysSales = processedSales.filter(s => s.brazilDate >= sevenDaysAgoStart)

  // Chart 1: Today (Hourly)
  const salesTodayByHour = new Array(24).fill(0).map((_, i) => ({ hour: `${i}h`, sales: 0 }))
  todaySales.forEach(s => {
    const hour = s.brazilDate.getUTCHours()
    if (salesTodayByHour[hour]) {
        salesTodayByHour[hour].sales++
    }
  })

  // Chart 2: Last 7 Days (Daily)
  const salesLast7DaysByDay = new Array(7).fill(0).map((_, i) => {
    const d = new Date(sevenDaysAgoStart.getTime() + i * 24 * 60 * 60 * 1000)
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
      sales: 0,
      rawDate: d.toISOString().split('T')[0]
    }
  })

  last7DaysSales.forEach(s => {
    const dateStr = s.brazilDate.toISOString().split('T')[0]
    const dayEntry = salesLast7DaysByDay.find(d => d.rawDate === dateStr)
    if (dayEntry) dayEntry.sales++
  })

  // Chart 3: Total (Monthly Trend)
  const salesByMonth: Record<string, number> = {}
  processedSales.forEach(s => {
    const d = s.brazilDate
    // Sortable key
    const sortKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    
    // We store by sortKey first to sort correctly, then map to display key
    salesByMonth[sortKey] = (salesByMonth[sortKey] || 0) + 1
  })

  const totalChartData = Object.entries(salesByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sortKey, sales]) => {
        const [year, month] = sortKey.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return {
            date: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            sales
        }
    })

  return {
    stats: {
      today: todaySales.length,
      sevenDays: last7DaysSales.length,
      total: sales.length
    },
    charts: {
      today: salesTodayByHour,
      sevenDays: salesLast7DaysByDay,
      total: totalChartData
    },
    sales: processedSales // Return processed sales with customer names
  }
}

export async function getSaleById(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: sale, error } = await supabase
    .from('vendas_amostra')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching sale by id:', error)
    return { error: error.message }
  }

  return sale
}

export async function updateSaleStatus(id: string, status: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { error } = await supabase
    .from('vendas_amostra')
    .update({ order_status: status })
    .eq('id', id)

  if (error) {
    console.error('Error updating sale status:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validUser = process.env.ADMIN_USER
  const validPassword = process.env.ADMIN_PASSWORD

  console.log('Tentativa de login:', { email, validUserPresent: !!validUser })

  // Validação segura no servidor usando variáveis de ambiente
  if (
    validUser && 
    validPassword && 
    email === validUser && 
    password === validPassword
  ) {
    await createSession('admin')
    redirect('/admin/dashboard')
  }

  return {
    error: 'Usuário ou senha inválidos',
  }
}

export async function logout() {
  await deleteSession()
  redirect('/admin')
}