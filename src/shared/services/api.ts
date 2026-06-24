import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: 'http://localhost:8090',
})

api.interceptors.request.use((config) => {
  const { token, usuario } = useAuthStore.getState()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (usuario?.empresaId) {
    config.headers['X-Empresa-Id'] = usuario.empresaId
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api