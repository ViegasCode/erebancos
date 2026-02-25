import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Mail, Phone, MapPin, Loader2 } from "lucide-react";

export default function ClienteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clientes, getClienteOrdens, loading } = useAppData();

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return <div className="p-8 text-center text-muted-foreground">Cliente não encontrado</div>;

  const ordensCliente = getClienteOrdens(cliente.id);
  const totalGasto = ordensCliente.filter(o => !(o as any).status?.is_cancelamento).reduce((s, o) => s + Number(o.valor_total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{cliente.nome}</h1>
          <p className="text-sm text-muted-foreground">{cliente.tipo_documento}: {cliente.documento}</p>
        </div>
        <Button onClick={() => navigate(`/ordens/nova?cliente=${cliente.id}`)} className="gap-2"><Plus className="h-4 w-4" /> Nova OS</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card border-l-4 border-l-primary"><p className="text-sm text-muted-foreground">Total Gasto</p><p className="text-xl font-bold">{formatCurrency(totalGasto)}</p></div>
        <div className="stat-card border-l-4 border-l-accent"><p className="text-sm text-muted-foreground">Total de OS</p><p className="text-xl font-bold">{ordensCliente.length}</p></div>
        <div className="stat-card border-l-4 border-l-info"><p className="text-sm text-muted-foreground">Cliente desde</p><p className="text-xl font-bold">{formatDate(cliente.created_at)}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold mb-3">Informações de Contato</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {cliente.telefone}</div>
          {cliente.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {cliente.email}</div>}
          {cliente.cidade && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {cliente.cidade}/{cliente.estado}</div>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-semibold">Histórico de OS</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">OS</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordensCliente.map(os => (
                <tr key={os.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-semibold"><Link to={`/ordens/${os.id}`} className="text-primary hover:underline">{os.numero_os}</Link></td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(Number(os.valor_total))}</td>
                  <td className="px-5 py-3">{formatDate(os.created_at)}</td>
                  <td className="px-5 py-3"><StatusBadge status={(os as any).status} /></td>
                </tr>
              ))}
              {ordensCliente.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Nenhuma OS registrada</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
