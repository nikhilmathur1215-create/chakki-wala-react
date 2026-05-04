import axios from 'axios'
import { API_BASE_URL } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId')
  if (sessionId && !config.url.includes('/send-otp') && !config.url.includes('/verify-otp')) {
    config.data = { ...config.data, sessionId }
  }
  return config
})

export default api
