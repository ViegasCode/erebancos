import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatDocumento, formatPhone, validateDocumento, formatCurrency } from "@/lib/formatters";
import { OS_TIPOS, LOCAIS_COMPRA, FORMAS_PAGAMENTO, Servico, Pagamento, FormaPagamento, LocalCompra, TipoDocumento } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Search, Save, UserPlus, Plus, Trash2 } from "lucide-react";

export default function OrdemNova() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientes, addCliente, findClienteByCpf, addOrdem } = useAppData();

  const [cpfBusca, setCpfBusca] = useState("");
  const [tipoDocBusca, setTipoDocBusca] = useState<TipoDocumento>("CPF");
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(searchParams.get("cliente"));
  const [showCadastro, setShowCadastro] = useState(false);
  const [tipoDocNovo, setTipoDocNovo] = useState<TipoDocumento>("CPF");
  const [novoCliente, setNovoCliente] = useState({ nome: "", cpf: "", telefone: "", email: "" });

  // Serviços múltiplos
  const [servicos, setServicos] = useState<Servico[]>([{ descricao: "", material: "" }]);

  // Pagamento
  const [valor, setValor] = useState("");
  const [desconto, setDesconto] = useState("");
  const [frete, setFrete] = useState("");
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([{ forma: "PIX", valor: 0 }]);
  const [localCompra, setLocalCompra] = useState<LocalCompra>("Fisicamente");
  const [influencer, setInfluencer] = useState("");

  const [form, setForm] = useState({
    marca: "", modelo: "", cilindrada: "", ano: "",
    tipo: "Retirada" as any,
    vendedor: "", data_previsao: "",
    peso_piloto: "", altura_piloto: "", peso_garupa: "", altura_garupa: "", coccix: "",
  });

  const cliente = clientes.find((c) => c.id === clienteSelecionado);

  const valorNum = parseFloat(valor) || 0;
  const descontoNum = parseFloat(desconto) || 0;
  const freteNum = parseFloat(frete) || 0;
  const totalVenda = valorNum - descontoNum + freteNum;

  const buscarCPF = () => {
    const found = findClienteByCpf(cpfBusca);
    if (found) {
      setClienteSelecionado(found.id);
      setShowCadastro(false);
      toast.success(`Cliente encontrado: ${found.nome}`);
    } else {
      toast.info("Cliente não encontrado. Cadastre abaixo.");
      setShowCadastro(true);
      setTipoDocNovo(tipoDocBusca);
      setNovoCliente((n) => ({ ...n, cpf: formatDocumento(cpfBusca, tipoDocBusca) }));
    }
  };

  const cadastrarRapido = () => {
    if (!novoCliente.nome || !novoCliente.cpf || !novoCliente.telefone) { toast.error(`Preencha nome, ${tipoDocNovo} e telefone`); return; }
    if (!validateDocumento(novoCliente.cpf, tipoDocNovo)) { toast.error(`${tipoDocNovo} inválido`); return; }
    const c = addCliente({ ...novoCliente, tipo_documento: tipoDocNovo });
    setClienteSelecionado(c.id);
    setShowCadastro(false);
    toast.success("Cliente cadastrado!");
  };

  const addServico = () => setServicos((s) => [...s, { descricao: "", material: "" }]);
  const removeServico = (i: number) => setServicos((s) => s.filter((_, idx) => idx !== i));
  const updateServico = (i: number, field: keyof Servico, value: string) =>
    setServicos((s) => s.map((srv, idx) => idx === i ? { ...srv, [field]: value } : srv));

  const addPagamento = () => setPagamentos((p) => [...p, { forma: "PIX", valor: 0 }]);
  const removePagamento = (i: number) => setPagamentos((p) => p.filter((_, idx) => idx !== i));
  const updatePagamento = (i: number, field: keyof Pagamento, value: any) =>
    setPagamentos((p) => p.map((pg, idx) => idx === i ? { ...pg, [field]: value } : pg));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado) { toast.error("Selecione um cliente"); return; }
    if (!form.marca || !form.modelo || !valor || !form.vendedor || !form.data_previsao) {
      toast.error("Preencha todos os campos obrigatórios"); return;
    }
    if (servicos.some((s) => !s.descricao)) { toast.error("Preencha a descrição de todos os serviços"); return; }

    const os = addOrdem({
      ...form,
      servicos,
      valor: valorNum,
      desconto: descontoNum,
      frete: freteNum,
      total_venda: totalVenda,
      pagamentos,
      local_compra: localCompra,
      influencer: localCompra === "Influencer" ? influencer : undefined,
      cliente_id: clienteSelecionado,
      status: "Criada",
    });
    toast.success(`OS #${os.numero_os} criada com sucesso!`);
    navigate(`/ordens/${os.id}`);
  };

  const updateForm = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

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
              <p className="text-sm text-muted-foreground">{cliente.tipo_documento}: {cliente.cpf} • {cliente.telefone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setClienteSelecionado(null); setCpfBusca(""); }}>Alterar</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button type="button" size="sm" variant={tipoDocBusca === "CPF" ? "default" : "outline"} onClick={() => setTipoDocBusca("CPF")}>CPF</Button>
                <Button type="button" size="sm" variant={tipoDocBusca === "CNPJ" ? "default" : "outline"} onClick={() => setTipoDocBusca("CNPJ")}>CNPJ</Button>
              </div>
              <Input placeholder={`Buscar por ${tipoDocBusca}...`} value={cpfBusca} onChange={(e) => setCpfBusca(formatDocumento(e.target.value, tipoDocBusca))} className="flex-1" />
              <Button onClick={buscarCPF} className="gap-2"><Search className="h-4 w-4" /> Buscar</Button>
            </div>
            {showCadastro && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" /> Cadastro Rápido</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome *" value={novoCliente.nome} onChange={(e) => setNovoCliente((n) => ({ ...n, nome: e.target.value }))} />
                  <Input placeholder={`${tipoDocNovo} *`} value={novoCliente.cpf} onChange={(e) => setNovoCliente((n) => ({ ...n, cpf: formatDocumento(e.target.value, tipoDocNovo) }))} />
                  <Input placeholder="Telefone *" value={novoCliente.telefone} onChange={(e) => setNovoCliente((n) => ({ ...n, telefone: formatPhone(e.target.value) }))} />
                  <Input placeholder="Email" value={novoCliente.email} onChange={(e) => setNovoCliente((n) => ({ ...n, email: e.target.value }))} />
                </div>
                <Button onClick={cadastrarRapido} size="sm">Cadastrar e Selecionar</Button>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Moto */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">2. Dados da Moto</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Marca *</Label><Input value={form.marca} onChange={(e) => updateForm("marca", e.target.value)} placeholder="Honda, Yamaha..." /></div>
            <div><Label>Modelo *</Label><Input value={form.modelo} onChange={(e) => updateForm("modelo", e.target.value)} placeholder="CG 160, MT-03..." /></div>
            <div><Label>Cilindrada</Label><Input value={form.cilindrada} onChange={(e) => updateForm("cilindrada", e.target.value)} placeholder="160cc" /></div>
            <div><Label>Ano</Label><Input value={form.ano} onChange={(e) => updateForm("ano", e.target.value)} placeholder="2024" /></div>
          </div>
        </div>

        {/* Serviços */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">3. Serviços</h3>
            <Button type="button" variant="outline" size="sm" onClick={addServico} className="gap-1">
              <Plus className="h-3 w-3" /> Adicionar Serviço
            </Button>
          </div>
          {servicos.map((srv, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Serviço {i + 1}</span>
                {servicos.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeServico(i)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div><Label>Descrição *</Label><Textarea value={srv.descricao} onChange={(e) => updateServico(i, "descricao", e.target.value)} placeholder="Descreva o serviço..." /></div>
              <div><Label>Material</Label><Input value={srv.material} onChange={(e) => updateServico(i, "material", e.target.value)} placeholder="Couro, napa..." /></div>
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => updateForm("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OS_TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Vendedor *</Label><Input value={form.vendedor} onChange={(e) => updateForm("vendedor", e.target.value)} /></div>
            <div><Label>Previsão de Entrega *</Label><Input type="date" value={form.data_previsao} onChange={(e) => updateForm("data_previsao", e.target.value)} /></div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">4. Pagamento</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" /></div>
            <div><Label>Desconto (R$)</Label><Input type="number" step="0.01" value={desconto} onChange={(e) => setDesconto(e.target.value)} placeholder="0,00" /></div>
            <div><Label>Frete (R$)</Label><Input type="number" step="0.01" value={frete} onChange={(e) => setFrete(e.target.value)} placeholder="0,00" /></div>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
            <span className="font-medium text-sm">Total da Venda</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(totalVenda)}</span>
          </div>

          {/* Formas de pagamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Formas de Pagamento</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPagamento} className="gap-1">
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </div>
            {pagamentos.map((pg, i) => (
              <div key={i} className="flex items-center gap-3">
                <Select value={pg.forma} onValueChange={(v) => updatePagamento(i, "forma", v as FormaPagamento)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" step="0.01" value={pg.valor || ""} onChange={(e) => updatePagamento(i, "valor", parseFloat(e.target.value) || 0)} placeholder="Valor" className="w-32" />
                {pagamentos.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePagamento(i)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Local de compra */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Local de Compra</Label>
              <Select value={localCompra} onValueChange={(v) => setLocalCompra(v as LocalCompra)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LOCAIS_COMPRA.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {localCompra === "Influencer" && (
              <div><Label>Nome do Influencer</Label><Input value={influencer} onChange={(e) => setInfluencer(e.target.value)} placeholder="Nome do influencer..." /></div>
            )}
          </div>
        </div>

        {/* Dados técnicos */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">5. Dados Técnicos (opcional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Peso do Piloto</Label><Input value={form.peso_piloto} onChange={(e) => updateForm("peso_piloto", e.target.value)} placeholder="80kg" /></div>
            <div><Label>Altura do Piloto</Label><Input value={form.altura_piloto} onChange={(e) => updateForm("altura_piloto", e.target.value)} placeholder="1.75m" /></div>
            <div><Label>Peso do Garupa</Label><Input value={form.peso_garupa} onChange={(e) => updateForm("peso_garupa", e.target.value)} placeholder="60kg" /></div>
            <div><Label>Altura do Garupa</Label><Input value={form.altura_garupa} onChange={(e) => updateForm("altura_garupa", e.target.value)} placeholder="1.65m" /></div>
            <div className="sm:col-span-2"><Label>Ajuste de Cóccix</Label><Input value={form.coccix} onChange={(e) => updateForm("coccix", e.target.value)} placeholder="Observações..." /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Criar OS</Button>
        </div>
      </form>
    </div>
  );
}
