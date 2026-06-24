import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────
// Coinciden exactamente con Compra.java, CompraItem.java y FormaPago.java del backend

export type TipoTransaccion = 'FACTURA_COMPRA' | 'RECIBO_EGRESO'
export type EstadoCompra = 'BORRADOR' | 'REGISTRADA' | 'ANULADA'
export type TipoItem = 'ACTIVO_FIJO' | 'PRODUCTO' | 'GASTO_CUENTA'
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CREDITO'

export interface CompraItem {
  itemId?: number
  tipo: TipoItem
  productoSku?: string
  descripcion: string
  cantidad: number
  valorUnitario: number
  descuento?: number
  impuestoCargo?: string
  impuestoRetencion?: string
  valorTotal?: number
}

export interface FormaPago {
  formaPagoId?: number
  metodo: MetodoPago
  valor: number
}

export interface Compra {
  compraId?: number
  empresaId?: string
  tipoTransaccion: TipoTransaccion
  numeroComprobante?: string
  proveedorId: number
  proveedorNombre?: string
  fechaElaboracion?: string // ISO yyyy-MM-dd
  creadoPor?: string
  sucursal?: string
  estado?: EstadoCompra
  totalBruto?: number
  totalDescuentos?: number
  subtotal?: number
  totalIva?: number
  totalRetencion?: number
  totalPagar?: number
  items: CompraItem[]
  formasPago: FormaPago[]
}

export interface FiltrosCompra {
  proveedorId?: number
  tipoTransaccion?: TipoTransaccion
  fechaInicio?: string // yyyy-MM-dd
  fechaFin?: string     // yyyy-MM-dd
  creadoPor?: string
}

// ─── Servicio ─────────────────────────────────────────────────────────────────
// Nota: X-Empresa-Id se inyecta automáticamente vía interceptor en api.ts,
// no hace falta enviarlo manualmente desde cada llamada.

export const compraService = {
  listar: () =>
    api.get<Compra[]>('/api/pos/compras/listar'),

  buscarPorId: (compraId: number) =>
    api.get<Compra>(`/api/pos/compras/buscar/${compraId}`),

  filtrar: (filtros: FiltrosCompra) =>
    api.get<Compra[]>('/api/pos/compras/filtrar', { params: filtros }),

  registrar: (compra: Compra) =>
    api.post<Compra>('/api/pos/compras/registrar', compra),

  anular: (compraId: number) =>
    api.put<void>(`/api/pos/compras/anular/${compraId}`),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const calcularValorTotalItem = (item: Partial<CompraItem>) => {
  const cantidad = item.cantidad ?? 1
  const valorUnitario = item.valorUnitario ?? 0
  const descuento = item.descuento ?? 0
  return cantidad * valorUnitario - descuento
}

export const TIPO_TRANSACCION_LABEL: Record<TipoTransaccion, string> = {
  FACTURA_COMPRA: 'Factura de compra',
  RECIBO_EGRESO: 'Recibo / Egreso',
}

export const ESTADO_COLOR: Record<EstadoCompra, string> = {
  BORRADOR: 'default',
  REGISTRADA: 'green',
  ANULADA: 'red',
}

export const TIPO_ITEM_LABEL: Record<TipoItem, string> = {
  ACTIVO_FIJO: 'Activo fijo',
  PRODUCTO: 'Producto',
  GASTO_CUENTA: 'Gasto / Cuenta contable',
}

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  CREDITO: 'Crédito',
}
