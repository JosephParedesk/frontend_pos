import { Card, Button, Badge, Spin, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { planesService } from '../../shared/services/planesService'

const cardStyle = (popular: boolean, hovered: boolean) => ({
  width: 320,
  borderRadius: 16,
  background: '#ffffff',
  border: hovered || popular ? '2px solid #e74c3c' : '1px solid #ffd5d5',
  boxShadow: hovered || popular
    ? '0 12px 40px rgba(231,76,60,0.25)'
    : '0 2px 12px rgba(231,76,60,0.07)',
  transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
})

export default function PlanesPage() {
  const navigate = useNavigate()
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [planes, setPlanes] = useState<any[]>([])
  const [loadingPlanes, setLoadingPlanes] = useState(true)

  useEffect(() => {
    planesService.listar()
      .then(({ data }) => setPlanes(data))
      .catch(() => message.error('Error al cargar los planes'))
      .finally(() => setLoadingPlanes(false))
  }, [])

  if (loadingPlanes) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f5' }}>
      <Spin size="large" />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff5f5', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: '#c0392b' }}>
          Elige tu plan
        </h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 16 }}>
          Comienza gratis por 14 días, sin tarjeta de crédito
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
        {planes.map((plan) => (
          <Badge.Ribbon
            key={plan.id}
            text="Más popular"
            color="#e74c3c"
            style={{ display: plan.popular ? 'block' : 'none' }}
          >
            <Card
              style={cardStyle(plan.popular, hoveredPlan === plan.id)}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: hoveredPlan === plan.id || plan.popular ? '#e74c3c' : '#333' }}>
                {plan.nombre}
              </h2>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#e74c3c' }}>
                  ${plan.precio.toLocaleString('es-CO')}
                </span>
                <span style={{ color: '#aaa', marginLeft: 4 }}>/mes</span>
              </div>

              <div style={{ marginBottom: 28 }}>
                {plan.modulos?.map((m: string) => (
                  <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <CheckOutlined style={{ color: '#e74c3c', fontSize: 14 }} />
                    <span style={{ fontSize: 14, color: '#555' }}>{m}</span>
                  </div>
                ))}
              </div>

              <Button
                size="large"
                block
                onClick={() => navigate(`/registro?plan=${plan.id}`)}
                style={{
                  background: hoveredPlan === plan.id || plan.popular ? '#e74c3c' : '#fff',
                  borderColor: '#e74c3c',
                  color: hoveredPlan === plan.id || plan.popular ? '#fff' : '#e74c3c',
                  fontWeight: 600,
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                }}
              >
                Comenzar ahora
              </Button>
            </Card>
          </Badge.Ribbon>
        ))}
      </div>
    </div>
  )
}