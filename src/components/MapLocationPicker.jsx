import React, { useState, useEffect } from 'react'

const MapLocationPicker = ({ onLocationSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Search for locations using OpenStreetMap Nominatim API
  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=IN&limit=10`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
      alert('Error searching location. Please try again.')
    }
    setLoading(false)
  }

  const selectLocation = async (location) => {
    setSelectedLocation(location)
    setLoading(true)
    
    try {
      // Get detailed address information
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}&addressdetails=1`
      )
      const data = await response.json()
      
      const address = data.address || {}
      const addressDetails = {
        lat: location.lat,
        lon: location.lon,
        displayName: location.display_name,
        houseNo: address.house_number || '',
        street: address.road || address.pedestrian || '',
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        pincode: address.postcode || '',
        country: address.country || ''
      }
      
      onLocationSelect(addressDetails)
      onClose()
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      alert('Error getting address details. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold">📍 Pick Location on Map</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            Search for your area, landmark, or pin code to pinpoint your exact location
          </p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search for area, landmark, or pincode..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={searchLocation}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Search Results</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectLocation(result)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium">{result.display_name.split(',')[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{result.display_name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm">info</span>
              <p className="text-xs text-gray-600">
                Search for your area, landmark, or pincode to pinpoint your exact location. 
                The system will automatically fill your address details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapLocationPicker
