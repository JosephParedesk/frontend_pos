import { useState } from "react";
import { Form, Input, Button, Steps, message, Checkbox, Select } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ShopOutlined, IdcardOutlined } from '@ant-design/icons'

import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from '../../shared/services/authService'

export default function RegistroPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get("plan") || "basico";
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [password, setPassword] = useState('')

    const requisitos = [
        { label: 'Una mayúscula', cumple: /[A-Z]/.test(password) },
        { label: 'Mínimo 8 caracteres', cumple: password.length >= 8 },
        { label: 'Un número', cumple: /[0-9]/.test(password) },
        { label: 'Un carácter especial: $ % * @ ? - ! _ / +', cumple: /[$%*@?!\-_/+]/.test(password) },
    ]
    const planNombres: Record<string, string> = {
        basico: "Básico — $89.900/mes",
        profesional: "Profesional — $189.900/mes",
        empresarial: "Empresarial — $349.900/mes",
    };

    const onFinish = async (values: any) => {
        console.log('Datos enviados:', values) // ← agrega esto
        setLoading(true)
        try {
            const payload = {
                cedula: values.cedula,
                tipoDocumento: values.tipoDocumento,
                nombre: values.nombre,
                correo: values.email,
                contrasena: values.password,
                telefono: values.telefono,
                planId: Number(plan)
            }
            console.log('Payload al backend:', payload) // ← y esto
            const { data } = await authService.registro(payload)
            console.log('Respuesta:', data)
            message.success('Cuenta creada exitosamente')
            navigate(`/pago?plan=${plan}&cedula=${values.cedula}`)
        } catch (error: any) {
            console.log('Error completo:', error.response?.data) // ← y esto
            message.error(error.response?.data?.message || 'Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "40px 48px",
                    width: "100%",
                    maxWidth: 480,
                    boxShadow: "0 8px 32px rgba(231,76,60,0.10)",
                    border: "1px solid #ffd5d5",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#c0392b",
                            margin: 0,
                        }}
                    >
                        Crear cuenta
                    </h1>
                    <p style={{ color: "#888", marginTop: 8 }}>
                        Plan seleccionado:{" "}
                        <strong style={{ color: "#e74c3c" }}>{planNombres[plan]}</strong>
                    </p>
                </div>

                <Steps
                    size="small"
                    current={0}
                    style={{ marginBottom: 32 }}
                    items={[
                        { title: "Registro" },
                        { title: "Pago" },
                        { title: "Activación" },
                    ]}
                />

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="tipoDocumento" rules={[{ required: true, message: 'Selecciona el tipo de documento' }]}>
                        <Select
                            placeholder="Tipo de documento"
                            size="large"
                            style={{ borderRadius: 8 }}
                        >
                            <Select.Option value="CC">Cédula de ciudadanía</Select.Option>
                            <Select.Option value="CE">Cédula de extranjería</Select.Option>
                            <Select.Option value="NIT">NIT</Select.Option>
                            <Select.Option value="PP">Pasaporte</Select.Option>
                            <Select.Option value="TI">Tarjeta de identidad</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="cedula" rules={[{ required: true, message: 'Ingresa tu número de documento' }]}>
                        <Input
                            prefix={<IdcardOutlined style={{ color: '#e74c3c' }} />}
                            placeholder="Número de documento"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="nombre"
                        rules={[{ required: true, message: "Ingresa tu nombre" }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: "#e74c3c" }} />}
                            placeholder="Nombre completo"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="empresa"
                        rules={[
                            { required: true, message: "Ingresa el nombre de tu empresa" },
                        ]}
                    >
                        <Input
                            prefix={<ShopOutlined style={{ color: "#e74c3c" }} />}
                            placeholder="Nombre de la empresa"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                type: "email",
                                message: "Ingresa un email válido",
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: "#e74c3c" }} />}
                            placeholder="Correo electrónico"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="telefono"
                        rules={[{ required: true, message: "Ingresa tu teléfono" }]}
                    >
                        <Input
                            prefix={<PhoneOutlined style={{ color: "#e74c3c" }} />}
                            placeholder="Teléfono"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Ingresa tu contraseña' },
                            () => ({
                                validator(_, value) {
                                    if (!value) return Promise.resolve()
                                    if (!/[A-Z]/.test(value)) return Promise.reject('Agrega al menos una mayúscula')
                                    if (value.length < 8) return Promise.reject('Mínimo 8 caracteres')
                                    if (!/[0-9]/.test(value)) return Promise.reject('Agrega al menos un número')
                                    if (!/[$%*@?!\-_/+]/.test(value)) return Promise.reject('Agrega un carácter especial: $ % * @ ? - ! _ / +')
                                    return Promise.resolve()
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#e74c3c' }} />}
                            placeholder="Contraseña"
                            size="large"
                            style={{ borderRadius: 8 }}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>

                    {password.length > 0 && (
                        <div style={{ background: '#fff5f5', border: '1px solid #ffd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                            <p style={{ fontWeight: 600, color: '#333', marginBottom: 10, fontSize: 13 }}>Debe contener:</p>
                            {requisitos.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: r.cumple ? '#e74c3c' : '#fff',
                                        border: r.cumple ? '2px solid #e74c3c' : '2px solid #ddd',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700,
                                        color: r.cumple ? '#fff' : '#aaa',
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </div>
                                    <span style={{ fontSize: 13, color: r.cumple ? '#e74c3c' : '#888', fontWeight: r.cumple ? 600 : 400, transition: 'all 0.3s ease' }}>
                                        {r.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Form.Item
                        name="confirmar"
                        rules={[
                            { required: true, message: "Confirma tu contraseña" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value)
                                        return Promise.resolve();
                                    return Promise.reject("Las contraseñas no coinciden");
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: "#e74c3c" }} />}
                            placeholder="Confirmar contraseña"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        style={{
                            background: "#e74c3c",
                            borderColor: "#e74c3c",
                            borderRadius: 8,
                            fontWeight: 600,
                            height: 48,
                        }}
                    >
                        Crear cuenta
                    </Button>
                </Form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: 20,
                        color: "#888",
                        fontSize: 14,
                    }}
                >
                    ¿Ya tienes cuenta?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        style={{ color: "#e74c3c", cursor: "pointer", fontWeight: 600 }}
                    >
                        Inicia sesión
                    </span>
                </p>
            </div>
        </div>
    );
}
