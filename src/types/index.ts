export type OSStatus =
  | "Criada"
  | "Em Produção"
  | "Em Corte"
  | "Em Costura"
  | "Em Montagem"
  | "Em Teste"
  | "Finalizada"
  | "Entregue"
  | "Cancelada";

export const OS_STATUS_FLOW: OSStatus[] = [
  "Criada",
  "Em Produção",
  "Em Corte",
  "Em Costura",
  "Em Montagem",
  "Em Teste",
  "Finalizada",
  "Entregue",
];

export const OS_TIPOS = ["Teste", "Retirada", "Envio"] as const;
export type OSTipo = (typeof OS_TIPOS)[number];

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
}

export interface OrdemServico {
  id: string;
  numero_os: number;
  cliente_id: string;
  marca: string;
  modelo: string;
  cilindrada: string;
  ano: string;
  descricao: string;
  tipo: OSTipo;
  material: string;
  valor: number;
  vendedor: string;
  peso_piloto?: string;
  altura_piloto?: string;
  peso_garupa?: string;
  altura_garupa?: string;
  coccix?: string;
  status: OSStatus;
  data_previsao: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricoStatus {
  id: string;
  os_id: string;
  status: OSStatus;
  usuario: string;
  data_hora: string;
}
