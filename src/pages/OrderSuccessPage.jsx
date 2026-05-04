import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const OrderSuccessPage = () => {
  const [order, setOrder] = useState(null)
  const navigate = useNavigate()
  const orderId = localStorage.getItem('lastOrderId')

  useEffect(() => {
    // Get the order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const foundOrder = orders.find(o => o.orderId === orderId)
    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      // Fallback
      setOrder({ orderId, orderTotal: 0, orderStatus: 'Confirmed' })
    }
  }, [orderId])

  if (!order) return <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>

  return (
    <div className="px-4 py-4 pb-32 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
      </div>
      <h2 className="text-2xl font-bold text-green-600 mt-4">Order Placed Successfully!</h2>
      <p className="text-gray-500 mt-2">Order #{order.orderId}</p>

      <div className="bg-white rounded-xl p-4 my-6 text-left">
        <h3 className="font-bold mb-2">Order Summary</h3>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Status</span>
          <span className="text-green-600 font-bold">{order.orderStatus}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-primary font-bold">₹{order.orderTotal}</span>
        </div>
      </div>

      <button 
        onClick={() => navigate(`/track-order/${order.orderId}`)} 
        className="w-full bg-primary text-white py-3 rounded-full font-bold mb-3"
      >
        Track Order
      </button>
      <button onClick={() => navigate('/orders')} className="w-full border border-primary text-primary py-3 rounded-full font-bold">
        View All Orders
      </button>
    </div>
  )
}

export default OrderSuccessPage
