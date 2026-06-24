import { useState, useEffect, useMemo } from 'react'
import {
    Card, Select, Input, InputNumber, Button, DatePicker, Space,
    message, Row, Col, Divider, Tag
} from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { proveedorService } from '../../shared/services/proveedorService'
import type { Proveedor } from '../../shared/services/proveedorService'
import { productoService } from '../../shared/services/inventarioService'
import type { Producto } from '../../shared/services/inventarioService'
import {
    compraService, calcularValorTotalItem, TIPO_TRANSACCION_LABEL,
    TIPO_ITEM_LABEL, METODO_PAGO_LABEL,
    type Compra, type CompraItem, type FormaPago, type TipoTransaccion, type TipoItem, type MetodoPago
} from '../../shared/services/compraService'

// ── Paleta de la app ──
const ROJO = '#e74c3c'
const ROJO_OSCURO = '#c0392b'

// ── Opciones de impuestos ──
const IMPUESTOS_CARGO = ['IVA 19%', 'IVA 5%', 'IVA 0%', 'Sin impuesto']
const IMPUESTOS_RETENCION = [
    'Retefuente 3,5% Arrendamientos',
    'Retefuente 2,5% Compras',
    'Retefuente 1% Compras',
    'ReteICA 0,4%',
    'Sin retención',
]

let itemSeq = 0
const nuevoItem = (): CompraItem & { _key: number } => ({
    _key: itemSeq++,
    tipo: 'PRODUCTO',
    descripcion: '',
    cantidad: 1,
    valorUnitario: 0,
    descuento: 0,
    valorTotal: 0,
})

let pagoSeq = 0
const nuevaFormaPago = (): FormaPago & { _key: number } => ({
    _key: pagoSeq++,
    metodo: 'EFECTIVO',
    valor: 0,
})

