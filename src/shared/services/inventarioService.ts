import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────
// Coinciden con Producto.java / ProductoData.java del backend real (clave = sku)

export interface Producto {
  sku: string
  nombre: string
  descripcion?: string
  categoriaId?: string
  categoriaNombre?: string
  proveedorId?: string
  proveedorNombre?: string
  precioCompra: number
  precioVenta: number
  gananciaPesos?: number
  gananciaPorcentaje?: number
  stock: number
  stockMinimo: number
  unidad: string
  imagenUrl?: string
  activo: boolean
}

export interface ProductoRequest {
  sku: string
  nombre: string
  descripcion?: string
  categoriaId?: string
  proveedorId?: string
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  unidad: string
  imagenUrl?: string
  activo: boolean
}

// ─── Servicio ─────────────────────────────────────────────────────────────────
// X-Empresa-Id se agrega automáticamente vía interceptor en api.ts

export const productoService = {
  listar: () =>
    api.get<Producto[]>('/api/surtiana/inventario/productos'),

  buscarPorSku: (sku: string) =>
    api.get<Producto>(`/api/surtiana/inventario/buscar/${sku}`),

  guardar: (data: ProductoRequest) =>
    api.post<Producto>('/api/surtiana/inventario/save', data),

  actualizar: (sku: string, data: ProductoRequest) =>
    api.put<Producto>(`/api/surtiana/inventario/actualizar/${sku}`, data),

  eliminar: (sku: string) =>
    api.delete(`/api/surtiana/inventario/eliminar/${sku}`),

  listarPorCategoria: (categoriaId: string) =>
    api.get<Producto[]>(`/api/surtiana/inventario/categoria/${categoriaId}`),

  // ── Nuevo: productos de un proveedor específico ──
  listarPorProveedor: (proveedorId: string | number) =>
    api.get<Producto[]>(`/api/surtiana/inventario/proveedor/${proveedorId}`),

  listarStockBajo: () =>
    api.get<Producto[]>('/api/surtiana/inventario/stock-bajo'),

  // ── Subir imagen del producto (requiere endpoint multipart en el backend) ──
  subirImagen: (sku: string, file: File) => {
    const formData = new FormData()
    formData.append('imagen', file)
    return api.post<{ imagenUrl: string }>(
      `/api/surtiana/inventario/${sku}/imagen`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const calcularGanancia = (precioCompra: number, precioVenta: number) => {
  const pesos = precioVenta - precioCompra
  const porcentaje = precioCompra > 0 ? (pesos / precioCompra) * 100 : 0
  return { pesos, porcentaje }
}