import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DeliverySlotPage = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const navigate = useNavigate()

  const getDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const timeSlots = [
    { id: 1, name: 'Morning', time: '08:00 AM - 10:00 AM' },
    { id: 2, name: 'Late Morning', time: '10:00 AM - 12:00 PM' },
    { id: 3, name: 'Afternoon', time: '12:00 PM - 02:00 PM' },
    { id: 4, name: 'Evening', time: '04:00 PM - 06:00 PM' },
    { id: 5, name: 'Night', time: '06:00 PM - 08:00 PM' },
  ]

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dates = getDates()

  const confirmSlot = () => {
    if (!selectedDate || !selectedSlot) {
      alert('Please select both date and time slot')
      return
    }
    const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const slotDisplay = `${formattedDate}, ${selectedSlot.time}`
    localStorage.setItem('selectedSlot', slotDisplay)
    navigate('/payment')
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h2 className="text-lg font-bold mb-4">Select Delivery Slot</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Date</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-20 py-3 rounded-xl text-center ${
                selectedDate?.getTime() === date.getTime()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-xs">{idx === 0 ? 'Today' : days[date.getDay()]}</div>
              <div className="text-xl font-bold">{date.getDate()}</div>
              <div className="text-xs">{date.toLocaleString('default', { month: 'short' })}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Time Slot</h3>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`p-4 rounded-xl text-left border-2 transition-all ${
                selectedSlot?.id === slot.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">{slot.name}</div>
              <div className="text-sm text-gray-500">{slot.time}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={confirmSlot} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg">
        Confirm Slot →
      </button>
    </div>
  )
}

export default DeliverySlotPage
