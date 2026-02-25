import type { StatusConfig } from "@/types";

interface StatusBadgeProps {
  status?: StatusConfig | null;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const nome = label || status?.nome || "—";
  const cor = status?.cor || "#6b7280";

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: `${cor}20`,
        color: cor,
      }}
    >
      {nome}
    </span>
  );
}
