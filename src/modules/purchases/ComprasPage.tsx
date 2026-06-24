import { useState, useEffect, useCallback } from 'react'
import {
    Table, Button, Input, Tag, Space, Select, DatePicker, message,
    Popconfirm, Card, Row, Col, Statistic, Dropdown
} from 'antd'
import {
    SearchOutlined, PlusOutlined, DownOutlined, FileExcelOutlined,
    ShoppingCartOutlined, FileTextOutlined, StopOutlined, EyeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs, { Dayjs } from 'dayjs'
import { proveedorService } from '../../shared/services/proveedorService'
import type { Proveedor } from '../../shared/services/proveedorService'
import {
    compraService, TIPO_TRANSACCION_LABEL, ESTADO_COLOR,
    type Compra, type TipoTransaccion, type FiltrosCompra
} from '../../shared/services/compraService'

const RANGOS_RAPIDOS: { label: string; dias: number }[] = [
    { label: 'Hoy', dias: 0 },
    { label: 'Últimos 7 días', dias: 7 },
    { label: 'Últimos 15 días', dias: 15 },
    { label: 'Últimos 30 días', dias: 30 },
]

export default function ComprasPage() {
    const navigate = useNavigate()
    const [compras, setCompras] = useState<Compra[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true)

    // ── Filtros ──
    const [proveedorId, setProveedorId] = useState<number | undefined>()
    const [tipoTransaccion, setTipoTransaccion] = useState<TipoTransaccion | undefined>()
    const [rango, setRango] = useState<[Dayjs, Dayjs] | null>([
        dayjs().subtract(15, 'day'), dayjs()
    ])
    const [creadoPor, setCreadoPor] = useState('')
    const [rangoRapido, setRangoRapido] = useState('Últimos 15 días')

    // ── Carga inicial ──
    const cargarProveedores = useCallback(() => {
        proveedorService.listar()
            .then(({ data }) => setProveedores(data))
            .catch(() => { /* silencioso, no es crítico para la tabla */ })
    }, [])

    const buscar = useCallback(() => {
        setLoading(true)
        const filtros: FiltrosCompra = {
            proveedorId,
            tipoTransaccion,
            fechaInicio: rango?.[0]?.format('YYYY-MM-DD'),
            fechaFin: rango?.[1]?.format('YYYY-MM-DD'),
            creadoPor: creadoPor || undefined,
        }
        compraService.filtrar(filtros)
            .then(({ data }) => setCompras(data))
            .catch(() => message.error('Error al cargar las compras'))
            .finally(() => setLoading(false))
    }, [proveedorId, tipoTransaccion, rango, creadoPor])

    useEffect(() => {
        cargarProveedores()
        buscar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const limpiarFiltros = () => {
        setProveedorId(undefined)
        setTipoTransaccion(undefined)
        setCreadoPor('')
        setRango([dayjs().subtract(15, 'day'), dayjs()])
        setRangoRapido('Últimos 15 días')
        setTimeout(buscar, 0)
    }

    const aplicarRangoRapido = (label: string, dias: number) => {
        setRangoRapido(label)
        setRango([dayjs().subtract(dias, 'day'), dayjs()])
    }

    const anularCompra = async (compraId: number) => {
        try {
            await compraService.anular(compraId)
            message.success('Compra anulada')
            buscar()
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al anular la compra')
        }
    }

    // ── Estadísticas rápidas ──
    const totalRegistradas = compras.filter(c => c.estado === 'REGISTRADA').length
    const totalPagar = compras
        .filter(c => c.estado === 'REGISTRADA')
        .reduce((s, c) => s + (c.totalPagar || 0), 0)

    // ── Columnas ──
    const columnas = [
        {
            title: 'Tipo de transacción',
            dataIndex: 'tipoTransaccion',
            key: 'tipoTransaccion',
            render: (v: TipoTransaccion) => (
                <Tag
                    icon={v === 'FACTURA_COMPRA' ? <FileTextOutlined /> : <ShoppingCartOutlined />}
                    color={v === 'FACTURA_COMPRA' ? 'red' : 'volcano'}
                    style={{ borderRadius: 6 }}
                >
                    {TIPO_TRANSACCION_LABEL[v]}
                </Tag>
            )
        },
        {
            title: 'Comprobante',
            dataIndex: 'numeroComprobante',
            key: 'numeroComprobante',
            render: (v: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#e74c3c' }}>{v}</span>
        },
        {
            title: 'Factura proveedor',
            dataIndex: 'numeroComprobante',
            key: 'facturaProveedor',
            render: () => <span style={{ color: '#999' }}>—</span>
        },
        {
            title: 'Fecha elaboración',
            dataIndex: 'fechaElaboracion',
            key: 'fechaElaboracion',
            render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—'
        },
        {
            title: 'Identificación',
            key: 'identificacion',
            render: (_: any, record: Compra) => {
                const prov = proveedores.find(p => p.proveedorId === record.proveedorId)
                return prov?.nit || '—'
            }
        },
        {
            title: 'Sucursal',
            dataIndex: 'sucursal',
            key: 'sucursal',
            render: (v: string) => v || '—'
        },
        {
            title: 'Proveedor',
            dataIndex: 'proveedorNombre',
            key: 'proveedorNombre',
            render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>
        },
        {
            title: 'Total a pagar',
            dataIndex: 'totalPagar',
            key: 'totalPagar',
            render: (v: number) => v != null
                ? <span style={{ fontWeight: 700 }}>${v.toLocaleString('es-CO')}</span>
                : '—'
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (v: Compra['estado']) => v ? <Tag color={ESTADO_COLOR[v]}>{v}</Tag> : '—'
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: Compra) => (
                <Space>
                    <Button
                        type="text" icon={<EyeOutlined />}
                        onClick={() => navigate(`/compras/ver/${record.compraId}`)}
                    />
                    {record.estado === 'REGISTRADA' && (
                        <Popconfirm
                            title="¿Anular esta compra?"
                            description="Esta acción no se puede deshacer"
                            onConfirm={() => anularCompra(record.compraId!)}
                            okText="Sí, anular" cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" icon={<StopOutlined />} danger />
                        </Popconfirm>
                    )}
                </Space>
            )
        },
    ]

    const opcionesNuevo = [
        { key: 'FACTURA_COMPRA', label: 'Factura de compra', icon: <FileTextOutlined /> },
        { key: 'RECIBO_EGRESO', label: 'Recibo / Egreso', icon: <ShoppingCartOutlined /> },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#c0392b', margin: 0 }}>
                        Compras, Gastos y Documento Soporte
                    </h2>
                    <p style={{ color: '#888', margin: 0, fontSize: 13 }}>
                        {compras.length} transacciones encontradas
                    </p>
                </div>
                <Dropdown
                    menu={{
                        items: opcionesNuevo,
                        onClick: ({ key }) => navigate(`/compras/nueva?tipo=${key}`)
                    }}
                >
                    <Button type="primary" style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600 }}>
                        Nueva Compra / Gasto / Doc Soporte <DownOutlined />
                    </Button>
                </Dropdown>
            </div>

            {/* Tarjetas resumen */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={12} sm={8}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic title="Transacciones registradas" value={totalRegistradas} valueStyle={{ color: '#e74c3c', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic
                            title="Total a pagar (periodo)"
                            value={totalPagar}
                            formatter={v => `$${Number(v).toLocaleString('es-CO')}`}
                            valueStyle={{ color: '#52c41a', fontWeight: 700, fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic title="Proveedores activos" value={proveedores.filter(p => p.activo).length} valueStyle={{ color: '#c0392b', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            {/* Panel de filtros (igual a la imagen) */}
            <Card size="small" style={{ borderRadius: 10, marginBottom: 16, borderColor: '#ffe0e0' }}>
                <Row gutter={[16, 12]}>
                    <Col xs={24} md={12}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Proveedor</div>
                        <Select
                            placeholder="Buscar"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            value={proveedorId}
                            onChange={setProveedorId}
                            style={{ width: '100%' }}
                            options={proveedores.map(p => ({
                                value: p.proveedorId,
                                label: `${p.nombre} · ${p.nit}`
                            }))}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Fecha elaboración</div>
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                value={rangoRapido}
                                onChange={(label) => {
                                    const opt = RANGOS_RAPIDOS.find(r => r.label === label)
                                    if (opt) aplicarRangoRapido(opt.label, opt.dias)
                                }}
                                style={{ width: 160 }}
                                options={RANGOS_RAPIDOS.map(r => ({ value: r.label, label: r.label }))}
                            />
                            <DatePicker.RangePicker
                                value={rango}
                                onChange={(v) => setRango(v as [Dayjs, Dayjs] | null)}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                            />
                        </Space.Compact>
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Tipo de transacción</div>
                        <Select
                            placeholder="Todos"
                            allowClear
                            value={tipoTransaccion}
                            onChange={setTipoTransaccion}
                            style={{ width: '100%' }}
                            options={[
                                { value: 'FACTURA_COMPRA', label: 'Factura de compra' },
                                { value: 'RECIBO_EGRESO', label: 'Recibo / Egreso' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Creado por</div>
                        <Input
                            placeholder="Buscar"
                            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                            value={creadoPor}
                            onChange={e => setCreadoPor(e.target.value)}
                            allowClear
                        />
                    </Col>
                </Row>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button
                        type="primary" icon={<SearchOutlined />} onClick={buscar} loading={loading}
                        style={{ background: '#e74c3c', borderColor: '#e74c3c' }}
                    >
                        Buscar
                    </Button>
                    <Button onClick={limpiarFiltros}>
                        Limpiar filtros
                    </Button>
                </div>
            </Card>

            {/* Tabla */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Button icon={<FileExcelOutlined />} size="small">
                    Exportar
                </Button>
            </div>

            <Table
                dataSource={compras}
                rowKey="compraId"
                columns={columnas}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `${t} registros` }}
                style={{ background: '#fff', borderRadius: 12 }}
                scroll={{ x: 1100 }}
                size="middle"
            />
        </div>
    )
}
