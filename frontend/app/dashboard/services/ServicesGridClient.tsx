'use client'

import { useState } from 'react'
import { Edit2, Scissors, Clock, DollarSign } from 'lucide-react'
import ServiceDialog from './ServiceDialog'
import DeleteServiceButton from './DeleteServiceButton'

export default function ServicesGridClient({ services }: { services: any[] }) {
  const [editingService, setEditingService] = useState<any | null>(null)

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {services.map((s: any) => (
          <div key={s.id} className="luxury-card" style={{ 
            background: 'var(--color-bg-card)', 
            border: '1px solid var(--color-border)', 
            padding: '2rem', 
            borderRadius: '28px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.5rem',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Icon Background */}
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--color-primary)' }}>
              <Scissors size={80} strokeWidth={1} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                {s.name}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', minHeight: '3em' }}>
                {s.description || 'Sin descripción adicional.'}
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Clock size={16} /> {s.duration_mins} min
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '1.1rem', fontWeight: 800 }}>
                  <DollarSign size={18} /> {s.base_price?.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', position: 'relative', zIndex: 1, borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => setEditingService(s)}
                className="btn btn-ghost" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
              >
                <Edit2 size={16} /> Editar
              </button>
              <DeleteServiceButton serviceId={s.id} serviceName={s.name} />
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <ServiceDialog service={editingService} onClose={() => setEditingService(null)} />
      )}

      <style jsx>{`
        .luxury-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg);
        }
      `}</style>
    </div>
  )
}
