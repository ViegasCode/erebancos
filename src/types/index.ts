export type OSStatus =
  | "Criada"
  | "Em Teste"
  | "Finalizado"
  | "Cancelada";

export const OS_STATUS_FLOW: OSStatus[] = [
  "Criada",
  "Em Teste",
  "Finalizado",
];

export const OS_TIPOS = ["Teste", "Retirada", "Envio"] as const;
export type OSTipo = (typeof OS_TIPOS)[number];

export const LOCAIS_COMPRA = ["Instagram", "Mercado Livre", "Site", "Fisicamente", "Influencer"] as const;
export type LocalCompra = (typeof LOCAIS_COMPRA)[number];

export const FORMAS_PAGAMENTO = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Transferência"] as const;
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export interface Servico {
  descricao: string;
  material: string;
}

export interface Pagamento {
  forma: FormaPagamento;
  valor: number;
}

export type TipoDocumento = "CPF" | "CNPJ";

export interface Cliente {
  id: string;
  nome: string;
  tipo_documento: TipoDocumento;
  cpf: string; // stores CPF or CNPJ
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
  servicos: Servico[];
  tipo: OSTipo;
  valor: number;
  desconto: number;
  frete: number;
  total_venda: number;
  pagamentos: Pagamento[];
  local_compra: LocalCompra;
  influencer?: string;
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
