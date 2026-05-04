import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    if (sessionId) {
      try {
        const res = await api.get(`/orders/${sessionId}`)
        setOrders(res.data.orders || [])
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
    setLoading(false)
  }

  const cancelOrder = async (orderId) => {
    const canCancel = confirm('Are you sure you want to cancel this order? Refund will be initiated.')
    if (!canCancel) return
    
    setCancelling(orderId)
    try {
      const response = await api.post('/order/cancel', { sessionId, orderId })
      if (response.data.success) {
        alert(response.data.message)
        loadOrders() // Refresh orders
      } else {
        alert(response.data.error || 'Cannot cancel this order')
      }
    } catch (error) {
      alert('Error cancelling order: ' + error.message)
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'text-green-600 bg-green-50'
      case 'Confirmed': return 'text-blue-600 bg-blue-50'
      case 'Processing': return 'text-yellow-600 bg-yellow-50'
      case 'Out for Delivery': return 'text-orange-600 bg-orange-50'
      case 'Cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const canCancelOrder = (status) => {
    return status === 'Confirmed' || status === 'Processing'
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400">receipt_long</span>
        <p className="text-gray-500 mt-4">No orders yet</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full">Start Shopping</button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h2 className="text-lg font-bold mb-4">My Orders ({orders.length})</h2>
      
      {orders.map((order, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
              <p className="font-bold text-primary text-sm">{order.orderId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">bakery_dining</span>
            </div>
            <div>
              <p className="font-medium text-sm">{order.items?.[0]?.name || 'Product'}</p>
              <p className="text-xs text-gray-500">Total: ₹{order.orderTotal}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t">
            <button 
              onClick={() => navigate(`/track-order/${order.orderId}`)}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold"
            >
              Track Order
            </button>
            
            {canCancelOrder(order.orderStatus) && (
              <button 
                onClick={() => cancelOrder(order.orderId)}
                disabled={cancelling === order.orderId}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50"
              >
                {cancelling === order.orderId ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            
            {order.orderStatus === 'Cancelled' && (
              <div className="text-right">
                <p className="text-xs text-green-600">Refund Initiated</p>
                <p className="text-xs text-gray-500">Amount: ₹{order.orderTotal}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrdersPage
