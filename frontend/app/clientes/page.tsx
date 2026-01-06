"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ClientesTable, ClienteModal } from "@/components/clientes-table";
import { useClientes } from "@/hooks/use-clientes";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_registro: string;
  total_compras: number;
  avatar?: string;
}

export default function ClientesPage() {
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const handleAddCliente = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDeleteCliente = async (id: number) => {
    try {
      await deleteCliente(id);
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCliente = async (clienteData: Omit<Cliente, 'id' | 'fecha_registro' | 'total_compras'>) => {
    try {
      if (editingCliente) {
        // Editar cliente existente
        await updateCliente(editingCliente.id, clienteData);
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente han sido actualizados.",
        });
      } else {
        // Crear nuevo cliente
        await createCliente(clienteData);
        toast({
          title: "Cliente creado",
          description: "El nuevo cliente ha sido creado exitosamente.",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 font-semibold">Error al cargar clientes</p>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
        <p className="text-muted-foreground">
          Administra la información de tus clientes, realiza búsquedas y gestiona sus datos.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Button onClick={handleAddCliente} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </div>

      <ClientesTable
        clientes={clientes}
        onEdit={handleEditCliente}
        onDelete={handleDeleteCliente}
      />

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={editingCliente}
      />
    </div>
  );
}