import { ArrowRight, Package, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function StockCard() {
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
            <span className="text-2xl font-bold">1,248</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Bajo Stock <AlertTriangle className="h-3 w-3 text-amber-500" />
            </span>
            <span className="text-2xl font-bold text-amber-600">24</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Actualizado <Clock className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium mt-1">Hace 10 min</span>
          </div>
        </div>

        <div className="mt-2 rounded-md bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Látex Interior Mate 20L</span>
            <span className="text-destructive font-bold">3 un.</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-background">
            <div className="h-full w-[15%] rounded-full bg-destructive" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Button variant="ghost" className="w-full justify-between hover:bg-background group" size="sm">
          Ver detalles de inventario
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
