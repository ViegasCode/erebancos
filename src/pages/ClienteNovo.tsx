import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/context/AppContext";
import { formatDocumento, formatPhone, validateDocumento } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

type TipoDoc = "CPF" | "CNPJ";

export default function ClienteNovo() {
  const navigate = useNavigate();
  const { addCliente } = useAppData();
  const [tipoDoc, setTipoDoc] = useState<TipoDoc>("CPF");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", documento: "", telefone: "", email: "", cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "" });

  const update = (field: string, value: string) => {
    if (field === "documento") value = formatDocumento(value, tipoDoc);
    if (field === "telefone") value = formatPhone(value);
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.documento || !form.telefone) { toast.error("Preencha os campos obrigatórios"); return; }
    if (!validateDocumento(form.documento, tipoDoc)) { toast.error(`${tipoDoc} inválido`); return; }

    setLoading(true);
    try {
      const c = await addCliente({ ...form, tipo_documento: tipoDoc });
      toast.success("Cliente cadastrado com sucesso!");
      navigate(`/clientes/${c.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Cliente</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados do cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder="Nome completo ou razão social" />
          </div>
          <div>
            <Label>Tipo de Documento *</Label>
            <div className="flex gap-2 mt-1">
              <Button type="button" size="sm" variant={tipoDoc === "CPF" ? "default" : "outline"} onClick={() => { setTipoDoc("CPF"); setForm(f => ({ ...f, documento: "" })); }}>CPF</Button>
              <Button type="button" size="sm" variant={tipoDoc === "CNPJ" ? "default" : "outline"} onClick={() => { setTipoDoc("CNPJ"); setForm(f => ({ ...f, documento: "" })); }}>CNPJ</Button>
            </div>
          </div>
          <div>
            <Label>{tipoDoc} *</Label>
            <Input value={form.documento} onChange={e => update("documento", e.target.value)} placeholder={tipoDoc === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"} />
          </div>
          <div><Label>Telefone *</Label><Input value={form.telefone} onChange={e => update("telefone", e.target.value)} placeholder="(00) 00000-0000" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="email@exemplo.com" /></div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Endereço (opcional)</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>CEP</Label><Input value={form.cep} onChange={e => update("cep", e.target.value)} placeholder="00000-000" /></div>
            <div className="sm:col-span-2"><Label>Rua</Label><Input value={form.rua} onChange={e => update("rua", e.target.value)} /></div>
            <div><Label>Número</Label><Input value={form.numero} onChange={e => update("numero", e.target.value)} /></div>
            <div><Label>Bairro</Label><Input value={form.bairro} onChange={e => update("bairro", e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={form.cidade} onChange={e => update("cidade", e.target.value)} /></div>
            <div><Label>Estado</Label><Input value={form.estado} onChange={e => update("estado", e.target.value)} maxLength={2} placeholder="UF" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="gap-2" disabled={loading}><Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar Cliente"}</Button>
        </div>
      </form>
    </div>
  );
}
