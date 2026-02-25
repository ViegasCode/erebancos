import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Save, Settings, Palette, FileText, Wrench, Package, Tag, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import type { StatusConfig, CampoOS, Servico, Produto, Categoria, Profile, AppRole } from "@/types";

export default function Configuracoes() {
  const { isAdmin, company, profile } = useAuth();
  const { statuses, campos, servicos, produtos, categorias, numeracao, refreshStatuses, refreshCampos, refreshServicos, refreshProdutos, refreshCategorias, refreshAll } = useAppData();

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Personalize a plataforma para sua empresa</p>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="status" className="gap-1"><Palette className="h-3 w-3" /> Status</TabsTrigger>
          <TabsTrigger value="campos" className="gap-1"><FileText className="h-3 w-3" /> Campos OS</TabsTrigger>
          <TabsTrigger value="servicos" className="gap-1"><Wrench className="h-3 w-3" /> Serviços</TabsTrigger>
          <TabsTrigger value="produtos" className="gap-1"><Package className="h-3 w-3" /> Produtos</TabsTrigger>
          <TabsTrigger value="categorias" className="gap-1"><Tag className="h-3 w-3" /> Categorias</TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-1"><Users className="h-3 w-3" /> Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="status"><StatusTab statuses={statuses} companyId={company!.id} onRefresh={refreshStatuses} /></TabsContent>
        <TabsContent value="campos"><CamposTab campos={campos} companyId={company!.id} onRefresh={refreshCampos} /></TabsContent>
        <TabsContent value="servicos"><ServicosTab servicos={servicos} companyId={company!.id} categorias={categorias} onRefresh={refreshServicos} /></TabsContent>
        <TabsContent value="produtos"><ProdutosTab produtos={produtos} companyId={company!.id} categorias={categorias} onRefresh={refreshProdutos} /></TabsContent>
        <TabsContent value="categorias"><CategoriasTab categorias={categorias} companyId={company!.id} onRefresh={refreshCategorias} /></TabsContent>
        <TabsContent value="usuarios"><UsuariosTab companyId={company!.id} /></TabsContent>
      </Tabs>
    </div>
  );
}

