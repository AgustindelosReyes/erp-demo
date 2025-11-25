import type React from "react"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, PaintBucket } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div
      className={cn(
        "pb-12 min-h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:block",
        className,
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PaintBucket className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Taragüí ERP</h2>
          </div>
          <div className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-sidebar-accent-foreground transition-all hover:text-sidebar-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Package className="h-4 w-4" />
              Inventario
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
              Ventas
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Users className="h-4 w-4" />
              Clientes
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Reportes
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/50 uppercase">
            Configuración
          </h2>
          <div className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Ajustes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
