import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, LogIn, UserPlus } from "lucide-react";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nome: "", companyName: "" });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(form.email, form.password);
        toast.success("Login realizado com sucesso!");
      } else {
        if (!form.nome || !form.companyName) {
          toast.error("Preencha todos os campos");
          setLoading(false);
          return;
        }
        await signUp(form.email, form.password, form.nome, form.companyName);
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-black">
            OS
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">OS Manager</h1>
          <p className="mt-2 text-muted-foreground">Plataforma SaaS de Ordens de Serviço</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex gap-1 mb-6 rounded-lg bg-muted p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <LogIn className="inline h-4 w-4 mr-1" /> Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <UserPlus className="inline h-4 w-4 mr-1" /> Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label>Nome Completo</Label>
                  <Input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder="Seu nome" required />
                </div>
                <div>
                  <Label>Nome da Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="Nome da sua empresa" className="pl-10" required />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="email@exemplo.com" required />
            </div>

            <div>
              <Label>Senha</Label>
              <Input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" minLength={6} required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta e Empresa"}
            </Button>
          </form>

          {!isLogin && (
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Ao criar uma conta, uma empresa será criada automaticamente e você será o administrador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
