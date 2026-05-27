import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const OrderTrackerPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const navigate = useNavigate()
  // FIXED: Use authToken instead of sessionId
  const authToken = localStorage.getItem('authToken')

  const loadOrder = useCallback(async () => {
    if (!authToken) {
      navigate('/login')
      return
    }
    
    try {
      const response = await api.getOrders()
      if (response.success) {
        const foundOrder = response.orders.find(o => o.order_id === orderId)
        if (foundOrder) {
          setOrder(foundOrder)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      }
    } catch (error) {
      console.error('Error loading order:', error)
    }
    setLoading(false)
  }, [orderId, authToken, navigate])

  useEffect(() => {
    if (!authToken) {
      navigate('/login')
      return
    }
    loadOrder()
    const interval = setInterval(loadOrder, 5000)
    return () => clearInterval(interval)
  }, [loadOrder, authToken, navigate])

  const cancelOrder = async () => {
    if (!order) return
    
    const canCancel = confirm('Are you sure you want to cancel this order?')
    if (!canCancel) return
    
    setCancelling(true)
    try {
      const response = await api.cancelOrder(orderId)
      if (response.success) {
        alert('Order cancelled successfully')
        loadOrder() // Refresh order status
      } else {
        alert(response.error || 'Cannot cancel this order')
      }
    } catch (error) {
      alert('Error cancelling order: ' + error.message)
    } finally {
      setCancelling(false)
    }
  }

  const canCancelOrder = () => {
    if (!order) return false
    const status = order.order_status
    return (status === 'Confirmed' || status === 'Processing') && !cancelling
  }

  const steps = [
    { name: 'Order Confirmed', icon: 'check_circle', status: 'Confirmed', step: 1 },
    { name: 'Processing', icon: 'settings', status: 'Processing', step: 2 },
    { name: 'Out for Delivery', icon: 'local_shipping', status: 'Out for Delivery', step: 3 },
    { name: 'Delivered', icon: 'check_circle', status: 'Delivered', step: 4 },
  ]

  const getCurrentStep = () => {
    const currentStatus = order?.order_status || 'Confirmed'
    const step = steps.find(s => s.status === currentStatus)
    return step ? step.step : 1
  }

  const getStatusColor = () => {
    const status = order?.order_status || 'Confirmed'
    switch(status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-600'
      case 'Processing': return 'bg-yellow-100 text-yellow-600'
      case 'Out for Delivery': return 'bg-purple-100 text-purple-600'
      case 'Delivered': return 'bg-green-100 text-green-600'
      case 'Cancelled': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatAddress = (address) => {
    if (!address) return 'Address not available'
    if (typeof address === 'string') return address
    if (address.fullAddress) return address.fullAddress
    if (address.address_line1) {
      return `${address.address_line1}, ${address.address_line2 || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`
    }
    return 'Address not available'
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
  if (!order) return <div className="text-center py-20">Order not found</div>

  const currentStep = getCurrentStep()
  const isCancelled = order.order_status === 'Cancelled'

  let addressObj = order.address_json
  if (typeof addressObj === 'string') {
    try {
      addressObj = JSON.parse(addressObj)
    } catch(e) {
      addressObj = {}
    }
  }
  const formattedAddress = formatAddress(addressObj)

  return (
    <div className="px-4 py-4 pb-32">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/orders')} className="text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold">Track Order</h2>
        </div>
        {lastUpdated && <p className="text-xs text-gray-400">Updated: {lastUpdated}</p>}
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-500">Order ID</p>
        <p className="font-bold text-primary">{order.order_id}</p>
        <p className="text-xs text-gray-500 mt-2">Customer</p>
        <p className="text-sm font-semibold">{order.customer_name || 'N/A'}</p>
        <p className="text-xs text-gray-500 mt-2">Placed on</p>
        <p className="text-sm">{order.order_date} at {order.order_time}</p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Order Status</h3>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor()}`}>
            {order.order_status}
          </span>
        </div>
        
        {isCancelled ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-5xl text-red-500">cancel</span>
            <p className="text-red-600 font-semibold mt-2">This order has been cancelled</p>
          </div>
        ) : (
          <div className="relative">
            {steps.map((step, idx) => {
              const isCompleted = currentStep >= step.step
              const isCurrent = currentStep === step.step
              return (
                <div key={idx} className="flex items-start mb-6 last:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                    <span className="material-symbols-outlined text-xl">{step.icon}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`font-semibold ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    {isCurrent && <p className="text-sm text-green-600 mt-1">Current Status</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-bold mb-2">Delivery Address</h3>
        <p className="text-sm text-gray-600">{formattedAddress}</p>
        {addressObj?.recipientName && (
          <p className="text-sm mt-2">👤 {addressObj.recipientName}</p>
        )}
        {addressObj?.recipientMobile && (
          <p className="text-sm text-gray-600">📞 {addressObj.recipientMobile}</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-bold mb-2">Delivery Slot</h3>
        <p className="text-sm text-gray-600">{order.delivery_slot || 'Slot not selected'}</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <h3 className="font-bold mb-2">Order Items</h3>
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-sm">{item.product_name}</p>
              <p className="text-xs text-gray-500">{item.weight} x {item.quantity}</p>
            </div>
            <p className="font-semibold">₹{item.price * item.quantity}</p>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-2 border-t border-gray-200">
          <span className="font-bold">Total</span>
          <span className="font-bold text-primary">₹{order.order_total}</span>
        </div>
      </div>

      {canCancelOrder() && (
        <button 
          onClick={cancelOrder}
          disabled={cancelling}
          className="w-full bg-red-500 text-white py-3 rounded-full font-bold mb-4 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}

      <button onClick={() => navigate('/')} className="w-full bg-primary text-white py-3 rounded-full font-bold">
        Continue Shopping
      </button>
    </div>
  )
}

export default OrderTrackerPage