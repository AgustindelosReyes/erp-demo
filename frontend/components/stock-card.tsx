"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Package, AlertTriangle, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface StockStats {
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

export function StockCard() {
  const [stats, setStats] = useState<StockStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    const fetchStats = async () => {
      console.log("[DEBUG StockCard] Iniciando fetch...")
      console.log("[DEBUG StockCard] Token presente:", !!token)
      console.log("[DEBUG StockCard] API URL:", API_URL)
      
      try {
        const response = await fetch(`${API_URL}/products/stats/summary`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        console.log("[DEBUG StockCard] Response status:", response.status)
        console.log("[DEBUG StockCard] Response ok:", response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log("[DEBUG StockCard] Datos recibidos:", data)
          setStats(data.data)
        } else {
          console.error("[DEBUG StockCard] Error en respuesta:", response.status)
          const errorText = await response.text()
          console.error("[DEBUG StockCard] Error body:", errorText)
        }
      } catch (error) {
        console.error("[DEBUG StockCard] Error en fetch:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  const getStockPercentage = (stock: number, stockMin: number) => {
    if (stockMin === 0) return 100
    return Math.min((stock / stockMin) * 100, 100)
  }

  const getStockColor = (percentage: number) => {
    if (percentage <= 25) return "bg-destructive"
    if (percentage <= 50) return "bg-amber-500"
    return "bg-green-500"
  }

  const getStockStatus = (stock: number, stockMin: number) => {
    if (stock < stockMin * 0.5) return { label: "Crítico", color: "text-destructive" }
    if (stock <= stockMin) return { label: "Bajo", color: "text-amber-600" }
    return { label: "Normal", color: "text-green-600" }
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Control de Stock</CardTitle>
          <CardDescription>Resumen del inventario actual</CardDescription>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Productos Totales</span>
            {loading ? (
              <Loader2 className="h-6 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-2xl font-bold">{stats?.total_products?.toLocaleString() || 0}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Bajo Stock <AlertTriangle className="h-3 w-3 text-amber-500" />
            </span>
            {loading ? (
              <Loader2 className="h-6 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-2xl font-bold text-amber-600">{stats?.low_stock || 0}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Actualizado <Clock className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium mt-1">Ahora</span>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
            stats.low_stock_products.map((product) => {
              const percentage = getStockPercentage(product.stock, product.stock_min)
              const status = getStockStatus(product.stock, product.stock_min)
              return (
                <div key={product.id} className="rounded-md bg-muted p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate pr-2">{product.name}</span>
                    <span className={`font-bold ${status.color}`}>{product.stock} un.</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-background">
                    <div
                      className={`h-full rounded-full ${getStockColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No hay productos con stock bajo
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Link href="/inventario" className="w-full">
          <Button variant="ghost" className="w-full justify-between hover:bg-background group" size="sm">
            Ver detalles de inventario
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
