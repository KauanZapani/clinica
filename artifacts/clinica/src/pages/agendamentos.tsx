import { useListAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, getListAppointmentsQueryKey, useListClients, useListServices } from "@workspace/api-client-react";
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
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function Agendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { data: appointments, isLoading } = useListAppointments({ 
    status: statusFilter || undefined,
    date: dateFilter || undefined
  });
  
  const { data: clients } = useListClients();
  const { data: services } = useListServices();

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editApt, setEditApt] = useState<any>(null);

  const [formData, setFormData] = useState({
    clientId: 0,
    serviceId: 0,
    scheduledAt: "",
    status: "pendente",
    notes: "",
  });

  const resetForm = () => setFormData({ clientId: 0, serviceId: 0, scheduledAt: "", status: "pendente", notes: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceId || !formData.scheduledAt) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      { data: { ...formData, clientId: Number(formData.clientId), serviceId: Number(formData.serviceId), scheduledAt: new Date(formData.scheduledAt).toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          setIsCreateOpen(false);
          resetForm();
          toast({ title: "Agendamento criado com sucesso" });
        },
        onError: () => toast({ title: "Erro ao criar agendamento", variant: "destructive" }),
      }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editApt) return;
    updateMutation.mutate(
      { id: editApt.id, data: { ...formData, clientId: Number(formData.clientId), serviceId: Number(formData.serviceId), scheduledAt: new Date(formData.scheduledAt).toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          setEditApt(null);
          resetForm();
          toast({ title: "Agendamento atualizado com sucesso" });
        },
        onError: () => toast({ title: "Erro ao atualizar agendamento", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
            toast({ title: "Agendamento excluído com sucesso" });
          },
          onError: () => toast({ title: "Erro ao excluir agendamento", variant: "destructive" }),
        }
      );
    }
  };

  const toLocalDatetimeInput = (isoStr: string) => {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEdit = (apt: any) => {
    setEditApt(apt);
    setFormData({
      clientId: apt.clientId,
      serviceId: apt.serviceId,
      scheduledAt: toLocalDatetimeInput(apt.scheduledAt),
      status: apt.status,
      notes: apt.notes || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground mt-2">Gerencie os agendamentos da clínica.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Cliente *</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.clientId} 
                    onChange={e => setFormData({...formData, clientId: Number(e.target.value)})}
                    required
                  >
                    <option value={0}>Selecione um cliente</option>
                    {clients?.map(c => <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Serviço *</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.serviceId} 
                    onChange={e => setFormData({...formData, serviceId: Number(e.target.value)})}
                    required
                  >
                    <option value={0}>Selecione um serviço</option>
                    {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Data e Hora *</Label>
                  <Input type="datetime-local" required value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Filtrar por Status</Label>
          <select 
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Filtrar por Data</Label>
          <Input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)} 
          />
        </div>
        <div className="flex items-end mb-1">
          {(statusFilter || dateFilter) && (
            <Button variant="ghost" onClick={() => { setStatusFilter(""); setDateFilter(""); }}>
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="rounded-md border bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Paciente</th>
                <th className="p-4 font-medium">Serviço</th>
                <th className="p-4 font-medium">Data / Hora</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((apt) => (
                <tr key={apt.id} className="border-t">
                  <td className="p-4 font-medium">{apt.clientName}</td>
                  <td className="p-4">{apt.serviceName}</td>
                  <td className="p-4">{formatDate(apt.scheduledAt)}</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={
                        apt.status === "confirmado" ? "bg-green-100 text-green-800 border-green-200" :
                        apt.status === "pendente" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        apt.status === "cancelado" ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(apt)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(apt.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {appointments?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editApt} onOpenChange={(open) => !open && setEditApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Cliente *</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.clientId} 
                  onChange={e => setFormData({...formData, clientId: Number(e.target.value)})}
                  required
                >
                  <option value={0}>Selecione um cliente</option>
                  {clients?.map(c => <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Serviço *</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.serviceId} 
                  onChange={e => setFormData({...formData, serviceId: Number(e.target.value)})}
                  required
                >
                  <option value={0}>Selecione um serviço</option>
                  {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Data e Hora *</Label>
                <Input type="datetime-local" required value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Observações</Label>
                <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
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
