'use client'

import { useState } from 'react'
import { createStaffAction } from './actions'

export default function CreateStaffClient() {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    
    const res = await createStaffAction(name)
    if (res.success) {
      setName('')
    } else {
      alert('Error: ' + res.error)
    }
    
    setIsSaving(false)
  }

  return (
    <div className="auth-card" style={{ maxWidth: '100%', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <label className="form-label">Añadir Nuevo Profesional</label>
        <input 
          type="text" className="form-input" 
          placeholder="Nombre del Barbero" 
          value={name} onChange={e => setName(e.target.value)} 
        />
      </div>
      <button onClick={handleAdd} className="btn btn-primary" disabled={isSaving || !name.trim()}>
        {isSaving ? 'Añadiendo...' : 'Añadir ➕'}
      </button>
    </div>
  )
}
