// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost'

// Change this to your Render backend URL after deployment
export const API_BASE_URL = isProduction 
  ? 'https://chakki-wala-backend.onrender.com/api'
  : 'http://localhost:3000/api'

export default { API_BASE_URL }
