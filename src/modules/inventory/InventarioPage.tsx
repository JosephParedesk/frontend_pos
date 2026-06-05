import { useState } from 'react'
import { Table, Button, Input, Tag, Space, Modal, Form, InputNumber, Select, message, Popconfirm } from 'antd'
import {
    PlusOutlined, SearchOutlined, EditOutlined,
    DeleteOutlined, WarningOutlined, InboxOutlined
} from '@ant-design/icons'

interface Producto {
    key: number
    id: number
    sku: string
    nombre: string
    categoria: string
    precio: number
    stock: number
    stockMinimo: number
    unidad: string
    activo: boolean
}

const categoriasOpciones = ['Bebidas', 'Alimentos', 'Limpieza', 'Papelería', 'Electrónica', 'Ropa', 'Otro']
const unidadesOpciones = ['Unidad', 'Kilogramo', 'Litro', 'Caja', 'Paquete', 'Metro']

const productosIniciales: Producto[] = [
    { key: 1, id: 1, sku: 'PRD-001', nombre: 'Coca Cola 350ml', categoria: 'Bebidas', precio: 2500, stock: 120, stockMinimo: 20, unidad: 'Unidad', activo: true },
    { key: 2, id: 2, sku: 'PRD-002', nombre: 'Pan tajado', categoria: 'Alimentos', precio: 8900, stock: 15, stockMinimo: 10, unidad: 'Unidad', activo: true },
    { key: 3, id: 3, sku: 'PRD-003', nombre: 'Detergente 1kg', categoria: 'Limpieza', precio: 12500, stock: 5, stockMinimo: 8, unidad: 'Kilogramo', activo: true },
    { key: 4, id: 4, sku: 'PRD-004', nombre: 'Cuaderno 100 hojas', categoria: 'Papelería', precio: 4500, stock: 45, stockMinimo: 15, unidad: 'Unidad', activo: true },
    { key: 5, id: 5, sku: 'PRD-005', nombre: 'Agua Cristal 600ml', categoria: 'Bebidas', precio: 1800, stock: 200, stockMinimo: 30, unidad: 'Unidad', activo: true },
]

