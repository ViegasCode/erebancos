// Multi-tenant SaaS types

export type AppRole = 'admin' | 'gerente' | 'operador';
export type TipoDocumento = 'CPF' | 'CNPJ';

export interface Company {
  id: string;
  nome: string;
  plano: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  nome: string;
  email: string;
  role: AppRole;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  company_id: string;
  nome: string;
  tipo_documento: string;
  documento: string;
  telefone: string;
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusConfig {
  id: string;
  company_id: string;
  nome: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  is_final: boolean;
  is_cancelamento: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  company_id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export interface Servico {
  id: string;
  company_id: string;
  categoria_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  ativo: boolean;
  created_at: string;
}

export interface Produto {
  id: string;
  company_id: string;
  categoria_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  ativo: boolean;
  created_at: string;
}

export interface CampoOS {
  id: string;
  company_id: string;
  nome: string;
  tipo: 'texto' | 'numero' | 'data' | 'select' | 'checkbox';
  obrigatorio: boolean;
  ativo: boolean;
  ordem: number;
  editavel_apos_finalizacao: boolean;
  opcoes?: string[];
  created_at: string;
}

export interface NumeracaoOS {
  id: string;
  company_id: string;
  prefixo: string;
  proximo_numero: number;
  created_at: string;
}

export interface OrdemServico {
  id: string;
  company_id: string;
  numero_os: string;
  cliente_id: string;
  status_id?: string;
  criado_por?: string;
  data_abertura: string;
  data_prevista?: string;
  data_finalizacao?: string;
  valor_total: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  cliente?: Cliente;
  status?: StatusConfig;
  criador?: Profile;
}

export interface OSItem {
  id: string;
  ordem_servico_id: string;
  tipo: 'servico' | 'produto';
  referencia_id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
}

export interface ValorCampoOS {
  id: string;
  ordem_servico_id: string;
  campo_id: string;
  valor?: string;
  created_at: string;
  campo?: CampoOS;
}

export interface HistoricoStatus {
  id: string;
  ordem_servico_id: string;
  status_id?: string;
  usuario_id?: string;
  data_hora: string;
  status?: StatusConfig;
  usuario?: Profile;
}
