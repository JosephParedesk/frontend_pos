import { useState, useEffect, useCallback } from 'react'
import {
    Table, Button, Input, Tag, Space, Modal, Form, InputNumber,
    Select, message, Popconfirm, Upload, Tooltip, Statistic, Row, Col, Card, Tabs, Badge, Divider
} from 'antd'
import {
    PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
    WarningOutlined, InboxOutlined, UploadOutlined, PictureOutlined,
    ShopOutlined, TagsOutlined, ArrowUpOutlined, ArrowDownOutlined,
    ReloadOutlined, PercentageOutlined, DollarOutlined
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { productoService, calcularGanancia } from '../../shared/services/inventarioService'
import type { Producto, ProductoRequest } from '../../shared/services/inventarioService'
import { proveedorService } from '../../shared/services/proveedorService'
import type { Proveedor } from '../../shared/services/proveedorService'
import { categoriaService } from '../../shared/services/categoriaService'
import type { Categoria } from '../../shared/services/categoriaService'

const UNIDADES = ['Unidad', 'Kilogramo', 'Litro', 'Caja', 'Paquete', 'Metro', 'Gramo', 'Mililitro']

// Emojis sugeridos para el ícono de categoría (campo "icono" del backend, texto libre)
const ICONOS_SUGERIDOS = ['🥤', '🍞', '🧴', '📎', '💻', '🧀', '🥩', '🧹', '🚗', '👕', '💊', '🔧']

// ─── Componente imagen producto ────────────────────────────────────────────────
function ImagenProducto({ url, nombre }: { url?: string; nombre: string }) {
    if (url) {
        return (
            <img
                src={url}
                alt={nombre}
                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
            />
        )
    }
    return (
        <div style={{
            width: 40, height: 40, borderRadius: 8, background: '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px dashed #d9d9d9'
        }}>
            <PictureOutlined style={{ color: '#bbb', fontSize: 16 }} />
        </div>
    )
}

// ─── Panel gestión de categorías (microservicio real) ──────────────────────────
function CategoriasPanel({
    categorias, loading, onActualizar
}: {
    categorias: Categoria[]
    loading: boolean
    onActualizar: () => void
}) {
    const [modalVisible, setModalVisible] = useState(false)
    const [editando, setEditando] = useState<Categoria | null>(null)
    const [guardando, setGuardando] = useState(false)
    const [form] = Form.useForm()

    const abrirModal = (cat?: Categoria) => {
        setEditando(cat || null)
        form.setFieldsValue(cat || { activo: true, icono: '🏷️' })
        setModalVisible(true)
    }

    const guardar = async (values: any) => {
        setGuardando(true)
        try {
            if (editando) {
                await categoriaService.actualizar(editando.categoriaId, values)
                message.success('Categoría actualizada')
            } else {
                await categoriaService.guardar({ ...values, activo: true })
                message.success('Categoría creada')
            }
            setModalVisible(false)
            form.resetFields()
            onActualizar()
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al guardar la categoría')
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id: number) => {
        try {
            await categoriaService.eliminar(id)
            message.success('Categoría eliminada')
            onActualizar()
        } catch {
            message.error('Error al eliminar la categoría')
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>
                    {categorias.length} categorías registradas
                </span>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => abrirModal()}
                    style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8 }}
                    size="small"
                >
                    Nueva categoría
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {categorias.map(cat => (
                    <div key={cat.categoriaId} style={{
                        background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10,
                        padding: '12px 16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        opacity: cat.activo ? 1 : 0.5
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 20 }}>{cat.icono || '🏷️'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{cat.nombre}</div>
                                {cat.descripcion && (
                                    <div style={{ fontSize: 11, color: '#999' }}>{cat.descripcion}</div>
                                )}
                                {!cat.activo && <Tag color="default" style={{ fontSize: 10, marginTop: 2 }}>Inactiva</Tag>}
                            </div>
                        </div>
                        <Space size={4}>
                            <Button
                                type="text" size="small" icon={<EditOutlined />}
                                onClick={() => abrirModal(cat)}
                                style={{ color: '#e74c3c' }}
                            />
                            <Popconfirm
                                title="¿Eliminar categoría?"
                                onConfirm={() => eliminar(cat.categoriaId)}
                                okText="Sí" cancelText="No"
                                okButtonProps={{ danger: true }}
                            >
                                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                        </Space>
                    </div>
                ))}
                {!loading && categorias.length === 0 && (
                    <div style={{ color: '#999', fontSize: 13, padding: 16 }}>
                        No hay categorías registradas todavía.
                    </div>
                )}
            </div>

            <Modal
                title={
                    <span style={{ color: '#c0392b', fontWeight: 700 }}>
                        {editando ? 'Editar categoría' : 'Nueva categoría'}
                    </span>
                }
                open={modalVisible}
                onCancel={() => { setModalVisible(false); form.resetFields() }}
                footer={null}
                width={420}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={guardar} style={{ marginTop: 16 }}>
                    <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input placeholder="Ej: Bebidas" style={{ borderRadius: 8 }} />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción (opcional)">
                        <Input placeholder="Descripción breve" style={{ borderRadius: 8 }} />
                    </Form.Item>
                    <Form.Item name="icono" label="Ícono">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {ICONOS_SUGERIDOS.map(emoji => (
                                <div
                                    key={emoji}
                                    onClick={() => form.setFieldValue('icono', emoji)}
                                    style={{
                                        width: 34, height: 34, borderRadius: 8, fontSize: 18,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', border: '1px solid #f0f0f0', background: '#fafafa'
                                    }}
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>
                    </Form.Item>
                    {editando && (
                        <Form.Item name="activo" label="Estado">
                            <Select>
                                <Select.Option value={true}>Activa</Select.Option>
                                <Select.Option value={false}>Inactiva</Select.Option>
                            </Select>
                        </Form.Item>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button onClick={() => { setModalVisible(false); form.resetFields() }}>Cancelar</Button>
                        <Button
                            type="primary" htmlType="submit" loading={guardando}
                            style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8 }}
                        >
                            {editando ? 'Guardar cambios' : 'Crear categoría'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function InventarioPage() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingCategorias, setLoadingCategorias] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroCat, setFiltroCat] = useState<number | undefined>()
    const [modalVisible, setModalVisible] = useState(false)
    const [editando, setEditando] = useState<Producto | null>(null)
    const [loadingModal, setLoadingModal] = useState(false)
    const [imagenPreview, setImagenPreview] = useState<string | undefined>()
    const [imagenFile, setImagenFile] = useState<File | undefined>()
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [precioCompra, setPrecioCompra] = useState(0)
    const [precioVenta, setPrecioVenta] = useState(0)
    const [activeTab, setActiveTab] = useState('productos')
    const [form] = Form.useForm()

    const ganancia = calcularGanancia(precioCompra, precioVenta)

    // ── Carga de datos ──
    const cargarProductos = useCallback(() => {
        setLoading(true)
        productoService.listar()
            .then(({ data }) => setProductos(data))
            .catch(() => message.error('Error al cargar los productos'))
            .finally(() => setLoading(false))
    }, [])

    const cargarCategorias = useCallback(() => {
        setLoadingCategorias(true)
        categoriaService.listar()
            .then(({ data }) => setCategorias(data))
            .catch(() => message.error('Error al cargar las categorías'))
            .finally(() => setLoadingCategorias(false))
    }, [])

    const cargarProveedores = useCallback(() => {
        proveedorService.listar()
            .then(({ data }) => setProveedores(data))
            .catch(() => { /* no crítico para listar productos */ })
    }, [])

    useEffect(() => {
        cargarProductos()
        cargarCategorias()
        cargarProveedores()
    }, [cargarProductos, cargarCategorias, cargarProveedores])

    // ── Helpers de nombre por id ──
    const nombreProveedor = (proveedorId?: string) =>
        proveedores.find(p => String(p.proveedorId) === proveedorId)?.nombre

    const categoriaDe = (categoriaId?: string) =>
        categorias.find(c => String(c.categoriaId) === categoriaId)

    // ── Filtros ──
    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = !busqueda ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.sku.toLowerCase().includes(busqueda.toLowerCase())
        const matchCat = !filtroCat || p.categoriaId === String(filtroCat)
        return matchBusqueda && matchCat
    })

    const stockBajo = productos.filter(p => p.stock <= p.stockMinimo)

    // ── Estadísticas ──
    const valorInventario = productos.reduce((s, p) => s + p.precioVenta * p.stock, 0)
    const gananciaPotencial = productos.reduce((s, p) => s + (p.precioVenta - p.precioCompra) * p.stock, 0)

    // ── Modal producto ──
    const abrirModal = (producto?: Producto) => {
        setImagenPreview(undefined)
        setImagenFile(undefined)
        setFileList([])
        if (producto) {
            setEditando(producto)
            setPrecioCompra(producto.precioCompra)
            setPrecioVenta(producto.precioVenta)
            form.setFieldsValue({
                ...producto,
                categoriaId: producto.categoriaId ? Number(producto.categoriaId) : undefined,
                proveedorId: producto.proveedorId ? Number(producto.proveedorId) : undefined,
            })
            if (producto.imagenUrl) setImagenPreview(producto.imagenUrl)
        } else {
            setEditando(null)
            setPrecioCompra(0)
            setPrecioVenta(0)
            form.resetFields()
            form.setFieldsValue({ activo: true, stock: 0, stockMinimo: 5, unidad: 'Unidad' })
        }
        setModalVisible(true)
    }

    const guardarProducto = async (values: any) => {
        setLoadingModal(true)
        try {
            const request: ProductoRequest = {
                sku: values.sku,
                nombre: values.nombre,
                descripcion: values.descripcion,
                categoriaId: values.categoriaId != null ? String(values.categoriaId) : undefined,
                proveedorId: values.proveedorId != null ? String(values.proveedorId) : undefined,
                precioCompra: values.precioCompra || 0,
                precioVenta: values.precioVenta || 0,
                stock: values.stock || 0,
                stockMinimo: values.stockMinimo || 0,
                unidad: values.unidad,
                activo: values.activo,
                imagenUrl: editando?.imagenUrl,
            }

            if (editando) {
                await productoService.actualizar(editando.sku, request)
                message.success('Producto actualizado')
            } else {
                await productoService.guardar(request)
                message.success('Producto creado')
            }

            if (imagenFile) {
                try {
                    await productoService.subirImagen?.(request.sku, imagenFile)
                } catch {
                    message.warning('El producto se guardó, pero la imagen no se pudo subir')
                }
            }

            setModalVisible(false)
            form.resetFields()
            cargarProductos()
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al guardar el producto')
        } finally {
            setLoadingModal(false)
        }
    }

    const eliminarProducto = async (sku: string) => {
        try {
            await productoService.eliminar(sku)
            message.success('Producto eliminado')
            cargarProductos()
        } catch {
            message.error('Error al eliminar el producto')
        }
    }

    // ── Upload imagen ──
    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/')
            if (!isImage) { message.error('Solo se permiten imágenes'); return false }
            const isLt2M = file.size / 1024 / 1024 < 2
            if (!isLt2M) { message.error('La imagen debe ser menor a 2MB'); return false }
            setImagenFile(file)
            const reader = new FileReader()
            reader.onload = (e) => setImagenPreview(e.target?.result as string)
            reader.readAsDataURL(file)
            return false
        },
        fileList,
        onChange: ({ fileList: fl }) => setFileList(fl.slice(-1)),
        showUploadList: false,
    }

    // ── Columnas tabla ──
    const columnas = [
        {
            title: '',
            key: 'imagen',
            width: 56,
            render: (_: any, record: Producto) => (
                <ImagenProducto url={record.imagenUrl} nombre={record.nombre} />
            )
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 110,
            render: (v: string) => (
                <span style={{ fontWeight: 600, color: '#e74c3c', fontFamily: 'monospace', fontSize: 12 }}>{v}</span>
            )
        },
        {
            title: 'Producto',
            dataIndex: 'nombre',
            key: 'nombre',
            render: (v: string, record: Producto) => {
                const prov = nombreProveedor(record.proveedorId)
                return (
                    <div>
                        <div style={{ fontWeight: 600, color: '#333' }}>{v}</div>
                        {prov && (
                            <div style={{ fontSize: 11, color: '#999' }}>
                                <ShopOutlined style={{ marginRight: 3 }} />{prov}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            title: 'Categoría',
            dataIndex: 'categoriaId',
            key: 'categoria',
            render: (categoriaId: string) => {
                const cat = categoriaDe(categoriaId)
                if (!cat) return <Tag style={{ borderRadius: 6 }}>Sin categoría</Tag>
                return (
                    <Tag style={{ borderRadius: 6, background: '#fff0f0', borderColor: '#ffd6d6', color: '#c0392b', fontWeight: 500 }}>
                        {cat.icono ? `${cat.icono} ` : ''}{cat.nombre}
                    </Tag>
                )
            }
        },
        {
            title: 'Precio compra',
            dataIndex: 'precioCompra',
            key: 'precioCompra',
            render: (v: number) => (
                <span style={{ color: '#888', fontSize: 13 }}>${v.toLocaleString('es-CO')}</span>
            )
        },
        {
            title: 'Precio venta',
            dataIndex: 'precioVenta',
            key: 'precioVenta',
            render: (v: number) => (
                <span style={{ fontWeight: 700, color: '#2c3e50' }}>${v.toLocaleString('es-CO')}</span>
            )
        },
        {
            title: 'Ganancia',
            key: 'ganancia',
            render: (_: any, record: Producto) => {
                const g = calcularGanancia(record.precioCompra, record.precioVenta)
                return (
                    <Tooltip title={`$${g.pesos.toLocaleString('es-CO')} por unidad`}>
                        <Tag
                            color={g.porcentaje >= 20 ? 'green' : g.porcentaje >= 0 ? 'orange' : 'red'}
                            style={{ borderRadius: 6, fontWeight: 600 }}
                        >
                            {g.porcentaje >= 0
                                ? <ArrowUpOutlined style={{ fontSize: 10 }} />
                                : <ArrowDownOutlined style={{ fontSize: 10 }} />
                            }
                            {' '}{Math.abs(g.porcentaje).toFixed(1)}%
                        </Tag>
                    </Tooltip>
                )
            }
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
                        {v} {record.unidad}
                    </span>
                    {v <= record.stockMinimo && <WarningOutlined style={{ color: '#e74c3c', fontSize: 12 }} />}
                </Space>
            )
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
                        type="text" icon={<EditOutlined />}
                        onClick={() => abrirModal(record)}
                        style={{ color: '#e74c3c' }}
                    />
                    <Popconfirm
                        title="¿Eliminar producto?"
                        description="Esta acción no se puede deshacer"
                        onConfirm={() => eliminarProducto(record.sku)}
                        okText="Sí, eliminar" cancelText="Cancelar"
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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#c0392b', margin: 0 }}>
                        <InboxOutlined style={{ marginRight: 8 }} />
                        Inventario
                    </h2>
                    <p style={{ color: '#888', margin: 0, fontSize: 13 }}>
                        {productos.length} productos registrados
                        {stockBajo.length > 0 && (
                            <span style={{ color: '#e74c3c', marginLeft: 8, fontWeight: 600 }}>
                                · <WarningOutlined /> {stockBajo.length} con stock bajo
                            </span>
                        )}
                    </p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={cargarProductos} style={{ borderRadius: 8 }}>
                        Actualizar
                    </Button>
                    <Button
                        type="primary" icon={<PlusOutlined />}
                        onClick={() => { setActiveTab('productos'); abrirModal() }}
                        style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600 }}
                    >
                        Nuevo producto
                    </Button>
                </Space>
            </div>

            {/* Tarjetas resumen */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic
                            title="Productos activos"
                            value={productos.filter(p => p.activo).length}
                            prefix={<InboxOutlined style={{ color: '#e74c3c' }} />}
                            styles={{ content: { color: '#e74c3c', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic
                            title="Stock bajo"
                            value={stockBajo.length}
                            prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
                            styles={{ content: { color: stockBajo.length > 0 ? '#fa8c16' : '#52c41a', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic
                            title="Valor inventario"
                            value={valorInventario}
                            prefix={<DollarOutlined style={{ color: '#e74c3c' }} />}
                            formatter={v => `$${Number(v).toLocaleString('es-CO')}`}
                            styles={{ content: { color: '#c0392b', fontWeight: 700, fontSize: 15 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#ffe0e0' }}>
                        <Statistic
                            title="Ganancia potencial"
                            value={gananciaPotencial}
                            prefix={<PercentageOutlined style={{ color: '#52c41a' }} />}
                            formatter={v => `$${Number(v).toLocaleString('es-CO')}`}
                            styles={{ content: { color: '#52c41a', fontWeight: 700, fontSize: 15 } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alerta stock bajo */}
            {stockBajo.length > 0 && (
                <div style={{
                    background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8,
                    padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <WarningOutlined style={{ color: '#e74c3c' }} />
                    <span style={{ color: '#e74c3c', fontWeight: 500, fontSize: 13 }}>
                        Stock bajo: {stockBajo.map(p => p.nombre).join(', ')}
                    </span>
                </div>
            )}

            {/* Tabs: Productos / Categorías */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'productos',
                        label: (
                            <span>
                                <InboxOutlined /> Productos
                                <Badge count={productos.length} style={{ marginLeft: 6, background: '#e74c3c' }} />
                            </span>
                        ),
                        children: (
                            <div>
                                {/* Filtros */}
                                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                    <Input
                                        placeholder="Buscar por nombre o SKU..."
                                        prefix={<SearchOutlined style={{ color: '#e74c3c' }} />}
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        style={{ borderRadius: 8, maxWidth: 340 }}
                                        allowClear
                                    />
                                    <Select
                                        placeholder="Filtrar por categoría"
                                        allowClear
                                        value={filtroCat}
                                        onChange={setFiltroCat}
                                        style={{ width: 200, borderRadius: 8 }}
                                        options={categorias.map(c => ({
                                            value: c.categoriaId,
                                            label: `${c.icono ? c.icono + ' ' : ''}${c.nombre}`
                                        }))}
                                    />
                                </div>

                                <Table
                                    dataSource={productosFiltrados}
                                    rowKey="sku"
                                    columns={columnas}
                                    loading={loading}
                                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `${t} productos` }}
                                    style={{ background: '#fff', borderRadius: 12 }}
                                    scroll={{ x: 900 }}
                                    size="middle"
                                />
                            </div>
                        )
                    },
                    {
                        key: 'categorias',
                        label: (
                            <span>
                                <TagsOutlined /> Categorías
                                <Badge count={categorias.length} style={{ marginLeft: 6, background: '#9b59b6' }} />
                            </span>
                        ),
                        children: (
                            <CategoriasPanel
                                categorias={categorias}
                                loading={loadingCategorias}
                                onActualizar={cargarCategorias}
                            />
                        )
                    }
                ]}
            />

            {/* ── Modal crear/editar producto ── */}
            <Modal
                title={
                    <span style={{ color: '#c0392b', fontWeight: 700 }}>
                        {editando ? 'Editar producto' : 'Nuevo producto'}
                    </span>
                }
                open={modalVisible}
                onCancel={() => { setModalVisible(false); form.resetFields() }}
                footer={null}
                width={680}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={guardarProducto} style={{ marginTop: 12 }}>
                    {/* Imagen */}
                    <Form.Item label="Imagen del producto">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 10,
                                border: '2px dashed #d9d9d9', overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#fafafa', flexShrink: 0
                            }}>
                                {imagenPreview
                                    ? <img src={imagenPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <PictureOutlined style={{ fontSize: 28, color: '#bbb' }} />
                                }
                            </div>
                            <div>
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>
                                        {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                                    </Button>
                                </Upload>
                                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                    JPG, PNG o WebP · Máx 2MB
                                </div>
                            </div>
                        </div>
                    </Form.Item>

                    <Divider style={{ margin: '8px 0 16px' }} />

                    {/* SKU + Categoría */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Requerido' }]}>
                            <Input placeholder="PRD-001" style={{ borderRadius: 8 }} disabled={!!editando} />
                        </Form.Item>
                        <Form.Item name="categoriaId" label="Categoría">
                            <Select
                                placeholder="Selecciona categoría"
                                allowClear
                                loading={loadingCategorias}
                                options={categorias.filter(c => c.activo).map(c => ({
                                    value: c.categoriaId,
                                    label: `${c.icono ? c.icono + ' ' : ''}${c.nombre}`
                                }))}
                                dropdownRender={menu => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div
                                            style={{ padding: '6px 12px', cursor: 'pointer', color: '#e74c3c', fontWeight: 500, fontSize: 13 }}
                                            onClick={() => { setModalVisible(false); setActiveTab('categorias') }}
                                        >
                                            <PlusOutlined /> Gestionar categorías
                                        </div>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </div>

                    {/* Nombre */}
                    <Form.Item name="nombre" label="Nombre del producto" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input placeholder="Ej: Coca Cola 350ml" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    {/* Descripción */}
                    <Form.Item name="descripcion" label="Descripción (opcional)">
                        <Input.TextArea rows={2} placeholder="Descripción del producto" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    {/* Proveedor */}
                    <Form.Item name="proveedorId" label="Proveedor">
                        <Select
                            placeholder="Selecciona el proveedor que lo vendió"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={proveedores.filter(p => p.activo).map(p => ({
                                value: p.proveedorId,
                                label: `${p.nombre} · NIT: ${p.nit}`
                            }))}
                        />
                    </Form.Item>

                    {/* Precios y ganancia */}
                    <div style={{
                        background: '#fafafa', border: '1px solid #f0f0f0',
                        borderRadius: 10, padding: '14px 16px', marginBottom: 16
                    }}>
                        <div style={{ fontWeight: 600, color: '#555', marginBottom: 12, fontSize: 13 }}>
                            💰 Precios y rentabilidad
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Form.Item name="precioCompra" label="Precio de compra" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Requerido' }]}>
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%', borderRadius: 8 }}
                                    min={0}
                                    onChange={v => setPrecioCompra(Number(v) || 0)}
                                />
                            </Form.Item>
                            <Form.Item name="precioVenta" label="Precio de venta" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Requerido' }]}>
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%', borderRadius: 8 }}
                                    min={0}
                                    onChange={v => setPrecioVenta(Number(v) || 0)}
                                />
                            </Form.Item>
                        </div>

                        {(precioCompra > 0 || precioVenta > 0) && (
                            <div style={{
                                marginTop: 12, padding: '10px 14px',
                                background: ganancia.pesos >= 0 ? '#f6ffed' : '#fff2f0',
                                border: `1px solid ${ganancia.pesos >= 0 ? '#b7eb8f' : '#ffccc7'}`,
                                borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <span style={{ fontSize: 13, color: '#555' }}>
                                    Ganancia por unidad:
                                </span>
                                <Space size={12}>
                                    <span style={{
                                        fontWeight: 700, fontSize: 15,
                                        color: ganancia.pesos >= 0 ? '#52c41a' : '#e74c3c'
                                    }}>
                                        {ganancia.pesos >= 0 ? '+' : ''}{ganancia.pesos >= 0
                                            ? `$${ganancia.pesos.toLocaleString('es-CO')}`
                                            : `-$${Math.abs(ganancia.pesos).toLocaleString('es-CO')}`
                                        }
                                    </span>
                                    <Tag
                                        color={ganancia.porcentaje >= 20 ? 'green' : ganancia.porcentaje >= 0 ? 'orange' : 'red'}
                                        style={{ fontWeight: 700, fontSize: 13 }}
                                    >
                                        {ganancia.porcentaje >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {' '}{Math.abs(ganancia.porcentaje).toFixed(1)}%
                                    </Tag>
                                </Space>
                            </div>
                        )}
                    </div>

                    {/* Stock + Unidad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <Form.Item name="stock" label="Stock actual" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber placeholder="0" style={{ width: '100%', borderRadius: 8 }} min={0} />
                        </Form.Item>
                        <Form.Item name="stockMinimo" label="Stock mínimo" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber placeholder="5" style={{ width: '100%', borderRadius: 8 }} min={0} />
                        </Form.Item>
                        <Form.Item name="unidad" label="Unidad" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Unidad">
                                {UNIDADES.map(u => <Select.Option key={u} value={u}>{u}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Estado */}
                    <Form.Item name="activo" label="Estado" initialValue={true}>
                        <Select>
                            <Select.Option value={true}>Activo</Select.Option>
                            <Select.Option value={false}>Inactivo</Select.Option>
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                        <Button onClick={() => { setModalVisible(false); form.resetFields() }}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary" htmlType="submit" loading={loadingModal}
                            style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600 }}
                        >
                            {editando ? 'Guardar cambios' : 'Crear producto'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
