import { Routes, Route, Navigate } from 'react-router-dom'
import PlanesPage from './modules/auth/PlanesPage'
import RegistroPage from './modules/auth/RegistroPage'
import PagoPage from './modules/auth/PagoPage'
import LoginPage from './modules/auth/LoginPage'
import DashboardLayout from './shared/components/DashboardLayout'
import DashboardPage from './modules/dashboard/DashboardPage'
import ProtectedRoute from './router/ProtectedRoute'
import InventarioPage from './modules/inventory/InventarioPage'
import ProveedoresPage from './modules/purchases/ProveedoresPage'
import ComprasPage from './modules/purchases/ComprasPage'
import NuevaCompraPage from './modules/purchases/NuevaCompraPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/planes" element={<PlanesPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/pago" element={<PagoPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ventas" element={<div>Módulo Ventas</div>} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/clientes" element={<div>Módulo Clientes</div>} />
          <Route path="/compras/proveedores" element={<ProveedoresPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/compras/nueva" element={<NuevaCompraPage />} />
          <Route path="/compras/ordenes" element={<div>Órdenes de compra — próximamente</div>} />
          <Route path="/compras/cuentas-por-pagar" element={<div>Cuentas por pagar — próximamente</div>} />
          <Route path="/contabilidad" element={<div>Módulo Contabilidad</div>} />
          <Route path="/facturacion" element={<div>Módulo Facturación</div>} />
          <Route path="/nomina" element={<div>Módulo Nómina</div>} />
          <Route path="/configuracion" element={<div>Módulo Configuración</div>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App