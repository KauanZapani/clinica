import { useLookupAppointments } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Consulta() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: appointments, isLoading, isError } = useLookupAppointments(
    { query: searchQuery },
    { query: { enabled: !!searchQuery } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Consulta de Agendamentos</h1>
        <p className="text-muted-foreground">
          Digite seu nome ou CPF para visualizar seus agendamentos na clínica.
        </p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Nome completo ou CPF"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={query.length < 3}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center text-muted-foreground p-8">Buscando...</div>}

      {isError && (
        <div className="text-center text-destructive p-8 bg-destructive/10 rounded-lg">
          Ocorreu um erro ao buscar. Tente novamente.
        </div>
      )}

      {appointments && appointments.length === 0 && (
        <div className="text-center text-muted-foreground p-8 bg-muted/50 rounded-lg">
          Nenhum agendamento encontrado para "{searchQuery}".
        </div>
      )}

      {appointments && appointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold px-1">Seus Agendamentos ({appointments.length})</h2>
          {appointments.map((apt) => (
            <Card key={apt.id} className="overflow-hidden border-primary/10">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">{apt.serviceName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(apt.scheduledAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      apt.status === "confirmado" ? "bg-green-100 text-green-800 border-green-200" :
                      apt.status === "pendente" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      apt.status === "cancelado" ? "bg-red-100 text-red-800 border-red-200" :
                      "bg-blue-100 text-blue-800 border-blue-200"
                    }
                  >
                    {apt.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Paciente</span>
                    <span className="font-medium">{apt.clientName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Valor</span>
                    <span className="font-medium">{formatCurrency(apt.servicePrice)}</span>
                  </div>
                  {apt.notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs">Observações</span>
                      <span className="text-foreground">{apt.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
