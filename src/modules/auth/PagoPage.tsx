import { useState } from 'react'
import { Button, Steps, message, Radio } from 'antd'
import { CreditCardOutlined, BankOutlined, MobileOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../shared/store/authStore'
import api from '../../shared/services/api'

export default function PagoPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const plan = searchParams.get('plan') || '1'
    const cedula = searchParams.get('cedula') || ''
    const [metodoPago, setMetodoPago] = useState('tarjeta')
    const [loading, setLoading] = useState(false)

    const precios: Record<string, number> = {
        basico: 89900, profesional: 189900, empresarial: 349900,
        '1': 89900, '2': 189900, '3': 349900,
    }

    const planNombres: Record<string, string> = {
        basico: 'Básico', profesional: 'Profesional', empresarial: 'Empresarial',
        '1': 'Básico', '2': 'Profesional', '3': 'Empresarial',
    }

    const precio = precios[plan] ?? 0

    const onPagar = async () => {
        setLoading(true)
        try {
            // crea la suscripción en el backend
            await api.post('/api/pos/suscripciones/crear', {
                usuarioCedula: cedula,
                planId: Number(plan),
                metodoPago: metodoPago,
            })

            // activa la suscripción inmediatamente (simulando pago exitoso)
            const { data: suscripcion } = await api.get(`/api/pos/suscripciones/usuario/${cedula}`)
            await api.put(`/api/pos/suscripciones/activar/${suscripcion.id}`)

            message.success('¡Pago procesado! Tu cuenta está activa')
            navigate('/login')
        } catch (error: any) {
            console.log('Error pago:', error.response?.data)
            message.error('Error al procesar el pago')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(231,76,60,0.10)', border: '1px solid #ffd5d5' }}>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#c0392b', margin: 0 }}>Datos de pago</h1>
                    <p style={{ color: '#888', marginTop: 8 }}>Pago seguro y encriptado</p>
                </div>

                <Steps size="small" current={1} style={{ marginBottom: 32 }}
                    items={[{ title: 'Registro' }, { title: 'Pago' }, { title: 'Activación' }]}
                />

                <div style={{ background: '#fff5f5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #ffd5d5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#555', fontSize: 15 }}>Plan {planNombres[plan]}</span>
                        <span style={{ fontWeight: 800, fontSize: 20, color: '#e74c3c' }}>${precio.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ color: '#aaa', fontSize: 13 }}>Facturación mensual</span>
                        <span style={{ color: '#52c41a', fontSize: 13, fontWeight: 600 }}>14 días gratis</span>
                    </div>
                </div>

                <p style={{ fontWeight: 600, color: '#333', marginBottom: 12 }}>Método de pago</p>
                <Radio.Group value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { value: 'tarjeta', icon: <CreditCardOutlined />, label: 'Tarjeta débito / crédito' },
                            { value: 'pse', icon: <BankOutlined />, label: 'PSE — Transferencia bancaria' },
                            { value: 'nequi', icon: <MobileOutlined />, label: 'Nequi / Daviplata' },
                        ].map((m) => (
                            <Radio.Button
                                key={m.value}
                                value={m.value}
                                style={{
                                    width: '100%', height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
                                    border: metodoPago === m.value ? '2px solid #e74c3c' : '1px solid #ffd5d5',
                                    background: metodoPago === m.value ? '#fff5f5' : '#fff',
                                    color: metodoPago === m.value ? '#e74c3c' : '#555',
                                    fontWeight: metodoPago === m.value ? 600 : 400,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {m.icon} {m.label}
                            </Radio.Button>
                        ))}
                    </div>
                </Radio.Group>

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={onPagar}
                    style={{ background: '#e74c3c', borderColor: '#e74c3c', borderRadius: 8, fontWeight: 600, height: 48 }}
                >
                    Pagar ${precio.toLocaleString('es-CO')}
                </Button>

                <p style={{ textAlign: 'center', marginTop: 16, color: '#aaa', fontSize: 12 }}>
                    🔒 Pagos procesados de forma segura mediante SSL
                </p>
            </div>
        </div>
    )
}