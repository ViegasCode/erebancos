import React, { createContext, useContext, useState, useCallback } from "react";
import { Cliente, OrdemServico, HistoricoStatus, OSStatus, OS_STATUS_FLOW } from "@/types";
import { mockClientes, mockOrdens, mockHistorico } from "@/data/mockData";

interface AppContextType {
  clientes: Cliente[];
  ordens: OrdemServico[];
  historico: HistoricoStatus[];
  addCliente: (c: Omit<Cliente, "id" | "created_at">) => Cliente;
  findClienteByCpf: (cpf: string) => Cliente | undefined;
  addOrdem: (o: Omit<OrdemServico, "id" | "numero_os" | "created_at" | "updated_at">) => OrdemServico;
  avancarStatus: (osId: string, usuario: string) => void;
  cancelarOS: (osId: string, usuario: string) => void;
  getClienteOrdens: (clienteId: string) => OrdemServico[];
  getOrdensHoje: () => OrdemServico[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [ordens, setOrdens] = useState<OrdemServico[]>(mockOrdens);
  const [historico, setHistorico] = useState<HistoricoStatus[]>(mockHistorico);

  const addCliente = useCallback((c: Omit<Cliente, "id" | "created_at">) => {
    const novo: Cliente = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setClientes((prev) => [...prev, novo]);
    return novo;
  }, []);

  const findClienteByCpf = useCallback((cpf: string) => {
    return clientes.find((c) => c.cpf.replace(/\D/g, "") === cpf.replace(/\D/g, ""));
  }, [clientes]);

  const addOrdem = useCallback((o: Omit<OrdemServico, "id" | "numero_os" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const maxNum = ordens.reduce((max, os) => Math.max(max, os.numero_os), 1000);
    const nova: OrdemServico = { ...o, id: crypto.randomUUID(), numero_os: maxNum + 1, created_at: now, updated_at: now };
    setOrdens((prev) => [...prev, nova]);
    setHistorico((prev) => [...prev, { id: crypto.randomUUID(), os_id: nova.id, status: nova.status, usuario: o.vendedor, data_hora: now }]);
    return nova;
  }, [ordens]);

  const avancarStatus = useCallback((osId: string, usuario: string) => {
    setOrdens((prev) =>
      prev.map((os) => {
        if (os.id !== osId) return os;
        const idx = OS_STATUS_FLOW.indexOf(os.status);
        if (idx < 0 || idx >= OS_STATUS_FLOW.length - 1) return os;
        const novoStatus = OS_STATUS_FLOW[idx + 1];
        const now = new Date().toISOString();
        setHistorico((h) => [...h, { id: crypto.randomUUID(), os_id: osId, status: novoStatus, usuario, data_hora: now }]);
        return { ...os, status: novoStatus, updated_at: now };
      })
    );
  }, []);

  const cancelarOS = useCallback((osId: string, usuario: string) => {
    const now = new Date().toISOString();
    setOrdens((prev) => prev.map((os) => os.id === osId ? { ...os, status: "Cancelada" as OSStatus, updated_at: now } : os));
    setHistorico((h) => [...h, { id: crypto.randomUUID(), os_id: osId, status: "Cancelada", usuario, data_hora: now }]);
  }, []);

  const getClienteOrdens = useCallback((clienteId: string) => ordens.filter((o) => o.cliente_id === clienteId), [ordens]);

  const getOrdensHoje = useCallback(() => {
    const hoje = new Date().toISOString().split("T")[0];
    return ordens.filter((o) => o.data_previsao === hoje);
  }, [ordens]);

  return (
    <AppContext.Provider value={{ clientes, ordens, historico, addCliente, findClienteByCpf, addOrdem, avancarStatus, cancelarOS, getClienteOrdens, getOrdensHoje }}>
      {children}
    </AppContext.Provider>
  );
};
