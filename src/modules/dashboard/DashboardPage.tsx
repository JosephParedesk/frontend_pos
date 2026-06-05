import { Card, Row, Col, Table, Tag, Alert, Badge } from 'antd'
import {
    ArrowUpOutlined, ArrowDownOutlined, ShoppingCartOutlined,
    InboxOutlined, TeamOutlined, FileTextOutlined, WarningOutlined
} from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ventasSemana = [
    { dia: 'Lun', ventas: 850000 },
    { dia: 'Mar', ventas: 1200000 },
    { dia: 'Mié', ventas: 980000 },
    { dia: 'Jue', ventas: 1450000 },
    { dia: 'Vie', ventas: 1800000 },
    { dia: 'Sáb', ventas: 2100000 },
    { dia: 'Hoy', ventas: 1250000 },
]

const ultimasVentas = [
    { key: 1, factura: 'FV-001', cliente: 'Juan García', total: 250000, estado: 'Pagada', hora: '10:30' },
    { key: 2, factura: 'FV-002', cliente: 'María López', total: 180000, estado: 'Pagada', hora: '11:15' },
    { key: 3, factura: 'FV-003', cliente: 'Carlos Ruiz', total: 420000, estado: 'Pendiente', hora: '12:00' },
    { key: 4, factura: 'FV-004', cliente: 'Ana Martínez', total: 95000, estado: 'Pagada', hora: '13:45' },
    { key: 5, factura: 'FV-005', cliente: 'Pedro Soto', total: 305000, estado: 'Pendiente', hora: '14:20' },
]

const kpis = [
    {
        titulo: 'Ventas hoy',
        valor: '$1.250.000',
        cambio: '+12%',
        positivo: true,
        icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#e74c3c' }} />,
        sub: '18 transacciones',
    },
    {
        titulo: 'Productos',
        valor: '142',
        cambio: '8 bajo stock',
        positivo: false,
        icon: <InboxOutlined style={{ fontSize: 28, color: '#e74c3c' }} />,
        sub: 'En inventario',
    },
    {
        titulo: 'Clientes',
        valor: '89',
        cambio: '+3 hoy',
        positivo: true,
        icon: <TeamOutlined style={{ fontSize: 28, color: '#e74c3c' }} />,
        sub: 'Registrados',
    },
    {
        titulo: 'Por cobrar',
        valor: '$450.000',
        cambio: '5 facturas',
        positivo: false,
        icon: <FileTextOutlined style={{ fontSize: 28, color: '#e74c3c' }} />,
        sub: 'Pendientes',
    },
]

const columnas = [
    { title: 'Factura', dataIndex: 'factura', key: 'factura', render: (v: string) => <span style={{ fontWeight: 600, color: '#e74c3c' }}>{v}</span> },
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (v: string) => <Tag color={v === 'Pagada' ? 'green' : 'orange'}>{v}</Tag> },
    { title: 'Hora', dataIndex: 'hora', key: 'hora' },
]

export default function DashboardPage() {
    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#c0392b', marginBottom: 24 }}>
                Buenos días 👋 — Resumen del día
            </h2>

            {/* Alertas */}
            <Alert
                message="8 productos tienen stock bajo — revisa el inventario"
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                closable
                style={{ marginBottom: 20, borderRadius: 8 }}
            />

            {/* KPIs */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {kpis.map((kpi, i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <Card style={{ borderRadius: 12, border: '1px solid #ffe0e0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#888', margin: 0, fontSize: 13 }}>{kpi.titulo}</p>
                                    <p style={{ fontSize: 26, fontWeight: 800, color: '#222', margin: '4px 0' }}>{kpi.valor}</p>
                                    <p style={{ margin: 0, fontSize: 13, color: kpi.positivo ? '#52c41a' : '#fa8c16', fontWeight: 500 }}>
                                        {kpi.positivo ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {kpi.cambio}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{kpi.sub}</p>
                                </div>
                                <div style={{ background: '#fff5f5', borderRadius: 12, padding: 12 }}>
                                    {kpi.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                {/* Gráfica */}
                <Col xs={24} lg={14}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#333' }}>Ventas últimos 7 días</span>}
                        style={{ borderRadius: 12, border: '1px solid #ffe0e0' }}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={ventasSemana}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffe0e0" />
                                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: number) => [`$${v.toLocaleString('es-CO')}`, 'Ventas']} />
                                <Line type="monotone" dataKey="ventas" stroke="#e74c3c" strokeWidth={2.5} dot={{ fill: '#e74c3c', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Últimas ventas */}
                <Col xs={24} lg={10}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#333' }}>Últimas ventas</span>}
                        style={{ borderRadius: 12, border: '1px solid #ffe0e0' }}
                    >
                        <Table
                            dataSource={ultimasVentas}
                            columns={columnas}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}