'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Scissors, Clock, DollarSign, Save } from 'lucide-react'
import { createServiceAction, updateServiceAction } from './actions'

interface ServiceDialogProps {
  service?: any // If provided, we are editing
  onClose?: () => void
}

export default function ServiceDialog({ service, onClose }: ServiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration_mins: service?.duration_mins || 30,
    base_price: service?.base_price || 20000
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync formData if service prop changes (for editing)
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_mins: service.duration_mins,
        base_price: service.base_price
      })
      setIsOpen(true)
    }
  }, [service])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    setIsSaving(true)
    setError(null)

    const duration = parseInt(formData.duration_mins.toString())
    const price = parseFloat(formData.base_price.toString())

    try {
      let res
      if (service) {
        res = await updateServiceAction(service.id, { ...formData, duration_mins: duration, base_price: price })
      } else {
        res = await createServiceAction(formData.name, formData.description, duration, price)
      }

      if (res.success) {
        if (!service) {
          setFormData({ name: '', description: '', duration_mins: 30, base_price: 20000 })
        }
        setIsOpen(false)
        if (onClose) onClose()
      } else {
        setError(res.error || 'Ocurrió un error')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (onClose && isOpen) onClose()
  }

  return (
    <>
      {!service && (
        <button onClick={toggleOpen} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderRadius: '14px', padding: '0.8rem 1.75rem' }}>
          <Plus size={20} /> Nuevo Servicio
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="auth-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative' }}>
            <button onClick={toggleOpen} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              {service ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Define los detalles del servicio que ofrecerás a tus clientes.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Servicio</label>
                <div style={{ position: 'relative' }}>
                  <Scissors size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input name="name" type="text" className="form-input" style={{ paddingLeft: '3rem' }} placeholder="Corte Clásico" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea name="description" className="form-input" style={{ minHeight: '80px', resize: 'none' }} placeholder="Opcional: Detalles del servicio..." value={formData.description} onChange={handleChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duración (min)</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input name="duration_mins" type="number" className="form-input" style={{ paddingLeft: '2.75rem' }} value={formData.duration_mins} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Precio ($)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input name="base_price" type="number" className="form-input" style={{ paddingLeft: '2.75rem' }} value={formData.base_price} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={toggleOpen} className="btn btn-ghost" style={{ flex: 1, borderRadius: '12px' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: '12px' }} disabled={isSaving || !formData.name.trim()}>
                  {isSaving ? 'Guardando...' : (service ? 'Actualizar Servicio' : 'Crear Servicio')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