export default function InventarioPage() {
    const [productos, setProductos] = useState<Producto[]>(productosIniciales)
    const [busqueda, setBusqueda] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [editando, setEditando] = useState<Producto | null>(null)
    const [form] = Form.useForm()

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    )

    const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo)

    const abrirModal = (producto?: Producto) => {
        if (producto) {
            setEditando(producto)
            form.setFieldsValue(producto)
        } else {
            setEditando(null)
            form.resetFields()
            form.setFieldsValue({
                sku: `PRD-00${productos.length + 1}`,
                activo: true,
            })
        }
        setModalVisible(true)
    }

    const guardarProducto = (values: any) => {
        if (editando) {
            setProductos(prev => prev.map(p =>
                p.id === editando.id ? { ...p, ...values } : p
            ))
            message.success('Producto actualizado')
        } else {
            const nuevo: Producto = {
                ...values,
                key: Date.now(),
                id: Date.now(),
            }
            setProductos(prev => [...prev, nuevo])
            message.success('Producto creado')
        }
        setModalVisible(false)
        form.resetFields()
    }

    const eliminarProducto = (id: number) => {
        setProductos(prev => prev.filter(p => p.id !== id))
        message.success('Producto eliminado')
    }

    const columnas = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (v: string) => <span style={{ fontWeight: 600, color: '#e74c3c', fontFamily: 'monospace' }}>{v}</span>
        },
        {
            title: 'Producto',
            dataIndex: 'nombre',
            key: 'nombre',
            render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>
        },
        {
            title: 'Categoría',
            dataIndex: 'categoria',
            key: 'categoria',
            render: (v: string) => <Tag color="red" style={{ borderRadius: 6 }}>{v}</Tag>
        },
        {
            title: 'Precio',
            dataIndex: 'precio',
            key: 'precio',
            render: (v: number) => <span style={{ fontWeight: 600 }}>${v.toLocaleString('es-CO')}</span>
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: (v: number, record: Producto) => (
                <Space>
                    <span style={{
                        fontWeight: 700,
                        color: v <= record.stockMinimo ? '#e74c3c' : v <= record.stockMinimo * 2 ? '#fa8c16' : '#52c41a'
                    }}>
                        {v}
                    </span>
                    {v <= record.stockMinimo && <WarningOutlined style={{ color: '#e74c3c' }} />}
                </Space>
            )
        },
        {
            title: 'Unidad',
            dataIndex: 'unidad',
            key: 'unidad',
            render: (v: string) => <Tag>{v}</Tag>
        },
        {
            title: 'Estado',
            dataIndex: 'activo',
            key: 'activo',
            render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Activo' : 'Inactivo'}</Tag>
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: Producto) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => abrirModal(record)}
                        style={{ color: '#e74c3c' }}
                    />
                    <Popconfirm
                        title="¿Eliminar producto?"
                        description="Esta acción no se puede deshacer"
                        onConfirm={() => eliminarProducto(record.id)}
                        okText="Sí, eliminar"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        },
    ]

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#c0392b', margin: 0 }}>
                        <InboxOutlined style={{ marginRight: 8 }} />
                        Inventario
                    </h2>
                    <p style={{ color: '#888', margin: 0, fontSize: 13 }}>
                        {productos.length} productos registrados
                        {productosStockBajo.length > 0 && (
                            <span style={{ color: '#e74c3c', marginLeft: 8, fontWeight: 600 }}>
                                · {productosStockBajo.length} con stock bajo
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => abrirModal()}
                    style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600 }}
                >
                    Nuevo producto
                </Button>
            </div>

            {/* Alerta stock bajo */}
            {productosStockBajo.length > 0 && (
                <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarningOutlined style={{ color: '#e74c3c' }} />
                    <span style={{ color: '#e74c3c', fontWeight: 500 }}>
                        Stock bajo: {productosStockBajo.map(p => p.nombre).join(', ')}
                    </span>
                </div>
            )}

            {/* Buscador */}
            <Input
                placeholder="Buscar por nombre, SKU o categoría..."
                prefix={<SearchOutlined style={{ color: '#e74c3c' }} />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ marginBottom: 16, borderRadius: 8, maxWidth: 400 }}
                allowClear
            />

            {/* Tabla */}
            <Table
                dataSource={productosFiltrados}
                columns={columnas}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                style={{ background: '#fff', borderRadius: 12 }}
                scroll={{ x: 800 }}
            />

            {/* Modal crear/editar */}
            <Modal
                title={
                    <span style={{ color: '#c0392b', fontWeight: 700 }}>
                        {editando ? 'Editar producto' : 'Nuevo producto'}
                    </span>
                }
                open={modalVisible}
                onCancel={() => { setModalVisible(false); form.resetFields() }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={guardarProducto} style={{ marginTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Requerido' }]}>
                            <Input placeholder="PRD-001" style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <Form.Item name="categoria" label="Categoría" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Selecciona" style={{ borderRadius: 8 }}>
                                {categoriasOpciones.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="nombre" label="Nombre del producto" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input placeholder="Ej: Coca Cola 350ml" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="precio" label="Precio de venta" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber
                                placeholder="0"
                                style={{ width: '100%', borderRadius: 8 }}
                                formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                min={0}
                            />
                        </Form.Item>
                        <Form.Item name="unidad" label="Unidad de medida" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Selecciona">
                                {unidadesOpciones.map(u => <Select.Option key={u} value={u}>{u}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="stock" label="Stock actual" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber placeholder="0" style={{ width: '100%', borderRadius: 8 }} min={0} />
                        </Form.Item>
                        <Form.Item name="stockMinimo" label="Stock mínimo" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber placeholder="0" style={{ width: '100%', borderRadius: 8 }} min={0} />
                        </Form.Item>
                    </div>

                    <Form.Item name="activo" label="Estado" initialValue={true}>
                        <Select>
                            <Select.Option value={true}>Activo</Select.Option>
                            <Select.Option value={false}>Inactivo</Select.Option>
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button onClick={() => { setModalVisible(false); form.resetFields() }}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8 }}
                        >
                            {editando ? 'Guardar cambios' : 'Crear producto'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}