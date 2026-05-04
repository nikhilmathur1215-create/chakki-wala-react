import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const ProfilePage = () => {
  const [user, setUser] = useState({})
  const [officeAddress, setOfficeAddress] = useState('')
  const [officeMobile, setOfficeMobile] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(userData)
    if (!sessionId) navigate('/login')
    
    // Load saved office address and mobile
    const savedOfficeAddress = localStorage.getItem('officeAddress')
    const savedOfficeMobile = localStorage.getItem('officeMobile')
    if (savedOfficeAddress) setOfficeAddress(savedOfficeAddress)
    if (savedOfficeMobile) setOfficeMobile(savedOfficeMobile)
  }, [])

  const handleSaveOfficeDetails = () => {
    localStorage.setItem('officeAddress', officeAddress)
    localStorage.setItem('officeMobile', officeMobile)
    setIsEditing(false)
    alert('Office address and mobile number saved successfully!')
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="px-4 py-4 pb-32">
      {/* User Profile Header */}
      <div className="bg-white rounded-xl p-6 flex items-center gap-4 mb-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">{user.name || 'Guest User'}</h2>
          <p className="text-on-surface-variant text-sm">+91 {user.mobile || 'XXXXXXXXXX'}</p>
        </div>
      </div>

      {/* Office Address Section */}
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">business</span>
            <h3 className="font-bold text-lg">My Office Address</h3>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-primary text-sm font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              placeholder="Enter office address (House/Flat No., Street, Landmark, City, Pincode)"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
            />
            <input
              type="tel"
              placeholder="Office Contact Number"
              value={officeMobile}
              onChange={(e) => setOfficeMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveOfficeDetails}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {officeAddress ? (
              <>
                <p className="text-sm text-gray-600 whitespace-pre-line">{officeAddress}</p>
                <p className="text-sm text-gray-600 mt-2">📞 {officeMobile || 'Not provided'}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No office address added. Click Edit to add.</p>
            )}
          </div>
        )}
      </div>

      {/* Account Settings - Removed Saved Addresses tab */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => navigate('/orders')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            <span className="font-medium">Order History</span>
          </div>
          <span className="material-symbols-outlined text-gray-400">chevron_right</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-red-500">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold">Logout</span>
          </div>
        </button>
      </div>

      {/* Customer Care Section */}
      <div className="mt-6 bg-gradient-to-r from-secondary-container/20 to-primary/5 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-primary">support_agent</span>
          <h3 className="font-bold">Customer Care</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">📞 Phone</span>
            <a href="tel:+919876543210" className="text-primary font-bold">+91 98765 43210</a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">✉️ Email</span>
            <a href="mailto:support@chakkiwala.com" className="text-primary font-bold">support@chakkiwala.com</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
