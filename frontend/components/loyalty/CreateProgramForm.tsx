'use client'

import { useState } from 'react'
import { programAPI } from '@/services/loyalty.service'

const PROGRAM_TYPES = [
  { value: 'STAMPS', label: '🎫 Sellos - Compra X, obtén 1 gratis', description: 'Café, comida rápida' },
  { value: 'CASHBACK', label: '💰 Cashback - Recibe % de descuento', description: 'Cualquier comercio' },
  { value: 'AFFINITY', label: '❤️ Afiliación - Regístrate para promociones', description: 'Comunidad' },
  { value: 'DISCOUNT', label: '🏷️ Descuento - Sistema de niveles', description: 'Mayoristas' },
  { value: 'COUPON', label: '🎁 Cupón - Obtén cupón al registrarte', description: 'Uno por vez' },
  { value: 'GIFT', label: '🎀 Regalo - Certificados de regalo', description: 'Regalería' },
  { value: 'MEMBERSHIP', label: '⭐ Membresía - Club VIP', description: 'Acceso especial' },
  { value: 'MULTIPASS', label: '🎟️ Multipase - Paquetes prepagados', description: 'Servicios' }
]

interface CreateProgramFormProps {
  onSuccess?: (program: any) => void
  onError?: (error: string) => void
}

export default function CreateProgramForm({ onSuccess, onError }: CreateProgramFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'STAMPS',
    currencyCode: 'USD',
    pointsName: 'Points',
    pointsPerDollar: 1.0,
    minPointsRedeemable: 100,
    expirationDays: 365,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    accentColor: '#3B82F6'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pointsPerDollar' || name === 'minPointsRedeemable' || name === 'expirationDays'
        ? parseFloat(value)
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const program = await programAPI.create(formData)
      onSuccess?.(program)
      setFormData({
        name: '',
        description: '',
        type: 'STAMPS',
        currencyCode: 'USD',
        pointsName: 'Points',
        pointsPerDollar: 1.0,
        minPointsRedeemable: 100,
        expirationDays: 365,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000',
        accentColor: '#3B82F6'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create program'
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const selectedType = PROGRAM_TYPES.find(t => t.value === formData.type)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crear Nuevo Programa de Lealtad</h2>
        <p className="text-gray-600">Configurar un programa de recompensas para tus clientes</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Programa *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ej: Programa de Café VIP"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Programa *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PROGRAM_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type Description */}
      {selectedType && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-900">
            <strong>Descripción:</strong> {selectedType.description}
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe tu programa de lealtad..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Points Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="pointsName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Puntos
          </label>
          <input
            type="text"
            id="pointsName"
            name="pointsName"
            value={formData.pointsName}
            onChange={handleChange}
            placeholder="ej: Sellos"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="pointsPerDollar" className="block text-sm font-medium text-gray-700 mb-1">
            Puntos por Dólar
          </label>
          <input
            type="number"
            id="pointsPerDollar"
            name="pointsPerDollar"
            value={formData.pointsPerDollar}
            onChange={handleChange}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="minPointsRedeemable" className="block text-sm font-medium text-gray-700 mb-1">
            Mín. Puntos Canjeables
          </label>
          <input
            type="number"
            id="minPointsRedeemable"
            name="minPointsRedeemable"
            value={formData.minPointsRedeemable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
            Color de Fondo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="backgroundColor"
              name="backgroundColor"
              value={formData.backgroundColor}
              onChange={handleChange}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={formData.backgroundColor}
              onChange={handleChange}
              name="backgroundColor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="foregroundColor" className="block text-sm font-medium text-gray-700 mb-1">
            Color de Texto
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="foregroundColor"
              name="foregroundColor"
              value={formData.foregroundColor}
              onChange={handleChange}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={formData.foregroundColor}
              onChange={handleChange}
              name="foregroundColor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-1">
            Color de Acento
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="accentColor"
              name="accentColor"
              value={formData.accentColor}
              onChange={handleChange}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={formData.accentColor}
              onChange={handleChange}
              name="accentColor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-1">
            Moneda
          </label>
          <select
            id="currencyCode"
            name="currencyCode"
            value={formData.currencyCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - Dólar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="MXN">MXN - Peso Mexicano</option>
            <option value="ARS">ARS - Peso Argentino</option>
          </select>
        </div>

        <div>
          <label htmlFor="expirationDays" className="block text-sm font-medium text-gray-700 mb-1">
            Días de Expiración (0 = nunca)
          </label>
          <input
            type="number"
            id="expirationDays"
            name="expirationDays"
            value={formData.expirationDays}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading || !formData.name || !formData.type}
          className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '⏳ Creando...' : '✨ Crear Programa'}
        </button>
      </div>
    </form>
  )
}
