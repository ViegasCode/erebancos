import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatCPF, formatPhone, validateCPF } from "@/lib/formatters";
import { OS_TIPOS } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Search, Save, UserPlus } from "lucide-react";

export default function OrdemNova() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientes, addCliente, findClienteByCpf, addOrdem } = useAppData();

  const [cpfBusca, setCpfBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(searchParams.get("cliente"));
  const [showCadastro, setShowCadastro] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", cpf: "", telefone: "", email: "" });

  const [form, setForm] = useState({
    marca: "", modelo: "", cilindrada: "", ano: "",
    descricao: "", tipo: "Retirada" as any, material: "", valor: "",
    vendedor: "", data_previsao: "",
    peso_piloto: "", altura_piloto: "", peso_garupa: "", altura_garupa: "", coccix: "",
  });

  const cliente = clientes.find((c) => c.id === clienteSelecionado);

  const buscarCPF = () => {
    const found = findClienteByCpf(cpfBusca);
    if (found) {
      setClienteSelecionado(found.id);
      setShowCadastro(false);
      toast.success(`Cliente encontrado: ${found.nome}`);
    } else {
      toast.info("Cliente não encontrado. Cadastre abaixo.");
      setShowCadastro(true);
      setNovoCliente((n) => ({ ...n, cpf: formatCPF(cpfBusca) }));
    }
  };

  const cadastrarRapido = () => {
    if (!novoCliente.nome || !novoCliente.cpf || !novoCliente.telefone) { toast.error("Preencha nome, CPF e telefone"); return; }
    if (!validateCPF(novoCliente.cpf)) { toast.error("CPF inválido"); return; }
    const c = addCliente(novoCliente);
    setClienteSelecionado(c.id);
    setShowCadastro(false);
    toast.success("Cliente cadastrado!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado) { toast.error("Selecione um cliente"); return; }
    if (!form.marca || !form.modelo || !form.descricao || !form.valor || !form.vendedor || !form.data_previsao) {
      toast.error("Preencha todos os campos obrigatórios"); return;
    }
    const os = addOrdem({
      ...form,
      valor: parseFloat(form.valor),
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
              <p className="text-sm text-muted-foreground">CPF: {cliente.cpf} • {cliente.telefone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setClienteSelecionado(null); setCpfBusca(""); }}>Alterar</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input placeholder="Buscar por CPF..." value={cpfBusca} onChange={(e) => setCpfBusca(formatCPF(e.target.value))} className="flex-1" />
              <Button onClick={buscarCPF} className="gap-2"><Search className="h-4 w-4" /> Buscar</Button>
            </div>
            {showCadastro && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" /> Cadastro Rápido</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome *" value={novoCliente.nome} onChange={(e) => setNovoCliente((n) => ({ ...n, nome: e.target.value }))} />
                  <Input placeholder="CPF *" value={novoCliente.cpf} onChange={(e) => setNovoCliente((n) => ({ ...n, cpf: formatCPF(e.target.value) }))} />
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

        {/* Serviço */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">3. Dados do Serviço</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Descrição *</Label><Textarea value={form.descricao} onChange={(e) => updateForm("descricao", e.target.value)} placeholder="Descreva o serviço..." /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => updateForm("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OS_TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Material</Label><Input value={form.material} onChange={(e) => updateForm("material", e.target.value)} placeholder="Couro, napa..." /></div>
            <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={form.valor} onChange={(e) => updateForm("valor", e.target.value)} placeholder="0,00" /></div>
            <div><Label>Vendedor *</Label><Input value={form.vendedor} onChange={(e) => updateForm("vendedor", e.target.value)} /></div>
            <div><Label>Previsão de Entrega *</Label><Input type="date" value={form.data_previsao} onChange={(e) => updateForm("data_previsao", e.target.value)} /></div>
          </div>
        </div>

        {/* Dados técnicos */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">4. Dados Técnicos (opcional)</h3>
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
