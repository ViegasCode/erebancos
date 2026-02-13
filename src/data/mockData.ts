import { Cliente, OrdemServico, HistoricoStatus, OSStatus } from "@/types";

// Helper
const uuid = () => crypto.randomUUID();
const today = new Date().toISOString().split("T")[0];

export const mockClientes: Cliente[] = [
  { id: "c1", nome: "João Silva", cpf: "123.456.789-00", telefone: "(11) 99999-1234", email: "joao@email.com", cidade: "São Paulo", estado: "SP", created_at: "2024-10-01" },
  { id: "c2", nome: "Maria Santos", cpf: "987.654.321-00", telefone: "(21) 98888-5678", cidade: "Rio de Janeiro", estado: "RJ", created_at: "2024-11-15" },
  { id: "c3", nome: "Pedro Oliveira", cpf: "456.789.123-00", telefone: "(31) 97777-9012", email: "pedro@email.com", cidade: "Belo Horizonte", estado: "MG", created_at: "2025-01-10" },
  { id: "c4", nome: "Ana Costa", cpf: "321.654.987-00", telefone: "(41) 96666-3456", cidade: "Curitiba", estado: "PR", created_at: "2025-02-01" },
];

export const mockOrdens: OrdemServico[] = [
  { id: "o1", numero_os: 1001, cliente_id: "c1", marca: "Honda", modelo: "CG 160", cilindrada: "160cc", ano: "2023", descricao: "Banco customizado com espuma gel", tipo: "Retirada", material: "Couro sintético preto", valor: 450, vendedor: "Carlos", peso_piloto: "80kg", altura_piloto: "1.75m", status: "Em Produção", data_previsao: today, created_at: "2025-02-10", updated_at: "2025-02-11" },
  { id: "o2", numero_os: 1002, cliente_id: "c2", marca: "Yamaha", modelo: "MT-03", cilindrada: "321cc", ano: "2024", descricao: "Rebaixamento + costura diamante", tipo: "Envio", material: "Couro legítimo marrom", valor: 780, vendedor: "Roberto", peso_piloto: "65kg", altura_piloto: "1.60m", peso_garupa: "55kg", altura_garupa: "1.55m", status: "Em Costura", data_previsao: today, created_at: "2025-02-08", updated_at: "2025-02-12" },
  { id: "o3", numero_os: 1003, cliente_id: "c3", marca: "Kawasaki", modelo: "Ninja 400", cilindrada: "400cc", ano: "2022", descricao: "Banco esportivo com grip lateral", tipo: "Retirada", material: "Material sintético", valor: 620, vendedor: "Carlos", status: "Finalizada", data_previsao: "2025-02-12", created_at: "2025-02-05", updated_at: "2025-02-12" },
  { id: "o4", numero_os: 1004, cliente_id: "c4", marca: "BMW", modelo: "G 310 GS", cilindrada: "313cc", ano: "2024", descricao: "Conforto para viagem + garupa", tipo: "Teste", material: "Napa premium", valor: 950, vendedor: "Roberto", peso_piloto: "90kg", altura_piloto: "1.82m", peso_garupa: "70kg", altura_garupa: "1.70m", coccix: "Ajuste especial solicitado", status: "Criada", data_previsao: "2025-02-15", created_at: "2025-02-13", updated_at: "2025-02-13" },
  { id: "o5", numero_os: 1005, cliente_id: "c1", marca: "Honda", modelo: "CB 500X", cilindrada: "500cc", ano: "2023", descricao: "Banco touring com espuma viscoelástica", tipo: "Retirada", material: "Couro sintético", valor: 550, vendedor: "Carlos", status: "Entregue", data_previsao: "2025-02-10", created_at: "2025-01-28", updated_at: "2025-02-10" },
];

export const mockHistorico: HistoricoStatus[] = [
  { id: "h1", os_id: "o1", status: "Criada", usuario: "Carlos", data_hora: "2025-02-10T08:00:00" },
  { id: "h2", os_id: "o1", status: "Em Produção", usuario: "Carlos", data_hora: "2025-02-11T09:30:00" },
  { id: "h3", os_id: "o2", status: "Criada", usuario: "Roberto", data_hora: "2025-02-08T10:00:00" },
  { id: "h4", os_id: "o2", status: "Em Produção", usuario: "Roberto", data_hora: "2025-02-09T08:00:00" },
  { id: "h5", os_id: "o2", status: "Em Corte", usuario: "Roberto", data_hora: "2025-02-10T14:00:00" },
  { id: "h6", os_id: "o2", status: "Em Costura", usuario: "Roberto", data_hora: "2025-02-12T09:00:00" },
];
