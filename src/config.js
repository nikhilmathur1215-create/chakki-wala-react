// Environment configuration
const isProduction = window.location.hostname !== 'localhost'

export const API_BASE_URL = isProduction 
  ? 'https://chakki-wala-backend.onrender.com/api'  // Change after backend deployment
  : 'http://localhost:3000/api'

export default { API_BASE_URL }
