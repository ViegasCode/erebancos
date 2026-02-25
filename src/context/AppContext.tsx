import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import type { Cliente, OrdemServico, StatusConfig, CampoOS, Servico, Produto, Categoria, OSItem, ValorCampoOS, HistoricoStatus, NumeracaoOS } from "@/types";

interface AppContextType {
  // Data
  clientes: Cliente[];
  ordens: OrdemServico[];
  statuses: StatusConfig[];
  campos: CampoOS[];
  servicos: Servico[];
  produtos: Produto[];
  categorias: Categoria[];
  numeracao: NumeracaoOS | null;
  loading: boolean;

  // Actions
  refreshClientes: () => Promise<void>;
  refreshOrdens: () => Promise<void>;
  refreshStatuses: () => Promise<void>;
  refreshCampos: () => Promise<void>;
  refreshServicos: () => Promise<void>;
  refreshProdutos: () => Promise<void>;
  refreshCategorias: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // CRUD helpers
  addCliente: (c: Partial<Cliente>) => Promise<Cliente>;
  updateCliente: (id: string, c: Partial<Cliente>) => Promise<void>;
  addOrdem: (o: Partial<OrdemServico>, itens: Partial<OSItem>[], camposValores: { campo_id: string; valor: string }[]) => Promise<OrdemServico>;
  updateOrdemStatus: (osId: string, statusId: string) => Promise<void>;
  getOrdemItens: (osId: string) => Promise<OSItem[]>;
  getOrdemCampos: (osId: string) => Promise<ValorCampoOS[]>;
  getOrdemHistorico: (osId: string) => Promise<HistoricoStatus[]>;
  getClienteOrdens: (clienteId: string) => OrdemServico[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, company } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [campos, setCampos] = useState<CampoOS[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [numeracao, setNumeracao] = useState<NumeracaoOS | null>(null);
  const [loading, setLoading] = useState(true);

  const companyId = company?.id;

  const refreshClientes = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("clientes").select("*").eq("company_id", companyId).order("nome");
    if (data) setClientes(data as unknown as Cliente[]);
  }, [companyId]);

  const refreshOrdens = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("ordens_servico")
      .select("*, cliente:clientes(*), status:status_config(*), criador:profiles(*)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (data) setOrdens(data as unknown as OrdemServico[]);
  }, [companyId]);

  const refreshStatuses = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("status_config").select("*").eq("company_id", companyId).order("ordem");
    if (data) setStatuses(data as unknown as StatusConfig[]);
  }, [companyId]);

  const refreshCampos = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("campos_os").select("*").eq("company_id", companyId).order("ordem");
    if (data) setCampos(data as unknown as CampoOS[]);
  }, [companyId]);

  const refreshServicos = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("servicos").select("*").eq("company_id", companyId).order("nome");
    if (data) setServicos(data as unknown as Servico[]);
  }, [companyId]);

  const refreshProdutos = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("produtos").select("*").eq("company_id", companyId).order("nome");
    if (data) setProdutos(data as unknown as Produto[]);
  }, [companyId]);

  const refreshCategorias = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("categorias").select("*").eq("company_id", companyId).order("nome");
    if (data) setCategorias(data as unknown as Categoria[]);
  }, [companyId]);

  const refreshNumeracao = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from("numeracao_os").select("*").eq("company_id", companyId).single();
    if (data) setNumeracao(data as unknown as NumeracaoOS);
  }, [companyId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshClientes(),
      refreshOrdens(),
      refreshStatuses(),
      refreshCampos(),
      refreshServicos(),
      refreshProdutos(),
      refreshCategorias(),
      refreshNumeracao(),
    ]);
    setLoading(false);
  }, [refreshClientes, refreshOrdens, refreshStatuses, refreshCampos, refreshServicos, refreshProdutos, refreshCategorias, refreshNumeracao]);

  useEffect(() => {
    if (companyId) {
      refreshAll();
    }
  }, [companyId, refreshAll]);

  const addCliente = useCallback(async (c: Partial<Cliente>) => {
    if (!companyId) throw new Error("No company");
    const insertData = {
      company_id: companyId,
      nome: c.nome || '',
      tipo_documento: c.tipo_documento || 'CPF',
      documento: c.documento || '',
      telefone: c.telefone || '',
      email: c.email || null,
      cep: c.cep || null,
      rua: c.rua || null,
      numero: c.numero || null,
      bairro: c.bairro || null,
      cidade: c.cidade || null,
      estado: c.estado || null,
    };
    const { data, error } = await supabase
      .from("clientes")
      .insert(insertData)
      .select()
      .single();
    if (error) throw error;
    await refreshClientes();
    return data as unknown as Cliente;
  }, [companyId, refreshClientes]);

  const updateCliente = useCallback(async (id: string, c: Partial<Cliente>) => {
    const { error } = await supabase.from("clientes").update(c).eq("id", id);
    if (error) throw error;
    await refreshClientes();
  }, [refreshClientes]);

  const addOrdem = useCallback(async (
    o: Partial<OrdemServico>,
    itens: Partial<OSItem>[],
    camposValores: { campo_id: string; valor: string }[]
  ) => {
    if (!companyId || !profile) throw new Error("No company/profile");

    // Get next number
    const { data: numData } = await supabase
      .from("numeracao_os")
      .select("*")
      .eq("company_id", companyId)
      .single();

    const prefixo = numData?.prefixo || "OS";
    const nextNum = numData?.proximo_numero || 1;
    const numero_os = `${prefixo}${String(nextNum).padStart(4, "0")}`;

    // Calculate total
    const valor_total = itens.reduce((sum, item) => sum + (item.valor_total || 0), 0);

    // Get initial status
    const initialStatus = statuses.find(s => !s.is_final && !s.is_cancelamento && s.ordem === 0) || statuses[0];

    const { data: osData, error: osError } = await supabase
      .from("ordens_servico")
      .insert({
        company_id: companyId,
        numero_os,
        cliente_id: o.cliente_id,
        status_id: initialStatus?.id,
        criado_por: profile.id,
        data_prevista: o.data_prevista,
        observacoes: o.observacoes,
        valor_total,
      })
      .select()
      .single();

    if (osError) throw osError;

    // Update numeracao
    await supabase
      .from("numeracao_os")
      .update({ proximo_numero: nextNum + 1 })
      .eq("company_id", companyId);

    // Insert items
    if (itens.length > 0) {
      const itensData = itens.map(item => ({
        ordem_servico_id: osData.id,
        tipo: item.tipo || 'servico',
        referencia_id: item.referencia_id,
        descricao: item.descricao || '',
        quantidade: item.quantidade || 1,
        valor_unitario: item.valor_unitario || 0,
        valor_total: item.valor_total || 0,
      }));
      await supabase.from("os_itens").insert(itensData);
    }

    // Insert custom field values
    if (camposValores.length > 0) {
      const valoresData = camposValores.map(cv => ({
        ordem_servico_id: osData.id,
        campo_id: cv.campo_id,
        valor: cv.valor,
      }));
      await supabase.from("valores_campos_os").insert(valoresData);
    }

    // Insert history
    await supabase.from("historico_status").insert({
      ordem_servico_id: osData.id,
      status_id: initialStatus?.id,
      usuario_id: profile.id,
    });

    await refreshOrdens();
    return osData as unknown as OrdemServico;
  }, [companyId, profile, statuses, refreshOrdens]);

  const updateOrdemStatus = useCallback(async (osId: string, statusId: string) => {
    if (!profile) throw new Error("No profile");
    
    const status = statuses.find(s => s.id === statusId);
    const updateData: Record<string, unknown> = { status_id: statusId };
    if (status?.is_final) {
      updateData.data_finalizacao = new Date().toISOString();
    }

    await supabase.from("ordens_servico").update(updateData).eq("id", osId);
    await supabase.from("historico_status").insert({
      ordem_servico_id: osId,
      status_id: statusId,
      usuario_id: profile.id,
    });
    await refreshOrdens();
  }, [profile, statuses, refreshOrdens]);

  const getOrdemItens = useCallback(async (osId: string) => {
    const { data } = await supabase.from("os_itens").select("*").eq("ordem_servico_id", osId);
    return (data || []) as unknown as OSItem[];
  }, []);

  const getOrdemCampos = useCallback(async (osId: string) => {
    const { data } = await supabase
      .from("valores_campos_os")
      .select("*, campo:campos_os(*)")
      .eq("ordem_servico_id", osId);
    return (data || []) as unknown as ValorCampoOS[];
  }, []);

  const getOrdemHistorico = useCallback(async (osId: string) => {
    const { data } = await supabase
      .from("historico_status")
      .select("*, status:status_config(*), usuario:profiles(*)")
      .eq("ordem_servico_id", osId)
      .order("data_hora", { ascending: false });
    return (data || []) as unknown as HistoricoStatus[];
  }, []);

  const getClienteOrdens = useCallback((clienteId: string) => {
    return ordens.filter(o => o.cliente_id === clienteId);
  }, [ordens]);

  return (
    <AppContext.Provider value={{
      clientes, ordens, statuses, campos, servicos, produtos, categorias, numeracao, loading,
      refreshClientes, refreshOrdens, refreshStatuses, refreshCampos, refreshServicos, refreshProdutos, refreshCategorias, refreshAll,
      addCliente, updateCliente, addOrdem, updateOrdemStatus, getOrdemItens, getOrdemCampos, getOrdemHistorico, getClienteOrdens,
    }}>
      {children}
    </AppContext.Provider>
  );
};
