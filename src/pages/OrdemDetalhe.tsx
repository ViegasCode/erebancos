import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { OS_STATUS_FLOW } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, XCircle, Clock, User, Bike, Wrench, Ruler, CreditCard, MapPin } from "lucide-react";
import { PrintOSButton, PreviewOSButton } from "@/components/PrintOS";

export default function OrdemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ordens, clientes, historico, avancarStatus, cancelarOS } = useAppData();

  const os = ordens.find((o) => o.id === id);
  if (!os) return <div className="p-8 text-center text-muted-foreground">OS não encontrada</div>;

  const cliente = clientes.find((c) => c.id === os.cliente_id);
  const hist = historico.filter((h) => h.os_id === os.id).sort((a, b) => b.data_hora.localeCompare(a.data_hora));

  const canAdvance = OS_STATUS_FLOW.indexOf(os.status) >= 0 && OS_STATUS_FLOW.indexOf(os.status) < OS_STATUS_FLOW.length - 1 && os.status !== "Cancelada";
  const canCancel = os.status !== "Finalizado" && os.status !== "Cancelada";

  const handleAdvance = () => {
    avancarStatus(os.id, "Operador");
    toast.success("Status avançado com sucesso!");
  };

  const handleCancel = () => {
    cancelarOS(os.id, "Operador");
    toast.info("OS cancelada");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">OS #{os.numero_os}</h1>
            <p className="text-sm text-muted-foreground">Criada em {formatDate(os.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PreviewOSButton os={os} cliente={cliente} />
          <PrintOSButton os={os} cliente={cliente} />
          {canAdvance && (
            <Button onClick={handleAdvance} className="gap-2">
              <ChevronRight className="h-4 w-4" /> Avançar Etapa
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={handleCancel} className="gap-2 text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4" /> Cancelar OS
            </Button>
          )}
        </div>
      </div>

      {/* Status Progress */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={os.status} />
          <span className="text-sm text-muted-foreground">• Atualizada em {formatDate(os.updated_at)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {OS_STATUS_FLOW.map((s, i) => {
            const idx = OS_STATUS_FLOW.indexOf(os.status);
            const active = i <= idx;
            return (
              <div key={s} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
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
              <p className="text-muted-foreground">CPF: {cliente.cpf}</p>
              <p className="text-muted-foreground">Tel: {cliente.telefone}</p>
            </div>
          )}
        </div>

        {/* Moto */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Bike className="h-4 w-4 text-primary" /> Moto</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Marca:</span> {os.marca}</div>
            <div><span className="text-muted-foreground">Modelo:</span> {os.modelo}</div>
            <div><span className="text-muted-foreground">Cilindrada:</span> {os.cilindrada || "—"}</div>
            <div><span className="text-muted-foreground">Ano:</span> {os.ano || "—"}</div>
          </div>
        </div>

        {/* Serviços */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Wrench className="h-4 w-4 text-primary" /> Serviços</h3>
          <div className="space-y-3 text-sm">
            {os.servicos.map((srv, i) => (
              <div key={i} className="rounded-lg bg-muted/30 p-3">
                <p className="font-medium">{srv.descricao}</p>
                {srv.material && <p className="text-muted-foreground text-xs mt-1">Material: {srv.material}</p>}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div><span className="text-muted-foreground">Tipo:</span> {os.tipo}</div>
              <div><span className="text-muted-foreground">Vendedor:</span> {os.vendedor}</div>
              <div><span className="text-muted-foreground">Previsão:</span> {formatDate(os.data_previsao)}</div>
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><CreditCard className="h-4 w-4 text-primary" /> Pagamento</h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Valor:</span> {formatCurrency(os.valor)}</div>
              <div><span className="text-muted-foreground">Desconto:</span> {formatCurrency(os.desconto)}</div>
              <div><span className="text-muted-foreground">Frete:</span> {formatCurrency(os.frete)}</div>
              <div><span className="text-muted-foreground font-semibold">Total:</span> <span className="font-bold text-primary">{formatCurrency(os.total_venda)}</span></div>
            </div>
            <div className="pt-2 border-t border-border space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Formas de pagamento:</p>
              {os.pagamentos.map((pg, i) => (
                <div key={i} className="flex justify-between">
                  <span>{pg.forma}</span>
                  <span className="font-medium">{formatCurrency(pg.valor)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Local:</span> {os.local_compra}
                {os.influencer && <span className="ml-1">({os.influencer})</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Dados Técnicos */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Ruler className="h-4 w-4 text-primary" /> Dados Técnicos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <div><span className="text-muted-foreground">Peso Piloto:</span> {os.peso_piloto || "—"}</div>
            <div><span className="text-muted-foreground">Altura Piloto:</span> {os.altura_piloto || "—"}</div>
            <div><span className="text-muted-foreground">Peso Garupa:</span> {os.peso_garupa || "—"}</div>
            <div><span className="text-muted-foreground">Altura Garupa:</span> {os.altura_garupa || "—"}</div>
            <div><span className="text-muted-foreground">Cóccix:</span> {os.coccix || "Sem ajuste"}</div>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" /> Histórico de Status</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {hist.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <StatusBadge status={h.status} />
                <span className="text-muted-foreground">por {h.usuario}</span>
                <span className="text-muted-foreground text-xs ml-auto">{new Date(h.data_hora).toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
