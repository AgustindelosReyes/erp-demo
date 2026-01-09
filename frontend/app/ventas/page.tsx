"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { VentasTable } from "@/components/ventas-table"
import { VentaModal } from "@/components/ventas-modal"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"

interface Venta {
  id: number
  numeroVenta: string
  fecha: string
  cliente: string
  productos: number
  subtotal: number
  descuento: number
  total: number
  estado: "completada" | "pendiente" | "cancelada"
  metodoPago: string
  vendedor: string
}

export default function VentasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setSelectedVenta(null)
    setIsModalOpen(true)
  }

  const handleView = (venta: Venta) => {
    setSelectedVenta(venta)
    setIsModalOpen(true)
  }

  const handleModalClose = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedVenta(null)
    if (shouldRefresh) {
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleExport = () => {
    // Implementar exportación de ventas
    console.log("Exporting sales...")
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
              <p className="text-muted-foreground mt-1">Gestiona y registra las ventas de tu pinturería</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Venta
              </Button>
            </div>
          </div>

          <VentasTable key={refreshKey} onView={handleView} />
        </main>
      </div>

      <VentaModal isOpen={isModalOpen} onClose={handleModalClose} venta={selectedVenta} />
    </div>
  )
}
