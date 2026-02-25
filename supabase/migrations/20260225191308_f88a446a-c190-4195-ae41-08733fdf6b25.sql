
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'operador');

-- 2. Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  plano TEXT NOT NULL DEFAULT 'free',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'operador',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Clientes table (multi-tenant)
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'CPF',
  documento TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cep TEXT,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 5. Status config per company
CREATE TABLE public.status_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#6b7280',
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  is_final BOOLEAN NOT NULL DEFAULT false,
  is_cancelamento BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.status_config ENABLE ROW LEVEL SECURITY;

-- 6. Categorias per company
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- 7. Servicos per company
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(12,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- 8. Produtos per company
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(12,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- 9. Campos OS customizáveis
CREATE TABLE public.campos_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  editavel_apos_finalizacao BOOLEAN NOT NULL DEFAULT false,
  opcoes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campos_os ENABLE ROW LEVEL SECURITY;

-- 10. Numeração config
CREATE TABLE public.numeracao_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  prefixo TEXT NOT NULL DEFAULT 'OS',
  proximo_numero INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.numeracao_os ENABLE ROW LEVEL SECURITY;

-- 11. Ordens de Serviço
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  numero_os TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  status_id UUID REFERENCES public.status_config(id),
  criado_por UUID REFERENCES public.profiles(id),
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_prevista DATE,
  data_finalizacao TIMESTAMPTZ,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- 12. OS Itens
CREATE TABLE public.os_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('servico', 'produto')),
  referencia_id UUID,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_itens ENABLE ROW LEVEL SECURITY;

-- 13. Valores campos OS
CREATE TABLE public.valores_campos_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  campo_id UUID NOT NULL REFERENCES public.campos_os(id) ON DELETE CASCADE,
  valor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.valores_campos_os ENABLE ROW LEVEL SECURITY;

-- 14. Histórico de status
CREATE TABLE public.historico_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  status_id UUID REFERENCES public.status_config(id),
  usuario_id UUID REFERENCES public.profiles(id),
  data_hora TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.historico_status ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Get current user's company_id
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Check if user belongs to a company
CREATE OR REPLACE FUNCTION public.is_my_company(_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND company_id = _company_id
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Check if user is admin or gerente
CREATE OR REPLACE FUNCTION public.is_admin_or_gerente()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Companies
CREATE POLICY "Users can view own company" ON public.companies FOR SELECT TO authenticated USING (public.is_my_company(id));
CREATE POLICY "Admins can update own company" ON public.companies FOR UPDATE TO authenticated USING (public.is_my_company(id) AND public.is_admin());
CREATE POLICY "Allow insert for signup" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);

-- Profiles
CREATE POLICY "Users can view company profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin() OR user_id = auth.uid());
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND (public.is_admin() OR user_id = auth.uid()));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Clientes
CREATE POLICY "Company users can view clients" ON public.clientes FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Company users can insert clients" ON public.clientes FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id));
CREATE POLICY "Company users can update clients" ON public.clientes FOR UPDATE TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Company users can delete clients" ON public.clientes FOR DELETE TO authenticated USING (public.is_my_company(company_id));

-- Status Config
CREATE POLICY "Company users can view statuses" ON public.status_config FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage statuses" ON public.status_config FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update statuses" ON public.status_config FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can delete statuses" ON public.status_config FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Categorias
CREATE POLICY "Company users can view categorias" ON public.categorias FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage categorias" ON public.categorias FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update categorias" ON public.categorias FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can delete categorias" ON public.categorias FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Servicos
CREATE POLICY "Company users can view servicos" ON public.servicos FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage servicos" ON public.servicos FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update servicos" ON public.servicos FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can delete servicos" ON public.servicos FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Produtos
CREATE POLICY "Company users can view produtos" ON public.produtos FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage produtos" ON public.produtos FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update produtos" ON public.produtos FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can delete produtos" ON public.produtos FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Campos OS
CREATE POLICY "Company users can view campos" ON public.campos_os FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage campos" ON public.campos_os FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update campos" ON public.campos_os FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can delete campos" ON public.campos_os FOR DELETE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Numeração OS
CREATE POLICY "Company users can view numeracao" ON public.numeracao_os FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Admins can manage numeracao" ON public.numeracao_os FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id) AND public.is_admin());
CREATE POLICY "Admins can update numeracao" ON public.numeracao_os FOR UPDATE TO authenticated USING (public.is_my_company(company_id) AND public.is_admin());

-- Ordens de Serviço
CREATE POLICY "Company users can view OS" ON public.ordens_servico FOR SELECT TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Company users can insert OS" ON public.ordens_servico FOR INSERT TO authenticated WITH CHECK (public.is_my_company(company_id));
CREATE POLICY "Company users can update OS" ON public.ordens_servico FOR UPDATE TO authenticated USING (public.is_my_company(company_id));
CREATE POLICY "Company users can delete OS" ON public.ordens_servico FOR DELETE TO authenticated USING (public.is_my_company(company_id));

-- OS Itens
CREATE POLICY "Users can view OS itens" ON public.os_itens FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = os_itens.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can insert OS itens" ON public.os_itens FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = os_itens.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can update OS itens" ON public.os_itens FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = os_itens.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can delete OS itens" ON public.os_itens FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = os_itens.ordem_servico_id AND public.is_my_company(os.company_id)));

-- Valores Campos OS
CREATE POLICY "Users can view campo values" ON public.valores_campos_os FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = valores_campos_os.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can insert campo values" ON public.valores_campos_os FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = valores_campos_os.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can update campo values" ON public.valores_campos_os FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = valores_campos_os.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can delete campo values" ON public.valores_campos_os FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = valores_campos_os.ordem_servico_id AND public.is_my_company(os.company_id)));

-- Historico Status
CREATE POLICY "Users can view historico" ON public.historico_status FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = historico_status.ordem_servico_id AND public.is_my_company(os.company_id)));
CREATE POLICY "Users can insert historico" ON public.historico_status FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ordens_servico os WHERE os.id = historico_status.ordem_servico_id AND public.is_my_company(os.company_id)));

-- =============================================
-- FUNCTION: Auto-create profile on signup (for first user = create company too)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company_id UUID;
  _company_name TEXT;
BEGIN
  -- Check if user metadata contains company info
  _company_name := NEW.raw_user_meta_data ->> 'company_name';
  _company_id := (NEW.raw_user_meta_data ->> 'company_id')::UUID;
  
  -- If creating new company
  IF _company_name IS NOT NULL AND _company_id IS NULL THEN
    INSERT INTO public.companies (nome) VALUES (_company_name) RETURNING id INTO _company_id;
    
    -- Create default statuses for new company
    INSERT INTO public.status_config (company_id, nome, cor, ordem, is_final, is_cancelamento) VALUES
      (_company_id, 'Aberta', '#3b82f6', 0, false, false),
      (_company_id, 'Em Andamento', '#f59e0b', 1, false, false),
      (_company_id, 'Finalizada', '#22c55e', 2, true, false),
      (_company_id, 'Cancelada', '#ef4444', 3, false, true);
    
    -- Create default numeracao
    INSERT INTO public.numeracao_os (company_id) VALUES (_company_id);
    
    -- First user of company is admin
    INSERT INTO public.profiles (user_id, company_id, nome, email, role)
    VALUES (NEW.id, _company_id, COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)), NEW.email, 'admin');
  ELSIF _company_id IS NOT NULL THEN
    -- Joining existing company
    INSERT INTO public.profiles (user_id, company_id, nome, email, role)
    VALUES (NEW.id, _company_id, COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)), NEW.email, COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'operador'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
