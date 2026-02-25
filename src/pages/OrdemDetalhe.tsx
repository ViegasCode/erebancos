import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Clock, User, Wrench, CreditCard, Loader2 } from "lucide-react";
import type { OSItem, ValorCampoOS, HistoricoStatus } from "@/types";

export default function OrdemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ordens, statuses, updateOrdemStatus, getOrdemItens, getOrdemCampos, getOrdemHistorico } = useAppData();

  const [itens, setItens] = useState<OSItem[]>([]);
  const [camposValores, setCamposValores] = useState<ValorCampoOS[]>([]);
  const [historico, setHistorico] = useState<HistoricoStatus[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const os = ordens.find(o => o.id === id);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingDetail(true);
      const [i, c, h] = await Promise.all([getOrdemItens(id), getOrdemCampos(id), getOrdemHistorico(id)]);
      setItens(i);
      setCamposValores(c);
      setHistorico(h);
      setLoadingDetail(false);
    };
    load();
  }, [id, getOrdemItens, getOrdemCampos, getOrdemHistorico]);

  if (!os) return <div className="p-8 text-center text-muted-foreground">OS não encontrada</div>;

  const currentStatus = (os as any).status;
  const cliente = (os as any).cliente;
  const isFinal = currentStatus?.is_final;
  const isCancelado = currentStatus?.is_cancelamento;

  const handleStatusChange = async (statusId: string) => {
    try {
      await updateOrdemStatus(os.id, statusId);
      toast.success("Status atualizado!");
      // Refresh detail data
      const h = await getOrdemHistorico(os.id);
      setHistorico(h);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{os.numero_os}</h1>
            <p className="text-sm text-muted-foreground">Criada em {formatDate(os.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {!isFinal && !isCancelado && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Alterar status:</span>
              <Select value={os.status_id || ""} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.filter(s => s.ativo).map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Status Progress */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={currentStatus} />
          <span className="text-sm text-muted-foreground">• Atualizada em {formatDate(os.updated_at)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {statuses.filter(s => s.ativo && !s.is_cancelamento).map(s => {
            const active = s.ordem <= (currentStatus?.ordem ?? -1);
            return (
              <div
                key={s.id}
                className={`rounded-full px-3 py-1 text-xs font-medium ${active ? "" : "bg-muted text-muted-foreground"}`}
                style={active ? { backgroundColor: `${s.cor}30`, color: s.cor } : undefined}
              >
                {s.nome}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cliente */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><User className="h-4 w-4 text-primary" /> Cliente</h3>
          {cliente && (
            <div className="space-y-1 text-sm">
              <p><Link to={`/clientes/${cliente.id}`} className="font-medium text-primary hover:underline">{cliente.nome}</Link></p>
              <p className="text-muted-foreground">{cliente.tipo_documento}: {cliente.documento}</p>
              <p className="text-muted-foreground">Tel: {cliente.telefone}</p>
            </div>
          )}
        </div>

        {/* Financeiro */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><CreditCard className="h-4 w-4 text-primary" /> Financeiro</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total da OS</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(Number(os.valor_total))}</span>
            </div>
            {os.data_prevista && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previsão</span>
                <span>{formatDate(os.data_prevista)}</span>
              </div>
            )}
            {os.data_finalizacao && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finalizada em</span>
                <span>{formatDate(os.data_finalizacao)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Wrench className="h-4 w-4 text-primary" /> Itens</h3>
          {loadingDetail ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 font-medium">Tipo</th>
                    <th className="py-2 font-medium">Descrição</th>
                    <th className="py-2 font-medium text-right">Qtd</th>
                    <th className="py-2 font-medium text-right">Unit.</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2"><span className="status-badge bg-muted text-muted-foreground">{item.tipo}</span></td>
                      <td className="py-2">{item.descricao}</td>
                      <td className="py-2 text-right">{item.quantidade}</td>
                      <td className="py-2 text-right">{formatCurrency(Number(item.valor_unitario))}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(Number(item.valor_total))}</td>
                    </tr>
                  ))}
                  {itens.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhum item</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {camposValores.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold mb-3">Campos Personalizados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {camposValores.map(cv => (
                <div key={cv.id}>
                  <span className="text-muted-foreground">{cv.campo?.nome}:</span> <span className="font-medium">{cv.valor || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {os.observacoes && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground">{os.observacoes}</p>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" /> Histórico de Status</h3>
        </div>
        <div className="p-5">
          {loadingDetail ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-3">
              {historico.map(h => (
                <div key={h.id} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <StatusBadge status={h.status} />
                  <span className="text-muted-foreground">por {h.usuario?.nome || "Sistema"}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{new Date(h.data_hora).toLocaleString("pt-BR")}</span>
                </div>
              ))}
              {historico.length === 0 && <p className="text-muted-foreground text-sm">Nenhum registro</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
