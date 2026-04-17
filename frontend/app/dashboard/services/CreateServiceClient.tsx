'use client'

import { useState } from 'react'
import { createServiceAction } from './actions'

export default function CreateServiceClient() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_mins: 30,
    base_price: 20000
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setIsSaving(true)
    setMessage(null)
    
    // Convert to numbers
    const duration = parseInt(formData.duration_mins.toString()) || 30
    const price = parseFloat(formData.base_price.toString()) || 0

    const res = await createServiceAction(formData.name, formData.description, duration, price)
    
    if (res.success) {
      setFormData({ name: '', description: '', duration_mins: 30, base_price: 20000 })
      setMessage({ text: '✅ Servicio creado. ¡Ya se puede reservar!', type: 'success' })
    } else {
      setMessage({ text: 'Error: ' + res.error, type: 'error' })
    }
    
    setIsSaving(false)
  }

  return (
    <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>Nuevo Servicio</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Corte/Servicio</label>
            <input name="name" type="text" className="form-input" placeholder="Corte Clásico" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción Corta</label>
            <input name="description" type="text" className="form-input" placeholder="Incluye lavado previo..." value={formData.description} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Duración (minutos)</label>
            <input name="duration_mins" type="number" min="5" step="5" className="form-input" value={formData.duration_mins} onChange={handleChange} required />
            <small style={{ color: 'var(--color-text-muted)' }}>Múltiplos de 5 recomendados.</small>
          </div>
          <div className="form-group">
            <label className="form-label">Precio Base ($)</label>
            <input name="base_price" type="number" min="0" step="100" className="form-input" value={formData.base_price} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSaving || !formData.name.trim()}>
          {isSaving ? 'Creando...' : 'Añadir Servicio a Catálogo'}
        </button>
      </form>
    </div>
  )
}
