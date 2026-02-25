import { useAppData } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { FileText, CheckCircle2, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { ordens, statuses, loading } = useAppData();
  const { company } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hoje = new Date().toISOString().split("T")[0];
  const statusFinal = statuses.find(s => s.is_final);
  const statusCancelamento = statuses.find(s => s.is_cancelamento);

  const finalizadas = ordens.filter(o => o.status_id === statusFinal?.id);
  const finalizadasHoje = finalizadas.filter(o => o.data_finalizacao?.startsWith(hoje));
  const emAndamento = ordens.filter(o => o.status_id !== statusFinal?.id && o.status_id !== statusCancelamento?.id);
  const atrasadas = emAndamento.filter(o => o.data_prevista && o.data_prevista < hoje);
  const faturamentoHoje = finalizadasHoje.reduce((sum, o) => sum + Number(o.valor_total), 0);

  const recentes = ordens.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {company?.nome} — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de OS" value={ordens.length} icon={FileText} variant="default" />
        <StatCard title="Em Andamento" value={emAndamento.length} icon={FileText} variant="accent" />
        <StatCard title="Atrasadas" value={atrasadas.length} icon={AlertTriangle} variant="destructive" />
        <StatCard title="Faturamento Hoje" value={formatCurrency(faturamentoHoje)} icon={DollarSign} variant="success" />
      </div>

      {/* Recent OS */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Ordens Recentes</h2>
          <Link to="/ordens" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">OS</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Previsão</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((os) => (
                <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-semibold text-primary">
                    <Link to={`/ordens/${os.id}`}>{os.numero_os}</Link>
                  </td>
                  <td className="px-5 py-3">{(os as any).cliente?.nome ?? "—"}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(Number(os.valor_total))}</td>
                  <td className="px-5 py-3">{os.data_prevista ? formatDate(os.data_prevista) : "—"}</td>
                  <td className="px-5 py-3"><StatusBadge status={(os as any).status} /></td>
                </tr>
              ))}
              {recentes.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhuma OS registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Atrasadas */}
      {atrasadas.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-destructive mb-3">
            <AlertTriangle className="h-4 w-4" /> Ordens Atrasadas
          </h3>
          <div className="space-y-2">
            {atrasadas.map((os) => (
              <Link key={os.id} to={`/ordens/${os.id}`} className="flex items-center justify-between rounded-lg bg-card p-3 border border-border hover:shadow-sm transition-shadow">
                <div>
                  <span className="font-semibold text-primary">{os.numero_os}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span>{(os as any).cliente?.nome}</span>
                </div>
                <StatusBadge status={(os as any).status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
