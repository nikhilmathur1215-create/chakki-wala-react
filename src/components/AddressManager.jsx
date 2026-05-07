import React, { useState, useEffect } from 'react'

const AddressManager = ({ onClose, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [formData, setFormData] = useState({
    addressId: '',
    recipientName: '',
    mobile: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    pincode: '',
    label: 'Home'
  })
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const loginMobile = user.mobile || ''

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = () => {
    const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]')
    setAddresses(savedAddresses)
    setLoading(false)
  }

  const saveAddress = () => {
    if (!formData.houseNo || !formData.street || !formData.city || !formData.pincode) {
      alert('Please fill all required fields')
      return
    }

    const fullAddress = `${formData.houseNo}, ${formData.street}${formData.landmark ? `, ${formData.landmark}` : ''}, ${formData.city} - ${formData.pincode}`
    
    let updatedAddresses = [...addresses]
    
    if (editingAddress) {
      const index = updatedAddresses.findIndex(a => a.addressId === editingAddress.addressId)
      if (index !== -1) {
        updatedAddresses[index] = {
          ...updatedAddresses[index],
          label: formData.label,
          fullAddress: fullAddress,
          recipientName: formData.recipientName,
          mobile: formData.mobile || loginMobile,
          houseNo: formData.houseNo,
          streetArea: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          pincode: formData.pincode
        }
      }
    } else {
      const newAddress = {
        addressId: Date.now().toString(),
        label: formData.label,
        fullAddress: fullAddress,
        isDefault: addresses.length === 0,
        recipientName: formData.recipientName,
        mobile: formData.mobile || loginMobile,
        houseNo: formData.houseNo,
        streetArea: formData.street,
        landmark: formData.landmark,
        city: formData.city,
        pincode: formData.pincode
      }
      updatedAddresses.push(newAddress)
      
      // If this is the first address (becomes default), update user profile name
      if (addresses.length === 0 && formData.recipientName) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        userData.name = formData.recipientName
        localStorage.setItem('user', JSON.stringify(userData))
      }
    }
    
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setAddresses(updatedAddresses)
    resetForm()
    alert(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!')
  }

  const deleteAddress = (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    const updatedAddresses = addresses.filter(addr => addr.addressId !== addressId)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setAddresses(updatedAddresses)
    alert('Address deleted successfully')
  }

  const editAddress = (addr) => {
    setEditingAddress(addr)
    setFormData({
      addressId: addr.addressId,
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

  const selectAddress = (addr) => {
    // Save full address details including recipient name
    localStorage.setItem('selectedAddress', addr.fullAddress)
    localStorage.setItem('selectedAddressLabel', addr.label)
    localStorage.setItem('selectedAddressDetails', JSON.stringify({
      fullAddress: addr.fullAddress,
      label: addr.label,
      recipientName: addr.recipientName,
      mobile: addr.mobile,
      houseNo: addr.houseNo,
      street: addr.streetArea,
      city: addr.city,
      pincode: addr.pincode
    }))
    // Also save the recipient name as the order user name
    localStorage.setItem('selectedAddressName', addr.recipientName || addr.label)
    if (onAddressSelect) onAddressSelect(addr)
    onClose()
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingAddress(null)
    setFormData({
      addressId: '',
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

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.address) {
        const address = data.address
        return {
          houseNo: address.house_number || '',
          street: address.road || address.pedestrian || '',
          city: address.city || address.town || address.village || '',
          pincode: address.postcode || '',
          landmark: address.suburb || address.neighbourhood || '',
        }
      }
      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        const addressData = await reverseGeocode(lat, lng)
        
        if (addressData) {
          setFormData({
            ...formData,
            houseNo: addressData.houseNo,
            street: addressData.street,
            city: addressData.city,
            pincode: addressData.pincode,
            landmark: addressData.landmark,
            recipientName: user.name || '',
            mobile: loginMobile
          })
          setShowAddForm(true)
          alert('Location detected! Please review and save the address.')
        } else {
          alert('Could not get address details. Please enter manually.')
        }
        setIsGettingLocation(false)
      }, (error) => {
        setIsGettingLocation(false)
        alert('Unable to get location. Please enable permissions.')
      })
    } else {
      alert('Geolocation not supported')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
            disabled={isGettingLocation}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-xl text-primary font-semibold border border-primary/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">my_location</span>
            {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
          </button>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              Saved Addresses
              <span className="text-xs text-gray-400">({addresses.length})</span>
            </h3>
            
            {loading ? (
              <div className="text-center py-8">Loading...</div>
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
                          {addr.isDefault && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{addr.fullAddress}</p>
                        <p className="text-xs text-gray-400 mt-1">📞 {addr.mobile || loginMobile}</p>
                        <p className="text-xs text-gray-400 mt-1">👤 {addr.recipientName || 'No name'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editAddress(addr)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        {!addr.isDefault && (
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

          <div>
            <button
              onClick={() => {
                resetForm()
                setShowAddForm(!showAddForm)
              }}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold"
            >
              <span className="material-symbols-outlined">add_circle</span>
              {showAddForm ? 'Cancel' : 'Add New Address'}
            </button>

            {showAddForm && (
              <div className="mt-4 space-y-3">
                <input 
                  type="text" 
                  placeholder="Full Name (will be used for delivery) *" 
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                />
                <p className="text-xs text-gray-400 -mt-2">This name will appear on the order</p>
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.mobile || loginMobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
                <p className="text-xs text-gray-400 -mt-2">Leave empty to use registered mobile</p>
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
                  placeholder="Landmark" 
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
                  className="w-full p-3 border rounded-lg"
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
        </div>
      </div>
    </div>
  )
}

export default AddressManager
