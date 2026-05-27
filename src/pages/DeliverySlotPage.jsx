import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const DeliverySlotPage = () => {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAfterCutoff, setIsAfterCutoff] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadSlots()
    checkCutoffTime()
  }, [])

  const checkCutoffTime = () => {
    const now = new Date()
    const currentHour = now.getHours()
    if (currentHour >= 18) {
      setIsAfterCutoff(true)
    }
  }

  const loadSlots = async () => {
    try {
      const response = await api.get('/slots')
      console.log('Slots API response:', response.data)
      
      if (response.data.success) {
        // Show ALL slots, just indicate availability
        setSlots(response.data.slots)
      } else {
        // Fallback slots
        setSlots([
          { id: 'slot1', name: 'Morning', time: '12:00 PM - 04:00 PM', enabled: true, startHour: 12, endHour: 16, isAvailable: true },
          { id: 'slot2', name: 'Evening', time: '04:00 PM - 08:00 PM', enabled: true, startHour: 16, endHour: 20, isAvailable: true },
          { id: 'slot3', name: 'Night', time: '08:00 PM - 10:00 PM', enabled: true, startHour: 20, endHour: 22, isAvailable: true }
        ])
      }
    } catch (error) {
      console.error('Error loading slots:', error)
      setSlots([
        { id: 'slot1', name: 'Morning', time: '12:00 PM - 04:00 PM', enabled: true, startHour: 12, endHour: 16, isAvailable: true },
        { id: 'slot2', name: 'Evening', time: '04:00 PM - 08:00 PM', enabled: true, startHour: 16, endHour: 20, isAvailable: true },
        { id: 'slot3', name: 'Night', time: '08:00 PM - 10:00 PM', enabled: true, startHour: 20, endHour: 22, isAvailable: true }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getNextDayMessage = () => {
    const now = new Date()
    const currentHour = now.getHours()
    
    if (currentHour >= 18) {
      return {
        title: "📅 Next Day Delivery",
        message: "Orders placed after 6 PM will be delivered tomorrow. We grind flour fresh only after receiving your order.",
        icon: "🌙"
      }
    }
    return null
  }

  const confirmSlot = () => {
    if (!selectedSlot) {
      alert('Please select a delivery slot')
      return
    }
    localStorage.setItem('selectedSlot', selectedSlot.time)
    localStorage.setItem('selectedSlotId', selectedSlot.id)
    
    const now = new Date()
    const currentHour = now.getHours()
    if (currentHour >= 18) {
      localStorage.setItem('isNextDayDelivery', 'true')
    } else {
      localStorage.setItem('isNextDayDelivery', 'false')
    }
    
    navigate('/checkout')
  }

  const nextDayInfo = getNextDayMessage()

  if (loading) {
    return <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
  }

  return (
    <div className="px-4 py-4 pb-32">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/cart')} className="text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Select Delivery Slot</h2>
      </div>

      {/* Next Day Delivery Message */}
      {nextDayInfo && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{nextDayInfo.icon}</span>
            <div>
              <h3 className="font-bold text-blue-800">{nextDayInfo.title}</h3>
              <p className="text-sm text-blue-700">{nextDayInfo.message}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">Choose your preferred delivery time slot</p>
      
      <div className="space-y-3">
        {slots.map(slot => (
          <button
            key={slot.id}
            onClick={() => setSelectedSlot(slot)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedSlot?.id === slot.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{slot.name}</h3>
                <p className="text-gray-600">{slot.time}</p>
                {!slot.isAvailable && slot.isAvailable !== undefined && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ High demand, please select next available slot</p>
                )}
                {nextDayInfo && (
                  <p className="text-xs text-blue-600 mt-1">📅 Delivered tomorrow</p>
                )}
              </div>
              {selectedSlot?.id === slot.id && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={confirmSlot}
        disabled={!selectedSlot}
        className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg mt-6 shadow-lg disabled:opacity-50"
      >
        Confirm Slot →
      </button>
    </div>
  )
}

export default DeliverySlotPage
