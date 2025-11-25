import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold md:text-xl text-foreground">Pinturería Taragüí – ERP</h1>
        <div className="hidden md:flex items-center gap-2 ml-auto mr-4 w-full max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos, clientes..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notificaciones</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Usuario</span>
        </Button>
      </div>
    </header>
  )
}
