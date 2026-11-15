import axios from 'axios'
import { readStorage } from '../utils/storage'

const SESSION_KEY = 'messmate-module1-session-v1'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const session = readStorage(SESSION_KEY, null)

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

export default axiosClient