export default function NuevaCompraPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const tipoInicial = (searchParams.get('tipo') as TipoTransaccion) || 'FACTURA_COMPRA'

    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [productosProveedor, setProductosProveedor] = useState<Producto[]>([])
    const [cargandoProductos, setCargandoProductos] = useState(false)

    const [tipoTransaccion, setTipoTransaccion] = useState<TipoTransaccion>(tipoInicial)
    const [proveedorId, setProveedorId] = useState<number | undefined>()
    const [fechaElaboracion, setFechaElaboracion] = useState(dayjs())
    const [sucursal, setSucursal] = useState('')
    const [items, setItems] = useState<(CompraItem & { _key: number })[]>([nuevoItem()])
    const [formasPago, setFormasPago] = useState<(FormaPago & { _key: number })[]>([nuevaFormaPago()])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        proveedorService.listar()
            .then(({ data }) => setProveedores(data))
            .catch(() => message.error('Error al cargar proveedores'))
    }, [])

    // ── Al cambiar de proveedor, cargar sus productos y limpiar los ítems que ya tenían producto seleccionado ──
    useEffect(() => {
        if (!proveedorId) {
            setProductosProveedor([])
            return
        }
        setCargandoProductos(true)
        productoService.listarPorProveedor(proveedorId)
            .then(({ data }) => setProductosProveedor(data))
            .catch(() => {
                message.error('No se pudieron cargar los productos del proveedor')
                setProductosProveedor([])
            })
            .finally(() => setCargandoProductos(false))
    }, [proveedorId])

    // ── Ítems ──
    const actualizarItem = (key: number, cambios: Partial<CompraItem>) => {
        setItems(prev => prev.map(it => {
            if (it._key !== key) return it
            const actualizado = { ...it, ...cambios }
            actualizado.valorTotal = calcularValorTotalItem(actualizado)
            return actualizado
        }))
    }

    // Cuando eligen un producto del catálogo del proveedor, autocompleta descripción y precio
    const seleccionarProductoEnItem = (key: number, sku: string) => {
        const producto = productosProveedor.find(p => p.sku === sku)
        if (!producto) return
        actualizarItem(key, {
            productoSku: producto.sku,
            descripcion: producto.nombre,
            valorUnitario: producto.precioCompra,
        })
    }

    const agregarItem = () => setItems(prev => [...prev, nuevoItem()])

    const eliminarItem = (key: number) => {
        if (items.length === 1) {
            message.warning('Debe existir al menos un ítem')
            return
        }
        setItems(prev => prev.filter(it => it._key !== key))
    }

    // ── Formas de pago ──
    const actualizarPago = (key: number, cambios: Partial<FormaPago>) => {
        setFormasPago(prev => prev.map(p => p._key === key ? { ...p, ...cambios } : p))
    }

    const agregarFormaPago = () => setFormasPago(prev => [...prev, nuevaFormaPago()])

    const eliminarFormaPago = (key: number) => {
        if (formasPago.length === 1) {
            message.warning('Debe existir al menos una forma de pago')
            return
        }
        setFormasPago(prev => prev.filter(p => p._key !== key))
    }

    // ── Totales ──
    const totales = useMemo(() => {
        const itemsValidos = items.filter(it => it.descripcion?.trim())
        const totalBruto = itemsValidos.reduce((s, it) => s + calcularValorTotalItem(it), 0)
        const totalDescuentos = itemsValidos.reduce((s, it) => s + (it.descuento || 0), 0)
        const subtotal = totalBruto

        const extraerPorcentaje = (texto?: string) => {
            if (!texto) return 0
            const match = texto.match(/([\d,.]+)\s*%/)
            return match ? parseFloat(match[1].replace(',', '.')) / 100 : 0
        }

        let totalIva = 0
        let totalRetencion = 0
        itemsValidos.forEach(it => {
            const base = calcularValorTotalItem(it)
            totalIva += base * extraerPorcentaje(it.impuestoCargo)
            totalRetencion += base * extraerPorcentaje(it.impuestoRetencion)
        })

        const totalPagar = subtotal + totalIva - totalRetencion
        const totalFormasPago = formasPago.reduce((s, p) => s + (p.valor || 0), 0)

        return { totalBruto, totalDescuentos, subtotal, totalIva, totalRetencion, totalPagar, totalFormasPago }
    }, [items, formasPago])

    const proveedorSeleccionado = proveedores.find(p => p.proveedorId === proveedorId)

    // ── Guardar ──
    const guardar = async () => {
        if (!proveedorId) {
            message.error('Selecciona un proveedor')
            return
        }
        const itemsValidos = items.filter(it => it.descripcion?.trim() && it.valorUnitario)
        if (itemsValidos.length === 0) {
            message.error('Agrega al menos un ítem válido')
            return
        }

        const compra: Compra = {
            tipoTransaccion,
            proveedorId,
            proveedorNombre: proveedorSeleccionado?.nombre,
            fechaElaboracion: fechaElaboracion.format('YYYY-MM-DD'),
            sucursal: sucursal || undefined,
            totalDescuentos: totales.totalDescuentos,
            totalIva: totales.totalIva,
            totalRetencion: totales.totalRetencion,
            items: itemsValidos.map(({ _key, ...resto }) => resto),
            formasPago: formasPago.map(({ _key, ...resto }) => resto),
        }

        setGuardando(true)
        try {
            await compraService.registrar(compra)
            message.success('Compra registrada correctamente')
            navigate('/compras')
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al registrar la compra')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: ROJO_OSCURO, margin: 0 }}>
                    Nueva {TIPO_TRANSACCION_LABEL[tipoTransaccion]}
                </h2>
                <Select
                    value={tipoTransaccion}
                    onChange={setTipoTransaccion}
                    style={{ width: 220 }}
                    options={[
                        { value: 'FACTURA_COMPRA', label: 'Factura de compra' },
                        { value: 'RECIBO_EGRESO', label: 'Recibo / Egreso' },
                    ]}
                />
            </div>

            {/* Datos generales */}
            <Card size="small" style={{ borderRadius: 10, marginBottom: 16, borderColor: '#ffe0e0' }}>
                <Row gutter={[16, 12]}>
                    <Col xs={24} md={8}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Proveedor *</div>
                        <Select
                            placeholder="Buscar proveedor"
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            value={proveedorId}
                            onChange={(v) => {
                                setProveedorId(v)
                                // limpiar productos de los ítems ya cargados, porque cambió el catálogo disponible
                                setItems(prev => prev.map(it => ({ ...it, productoSku: undefined })))
                            }}
                            style={{ width: '100%' }}
                            suffixIcon={<SearchOutlined />}
                            options={proveedores.map(p => ({
                                value: p.proveedorId,
                                label: `${p.nombre} · ${p.nit}`
                            }))}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Fecha elaboración *</div>
                        <DatePicker
                            value={fechaElaboracion}
                            onChange={(v) => v && setFechaElaboracion(v)}
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Sucursal</div>
                        <Input
                            placeholder="Sucursal (opcional)"
                            value={sucursal}
                            onChange={e => setSucursal(e.target.value)}
                        />
                    </Col>
                </Row>
                {!proveedorId && (
                    <div style={{ marginTop: 10, fontSize: 12, color: ROJO }}>
                        Selecciona un proveedor para poder elegir productos de su catálogo en los ítems.
                    </div>
                )}
            </Card>

            {/* Tabla de ítems */}
            <Card size="small" style={{ borderRadius: 10, marginBottom: 16, borderColor: '#ffe0e0' }} bodyStyle={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                        <thead>
                            <tr style={{ background: '#fff5f5', textAlign: 'left' }}>
                                {['#', 'Tipo', 'Producto', 'Descripción', 'Cant', 'Valor Unitario', 'Descuento', 'Impuesto Cargo', 'Impuesto Retención', 'Valor Total', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 8px', fontSize: 12, color: '#555', fontWeight: 600, borderBottom: '1px solid #ffe0e0' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item._key} style={{ borderBottom: '1px solid #fbeaea' }}>
                                    <td style={{ padding: '8px', fontSize: 13, color: '#888' }}>{idx + 1}</td>
                                    <td style={{ padding: '8px', minWidth: 140 }}>
                                        <Select
                                            value={item.tipo}
                                            onChange={(v: TipoItem) => actualizarItem(item._key, { tipo: v })}
                                            style={{ width: '100%' }}
                                            size="small"
                                            options={Object.entries(TIPO_ITEM_LABEL).map(([value, label]) => ({ value, label }))}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 180 }}>
                                        <Select
                                            placeholder={proveedorId ? 'Selecciona producto' : 'Elige un proveedor primero'}
                                            disabled={!proveedorId}
                                            loading={cargandoProductos}
                                            showSearch
                                            allowClear
                                            optionFilterProp="label"
                                            size="small"
                                            style={{ width: '100%' }}
                                            value={item.productoSku}
                                            onChange={(v) => v
                                                ? seleccionarProductoEnItem(item._key, v)
                                                : actualizarItem(item._key, { productoSku: undefined })
                                            }
                                            notFoundContent={proveedorId ? 'Este proveedor no tiene productos en inventario' : null}
                                            options={productosProveedor.map(p => ({
                                                value: p.sku,
                                                label: `${p.nombre} (${p.sku})`
                                            }))}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 180 }}>
                                        <Input
                                            placeholder="Descripción"
                                            size="small"
                                            value={item.descripcion}
                                            onChange={e => actualizarItem(item._key, { descripcion: e.target.value })}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', width: 80 }}>
                                        <InputNumber
                                            min={0} size="small" style={{ width: '100%' }}
                                            value={item.cantidad}
                                            onChange={(v) => actualizarItem(item._key, { cantidad: Number(v) || 0 })}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 110 }}>
                                        <InputNumber
                                            min={0} size="small" style={{ width: '100%' }}
                                            value={item.valorUnitario}
                                            onChange={(v) => actualizarItem(item._key, { valorUnitario: Number(v) || 0 })}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 100 }}>
                                        <InputNumber
                                            min={0} size="small" style={{ width: '100%' }}
                                            value={item.descuento}
                                            onChange={(v) => actualizarItem(item._key, { descuento: Number(v) || 0 })}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 140 }}>
                                        <Select
                                            placeholder="—"
                                            allowClear
                                            size="small"
                                            style={{ width: '100%' }}
                                            value={item.impuestoCargo}
                                            onChange={(v) => actualizarItem(item._key, { impuestoCargo: v })}
                                            options={IMPUESTOS_CARGO.map(v => ({ value: v, label: v }))}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', minWidth: 160 }}>
                                        <Select
                                            placeholder="—"
                                            allowClear
                                            size="small"
                                            style={{ width: '100%' }}
                                            value={item.impuestoRetencion}
                                            onChange={(v) => actualizarItem(item._key, { impuestoRetencion: v })}
                                            options={IMPUESTOS_RETENCION.map(v => ({ value: v, label: v }))}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', fontWeight: 700, whiteSpace: 'nowrap', color: ROJO_OSCURO }}>
                                        {(item.valorTotal || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <Button
                                            type="text" danger size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => eliminarItem(item._key)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: 12 }}>
                    <Button
                        type="dashed" icon={<PlusOutlined />} onClick={agregarItem} block
                        style={{ borderColor: ROJO, color: ROJO }}
                    >
                        Agregar ítem
                    </Button>
                </div>
            </Card>

            <Row gutter={16}>
                {/* Formas de pago */}
                <Col xs={24} md={14}>
                    <Card
                        size="small"
                        title={<span style={{ color: ROJO_OSCURO, fontWeight: 700 }}>Formas de pago</span>}
                        style={{ borderRadius: 10, borderColor: '#ffe0e0' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={10}>
                            {formasPago.map(pago => (
                                <div key={pago._key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Select
                                        value={pago.metodo}
                                        onChange={(v: MetodoPago) => actualizarPago(pago._key, { metodo: v })}
                                        style={{ width: 180 }}
                                        options={Object.entries(METODO_PAGO_LABEL).map(([value, label]) => ({ value, label }))}
                                    />
                                    <InputNumber
                                        min={0}
                                        style={{ flex: 1 }}
                                        value={pago.valor}
                                        onChange={(v) => actualizarPago(pago._key, { valor: Number(v) || 0 })}
                                    />
                                    <Button
                                        type="text" danger icon={<DeleteOutlined />}
                                        onClick={() => eliminarFormaPago(pago._key)}
                                    />
                                </div>
                            ))}
                            <Button
                                type="link" icon={<PlusOutlined />} onClick={agregarFormaPago}
                                style={{ paddingLeft: 0, color: ROJO }}
                            >
                                Agregar otra forma de pago
                            </Button>
                        </Space>

                        {Math.abs(totales.totalFormasPago - totales.totalPagar) > 0.01 && (
                            <Tag color="orange" style={{ marginTop: 8 }}>
                                Diferencia con el total a pagar: $
                                {(totales.totalPagar - totales.totalFormasPago).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                            </Tag>
                        )}
                    </Card>
                </Col>

                {/* Totales */}
                <Col xs={24} md={10}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            <FilaTotal label="Total Bruto" valor={totales.totalBruto} />
                            <FilaTotal label="Descuentos" valor={totales.totalDescuentos} />
                            <FilaTotal label="Subtotal" valor={totales.subtotal} />
                            <FilaTotal label="IVA" valor={totales.totalIva} />
                            <FilaTotal label="Retención" valor={-totales.totalRetencion} />
                            <Divider style={{ margin: '8px 0' }} />
                            <FilaTotal label="Total a pagar" valor={totales.totalPagar} grande />
                        </Space>
                    </Card>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <Button block onClick={() => navigate('/compras')}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary" block
                            loading={guardando}
                            onClick={guardar}
                            style={{ background: ROJO, borderColor: ROJO, fontWeight: 600 }}
                        >
                            Guardar
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

function FilaTotal({ label, valor, grande }: { label: string; valor: number; grande?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: grande ? '#333' : '#888', fontWeight: grande ? 700 : 400, fontSize: grande ? 15 : 13 }}>
                {label}:
            </span>
            <span style={{ color: grande ? ROJO_OSCURO : '#333', fontWeight: grande ? 700 : 500, fontSize: grande ? 16 : 13 }}>
                ${valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </span>
        </div>
    )
}
