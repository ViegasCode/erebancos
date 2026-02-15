import { OSStatus } from "@/types";

export const statusColor: Record<OSStatus, string> = {
  Criada: "bg-muted text-muted-foreground",
  "Em Teste": "bg-info/15 text-info",
  Finalizado: "bg-success/15 text-success",
  Cancelada: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: OSStatus }) {
  return (
    <span className={`status-badge ${statusColor[status]}`}>
      {status}
    </span>
  );
}
