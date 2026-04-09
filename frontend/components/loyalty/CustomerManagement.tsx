'use client'

import { useState } from 'react'
import { customerAPI } from '@/services/loyalty.service'

interface CustomerManagementProps {
  programId: string
}

export default function CustomerManagement({ programId }: CustomerManagementProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'bulk'>('list')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    country: 'US'
  })
  const [bulkText, setBulkText] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Email es requerido' })
      return
    }

    setLoading(true)
    try {
      const customer = await customerAPI.create(formData)
      setMessage({ type: 'success', text: `✓ Cliente "${formData.email}" creado exitosamente` })

      // Enroll in program
      await customerAPI.enrollInProgram(customer.id, programId)

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        country: 'US'
      })

      setTimeout(() => {
        setMode('list')
        setMessage(null)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear cliente'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkText.trim()) {
      setMessage({ type: 'error', text: 'Ingresa datos para importar' })
      return
    }

    setLoading(true)
    try {
      const lines = bulkText.trim().split('\n')
      const customers = lines.map(line => {
        const [email, firstName, lastName, phone] = line.split(',').map(s => s.trim())
        return { email, firstName, lastName, phone, country: 'US' }
      })

      const result = await customerAPI.bulkImport(customers)
      setMessage({
        type: 'success',
        text: `✓ ${result.imported} clientes importados, ${result.failed} errores`
      })

      setBulkText('')

      setTimeout(() => {
        setMode('list')
        setMessage(null)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al importar'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Clientes</h2>

      {/* Mode Selection */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setMode('list')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            mode === 'list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Mis Clientes
        </button>
        <button
          onClick={() => setMode('create')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            mode === 'create'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ➕ Nuevo Cliente
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            mode === 'bulk'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Importar Masivo
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Client Form */}
      {mode === 'create' && (
        <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@ejemplo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Madrid"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US">Estados Unidos</option>
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="CO">Colombia</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? '⏳ Creando...' : '✨ Crear Cliente'}
          </button>
        </form>
      )}

      {/* Bulk Import */}
      {mode === 'bulk' && (
        <form onSubmit={handleBulkImport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato: email, nombre, apellido, teléfono (una línea por cliente)
            </label>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="juan@ejemplo.com, Juan, Pérez, +123456&#10;maria@ejemplo.com, María, García, +654321"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? '⏳ Importando...' : '📤 Importar Clientes'}
          </button>
        </form>
      )}

      {/* List View */}
      {mode === 'list' && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Carga de clientes desde la lista del programa</p>
          <button
            onClick={() => setMode('create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            ➕ Agregar Cliente
          </button>
        </div>
      )}
    </div>
  )
}
