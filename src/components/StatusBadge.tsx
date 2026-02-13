import { OSStatus } from "@/types";

export const statusColor: Record<OSStatus, string> = {
  Criada: "bg-muted text-muted-foreground",
  "Em Produção": "bg-info/15 text-info",
  "Em Corte": "bg-warning/15 text-warning",
  "Em Costura": "bg-accent/20 text-accent-foreground",
  "Em Montagem": "bg-primary/10 text-primary",
  "Em Teste": "bg-info/15 text-info",
  Finalizada: "bg-success/15 text-success",
  Entregue: "bg-success/20 text-success",
  Cancelada: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: OSStatus }) {
  return (
    <span className={`status-badge ${statusColor[status]}`}>
      {status}
    </span>
  );
}
