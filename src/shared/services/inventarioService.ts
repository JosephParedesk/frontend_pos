import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Categoria {
  categoriaId: number
  nombre: string
  descripcion?: string
  icono?: string
  activo?: boolean
}

export interface Proveedor {
  proveedorId: number
  nombre: string
  nit?: string
}

export interface Producto {
  sku: string
  nombre: string
  descripcion: string
  categoriaId: string
  categoriaNombre: string
  proveedorId: string
  proveedorNombre: string
  precioCompra: number
  precioVenta: number
  gananciaPesos: number
  gananciaPorcentaje: number
  stock: number
  stockMinimo: number
  unidad: string
  imagenUrl: string
  activo: boolean
}
export interface ProductoRequest {
  sku: string
  nombre: string
  descripcion?: string
  categoriaId: string
  proveedorId?: string
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  unidad: string
  imagenBase64?: string
  activo: boolean
}

// ─── Productos ────────────────────────────────────────────────────────────────

export const productoService = {
  listar: () =>
    api.get<Producto[]>('/api/surtiana/inventario/productos').then(r => r.data),

  buscarPorId: (id: string) =>
    api.get<Producto>(`/api/surtiana/inventario/buscar/${id}`).then(r => r.data),

  guardar: (data: ProductoRequest) =>
    api.post<Producto>('/api/surtiana/inventario/save', data).then(r => r.data),

  actualizar: (id: string, data: ProductoRequest) =>
    api.put<Producto>(`/api/surtiana/inventario/actualizar/${id}`, data).then(r => r.data),

  eliminar: (id: string) =>
    api.delete(`/api/surtiana/inventario/eliminar/${id}`),

  subirImagen: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('imagen', file)
    return api.post<{ imagenUrl: string }>(
      `/api/surtiana/inventario/${id}/imagen`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(r => r.data)
  },
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export const categoriaService = {
  listar: () =>
    api.get<Categoria[]>('/api/pos/categorias/listar').then(r => r.data),

  guardar: (data: Omit<Categoria, 'categoriaId'>) =>
    api.post<Categoria>('/api/pos/categorias/save', data).then(r => r.data),

  actualizar: (id: string, data: Partial<Categoria>) =>
    api.put<Categoria>(`/api/pos/categorias/actualizar/${id}`, data).then(r => r.data),

  eliminar: (id: string) =>
    api.delete(`/api/pos/categorias/eliminar/${id}`),
}

// ─── Proveedores ──────────────────────────────────────────────────────────────

export const proveedorService = {
  listar: () =>
    api.get<Proveedor[]>('/api/pos/proveedores/listar').then(r => r.data),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const calcularGanancia = (precioCompra: number, precioVenta: number) => {
  const pesos = precioVenta - precioCompra
  const porcentaje = precioCompra > 0 ? (pesos / precioCompra) * 100 : 0
  return { pesos, porcentaje }
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
  })
