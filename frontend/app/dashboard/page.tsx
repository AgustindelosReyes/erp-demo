'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StockCard } from "@/components/stock-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from '@/lib/auth-context'

interface DashboardStats {
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

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

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
          const response = await fetch(`${API_URL}/movements/stats/summary`, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setStats(data.data)
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

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} h`
    return date.toLocaleDateString('es-AR')
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              {loadingStats ? (
                <span className="text-sm text-muted-foreground">Actualizando...</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Última sincronización: {new Date().toLocaleTimeString('es-AR')}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.ventas_totales || 0)}</div>
                    <p className="text-xs text-muted-foreground">{stats?.count_ventas || 0} ventas completadas</p>
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
                    <div className="text-2xl font-bold">+{stats?.pedidos_activos || 0}</div>
                    <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">+{stats?.ventas_hoy || 0}</div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(stats?.ventas_hoy_total || 0)} hoy</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${stats?.alertas_stock ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.alertas_stock || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.alertas_stock ? 'Requieren atención inmediata' : 'Sin alertas'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <StockCard />
            </div>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : stats?.actividad_reciente && stats.actividad_reciente.length > 0 ? (
                  <div className="space-y-8">
                    {stats?.actividad_reciente?.map((actividad: { id: number; tipo: string; descripcion: string; monto: number; fecha: string }) => (
                      <div key={actividad.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{actividad.tipo}</p>
                          <p className="text-sm text-muted-foreground">{actividad.descripcion}</p>
                        </div>
                        <div className="ml-auto font-medium text-sm">
                          {formatCurrency(actividad.monto)}
                        </div>
                        <div className="ml-2 text-xs text-muted-foreground">
                          {getTimeAgo(actividad.fecha)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay actividad reciente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
