import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatDocumento, formatPhone, validateDocumento, formatCurrency } from "@/lib/formatters";
import type { CampoOS, OSItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Search, Save, UserPlus, Plus, Trash2 } from "lucide-react";

type TipoDoc = "CPF" | "CNPJ";

export default function OrdemNova() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientes, addCliente, addOrdem, campos, servicos, produtos } = useAppData();

  const [docBusca, setDocBusca] = useState("");
  const [tipoDocBusca, setTipoDocBusca] = useState<TipoDoc>("CPF");
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(searchParams.get("cliente"));
  const [showCadastro, setShowCadastro] = useState(false);
  const [tipoDocNovo, setTipoDocNovo] = useState<TipoDoc>("CPF");
  const [novoCliente, setNovoCliente] = useState({ nome: "", documento: "", telefone: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Items (services + products)
  const [itens, setItens] = useState<Partial<OSItem>[]>([{ tipo: "servico", descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 }]);

  // Custom fields
  const [camposValores, setCamposValores] = useState<Record<string, string>>({});
  const activeCampos = campos.filter(c => c.ativo);

  useEffect(() => {
    const initial: Record<string, string> = {};
    activeCampos.forEach(c => { initial[c.id] = ""; });
    setCamposValores(initial);
  }, [campos]);

  // Form
  const [dataPrevista, setDataPrevista] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const cliente = clientes.find(c => c.id === clienteSelecionado);
  const valorTotal = itens.reduce((sum, item) => sum + (item.valor_total || 0), 0);

  const buscarDoc = () => {
    const found = clientes.find(c => c.documento.replace(/\D/g, "") === docBusca.replace(/\D/g, ""));
    if (found) {
      setClienteSelecionado(found.id);
      setShowCadastro(false);
      toast.success(`Cliente encontrado: ${found.nome}`);
    } else {
      toast.info("Cliente não encontrado. Cadastre abaixo.");
      setShowCadastro(true);
      setTipoDocNovo(tipoDocBusca);
      setNovoCliente(n => ({ ...n, documento: formatDocumento(docBusca, tipoDocBusca) }));
    }
  };

  const cadastrarRapido = async () => {
    if (!novoCliente.nome || !novoCliente.documento || !novoCliente.telefone) { toast.error("Preencha nome, documento e telefone"); return; }
    if (!validateDocumento(novoCliente.documento, tipoDocNovo)) { toast.error(`${tipoDocNovo} inválido`); return; }
    try {
      const c = await addCliente({ ...novoCliente, tipo_documento: tipoDocNovo });
      setClienteSelecionado(c.id);
      setShowCadastro(false);
      toast.success("Cliente cadastrado!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addItem = () => setItens(s => [...s, { tipo: "servico", descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 }]);
  const removeItem = (i: number) => setItens(s => s.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    setItens(s => s.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantidade" || field === "valor_unitario") {
        updated.valor_total = (updated.quantidade || 1) * (updated.valor_unitario || 0);
      }
      if (field === "referencia_id" && updated.tipo === "servico") {
        const srv = servicos.find(s => s.id === value);
        if (srv) { updated.descricao = srv.nome; updated.valor_unitario = Number(srv.preco); updated.valor_total = (updated.quantidade || 1) * Number(srv.preco); }
      }
      if (field === "referencia_id" && updated.tipo === "produto") {
        const prod = produtos.find(p => p.id === value);
        if (prod) { updated.descricao = prod.nome; updated.valor_unitario = Number(prod.preco); updated.valor_total = (updated.quantidade || 1) * Number(prod.preco); }
      }
      return updated;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado) { toast.error("Selecione um cliente"); return; }
    if (itens.some(item => !item.descricao)) { toast.error("Preencha a descrição de todos os itens"); return; }

    // Validate required custom fields
    for (const campo of activeCampos) {
      if (campo.obrigatorio && !camposValores[campo.id]) {
        toast.error(`Campo "${campo.nome}" é obrigatório`);
        return;
      }
    }

    setLoading(true);
    try {
      const camposArray = Object.entries(camposValores).filter(([_, v]) => v).map(([campo_id, valor]) => ({ campo_id, valor }));
      const os = await addOrdem(
        { cliente_id: clienteSelecionado, data_prevista: dataPrevista || undefined, observacoes: observacoes || undefined },
        itens as Partial<OSItem>[],
        camposArray
      );
      toast.success(`${os.numero_os} criada com sucesso!`);
      navigate(`/ordens/${os.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar OS");
    } finally {
      setLoading(false);
    }
  };

  const renderCampo = (campo: CampoOS) => {
    const value = camposValores[campo.id] || "";
    const onChange = (v: string) => setCamposValores(prev => ({ ...prev, [campo.id]: v }));

    switch (campo.tipo) {
      case "texto":
        return <Input value={value} onChange={e => onChange(e.target.value)} placeholder={campo.nome} />;
      case "numero":
        return <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={campo.nome} />;
      case "data":
        return <Input type="date" value={value} onChange={e => onChange(e.target.value)} />;
      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {(campo.opcoes || []).map((op: string) => <SelectItem key={op} value={op}>{op}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox checked={value === "true"} onCheckedChange={v => onChange(v ? "true" : "false")} />
            <span className="text-sm">{campo.nome}</span>
          </div>
        );
      default:
        return <Input value={value} onChange={e => onChange(e.target.value)} />;
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados para criar a OS</p>
        </div>
      </div>

      {/* Cliente Search */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-semibold">1. Cliente</h3>
        {cliente ? (
          <div className="flex items-center justify-between rounded-lg bg-success/10 p-3 border border-success/20">
            <div>
              <p className="font-medium">{cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{cliente.tipo_documento}: {cliente.documento} • {cliente.telefone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setClienteSelecionado(null); setDocBusca(""); }}>Alterar</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button type="button" size="sm" variant={tipoDocBusca === "CPF" ? "default" : "outline"} onClick={() => setTipoDocBusca("CPF")}>CPF</Button>
                <Button type="button" size="sm" variant={tipoDocBusca === "CNPJ" ? "default" : "outline"} onClick={() => setTipoDocBusca("CNPJ")}>CNPJ</Button>
              </div>
              <Input placeholder={`Buscar por ${tipoDocBusca}...`} value={docBusca} onChange={e => setDocBusca(formatDocumento(e.target.value, tipoDocBusca))} className="flex-1" />
              <Button onClick={buscarDoc} className="gap-2"><Search className="h-4 w-4" /> Buscar</Button>
            </div>
            {showCadastro && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" /> Cadastro Rápido</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome *" value={novoCliente.nome} onChange={e => setNovoCliente(n => ({ ...n, nome: e.target.value }))} />
                  <Input placeholder={`${tipoDocNovo} *`} value={novoCliente.documento} onChange={e => setNovoCliente(n => ({ ...n, documento: formatDocumento(e.target.value, tipoDocNovo) }))} />
                  <Input placeholder="Telefone *" value={novoCliente.telefone} onChange={e => setNovoCliente(n => ({ ...n, telefone: formatPhone(e.target.value) }))} />
                  <Input placeholder="Email" value={novoCliente.email} onChange={e => setNovoCliente(n => ({ ...n, email: e.target.value }))} />
                </div>
                <Button onClick={cadastrarRapido} size="sm">Cadastrar e Selecionar</Button>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Itens */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">2. Itens da OS</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3 w-3" /> Adicionar Item</Button>
          </div>
          {itens.map((item, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3 bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Item {i + 1}</span>
                  <Select value={item.tipo || "servico"} onValueChange={v => updateItem(i, "tipo", v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {itens.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Quick select from catalog */}
              {item.tipo === "servico" && servicos.length > 0 && (
                <div>
                  <Label className="text-xs">Selecionar do catálogo</Label>
                  <Select value={item.referencia_id || ""} onValueChange={v => updateItem(i, "referencia_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Ou digite manualmente abaixo..." /></SelectTrigger>
                    <SelectContent>{servicos.filter(s => s.ativo).map(s => <SelectItem key={s.id} value={s.id}>{s.nome} - {formatCurrency(Number(s.preco))}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {item.tipo === "produto" && produtos.length > 0 && (
                <div>
                  <Label className="text-xs">Selecionar do catálogo</Label>
                  <Select value={item.referencia_id || ""} onValueChange={v => updateItem(i, "referencia_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Ou digite manualmente abaixo..." /></SelectTrigger>
                    <SelectContent>{produtos.filter(p => p.ativo).map(p => <SelectItem key={p.id} value={p.id}>{p.nome} - {formatCurrency(Number(p.preco))}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <div><Label>Descrição *</Label><Input value={item.descricao || ""} onChange={e => updateItem(i, "descricao", e.target.value)} placeholder="Descrição do item" /></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Qtd</Label><Input type="number" step="0.01" min="0.01" value={item.quantidade || ""} onChange={e => updateItem(i, "quantidade", parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Valor Unit.</Label><Input type="number" step="0.01" value={item.valor_unitario || ""} onChange={e => updateItem(i, "valor_unitario", parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Total</Label><Input type="number" value={item.valor_total || ""} readOnly className="bg-muted/50" /></div>
              </div>
            </div>
          ))}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
            <span className="font-medium text-sm">Total da OS</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(valorTotal)}</span>
          </div>
        </div>

        {/* Custom fields */}
        {activeCampos.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">3. Campos Personalizados</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeCampos.map(campo => (
                <div key={campo.id}>
                  <Label>{campo.nome} {campo.obrigatorio && "*"}</Label>
                  {renderCampo(campo)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">{activeCampos.length > 0 ? "4" : "3"}. Detalhes</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Previsão de Entrega</Label><Input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} /></div>
          </div>
          <div><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações gerais..." /></div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="gap-2" disabled={loading}><Save className="h-4 w-4" /> {loading ? "Criando..." : "Criar OS"}</Button>
        </div>
      </form>
    </div>
  );
}
