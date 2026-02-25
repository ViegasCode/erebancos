export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campos_os: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          editavel_apos_finalizacao: boolean
          id: string
          nome: string
          obrigatorio: boolean
          opcoes: Json | null
          ordem: number
          tipo: string
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          editavel_apos_finalizacao?: boolean
          id?: string
          nome: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          tipo?: string
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          editavel_apos_finalizacao?: boolean
          id?: string
          nome?: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "campos_os_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          company_id: string
          created_at: string
          documento: string
          email: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          rua: string | null
          telefone: string
          tipo_documento: string
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id: string
          created_at?: string
          documento: string
          email?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          rua?: string | null
          telefone: string
          tipo_documento?: string
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string
          created_at?: string
          documento?: string
          email?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          rua?: string | null
          telefone?: string
          tipo_documento?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          plano: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          plano?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          plano?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_status: {
        Row: {
          data_hora: string
          id: string
          ordem_servico_id: string
          status_id: string | null
          usuario_id: string | null
        }
        Insert: {
          data_hora?: string
          id?: string
          ordem_servico_id: string
          status_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          data_hora?: string
          id?: string
          ordem_servico_id?: string
          status_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_status_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_status_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      numeracao_os: {
        Row: {
          company_id: string
          created_at: string
          id: string
          prefixo: string
          proximo_numero: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          prefixo?: string
          proximo_numero?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          prefixo?: string
          proximo_numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "numeracao_os_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string
          company_id: string
          created_at: string
          criado_por: string | null
          data_abertura: string
          data_finalizacao: string | null
          data_prevista: string | null
          id: string
          numero_os: string
          observacoes: string | null
          status_id: string | null
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          company_id: string
          created_at?: string
          criado_por?: string | null
          data_abertura?: string
          data_finalizacao?: string | null
          data_prevista?: string | null
          id?: string
          numero_os: string
          observacoes?: string | null
          status_id?: string | null
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          company_id?: string
          created_at?: string
          criado_por?: string | null
          data_abertura?: string
          data_finalizacao?: string | null
          data_prevista?: string | null
          id?: string
          numero_os?: string
          observacoes?: string | null
          status_id?: string | null
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_config"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem_servico_id: string
          quantidade: number
          referencia_id: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          ordem_servico_id: string
          quantidade?: number
          referencia_id?: string | null
          tipo: string
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem_servico_id?: string
          quantidade?: number
          referencia_id?: string | null
          tipo?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          company_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          company_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          company_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          email: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          company_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          company_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          company_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      status_config: {
        Row: {
          ativo: boolean
          company_id: string
          cor: string
          created_at: string
          id: string
          is_cancelamento: boolean
          is_final: boolean
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          company_id: string
          cor?: string
          created_at?: string
          id?: string
          is_cancelamento?: boolean
          is_final?: boolean
          nome: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          company_id?: string
          cor?: string
          created_at?: string
          id?: string
          is_cancelamento?: boolean
          is_final?: boolean
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "status_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      valores_campos_os: {
        Row: {
          campo_id: string
          created_at: string
          id: string
          ordem_servico_id: string
          valor: string | null
        }
        Insert: {
          campo_id: string
          created_at?: string
          id?: string
          ordem_servico_id: string
          valor?: string | null
        }
        Update: {
          campo_id?: string
          created_at?: string
          id?: string
          ordem_servico_id?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valores_campos_os_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_os"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valores_campos_os_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_company_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_gerente: { Args: never; Returns: boolean }
      is_my_company: { Args: { _company_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "gerente" | "operador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "operador"],
    },
  },
} as const
