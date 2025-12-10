'use server'

import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor, preencha todos os campos.' }
  }

  // Check against Environment Variables first
  const adminUser = process.env.ADMIN_USER
  const adminPassword = process.env.ADMIN_PASSWORD

  if (email === adminUser && password === adminPassword) {
    await createSession('admin') // Using 'admin' as fixed userId for env auth
    redirect('/admin/dashboard')
  }

  // Fallback to Supabase Auth if env vars don't match (optional, but good to keep if they migrate)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Credenciais inválidas.' }
  }

  if (data.user) {
    await createSession(data.user.id)
    redirect('/admin/dashboard')
  }
  
  return { error: 'Erro ao realizar login.' }
}

export async function logout() {
  await deleteSession()
  redirect('/admin')
}

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

export async function getWithdrawals() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Fetch withdrawals
  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false })

  if (withdrawalsError) {
    console.error('Error fetching withdrawals:', withdrawalsError)
    return { error: withdrawalsError.message }
  }

  if (!withdrawals || withdrawals.length === 0) {
    return []
  }

  // 2. Fetch Users
  const userIds = Array.from(new Set(withdrawals.map(w => w.user_id)))
    .filter(id => id && id !== 'undefined');

  let usersMap = new Map();
  let affiliateCodes: string[] = [];

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, affiliate_code, email, cpf')
      .in('id', userIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    } else if (users) {
      usersMap = new Map(users.map(u => [u.id, u]))
      affiliateCodes = users
        .map(u => u.affiliate_code)
        .filter(code => code) as string[]
    }
  }

  // 3. Fetch User Details (vendas_amostra)
  // Logic: 
  // - If user has affiliate_code, look up by codigo_gerado.
  // - If user NO affiliate_code, look up by email in vendas_amostra to FIND the code.
  
  let userDetailsMap = new Map();
  let recoveredCodesMap = new Map(); // userId -> recovered affiliateCode

  // A. First, fetch details for known codes
  if (affiliateCodes.length > 0) {
    const { data: details } = await supabase
      .from('vendas_amostra')
      .select('codigo_gerado, nome_completo, number, email, cpf')
      .in('codigo_gerado', affiliateCodes)
    
    if (details) {
      details.forEach(d => userDetailsMap.set(d.codigo_gerado, d))
    }
  }

  // B. For users without code, try to find by email
  const usersWithoutCode = Array.from(usersMap.values()).filter(u => !u.affiliate_code && u.email);
  if (usersWithoutCode.length > 0) {
    const emails = usersWithoutCode.map(u => u.email);
    const { data: recoveredDetails } = await supabase
      .from('vendas_amostra')
      .select('codigo_gerado, nome_completo, number, email, cpf')
      .in('email', emails)
      .not('codigo_gerado', 'is', null)

    if (recoveredDetails) {
      recoveredDetails.forEach(d => {
        // Find which user has this email
        const user = usersWithoutCode.find(u => u.email === d.email);
        if (user) {
          recoveredCodesMap.set(user.id, d.codigo_gerado);
          userDetailsMap.set(d.codigo_gerado, d);
        }
      })
    }
  }

  // 4. Assemble Data
  const result = withdrawals.map(w => {
    const user = usersMap.get(w.user_id)
    let affiliateCode = user?.affiliate_code
    
    // If not in user table, check if we recovered it
    if (!affiliateCode && user) {
      affiliateCode = recoveredCodesMap.get(user.id)
    }

    const userDetail = affiliateCode ? userDetailsMap.get(affiliateCode) : null

    // Construct customer object
    const customer = userDetail ? {
      id: user?.id,
      full_name: userDetail.nome_completo,
      cpf: userDetail.cpf || user?.cpf,
      number: userDetail.number,
      email: userDetail.email || user?.email
    } : (user ? {
       id: user.id,
       full_name: 'Usuário sem cadastro de venda',
       cpf: user.cpf,
       email: user.email
    } : null)

    return {
      ...w,
      affiliate: {
        id: w.user_id,
        code: affiliateCode || 'N/A',
        customer: customer
      }
    }
  })

  return result
}

export async function getWithdrawalById(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Get Withdrawal Details
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching withdrawal by id:', error)
    return { error: error.message }
  }

  if (!withdrawal) return { error: 'Withdrawal not found' }

  const userId = withdrawal.user_id

  // 2. Get User Info
  let user = null
  let affiliateCode = null
  
  if (userId) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, affiliate_code, email, cpf')
      .eq('id', userId)
      .single()
      
    if (!userError && userData) {
       user = userData
       affiliateCode = userData.affiliate_code
    }
  }

  // 2.1. Fallback: If no affiliate code, try to find in vendas_amostra by email
  if (user && !affiliateCode && user.email) {
     const { data: recovered } = await supabase
       .from('vendas_amostra')
       .select('codigo_gerado')
       .eq('email', user.email)
       .not('codigo_gerado', 'is', null)
       .maybeSingle()
       
     if (recovered && recovered.codigo_gerado) {
        affiliateCode = recovered.codigo_gerado
     }
  }

  let customer = null
  let salesCount = 0

  if (affiliateCode) {
    // 3. Get Customer Info from vendas_amostra using codigo_gerado
    const { data: customerData } = await supabase
      .from('vendas_amostra')
      .select('nome_completo, number, email, cpf')
      .eq('codigo_gerado', affiliateCode)
      .maybeSingle()
      
    if (customerData) {
      customer = {
        full_name: customerData.nome_completo,
        number: customerData.number,
        email: customerData.email || user?.email,
        cpf: customerData.cpf || user?.cpf
      }
    } else if (user) {
       // Fallback
       customer = {
          full_name: 'Usuário não encontrado em vendas',
          email: user.email,
          cpf: user.cpf
       }
    }

    // 4. Get Sales Count (vendas_amostra where codigo_usado = affiliateCode)
    const { count } = await supabase
      .from('vendas_amostra')
      .select('*', { count: 'exact', head: true })
      .eq('codigo_usado', affiliateCode)
    
    salesCount = count || 0
  } else if (user) {
      customer = {
        full_name: 'Usuário sem código de afiliado',
        email: user.email,
        cpf: user.cpf
      }
  }

  // 5. Get Total Withdrawals Stats
  // Sum all withdrawals that have the same user_id
  const { data: allWithdrawals, error: withdrawalsError } = await supabase
    .from('withdrawals')
    .select('amount, status')
    .eq('user_id', userId)

  const totalWithdrawalsCount = allWithdrawals?.length || 0
  const totalWithdrawalsAmount = allWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0

  return {
    ...withdrawal,
    affiliate: {
      id: userId,
      code: affiliateCode || 'N/A',
      customer,
      sales_count: salesCount,
      total_withdrawals_count: totalWithdrawalsCount,
      total_withdrawals_amount: totalWithdrawalsAmount
    }
  }
}

export async function updateWithdrawalStatus(id: string, status: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { error } = await supabase
    .from('withdrawals')
    .update({ status: status })
    .eq('id', id)

  if (error) {
    console.error('Error updating withdrawal status:', error)
    return { error: error.message }
  }

  return { success: true }
}