// === STATUS TAB ===
function StatusTab({ statuses, companyId, onRefresh }: { statuses: StatusConfig[]; companyId: string; onRefresh: () => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#3b82f6");
  const [isFinal, setIsFinal] = useState(false);
  const [isCancelamento, setIsCancelamento] = useState(false);

  const addStatus = async () => {
    if (!nome) { toast.error("Informe o nome"); return; }
    const ordem = statuses.length;
    const { error } = await supabase.from("status_config").insert({ company_id: companyId, nome, cor, ordem, is_final: isFinal, is_cancelamento: isCancelamento });
    if (error) { toast.error(error.message); return; }
    toast.success("Status criado!");
    setNome(""); setCor("#3b82f6"); setIsFinal(false); setIsCancelamento(false);
    await onRefresh();
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from("status_config").update({ ativo: !ativo }).eq("id", id);
    await onRefresh();
  };

  const deleteStatus = async (id: string) => {
    await supabase.from("status_config").delete().eq("id", id);
    await onRefresh();
    toast.success("Status removido");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Status Personalizados</h3>
      <div className="flex gap-3 flex-wrap items-end">
        <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Aguardando Peça" className="w-48" /></div>
        <div><Label>Cor</Label><Input type="color" value={cor} onChange={e => setCor(e.target.value)} className="w-16 h-10 p-1" /></div>
        <div className="flex items-center gap-2"><Switch checked={isFinal} onCheckedChange={setIsFinal} /><Label className="text-xs">Final</Label></div>
        <div className="flex items-center gap-2"><Switch checked={isCancelamento} onCheckedChange={setIsCancelamento} /><Label className="text-xs">Cancelamento</Label></div>
        <Button onClick={addStatus} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {statuses.map(s => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: s.cor }} />
              <span className={`font-medium ${!s.ativo ? "line-through text-muted-foreground" : ""}`}>{s.nome}</span>
              {s.is_final && <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded">Final</span>}
              {s.is_cancelamento && <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">Cancelamento</span>}
              <span className="text-xs text-muted-foreground">Ordem: {s.ordem}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={s.ativo} onCheckedChange={() => toggleAtivo(s.id, s.ativo)} />
              <Button variant="ghost" size="sm" onClick={() => deleteStatus(s.id)} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === CAMPOS TAB ===
function CamposTab({ campos, companyId, onRefresh }: { campos: CampoOS[]; companyId: string; onRefresh: () => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [obrigatorio, setObrigatorio] = useState(false);
  const [opcoes, setOpcoes] = useState("");

  const addCampo = async () => {
    if (!nome) { toast.error("Informe o nome"); return; }
    const ordem = campos.length;
    const opcoesArr = tipo === "select" ? opcoes.split(",").map(o => o.trim()).filter(Boolean) : null;
    const { error } = await supabase.from("campos_os").insert({ company_id: companyId, nome, tipo, obrigatorio, ordem, opcoes: opcoesArr });
    if (error) { toast.error(error.message); return; }
    toast.success("Campo criado!");
    setNome(""); setTipo("texto"); setObrigatorio(false); setOpcoes("");
    await onRefresh();
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from("campos_os").update({ ativo: !ativo }).eq("id", id);
    await onRefresh();
  };

  const deleteCampo = async (id: string) => {
    await supabase.from("campos_os").delete().eq("id", id);
    await onRefresh();
    toast.success("Campo removido");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Campos Personalizados da OS</h3>
      <div className="flex gap-3 flex-wrap items-end">
        <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Marca do Veículo" className="w-48" /></div>
        <div>
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="texto">Texto</SelectItem>
              <SelectItem value="numero">Número</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tipo === "select" && <div><Label>Opções (vírgula)</Label><Input value={opcoes} onChange={e => setOpcoes(e.target.value)} placeholder="Op1, Op2, Op3" className="w-48" /></div>}
        <div className="flex items-center gap-2"><Switch checked={obrigatorio} onCheckedChange={setObrigatorio} /><Label className="text-xs">Obrigatório</Label></div>
        <Button onClick={addCampo} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {campos.map(c => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${!c.ativo ? "line-through text-muted-foreground" : ""}`}>{c.nome}</span>
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{c.tipo}</span>
              {c.obrigatorio && <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded">Obrigatório</span>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={c.ativo} onCheckedChange={() => toggleAtivo(c.id, c.ativo)} />
              <Button variant="ghost" size="sm" onClick={() => deleteCampo(c.id)} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === SERVICOS TAB ===
function ServicosTab({ servicos, companyId, categorias, onRefresh }: { servicos: Servico[]; companyId: string; categorias: Categoria[]; onRefresh: () => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const add = async () => {
    if (!nome) { toast.error("Informe o nome"); return; }
    const { error } = await supabase.from("servicos").insert({ company_id: companyId, nome, preco: parseFloat(preco) || 0, categoria_id: categoriaId || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Serviço criado!");
    setNome(""); setPreco(""); setCategoriaId("");
    await onRefresh();
  };

  const del = async (id: string) => {
    await supabase.from("servicos").delete().eq("id", id);
    await onRefresh();
    toast.success("Serviço removido");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Catálogo de Serviços</h3>
      <div className="flex gap-3 flex-wrap items-end">
        <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do serviço" className="w-48" /></div>
        <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} className="w-32" /></div>
        {categorias.length > 0 && (
          <div>
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={add} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {servicos.map(s => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <div><span className="font-medium">{s.nome}</span> <span className="text-muted-foreground ml-2">R$ {Number(s.preco).toFixed(2)}</span></div>
            <Button variant="ghost" size="sm" onClick={() => del(s.id)} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === PRODUTOS TAB ===
function ProdutosTab({ produtos, companyId, categorias, onRefresh }: { produtos: Produto[]; companyId: string; categorias: Categoria[]; onRefresh: () => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const add = async () => {
    if (!nome) { toast.error("Informe o nome"); return; }
    const { error } = await supabase.from("produtos").insert({ company_id: companyId, nome, preco: parseFloat(preco) || 0, categoria_id: categoriaId || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Produto criado!");
    setNome(""); setPreco(""); setCategoriaId("");
    await onRefresh();
  };

  const del = async (id: string) => {
    await supabase.from("produtos").delete().eq("id", id);
    await onRefresh();
    toast.success("Produto removido");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Catálogo de Produtos</h3>
      <div className="flex gap-3 flex-wrap items-end">
        <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do produto" className="w-48" /></div>
        <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} className="w-32" /></div>
        {categorias.length > 0 && (
          <div>
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={add} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {produtos.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <div><span className="font-medium">{p.nome}</span> <span className="text-muted-foreground ml-2">R$ {Number(p.preco).toFixed(2)}</span></div>
            <Button variant="ghost" size="sm" onClick={() => del(p.id)} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === CATEGORIAS TAB ===
function CategoriasTab({ categorias, companyId, onRefresh }: { categorias: Categoria[]; companyId: string; onRefresh: () => Promise<void> }) {
  const [nome, setNome] = useState("");

  const add = async () => {
    if (!nome) { toast.error("Informe o nome"); return; }
    const { error } = await supabase.from("categorias").insert({ company_id: companyId, nome });
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria criada!");
    setNome("");
    await onRefresh();
  };

  const del = async (id: string) => {
    await supabase.from("categorias").delete().eq("id", id);
    await onRefresh();
    toast.success("Categoria removida");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Categorias</h3>
      <div className="flex gap-3 items-end">
        <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da categoria" className="w-48" /></div>
        <Button onClick={add} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {categorias.map(c => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <span className="font-medium">{c.nome}</span>
            <Button variant="ghost" size="sm" onClick={() => del(c.id)} className="text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === USUARIOS TAB ===
function UsuariosTab({ companyId }: { companyId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("company_id", companyId).order("nome");
    if (data) setProfiles(data as unknown as Profile[]);
    setLoaded(true);
  };

  if (!loaded) {
    loadUsers();
    return <div className="text-center py-4 text-muted-foreground">Carregando...</div>;
  }

  const updateRole = async (userId: string, role: AppRole) => {
    await supabase.from("profiles").update({ role }).eq("id", userId);
    await loadUsers();
    toast.success("Papel atualizado!");
  };

  const toggleAtivo = async (userId: string, ativo: boolean) => {
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", userId);
    await loadUsers();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Usuários da Empresa</h3>
      <p className="text-xs text-muted-foreground">Para adicionar novos usuários, eles devem se cadastrar com o link da empresa.</p>
      <div className="space-y-2">
        {profiles.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/10">
            <div>
              <span className={`font-medium ${!p.ativo ? "line-through text-muted-foreground" : ""}`}>{p.nome}</span>
              <span className="text-xs text-muted-foreground ml-2">{p.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Select value={p.role} onValueChange={(v: AppRole) => updateRole(p.id, v)}>
                <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
              <Switch checked={p.ativo} onCheckedChange={() => toggleAtivo(p.id, p.ativo)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
