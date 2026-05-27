import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrdersPage = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.getOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (showToast) showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(orderId);
    try {
      const response = await api.cancelOrder(orderId);
      if (response.success) {
        if (showToast) showToast('Order cancelled successfully', 'success');
        await loadOrders();
      } else {
        if (showToast) showToast(response.error || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (showToast) showToast('Failed to cancel order', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const canCancelOrder = (order) => {
    if (order.order_status === 'Cancelled') return false;
    if (order.order_status !== 'Confirmed') return false;
    if (!order.created_at) return false;
    
    const orderTime = new Date(order.created_at).getTime();
    const now = Date.now();
    const hoursSinceOrder = (now - orderTime) / (1000 * 60 * 60);
    return hoursSinceOrder <= 2;
  };

  const getRemainingCancelTime = (order) => {
    if (order.order_status !== 'Confirmed') return null;
    if (!order.created_at) return null;
    
    const orderTime = new Date(order.created_at).getTime();
    const now = Date.now();
    const hoursSince = (now - orderTime) / (1000 * 60 * 60);
    if (hoursSince >= 2) return null;
    
    const remainingMinutes = Math.floor((2 - hoursSince) * 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMins}m`;
    }
    return `${remainingMins}m`;
  };

  // Get status step for progress bar
  const getStatusStep = (status) => {
    const steps = {
      'Confirmed': 0,
      'Processing': 1,
      'Out for Delivery': 2,
      'Delivered': 3,
      'Cancelled': -1
    };
    return steps[status] !== undefined ? steps[status] : 0;
  };

  const getStatusMessage = (order) => {
    if (order.order_status === 'Processing') {
      return "⏳ We're grinding your flour fresh!";
    }
    if (order.order_status === 'Out for Delivery') {
      return "🚚 Your order is out for delivery!";
    }
    if (order.order_status === 'Delivered') {
      return "✅ Order delivered - Thank you for shopping!";
    }
    if (order.order_status === 'Cancelled') {
      return "❌ Order cancelled";
    }
    return null;
  };

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const d = new Date(dateValue);
      return d.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      });
    } catch(e) {
      return dateValue;
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    if (address.fullAddress) return address.fullAddress;
    if (address.address_line1) {
      return `${address.address_line1}, ${address.address_line2 || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;
    }
    return 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-gray-400">receipt_long</span>
          <p className="text-gray-500 mt-4">No orders yet</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.order_id;
            const cancellable = canCancelOrder(order);
            const remainingTime = getRemainingCancelTime(order);
            const displayDate = formatDisplayDate(order.created_at || order.order_date);
            const statusMessage = getStatusMessage(order);
            const currentStep = getStatusStep(order.order_status);
            const isCancelled = order.order_status === 'Cancelled';
            
            // Status steps for progress bar
            const statusSteps = [
              { name: 'Confirmed', icon: '📋', step: 0 },
              { name: 'Processing', icon: '⚙️', step: 1 },
              { name: 'Out for Delivery', icon: '🚚', step: 2 },
              { name: 'Delivered', icon: '✅', step: 3 }
            ];
            
            let addressObj = order.address_json;
            if (typeof addressObj === 'string') {
              try {
                addressObj = JSON.parse(addressObj);
              } catch(e) {
                addressObj = {};
              }
            }
            const formattedAddress = formatAddress(addressObj);

            return (
              <div key={order.order_id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono text-sm font-semibold">{order.order_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>📅 {displayDate}</span>
                    <span>⏰ {order.order_time || 'N/A'}</span>
                  </div>

                  {/* Status Progress Bar */}
                  {!isCancelled && (
                    <div className="mt-3 mb-3">
                      <div className="flex justify-between mb-1">
                        {statusSteps.map((step, idx) => (
                          <div key={step.step} className="text-center flex-1">
                            <div className={`text-sm ${idx <= currentStep ? 'text-primary' : 'text-gray-400'}`}>
                              {step.icon}
                            </div>
                            <p className={`text-[10px] font-medium ${idx <= currentStep ? 'text-primary' : 'text-gray-400'}`}>
                              {step.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="absolute left-0 top-0 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${((currentStep + 1) / statusSteps.length) * 100}%`,
                            backgroundColor: '#803d0a'
                          }}
                        ></div>
                      </div>
                      {statusMessage && (
                        <p className="text-xs text-center mt-2 text-gray-600">
                          {statusMessage}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} item(s) • {order.items?.[0]?.product_name}
                        {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">₹{order.order_total}</p>
                    </div>
                    <button onClick={() => toggleExpand(order.order_id)} className="text-primary flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-base">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="text-xs text-gray-500 mb-1">📍 Delivery Address</p>
                  <p className="text-sm font-medium">{formattedAddress}</p>
                  {addressObj?.recipientName && (
                    <p className="text-sm mt-1">👤 {addressObj.recipientName}</p>
                  )}
                  {addressObj?.recipientMobile && (
                    <p className="text-sm text-gray-600">📞 {addressObj.recipientMobile}</p>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Items Ordered</h4>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-gray-500">{item.weight} × {item.quantity}</p>
                          </div>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Payment</h4>
                        <p className="text-sm capitalize">{order.payment_method || 'COD'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Delivery Slot</h4>
                        <p className="text-sm">{order.delivery_slot || 'Not selected'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Price Details</h4>
                      <div className="bg-white rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal || 0}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee || 0}`}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">GST (5%)</span><span>₹{order.gst || 0}</span></div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">₹{order.order_total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Button Section */}
                <div className="p-4">
                  {cancellable ? (
                    <div>
                      <button
                        onClick={() => cancelOrder(order.order_id)}
                        disabled={cancelling === order.order_id}
                        className="w-full bg-red-500 text-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        {cancelling === order.order_id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                      {remainingTime && (
                        <p className="text-center text-xs text-green-600 mt-2">
                          ⏰ Cancel available for {remainingTime}
                        </p>
                      )}
                    </div>
                  ) : order.order_status === 'Cancelled' ? (
                    <div className="text-center text-gray-400 text-sm py-2">❌ Order Cancelled</div>
                  ) : order.order_status !== 'Delivered' && order.order_status !== 'Cancelled' ? (
                    <div className="text-center text-gray-400 text-sm py-2">
                      ⏰ Cancellation window closed (within 2 hours only)
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;