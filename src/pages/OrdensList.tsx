import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdensList() {
  const { ordens, statuses, loading } = useAppData();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const filtered = ordens.filter(o => {
    if (statusFilter !== "todos" && o.status_id !== statusFilter) return false;
    const q = busca.toLowerCase();
    if (!q) return true;
    const cliente = (o as any).cliente;
    return o.numero_os.toLowerCase().includes(q) || cliente?.nome?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">{ordens.length} ordens registradas</p>
        </div>
        <Button onClick={() => navigate("/ordens/nova")} className="gap-2"><Plus className="h-4 w-4" /> Nova OS</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nº ou cliente..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
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
            {filtered.map(os => (
              <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/ordens/${os.id}`)}>
                <td className="px-5 py-3 font-semibold text-primary">{os.numero_os}</td>
                <td className="px-5 py-3">{(os as any).cliente?.nome ?? "—"}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(Number(os.valor_total))}</td>
                <td className="px-5 py-3">{os.data_prevista ? formatDate(os.data_prevista) : "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={(os as any).status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhuma OS encontrada</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
