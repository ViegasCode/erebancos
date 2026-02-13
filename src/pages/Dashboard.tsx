import { useAppData } from "@/context/AppContext";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { FileText, Factory, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { ordens, clientes, getOrdensHoje } = useAppData();

  const hoje = new Date().toISOString().split("T")[0];
  const ordensHoje = getOrdensHoje();
  const emProducao = ordens.filter((o) => !["Finalizada", "Entregue", "Cancelada", "Criada"].includes(o.status));
  const finalizadasHoje = ordens.filter((o) => o.status === "Finalizada" && o.updated_at.startsWith(hoje));
  const atrasadas = ordens.filter((o) => o.data_previsao < hoje && !["Finalizada", "Entregue", "Cancelada"].includes(o.status));
  const faturamentoHoje = ordens.filter((o) => o.status === "Entregue" && o.updated_at.startsWith(hoje)).reduce((sum, o) => sum + o.valor, 0);

  const recentes = [...ordens].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da produção — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="OS do Dia" value={ordensHoje.length} icon={FileText} variant="default" />
        <StatCard title="Em Produção" value={emProducao.length} icon={Factory} variant="accent" />
        <StatCard title="Finalizadas Hoje" value={finalizadasHoje.length} icon={CheckCircle2} variant="success" />
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
                <th className="px-5 py-3 font-medium">Moto</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Previsão</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((os) => {
                const cliente = clientes.find((c) => c.id === os.cliente_id);
                return (
                  <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-semibold text-primary">
                      <Link to={`/ordens/${os.id}`}>#{os.numero_os}</Link>
                    </td>
                    <td className="px-5 py-3">{cliente?.nome ?? "—"}</td>
                    <td className="px-5 py-3">{os.marca} {os.modelo}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(os.valor)}</td>
                    <td className="px-5 py-3">{formatDate(os.data_previsao)}</td>
                    <td className="px-5 py-3"><StatusBadge status={os.status} /></td>
                  </tr>
                );
              })}
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
            {atrasadas.map((os) => {
              const cliente = clientes.find((c) => c.id === os.cliente_id);
              return (
                <Link key={os.id} to={`/ordens/${os.id}`} className="flex items-center justify-between rounded-lg bg-card p-3 border border-border hover:shadow-sm transition-shadow">
                  <div>
                    <span className="font-semibold text-primary">#{os.numero_os}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span>{cliente?.nome}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{os.marca} {os.modelo}</span>
                  </div>
                  <StatusBadge status={os.status} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
