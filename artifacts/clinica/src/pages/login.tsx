import { useState } from "react";
import { useAuth, type Role } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ShieldCheck, ConciergeBell } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError("");

    setTimeout(() => {
      const ok = login(selectedRole, password);
      if (!ok) {
        setError("Senha incorreta. Tente novamente.");
        setPassword("");
      }
      setLoading(false);
    }, 400);
  };

  const roles: { key: Role; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: "recepcao",
      label: "Recepção",
      desc: "Editar clientes e gerenciar agendamentos",
      icon: <ConciergeBell className="h-6 w-6" />,
    },
    {
      key: "administrador",
      label: "Administrador",
      desc: "Acesso completo ao sistema",
      icon: <ShieldCheck className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(205_70%_92%)] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Clínica</h1>
          <p className="text-muted-foreground mt-1">Sistema de Gestão</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Selecione seu perfil de acesso</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  data-testid={`role-${r.key}`}
                  onClick={() => { setSelectedRole(r.key); setPassword(""); setError(""); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                    selectedRole === r.key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {r.icon}
                  <span className="font-semibold text-sm">{r.label}</span>
                  <span className="text-xs leading-tight opacity-80">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedRole && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha — {selectedRole === "recepcao" ? "Recepção" : "Administrador"}
                </Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoFocus
                />
                {error && (
                  <p data-testid="text-login-error" className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                data-testid="button-entrar"
                disabled={!password || loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Clínica de Cirurgia Plástica &mdash; Acesso restrito
        </p>
      </div>
    </div>
  );
}
