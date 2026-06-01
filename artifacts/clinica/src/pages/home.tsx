import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CalendarCheck, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) {
    return <div className="p-4">Carregando...</div>;
  }

  if (error || !summary) {
    return <div className="p-4 text-destructive">Erro ao carregar dados.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Início</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema da clínica.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.appointmentsToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.confirmedAppointments}</div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Agendamentos Recentes</h2>
      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serviço</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data/Hora</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {summary.recentAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">{appointment.clientName}</td>
                  <td className="p-4 align-middle">{appointment.serviceName}</td>
                  <td className="p-4 align-middle">{formatDate(appointment.scheduledAt)}</td>
                  <td className="p-4 align-middle">
                    <Badge
                      variant="outline"
                      className={
                        appointment.status === "confirmado" ? "bg-green-100 text-green-800 border-green-200" :
                        appointment.status === "pendente" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        appointment.status === "cancelado" ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {summary.recentAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum agendamento recente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
