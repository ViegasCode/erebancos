import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Calendar, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Agenda() {
  const { ordens, statuses, loading } = useAppData();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [modoTV, setModoTV] = useState(false);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const statusCancelamento = statuses.find(s => s.is_cancelamento);
  const ordensData = ordens
    .filter(o => o.data_prevista === data && o.status_id !== statusCancelamento?.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  if (modoTV) {
    return (
      <div className="min-h-screen bg-primary p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Agenda do Dia</h1>
            <p className="text-lg text-primary-foreground/70">{new Date(data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <Button variant="outline" onClick={() => setModoTV(false)} className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">Sair do Modo TV</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordensData.map(os => {
            const cliente = (os as any).cliente;
            return (
              <div key={os.id} className="rounded-xl bg-primary-foreground/10 p-5 border border-primary-foreground/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary-foreground">{os.numero_os}</span>
                  <StatusBadge status={(os as any).status} />
                </div>
                <p className="text-primary-foreground font-medium">{cliente?.nome}</p>
              </div>
            );
          })}
          {ordensData.length === 0 && <div className="col-span-full text-center py-12 text-primary-foreground/50 text-lg">Nenhuma OS agendada para esta data</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">Ordens previstas por data</p>
        </div>
        <Button variant="outline" onClick={() => setModoTV(true)} className="gap-2"><Monitor className="h-4 w-4" /> Modo TV</Button>
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Input type="date" value={data} onChange={e => setData(e.target.value)} className="w-48" />
        <span className="text-sm text-muted-foreground">{ordensData.length} ordens</span>
      </div>

      <div className="space-y-3">
        {ordensData.map(os => {
          const cliente = (os as any).cliente;
          return (
            <Link key={os.id} to={`/ordens/${os.id}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{os.numero_os}</div>
                <div>
                  <p className="font-medium">{cliente?.nome}</p>
                </div>
              </div>
              <StatusBadge status={(os as any).status} />
            </Link>
          );
        })}
        {ordensData.length === 0 && <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground shadow-sm">Nenhuma OS agendada para esta data</div>}
      </div>
    </div>
  );
}
