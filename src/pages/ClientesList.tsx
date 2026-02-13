import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { formatCPF, formatCurrency } from "@/lib/formatters";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Eye, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClientesList() {
  const { clientes, ordens } = useAppData();
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const filtered = clientes.filter((c) => {
    const q = busca.toLowerCase();
    return c.nome.toLowerCase().includes(q) || c.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, "")) || c.telefone.includes(q);
  });

  const getUltimaOS = (clienteId: string) => {
    const os = ordens.filter((o) => o.cliente_id === clienteId).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return os[0];
  };

  const getTotalGasto = (clienteId: string) => ordens.filter((o) => o.cliente_id === clienteId && o.status !== "Cancelada").reduce((s, o) => s + o.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => navigate("/clientes/novo")} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por CPF, nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">CPF</th>
              <th className="px-5 py-3 font-medium">Telefone</th>
              <th className="px-5 py-3 font-medium">Última OS</th>
              <th className="px-5 py-3 font-medium">Total Gasto</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const ultimaOS = getUltimaOS(c.id);
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{c.nome}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.cpf}</td>
                  <td className="px-5 py-3">{c.telefone}</td>
                  <td className="px-5 py-3">{ultimaOS ? `#${ultimaOS.numero_os}` : "—"}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(getTotalGasto(c.id))}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/clientes/${c.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/ordens/nova?cliente=${c.id}`)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
