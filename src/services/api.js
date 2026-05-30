const API_BASE_URL = 'https://api.chakkiwalaa.com/api';

class ApiService {
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const authToken = localStorage.getItem('authToken');
    if (authToken) headers['X-Auth-Token'] = authToken;
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: this.getHeaders(),
      });
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // ========== AUTH APIS ==========
  sendOTP(mobile) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile })
    });
  }

  verifyOTP(mobile, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp })
    });
  }

  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // ========== PROFILE APIS ==========
  getProfile() {
    return this.request('/user/profile');
  }

  updateProfile(name, email) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });
  }

  // ========== ADDRESS APIS ==========
  getAddresses() {
    return this.request('/user/addresses');
  }

  saveAddress(data) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  deleteAddress(addressId) {
    return this.request(`/user/addresses/${addressId}`, { method: 'DELETE' });
  }

  // ========== CART APIS ==========
  getCart() {
    return this.request('/cart');
  }

  addToCart(product) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  updateCartItem(productId, weight, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, weight, quantity })
    });
  }

  removeCartItem(productId, weight) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId, weight })
    });
  }

  syncCart(guestItems) {
    return this.request('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ guestItems })
    });
  }

  // ========== DELIVERY SLOTS ==========
  getDeliverySlots() {
    return this.request('/delivery-slots');
  }

  // ========== ORDER APIS ==========
  async placeOrder(address, deliverySlot, paymentMethod, items, subtotal, deliveryFee, gst, total) {
    const orderData = {
      address,
      deliverySlot,
      paymentMethod,
      items,
      subtotal,
      deliveryFee,
      gst,
      total
    };
    console.log('Placing order with data:', orderData);
    const response = await this.request('/order/place', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    console.log('Order placement response:', response);
    return response;
  }

  getOrders() {
    return this.request('/orders');
  }

  cancelOrder(orderId) {
    return this.request('/order/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
  }
}

export default new ApiService();
