import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { formatCurrency } from "@/lib/formatters";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, FileText, TrendingUp, Clock, Download, Loader2 } from "lucide-react";

export default function Relatorios() {
  const { ordens, statuses, loading } = useAppData();

  const [inicio, setInicio] = useState("2025-01-01");
  const [fim, setFim] = useState("2026-12-31");
  const [statusFilter, setStatusFilter] = useState("todos");

  const statusFinal = statuses.find(s => s.is_final);
  const statusCancelamento = statuses.find(s => s.is_cancelamento);

  const filtered = useMemo(() => {
    return ordens.filter(o => {
      if (o.created_at < inicio || o.created_at > fim + "T23:59:59") return false;
      if (statusFilter !== "todos" && o.status_id !== statusFilter) return false;
      return true;
    });
  }, [ordens, inicio, fim, statusFilter]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const totalFaturado = filtered.filter(o => o.status_id !== statusCancelamento?.id).reduce((s, o) => s + Number(o.valor_total), 0);
  const qtdOS = filtered.length;
  const ticketMedio = qtdOS > 0 ? totalFaturado / qtdOS : 0;

  const finalizadas = filtered.filter(o => o.status_id === statusFinal?.id);
  const tempoMedio = finalizadas.length > 0
    ? finalizadas.reduce((s, o) => {
        const diff = new Date(o.data_finalizacao || o.updated_at).getTime() - new Date(o.created_at).getTime();
        return s + diff / (1000 * 60 * 60 * 24);
      }, 0) / finalizadas.length
    : 0;

  const exportCSV = () => {
    const headers = "Nº OS,Cliente,Total,Status,Data Criação,Previsão\n";
    const rows = filtered.map(o => {
      const cliente = (o as any).cliente;
      const status = (o as any).status;
      return `${o.numero_os},"${cliente?.nome || ""}",${o.valor_total},"${status?.nome || ""}",${o.created_at},${o.data_prevista || ""}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${inicio}_${fim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise gerencial das ordens de serviço</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> Exportar CSV</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Data Início</Label><Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
          <div><Label>Data Fim</Label><Input type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Faturado" value={formatCurrency(totalFaturado)} icon={DollarSign} variant="success" />
        <StatCard title="Quantidade de OS" value={qtdOS} icon={FileText} variant="default" />
        <StatCard title="Ticket Médio" value={formatCurrency(ticketMedio)} icon={TrendingUp} variant="accent" />
        <StatCard title="Tempo Médio (dias)" value={tempoMedio.toFixed(1)} icon={Clock} variant="warning" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">OS</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(os => (
              <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-semibold text-primary">{os.numero_os}</td>
                <td className="px-5 py-3">{(os as any).cliente?.nome || "—"}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(Number(os.valor_total))}</td>
                <td className="px-5 py-3"><StatusBadge status={(os as any).status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
