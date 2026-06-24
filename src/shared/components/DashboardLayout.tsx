import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Tag } from 'antd'
import {
    DashboardOutlined, ShoppingCartOutlined, InboxOutlined,
    TeamOutlined, CarOutlined, AccountBookOutlined,
    FileTextOutlined, UserOutlined, SettingOutlined,
    LogoutOutlined, BellOutlined, LockOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const { Header, Sider, Content } = Layout

const todosLosModulos = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', planes: [1, 2, 3] },
    { key: '/ventas', icon: <ShoppingCartOutlined />, label: 'Ventas / POS', planes: [1, 2, 3] },
    { key: '/inventario', icon: <InboxOutlined />, label: 'Inventario', planes: [1, 2, 3] },
    { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes', planes: [1, 2, 3] },
    {
        key: 'compras',
        icon: <CarOutlined />,
        label: 'Compras',
        planes: [2, 3],
        children: [
            { key: '/compras', label: 'Compras y Gastos', planes: [2, 3] },
            { key: '/compras/proveedores', label: 'Proveedores', planes: [2, 3] },
            { key: '/compras/ordenes', label: 'Órdenes de compra', planes: [2, 3] },
            { key: '/compras/cuentas-por-pagar', label: 'Cuentas por pagar', planes: [2, 3] },
        ]
    },
    { key: '/contabilidad', icon: <AccountBookOutlined />, label: 'Contabilidad', planes: [2, 3] },
    { key: '/facturacion', icon: <FileTextOutlined />, label: 'Facturación', planes: [2, 3] },
    { key: '/nomina', icon: <UserOutlined />, label: 'Nómina', planes: [3] },
    { key: '/configuracion', icon: <SettingOutlined />, label: 'Configuración', planes: [1, 2, 3] },
]

export default function DashboardLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { usuario, logout } = useAuthStore()
    const [collapsed, setCollapsed] = useState(false)

    const planId = usuario?.planId ?? 1

    const menuItems = todosLosModulos.map((modulo) => {
        const tieneAcceso = modulo.planes.includes(planId)

        if (modulo.children) {
            return {
                key: modulo.key,
                icon: modulo.icon,
                label: modulo.label,
                disabled: !tieneAcceso,
                children: modulo.children.map((hijo) => ({
                    key: hijo.key,
                    label: (
                        <span style={{ color: tieneAcceso ? 'inherit' : '#aaa' }}>
                            {hijo.label}
                        </span>
                    ),
                    disabled: !hijo.planes.includes(planId),
                })),
            }
        }

        return {
            key: modulo.key,
            icon: modulo.icon,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: tieneAcceso ? 'inherit' : '#aaa' }}>{modulo.label}</span>
                    {!tieneAcceso && <LockOutlined style={{ color: '#aaa', fontSize: 11 }} />}
                </div>
            ),
            disabled: !tieneAcceso,
        }
    })

    const onMenuClick = ({ key }: { key: string }) => {
        // busca en módulos planos
        let modulo = todosLosModulos.find(m => m.key === key)

        // si no lo encuentra, busca dentro de los hijos
        if (!modulo) {
            for (const m of todosLosModulos) {
                if (m.children) {
                    const hijo = m.children.find((h: any) => h.key === key)
                    if (hijo) {
                        modulo = hijo
                        break
                    }
                }
            }
        }

        if (modulo && !modulo.planes.includes(planId)) return
        navigate(key)
    }
    const planNombre: Record<number, string> = { 1: 'Básico', 2: 'Profesional', 3: 'Empresarial' }
    const planColor: Record<number, string> = { 1: 'default', 2: 'blue', 3: 'gold' }

    const userMenu = {
        items: [
            { key: 'perfil', icon: <UserOutlined />, label: 'Mi perfil' },
            { key: 'config', icon: <SettingOutlined />, label: 'Configuración' },
            { type: 'divider' as const },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
            if (key === 'logout') {
                logout()
                navigate('/login')
            } else if (key === 'config') {
                navigate('/configuracion')
            }
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                trigger={null}
                width={230}
                style={{ background: '#fff', borderRight: '1px solid #ffe0e0', position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
            >
                <div style={{ padding: collapsed ? '16px 8px' : '16px 20px', borderBottom: '1px solid #ffe0e0', marginBottom: 8 }}>
                    {collapsed ? (
                        <div style={{ textAlign: 'center', fontSize: 22 }}>🏪</div>
                    ) : (
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#e74c3c' }}>Logo Empresa</div>
                            <Tag color={planColor[planId]} style={{ marginTop: 4, fontSize: 11 }}>
                                Plan {planNombre[planId]}
                            </Tag>
                        </div>
                    )}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={onMenuClick}
                    style={{ border: 'none', color: '#333' }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 230, transition: 'all 0.2s' }}>
                <Header style={{
                    background: '#fff', padding: '0 24px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #ffe0e0', position: 'sticky', top: 0, zIndex: 99
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: 16, color: '#e74c3c' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Badge count={3} size="small">
                            <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
                        </Badge>

                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <Avatar style={{ background: '#e74c3c' }} icon={<UserOutlined />} />
                                {!collapsed && (
                                    <span style={{ fontWeight: 500, color: '#333' }}>
                                        {usuario?.nombre || 'Usuario'}
                                    </span>
                                )}
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ padding: 24, background: '#f9f0f0', minHeight: 'calc(100vh - 64px)' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}