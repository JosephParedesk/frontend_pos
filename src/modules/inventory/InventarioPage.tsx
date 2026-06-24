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
import {
    productoService, categoriaService, proveedorService,
    calcularGanancia,
} from '../../shared/services/inventarioService'
import type { Producto, Categoria, Proveedor, ProductoRequest } from '../../shared/services/inventarioService'
import { useAuthStore } from '../../shared/store/authStore'

const UNIDADES = ['Unidad', 'Kilogramo', 'Litro', 'Caja', 'Paquete', 'Metro', 'Gramo', 'Mililitro']
const COLORES_CATEGORIA = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e91e63']

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

// ─── Panel gestión de categorías ───────────────────────────────────────────────
function CategoriasPanel({
    categorias, onActualizar
}: {
    categorias: Categoria[]
    onActualizar: () => void
}) {
    const [modalVisible, setModalVisible] = useState(false)
    const [editando, setEditando] = useState<Categoria | null>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const abrirModal = (cat?: Categoria) => {
        setEditando(cat || null)
        form.setFieldsValue(cat || { color: '#e74c3c' })
        setModalVisible(true)
    }

    const guardar = async (values: any) => {
        setLoading(true)
        try {
            if (editando) {
                await categoriaService.actualizar(editando.categoriaId, values)
                message.success('Categoría actualizada')
            } else {
                await categoriaService.guardar(values)
                message.success('Categoría creada')
            }
            setModalVisible(false)
            form.resetFields()
            onActualizar()
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al guardar la categoría')
        } finally {
            setLoading(false)
        }
    }

    const eliminar = async (id: string) => {
        try {
            await categoriaService.eliminar(id)
            message.success('Categoría eliminada')
            onActualizar()
        } catch {
            message.error('No se pudo eliminar la categoría')
        }
    }

    console.log('categorias:', categorias)
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {categorias.map(cat => (
                    <div key={cat.categoriaId} style={{
                        background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10,
                        padding: '12px 16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: '50%',
                                background: cat.color || '#e74c3c', flexShrink: 0
                            }} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{cat.nombre}</div>
                                {cat.descripcion && (
                                    <div style={{ fontSize: 11, color: '#999' }}>{cat.descripcion}</div>
                                )}
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
                    <Form.Item name="color" label="Color identificador">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {COLORES_CATEGORIA.map(c => (
                                <div
                                    key={c}
                                    onClick={() => form.setFieldValue('color', c)}
                                    style={{
                                        width: 28, height: 28, borderRadius: '50%', background: c,
                                        cursor: 'pointer', border: form.getFieldValue('color') === c ? '3px solid #333' : '3px solid transparent',
                                        transition: 'border 0.15s'
                                    }}
                                />
                            ))}
                        </div>
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button onClick={() => { setModalVisible(false); form.resetFields() }}>Cancelar</Button>
                        <Button
                            type="primary" htmlType="submit" loading={loading}
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
    const { usuario } = useAuthStore()

    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true)

    const [busqueda, setBusqueda] = useState('')
    const [filtroCat, setFiltroCat] = useState<string | undefined>()
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

    // ── Carga datos del backend (solo cuando ya hay empresaId) ──
    const cargarDatos = useCallback(async () => {
        if (!usuario?.empresaId) return
        setLoading(true)
        try {
            const [productosData, categoriasData, proveedoresData] = await Promise.all([
                productoService.listar(),
                categoriaService.listar(),
                proveedorService.listar(),
            ])
            setProductos(productosData)
            setCategorias(categoriasData)
            setProveedores(proveedoresData)
        } catch (error: any) {
            message.error('Error al cargar el inventario')
        } finally {
            setLoading(false)
        }
    }, [usuario?.empresaId])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])
    console.log('usuario en InventarioPage:', usuario)

    useEffect(() => {
        if (usuario?.empresaId) {
            cargarDatos()
        }
    }, [usuario?.empresaId, cargarDatos])
    // ── Filtros ──
    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = !busqueda ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.categoriaNombre || '').toLowerCase().includes(busqueda.toLowerCase())
        const matchCat = !filtroCat || p.categoriaId === filtroCat
        return matchBusqueda && matchCat
    })

    const stockBajo = productos.filter(p => p.stock <= p.stockMinimo)

    // ── Estadísticas ──
    const valorInventario = productos.reduce((s, p) => s + p.precioVenta * p.stock, 0)
    const gananciaPotencial = productos.reduce((s, p) => s + (p.precioVenta - p.precioCompra) * p.stock, 0)

    // ── Modal ──
    const abrirModal = (producto?: Producto) => {
        setImagenPreview(undefined)
        setImagenFile(undefined)
        setFileList([])
        if (producto) {
            setEditando(producto)
            setPrecioCompra(producto.precioCompra)
            setPrecioVenta(producto.precioVenta)
            form.setFieldsValue(producto)
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
                ...values,
                precioCompra: values.precioCompra || 0,
                precioVenta: values.precioVenta || 0,
            }

            let skuFinal: string = values.sku

            if (editando) {
                await productoService.actualizar(editando.sku, request)
                skuFinal = editando.sku
            } else {
                const nuevo = await productoService.guardar(request)
                skuFinal = nuevo.sku
            }

            if (imagenFile) {
                try {
                    await productoService.subirImagen(skuFinal, imagenFile)
                } catch {
                    message.warning('Producto guardado pero no se pudo subir la imagen')
                }
            }

            await cargarDatos()

            message.success(editando ? 'Producto actualizado' : 'Producto creado')
            setModalVisible(false)
            setImagenFile(undefined)
            setImagenPreview(undefined)
            setFileList([])
            form.resetFields()

        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al guardar el producto')
        } finally {
            setLoadingModal(false)
        }
    }

    const eliminarProducto = async (sku: string) => {
        try {
            await productoService.eliminar(sku)
            setProductos(prev => prev.filter(p => p.sku !== sku))
            message.success('Producto eliminado')
        } catch {
            message.error('No se pudo eliminar el producto')
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
                const prov = proveedores.find(p => p.proveedorId === record.proveedorId)
                return (
                    <div>
                        <div style={{ fontWeight: 600, color: '#333' }}>{v}</div>
                        {prov && (
                            <div style={{ fontSize: 11, color: '#999' }}>
                                <ShopOutlined style={{ marginRight: 3 }} />{prov.nombre}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            title: 'Categoría',
            dataIndex: 'categoriaNombre',
            key: 'categoria',
            render: (v: string, record: Producto) => {
                const cat = categorias.find(c => c.categoriaId === record.categoriaId)
                return (
                    <Tag
                        style={{
                            borderRadius: 6,
                            background: (cat?.color || '#e74c3c') + '18',
                            borderColor: cat?.color || '#e74c3c',
                            color: cat?.color || '#e74c3c',
                            fontWeight: 500
                        }}
                    >
                        {cat?.nombre || v || 'Sin categoría'}
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
                    <Button icon={<ReloadOutlined />} onClick={cargarDatos} style={{ borderRadius: 8 }}>
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
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#f0f0f0' }}>
                        <Statistic
                            title="Productos activos"
                            value={productos.filter(p => p.activo).length}
                            prefix={<InboxOutlined style={{ color: '#e74c3c' }} />}
                            styles={{ content: { color: '#e74c3c', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#f0f0f0' }}>
                        <Statistic
                            title="Stock bajo"
                            value={stockBajo.length}
                            prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
                            styles={{ content: { color: stockBajo.length > 0 ? '#fa8c16' : '#52c41a', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#f0f0f0' }}>
                        <Statistic
                            title="Valor inventario"
                            value={valorInventario}
                            prefix={<DollarOutlined style={{ color: '#3498db' }} />}
                            formatter={v => `$${Number(v).toLocaleString('es-CO')}`}
                            styles={{ content: { color: '#3498db', fontWeight: 700, fontSize: 15 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: 10, borderColor: '#f0f0f0' }}>
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
                                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                    <Input
                                        placeholder="Buscar por nombre, SKU o categoría..."
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
                                    >
                                        {categorias.map(c => (
                                            <Select.Option key={c.categoriaId} value={c.categoriaId}>
                                                <span style={{ color: c.color, marginRight: 6 }}>●</span>
                                                {c.nombre}
                                            </Select.Option>
                                        ))}
                                    </Select>
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
                                onActualizar={cargarDatos}
                            />
                        )
                    }
                ]}
            />

            {/* Modal crear/editar producto */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Requerido' }]}>
                            <Input placeholder="PRD-001" style={{ borderRadius: 8 }} disabled={!!editando} />
                        </Form.Item>
                        <Form.Item name="categoriaId" label="Categoría" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select
                                placeholder="Selecciona categoría"
                                popupRender={menu => (
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
                            >
                                {categorias.map(c => (
                                    <Select.Option key={c.categoriaId} value={c.categoriaId}>
                                        <span style={{ color: c.color, marginRight: 6 }}>●</span>
                                        {c.nombre}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="nombre" label="Nombre del producto" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input placeholder="Ej: Coca Cola 350ml" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="descripcion" label="Descripción (opcional)">
                        <Input.TextArea rows={2} placeholder="Descripción del producto" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="proveedorId" label="Proveedor">
                        <Select placeholder="Selecciona el proveedor que lo vendió" allowClear>
                            {proveedores.map(p => (
                                <Select.Option key={p.proveedorId} value={p.proveedorId}>
                                    <ShopOutlined style={{ marginRight: 6, color: '#888' }} />
                                    {p.nombre}
                                    {p.nit && <span style={{ color: '#bbb', marginLeft: 8, fontSize: 11 }}>NIT: {p.nit}</span>}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                                    formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={v => v ? Number(v.replace(/\$\s?|(\.)/g, '').replace(',', '.')) : 0}
                                    min={0}
                                    onChange={v => setPrecioCompra(Number(v) || 0)}
                                />
                            </Form.Item>
                            <Form.Item name="precioVenta" label="Precio de venta" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Requerido' }]}>
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%', borderRadius: 8 }}
                                    formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={v => v ? Number(v.replace(/\$\s?|(\.)/g, '').replace(',', '.')) : 0}
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
                                        {ganancia.pesos >= 0
                                            ? `+$${ganancia.pesos.toLocaleString('es-CO')}`
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