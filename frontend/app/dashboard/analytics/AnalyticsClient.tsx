'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { DollarSign, Calendar as CalendarIcon, TrendingUp } from 'lucide-react'

// Note: Recharts doesn't handle full string dates well, so we transform them.
export default function AnalyticsClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()

  // To keep data fresh without complex DB triggers, we use a graceful sliding interval to refetch SSR
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  // --- KPI Calculus ---
  const totalRevenue = useMemo(() => {
    return initialData.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0)
  }, [initialData])

  const totalAppointments = initialData.length

  const avgTicket = totalAppointments > 0 ? (totalRevenue / totalAppointments).toFixed(2) : '0.00'

  // --- Aggregate data for Trend Chart (Revenue grouped by Date) ---
  const dailyData = useMemo(() => {
    const map = new Map<string, number>()
    
    initialData.forEach(app => {
       const dateStr = new Date(app.start_time).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
       const price = Number(app.total_price || 0)
       map.set(dateStr, (map.get(dateStr) || 0) + price)
    })

    // Convert to array of objects
    return Array.from(map.entries()).map(([date, revenue]) => ({
       date,
       revenue
    }))
  }, [initialData])

  return (
    <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Revenue KPI */}
        <div style={{ 
          background: 'var(--color-glass)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-glass-border)',
          display: 'flex', alignItems: 'center', gap: '1.5rem'
         }}>
           <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(46, 204, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
              <DollarSign size={32} color="#2ecc71" />
           </div>
           <div>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.3rem' }}>Ingreso Bruto Total</p>
             <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
               ${totalRevenue.toLocaleString()}
             </h2>
           </div>
        </div>

        {/* Volume KPI */}
        <div style={{ 
          background: 'var(--color-glass)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-glass-border)',
          display: 'flex', alignItems: 'center', gap: '1.5rem'
         }}>
           <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
              <CalendarIcon size={32} color="var(--color-primary)" />
           </div>
           <div>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.3rem' }}>Volumen de Citas</p>
             <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
               {totalAppointments}
             </h2>
           </div>
        </div>

        {/* Average Ticket KPI */}
        <div style={{ 
          background: 'var(--color-glass)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-glass-border)',
          display: 'flex', alignItems: 'center', gap: '1.5rem'
         }}>
           <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
              <TrendingUp size={32} color="#3498db" />
           </div>
           <div>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.3rem' }}>Ticket Promedio</p>
             <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
               ${avgTicket}
             </h2>
           </div>
        </div>

      </div>

      {/* Main Chart Area */}
      <div style={{ background: 'var(--color-glass)', border: '1px solid var(--color-glass-border)', borderRadius: '16px', padding: '2.5rem', minHeight: '400px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
           Tendencia de Ingresos Diarios
        </h3>

        {dailyData.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                   dataKey="date" 
                   stroke="rgba(255,255,255,0.4)" 
                   tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                   tickLine={false}
                   axisLine={false}
                   dy={10}
                />
                <YAxis 
                   stroke="rgba(255,255,255,0.4)" 
                   tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                   tickLine={false}
                   axisLine={false}
                   tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                   contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-glass-border)', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                   itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                />
                <Area 
                   type="monotone" 
                   dataKey="revenue" 
                   name="Ingresos"
                   stroke="var(--color-primary)" 
                   strokeWidth={3}
                   fillOpacity={1} 
                   fill="url(#colorRevenue)" 
                   activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
             No hay datos transaccionales para graficar.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-success)', alignItems: 'center', gap: '0.4rem', opacity: 0.8 }}>
         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }}></div>
         Integración In-Sync Activa
      </div>
    </div>
  )
}
