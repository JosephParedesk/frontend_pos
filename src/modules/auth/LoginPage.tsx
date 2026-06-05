import { useState } from 'react'
import { Form, Input, Button, message, Checkbox } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../shared/services/authService'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '../../shared/store/authStore'

export default function LoginPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            const { data } = await authService.login(values.email, values.password)

            // decodifica el JWT
            const decoded: any = jwtDecode(data)

            // guarda token y usuario en el store
            const { setToken, setUsuario } = useAuthStore.getState()
            setToken(data)
            setUsuario({
                cedula: decoded.cedula,
                nombre: decoded.nombre,
                correo: decoded.sub,
                rol: decoded.rol,
                planId: decoded.planId,
            })

            message.success(`¡Bienvenido ${decoded.nombre}!`)
            navigate('/dashboard')
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Credenciales incorrectas')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div style={{ minHeight: '100vh', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(231,76,60,0.10)', border: '1px solid #ffd5d5' }}>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, background: '#e74c3c', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                        🏪
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#c0392b', margin: 0 }}>Iniciar sesión</h1>
                    <p style={{ color: '#888', marginTop: 6, fontSize: 14 }}>Ingresa a tu cuenta POS</p>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Ingresa un email válido' }]}>
                        <Input
                            prefix={<MailOutlined style={{ color: '#e74c3c' }} />}
                            placeholder="Correo electrónico"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: 'Ingresa tu contraseña' }]}>
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#e74c3c' }} />}
                            placeholder="Contraseña"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Checkbox style={{ color: '#555' }}>Recordarme</Checkbox>
                        <span
                            onClick={() => message.info('Próximamente')}
                            style={{ color: '#e74c3c', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                        >
                            ¿Olvidaste tu contraseña?
                        </span>
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600, height: 48 }}
                    >
                        Ingresar
                    </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: '#888', fontSize: 14 }}>
                        ¿No tienes cuenta?{' '}
                        <span onClick={() => navigate('/planes')} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}>
                            Ver planes
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}