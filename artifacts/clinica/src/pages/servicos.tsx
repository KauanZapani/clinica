import { useListServices, useCreateService, useUpdateService, useDeleteService, getListServicesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function Servicos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services, isLoading } = useListServices();

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editService, setEditService] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    durationMinutes: 60,
    category: "",
    active: true,
  });

  const resetForm = () => setFormData({ name: "", description: "", price: 0, durationMinutes: 60, category: "", active: true });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { data: { ...formData, price: Number(formData.price), durationMinutes: Number(formData.durationMinutes) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          setIsCreateOpen(false);
          resetForm();
          toast({ title: "Serviço criado com sucesso" });
        },
        onError: () => toast({ title: "Erro ao criar serviço", variant: "destructive" }),
      }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    updateMutation.mutate(
      { id: editService.id, data: { ...formData, price: Number(formData.price), durationMinutes: Number(formData.durationMinutes) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          setEditService(null);
          resetForm();
          toast({ title: "Serviço atualizado com sucesso" });
        },
        onError: () => toast({ title: "Erro ao atualizar serviço", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
            toast({ title: "Serviço excluído com sucesso" });
          },
          onError: () => toast({ title: "Erro ao excluir serviço", variant: "destructive" }),
        }
      );
    }
  };

  const openEdit = (service: any) => {
    setEditService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      category: service.category,
      active: service.active,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-2">Catálogo de serviços oferecidos pela clínica.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Serviço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome *</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição *</Label>
                  <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$) *</Label>
                  <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Duração (minutos) *</Label>
                  <Input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="rounded-md border bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Serviço</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Preço / Duração</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services?.map((service) => (
                <tr key={service.id} className="border-t">
                  <td className="p-4">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-muted-foreground text-xs">{service.description}</div>
                  </td>
                  <td className="p-4">{service.category}</td>
                  <td className="p-4">
                    <div className="font-medium">{formatCurrency(service.price)}</div>
                    <div className="text-muted-foreground text-xs">{service.durationMinutes} min</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {services?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum serviço encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editService} onOpenChange={(open) => !open && setEditService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descrição *</Label>
                <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Duração (minutos) *</Label>
                <Input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 col-span-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>Atualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
