"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { InventarioTable } from "@/components/inventario-table"
import { ProductoModal } from "@/components/producto-modal"
import { Button } from "@/components/ui/button"
import { Plus, Download, Upload } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string | null
  category: string | null
  stock: number
  stock_min: number
  price: number
}

export default function InventarioPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Product | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setSelectedProducto(null)
    setIsModalOpen(true)
  }

  const handleEdit = (producto: Product) => {
    setSelectedProducto(producto)
    setIsModalOpen(true)
  }

  const handleModalClose = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedProducto(null)
    if (shouldRefresh) {
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleExport = () => {
    // Implementar exportación a Excel/CSV
    console.log("[v0] Exporting inventory...")
  }

  const handleImport = () => {
    // Implementar importación desde Excel/CSV
    console.log("[v0] Importing inventory...")
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
              <p className="text-muted-foreground mt-1">Gestiona el stock y productos de tu pinturería</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImport} className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
          </div>

          <InventarioTable key={refreshKey} onEdit={handleEdit} />
        </main>
      </div>

      <ProductoModal isOpen={isModalOpen} onClose={handleModalClose} producto={selectedProducto} />
    </div>
  )
}
