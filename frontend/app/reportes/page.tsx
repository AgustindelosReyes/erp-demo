"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  FileText,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Loader2,
} from "lucide-react"
import { useAuth } from '@/lib/auth-context'

interface MovementStats {
  ventas_totales: number
  count_ventas: number
  ventas_hoy: number
  ventas_hoy_total: number
  pedidos_activos: number
  alertas_stock: number
  actividad_reciente: {
    id: number
    tipo: string
    descripcion: string
    monto: number
    fecha: string
  }[]
}

interface ProductStats {
  total_products: number
  low_stock: number
  critical_stock: number
  low_stock_products: {
    id: number
    name: string
    stock: number
    stock_min: number
    percentage: number
  }[]
}

export default function ReportesPage() {
   const { user, isLoading } = useAuth()
   const router = useRouter()
   const [selectedReport, setSelectedReport] = useState<string>("")
   const [dateFrom, setDateFrom] = useState("")
   const [dateTo, setDateTo] = useState("")
   const [selectedPeriod, setSelectedPeriod] = useState("monthly")
   const [movementStats, setMovementStats] = useState<MovementStats | null>(null)
   const [productStats, setProductStats] = useState<ProductStats | null>(null)
   const [loadingStats, setLoadingStats] = useState(true)
   const [reportData, setReportData] = useState<any>(null)
   const [generatingReport, setGeneratingReport] = useState(false)

   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

   useEffect(() => {
     if (!isLoading && !user) {
       router.push('/login')
     }
   }, [user, isLoading, router])

   useEffect(() => {
     if (user) {
       const fetchStats = async () => {
         try {
           const [movementResponse, productResponse] = await Promise.all([
             fetch(`${API_URL}/movements/stats/summary`, {
               headers: {
                 "Content-Type": "application/json",
                 Accept: "application/json",
                 Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
               },
             }),
             fetch(`${API_URL}/products/stats/summary`, {
               headers: {
                 "Content-Type": "application/json",
                 Accept: "application/json",
                 Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
               },
             })
           ])

           if (movementResponse.ok) {
             const movementData = await movementResponse.json()
             setMovementStats(movementData.data)
           }

           if (productResponse.ok) {
             const productData = await productResponse.json()
             setProductStats(productData.data)
           }
         } catch (error) {
           console.error("Error fetching stats:", error)
         } finally {
           setLoadingStats(false)
         }
       }

       fetchStats()
     }
   }, [user])

   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('es-AR', {
       style: 'currency',
       currency: 'ARS',
       minimumFractionDigits: 0,
     }).format(amount)
   }

   if (isLoading) {
     return <div>Cargando...</div>
   }

   if (!user) {
     return null
   }

   const reportTypes = [
    {
      id: "ventas",
      name: "Reporte de Ventas",
      description: "Análisis completo de ventas por período, cliente y producto",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      id: "inventario",
      name: "Reporte de Inventario",
      description: "Estado actual del stock, movimientos y valorización",
      icon: Package,
      color: "text-blue-500",
    },
    {
      id: "clientes",
      name: "Reporte de Clientes",
      description: "Análisis de clientes, compras y comportamiento",
      icon: Users,
      color: "text-purple-500",
    },
    {
      id: "financiero",
      name: "Reporte Financiero",
      description: "Balance, ingresos, gastos y rentabilidad",
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      id: "productos",
      name: "Reporte de Productos",
      description: "Productos más vendidos, rentabilidad por producto",
      icon: BarChart3,
      color: "text-orange-500",
    },
    {
      id: "movimientos",
      name: "Reporte de Movimientos",
      description: "Historial de entradas y salidas de inventario",
      icon: PieChart,
      color: "text-teal-500",
    },
  ]

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      alert("Por favor selecciona un tipo de reporte")
      return
    }

    setGeneratingReport(true)
    try {
      let url = ""
      let params = new URLSearchParams()

      if (selectedReport === "ventas") {
        url = `${API_URL}/movements`
        if (selectedPeriod === "hoy") params.append("periodo", "hoy")
        else if (selectedPeriod === "semana") params.append("periodo", "semana")
        else if (selectedPeriod === "mes") params.append("periodo", "mes")
      } else if (selectedReport === "inventario") {
        url = `${API_URL}/products`
      } else {
        // For other reports, just show a message for now
        setReportData({ message: `Reporte de ${selectedReport} generado (funcionalidad básica)` })
        setGeneratingReport(false)
        return
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReportData({
          type: selectedReport,
          data: data.data,
          pagination: data.pagination,
          generatedAt: new Date().toISOString()
        })
      } else {
        throw new Error("Error al generar el reporte")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error al generar el reporte")
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleExportPDF = () => {
    if (!reportData) {
      alert("Primero genera un reporte")
      return
    }
    // Basic implementation: download as JSON for now
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `reporte-${reportData.type}-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleExportExcel = () => {
    if (!reportData) {
      alert("Primero genera un reporte")
      return
    }
    // Basic implementation: download as CSV
    let csvContent = ""
    if (reportData.type === "ventas" && reportData.data.length > 0) {
      csvContent = "Número Venta,Fecha,Productos,Total,Estado,Vendedor\n"
      reportData.data.forEach((venta: any) => {
        csvContent += `${venta.numeroVenta},${venta.fecha},${venta.productos},${venta.total},${venta.estado},${venta.vendedor}\n`
      })
    } else if (reportData.type === "inventario" && reportData.data.length > 0) {
      csvContent = "Nombre,Stock,Stock Mínimo,Precio,Categoría\n"
      reportData.data.forEach((producto: any) => {
        csvContent += `${producto.name},${producto.stock},${producto.stock_min},${producto.price},${producto.category || 'N/A'}\n`
      })
    } else {
      csvContent = "Tipo,Datos\n"
      csvContent += `${reportData.type},${JSON.stringify(reportData.data)}\n`
    }

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent)
    const exportFileDefaultName = `reporte-${reportData.type}-${new Date().toISOString().split('T')[0]}.csv`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
              <p className="text-muted-foreground mt-1">Genera y analiza reportes de tu negocio</p>
            </div>
          </div>

          {/* Tarjetas de métricas rápidas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(movementStats?.ventas_totales || 0)}</div>
                    <p className="text-xs text-muted-foreground">{movementStats?.count_ventas || 0} ventas completadas</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos en Inventario</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{productStats?.total_products || 0}</div>
                    <p className="text-xs text-muted-foreground">{productStats?.low_stock || 0} con stock bajo</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{movementStats?.pedidos_activos || 0}</div>
                    <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{movementStats?.alertas_stock || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {movementStats?.alertas_stock ? 'Requieren atención' : 'Sin alertas'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Panel de selección de reportes */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Selecciona el tipo de reporte y período</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Tipo de Reporte</Label>
                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Selecciona un reporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((report) => (
                          <SelectItem key={report.id} value={report.id}>
                            {report.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Período</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger id="period">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPeriod === "custom" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="date-from">Fecha Desde</Label>
                        <Input
                          id="date-from"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date-to">Fecha Hasta</Label>
                        <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                      </div>
                    </>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button onClick={handleGenerateReport} className="w-full gap-2" disabled={generatingReport}>
                      {generatingReport ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {generatingReport ? "Generando..." : "Generar Reporte"}
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={handleExportPDF} variant="outline" className="flex-1 gap-2 bg-transparent" disabled={!reportData}>
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button onClick={handleExportExcel} variant="outline" className="flex-1 gap-2 bg-transparent" disabled={!reportData}>
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de tipos de reportes disponibles */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes Disponibles</CardTitle>
                  <CardDescription>Selecciona el tipo de análisis que necesitas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {reportTypes.map((report) => {
                      const Icon = report.icon
                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReport(report.id)}
                          className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-accent/50 ${
                            selectedReport === report.id ? "border-primary bg-accent" : ""
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{report.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                          </div>
                          {selectedReport === report.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resultados del reporte generado */}
          {reportData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reporte Generado: {reportTypes.find(r => r.id === reportData.type)?.name}</CardTitle>
                <CardDescription>Generado el {new Date(reportData.generatedAt).toLocaleString('es-AR')}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.type === "ventas" && reportData.data ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Total de registros: {reportData.pagination?.total || reportData.data.length}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Número Venta</th>
                            <th className="text-left p-2">Fecha</th>
                            <th className="text-left p-2">Productos</th>
                            <th className="text-left p-2">Total</th>
                            <th className="text-left p-2">Estado</th>
                            <th className="text-left p-2">Vendedor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.data.map((venta: any) => (
                            <tr key={venta.id} className="border-b">
                              <td className="p-2">{venta.numeroVenta}</td>
                              <td className="p-2">{new Date(venta.fecha).toLocaleDateString('es-AR')}</td>
                              <td className="p-2">{venta.productos}</td>
                              <td className="p-2">{formatCurrency(venta.total)}</td>
                              <td className="p-2">{venta.estado}</td>
                              <td className="p-2">{venta.vendedor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : reportData.type === "inventario" && reportData.data ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Total de productos: {reportData.pagination?.total || reportData.data.length}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Stock</th>
                            <th className="text-left p-2">Stock Mínimo</th>
                            <th className="text-left p-2">Precio</th>
                            <th className="text-left p-2">Categoría</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.data.map((producto: any) => (
                            <tr key={producto.id} className="border-b">
                              <td className="p-2">{producto.name}</td>
                              <td className="p-2">{producto.stock}</td>
                              <td className="p-2">{producto.stock_min}</td>
                              <td className="p-2">{formatCurrency(producto.price)}</td>
                              <td className="p-2">{producto.category || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{reportData.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reportes recientes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Reportes Generados Recientemente</CardTitle>
              <CardDescription>Historial de reportes generados en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Reporte de Ventas - Diciembre 2024",
                    date: "15/01/2025 10:30",
                    type: "ventas",
                    size: "2.4 MB",
                  },
                  {
                    name: "Reporte de Inventario - Stock al 10/01",
                    date: "10/01/2025 15:45",
                    type: "inventario",
                    size: "1.8 MB",
                  },
                  {
                    name: "Reporte Financiero - Q4 2024",
                    date: "08/01/2025 09:15",
                    type: "financiero",
                    size: "3.2 MB",
                  },
                  {
                    name: "Reporte de Clientes - Análisis Anual",
                    date: "05/01/2025 14:20",
                    type: "clientes",
                    size: "1.5 MB",
                  },
                ].map((report, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
