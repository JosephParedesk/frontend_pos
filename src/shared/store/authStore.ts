import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'

interface Usuario {
    cedula: string
    nombre: string
    correo: string
    rol: string
    planId?: number
}

interface AuthStore {
    usuario: Usuario | null
    token: string | null
    setUsuario: (usuario: Usuario) => void
    setToken: (token: string) => void
    logout: () => void
    inicializar: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    usuario: null,
    token: localStorage.getItem('token'),

    inicializar: () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const decoded: any = jwtDecode(token)
                const ahora = Date.now() / 1000
                if (decoded.exp && decoded.exp < ahora) {
                    localStorage.removeItem('token')
                    return
                }
                set({
                    token,
                    usuario: {
                        cedula: decoded.cedula,
                        nombre: decoded.nombre,
                        correo: decoded.sub,
                        rol: decoded.rol,
                        planId: decoded.planId,
                    }
                })
            } catch {
                localStorage.removeItem('token')
            }
        }
    },

    setUsuario: (usuario) => set({ usuario }),

    setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token })
    },

    logout: () => {
        localStorage.removeItem('token')
        set({ usuario: null, token: null })
    },
}))