import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { formatCurrency } from "@/lib/formatters";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign, FileText, TrendingUp, Clock, Download } from "lucide-react";

export default function Relatorios() {
  const { ordens } = useAppData();

  const [inicio, setInicio] = useState("2025-01-01");
  const [fim, setFim] = useState("2025-12-31");
  const [vendedor, setVendedor] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const vendedores = [...new Set(ordens.map((o) => o.vendedor))];

  const filtered = useMemo(() => {
    return ordens.filter((o) => {
      if (o.created_at < inicio || o.created_at > fim + "T23:59:59") return false;
      if (vendedor !== "todos" && o.vendedor !== vendedor) return false;
      if (statusFilter !== "todos" && o.status !== statusFilter) return false;
      return true;
    });
  }, [ordens, inicio, fim, vendedor, statusFilter]);

  const totalFaturado = filtered.filter((o) => o.status !== "Cancelada").reduce((s, o) => s + o.valor, 0);
  const qtdOS = filtered.length;
  const ticketMedio = qtdOS > 0 ? totalFaturado / qtdOS : 0;

  const finalizadas = filtered.filter((o) => ["Finalizada", "Entregue"].includes(o.status));
  const tempoMedio = finalizadas.length > 0
    ? finalizadas.reduce((s, o) => {
        const diff = new Date(o.updated_at).getTime() - new Date(o.created_at).getTime();
        return s + diff / (1000 * 60 * 60 * 24);
      }, 0) / finalizadas.length
    : 0;

  const exportCSV = () => {
    const headers = "Nº OS,Cliente ID,Marca,Modelo,Tipo,Valor,Vendedor,Status,Data Criação,Previsão\n";
    const rows = filtered.map((o) => `${o.numero_os},${o.cliente_id},${o.marca},${o.modelo},${o.tipo},${o.valor},${o.vendedor},${o.status},${o.created_at},${o.data_previsao}`).join("\n");
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

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-4">
          <div><Label>Data Início</Label><Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
          <div><Label>Data Fim</Label><Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></div>
          <div>
            <Label>Vendedor</Label>
            <Select value={vendedor} onValueChange={setVendedor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {vendedores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Finalizada">Finalizada</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Faturado" value={formatCurrency(totalFaturado)} icon={DollarSign} variant="success" />
        <StatCard title="Quantidade de OS" value={qtdOS} icon={FileText} variant="default" />
        <StatCard title="Ticket Médio" value={formatCurrency(ticketMedio)} icon={TrendingUp} variant="accent" />
        <StatCard title="Tempo Médio (dias)" value={tempoMedio.toFixed(1)} icon={Clock} variant="warning" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">OS</th>
              <th className="px-5 py-3 font-medium">Moto</th>
              <th className="px-5 py-3 font-medium">Vendedor</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((os) => (
              <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-semibold text-primary">#{os.numero_os}</td>
                <td className="px-5 py-3">{os.marca} {os.modelo}</td>
                <td className="px-5 py-3">{os.vendedor}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(os.valor)}</td>
                <td className="px-5 py-3"><span className="status-badge bg-muted text-muted-foreground">{os.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
