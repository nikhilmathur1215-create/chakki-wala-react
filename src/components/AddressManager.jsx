import React, { useState, useEffect } from 'react'
import api from '../services/api'

const AddressManager = ({ onClose, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    recipientName: '',
    mobile: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    pincode: '',
    label: 'Home'
  })
  
  const sessionId = localStorage.getItem('sessionId')
  const isLoggedIn = !!sessionId
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const loginMobile = user.mobile || ''

  useEffect(() => {
    if (isLoggedIn) {
      loadAddresses()
    } else {
      setLoading(false)
    }
  }, [isLoggedIn])

  const loadAddresses = () => {
    setLoading(true)
    const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]')
    setAddresses(savedAddresses)
    setLoading(false)
  }

  // Update user profile name in localStorage and backend
  const updateUserProfileName = async (name) => {
    if (!name) return
    
    // Update in localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    currentUser.name = name
    localStorage.setItem('user', JSON.stringify(currentUser))
    
    // Update in backend if available
    try {
      await api.put('/profile/update', { sessionId, name })
    } catch (error) {
      console.log('Backend not available, name saved locally')
    }
  }

  const saveAddressToLocal = () => {
    if (!formData.houseNo || !formData.street || !formData.city || !formData.pincode) {
      alert('Please fill all required fields')
      return false
    }

    const fullAddress = `${formData.houseNo}, ${formData.street}${formData.landmark ? `, ${formData.landmark}` : ''}, ${formData.city} - ${formData.pincode}`
    
    const newAddress = {
      addressId: Date.now().toString(),
      label: formData.label,
      fullAddress: fullAddress,
      isDefault: addresses.length === 0 ? 'true' : 'false',
      recipientName: formData.recipientName,
      mobile: formData.mobile || loginMobile,
      houseNo: formData.houseNo,
      streetArea: formData.street,
      landmark: formData.landmark,
      city: formData.city,
      pincode: formData.pincode
    }

    let updatedAddresses = [...addresses]
    
    if (editingAddress) {
      const index = updatedAddresses.findIndex(a => a.addressId === editingAddress.addressId)
      if (index !== -1) {
        updatedAddresses[index] = { ...newAddress, addressId: editingAddress.addressId }
      }
    } else {
      updatedAddresses.push(newAddress)
    }
    
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setAddresses(updatedAddresses)
    
    // If this is the first address (becomes default), update user profile name
    if (addresses.length === 0 && formData.recipientName) {
      updateUserProfileName(formData.recipientName)
    }
    
    return true
  }

  const saveAddress = async () => {
    const success = saveAddressToLocal()
    if (success) {
      alert(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!')
      setShowAddForm(false)
      setEditingAddress(null)
      setFormData({ 
        recipientName: '', 
        mobile: '', 
        houseNo: '', 
        street: '', 
        landmark: '', 
        city: '', 
        pincode: '', 
        label: 'Home' 
      })
    }
  }

  const deleteAddress = (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    const updatedAddresses = addresses.filter(addr => addr.addressId !== addressId)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setAddresses(updatedAddresses)
    alert('Address deleted successfully')
  }

  const selectAddress = (addr) => {
    localStorage.setItem('selectedAddress', addr.fullAddress)
    localStorage.setItem('selectedAddressLabel', addr.label)
    if (onAddressSelect) onAddressSelect(addr)
    if (onClose) onClose()
  }

  const startEdit = (addr) => {
    setEditingAddress(addr)
    setFormData({
      recipientName: addr.recipientName || '',
      mobile: addr.mobile || '',
      houseNo: addr.houseNo || '',
      street: addr.streetArea || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      pincode: addr.pincode || '',
      label: addr.label || 'Home'
    })
    setShowAddForm(true)
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const address = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        localStorage.setItem('selectedAddress', address)
        localStorage.setItem('selectedAddressLabel', 'Current Location')
        if (onAddressSelect) onAddressSelect({ fullAddress: address, label: 'Current Location' })
        if (onClose) onClose()
      }, () => {
        alert('Unable to get location')
      })
    } else {
      alert('Geolocation not supported')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold">Manage Addresses</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <button
            onClick={useCurrentLocation}
            className="w-full flex items-center gap-3 p-3 bg-primary/5 rounded-xl text-primary font-semibold border border-primary/20"
          >
            <span className="material-symbols-outlined">my_location</span>
            Use Current Location
          </button>

          {isLoggedIn && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                Saved Addresses
                {!loading && <span className="text-xs text-gray-400">({addresses.length})</span>}
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-gray-300">location_off</span>
                  <p className="text-gray-500 mt-2 text-sm">No saved addresses</p>
                  <p className="text-gray-400 text-xs mt-1">Add your first address below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.addressId} className="border rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-primary text-sm">{addr.label}</span>
                            {addr.isDefault === 'true' && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.fullAddress}</p>
                          <p className="text-xs text-gray-400 mt-1">📞 {addr.mobile || loginMobile}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(addr)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {addr.isDefault !== 'true' && (
                            <button onClick={() => deleteAddress(addr.addressId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => selectAddress(addr)}
                        className="w-full mt-3 bg-primary text-white py-2 rounded-lg text-sm font-semibold"
                      >
                        Deliver to this address
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLoggedIn && (
            <div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold"
              >
                <span className="material-symbols-outlined">add_circle</span>
                {showAddForm ? 'Cancel' : 'Add New Address'}
              </button>

              {showAddForm && (
                <div className="mt-4 space-y-3">
                  <input 
                    type="text" 
                    placeholder="Full Name *" 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 -mt-2">This name will be saved as your profile name</p>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.mobile || loginMobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 -mt-2">Leave empty to use registered mobile: {loginMobile}</p>
                  <input 
                    type="text" 
                    placeholder="House/Flat No. *" 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.houseNo}
                    onChange={(e) => setFormData({...formData, houseNo: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Street/Area *" 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Landmark (Optional)" 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="City *" 
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Pincode *" 
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    />
                  </div>
                  <select 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                  >
                    <option value="Home">Home 🏠</option>
                    <option value="Work">Work 💼</option>
                    <option value="Other">Other 📍</option>
                  </select>
                  <button
                    onClick={saveAddress}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLoggedIn && (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-gray-300">lock</span>
              <p className="text-gray-500 mt-2 text-sm">Login to save addresses</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="mt-3 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
              >
                Login / Signup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressManager
