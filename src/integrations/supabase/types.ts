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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      evaluations: {
        Row: {
          biweekly_period: number
          evaluatee_type: string
          evaluation_date: string
          evaluator_id: string
          evaluator_role: string
          foreman_id: string | null
          id: string
          notes: string | null
          period: string
          rating: string
          scores: Json
          total_score: number
          worker_id: string | null
        }
        Insert: {
          biweekly_period: number
          evaluatee_type: string
          evaluation_date?: string
          evaluator_id: string
          evaluator_role: string
          foreman_id?: string | null
          id?: string
          notes?: string | null
          period?: string
          rating: string
          scores: Json
          total_score: number
          worker_id?: string | null
        }
        Update: {
          biweekly_period?: number
          evaluatee_type?: string
          evaluation_date?: string
          evaluator_id?: string
          evaluator_role?: string
          foreman_id?: string | null
          id?: string
          notes?: string | null
          period?: string
          rating?: string
          scores?: Json
          total_score?: number
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_foreman_id_fkey"
            columns: ["foreman_id"]
            isOneToOne: false
            referencedRelation: "foremen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      foremen: {
        Row: {
          created_at: string
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "foremen_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_at: string
          id: string
          leader_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          entity_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_configs: {
        Row: {
          created_at: string
          email_enabled: boolean
          escalation_days: number
          escalation_enabled: boolean
          evaluation_deadline_days: number
          id: string
          in_app_enabled: boolean
          is_active: boolean
          reminder_days_before: number
          reminder_message: string
          reminder_title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          escalation_days?: number
          escalation_enabled?: boolean
          evaluation_deadline_days?: number
          id?: string
          in_app_enabled?: boolean
          is_active?: boolean
          reminder_days_before?: number
          reminder_message?: string
          reminder_title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          escalation_days?: number
          escalation_enabled?: boolean
          evaluation_deadline_days?: number
          id?: string
          in_app_enabled?: boolean
          is_active?: boolean
          reminder_days_before?: number
          reminder_message?: string
          reminder_title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          entity_id: string | null
          id: string
          is_active: boolean
          is_pending: boolean | null
          name: string
          password: string
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          is_pending?: boolean | null
          name: string
          password: string
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          is_pending?: boolean | null
          name?: string
          password?: string
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string
          foreman_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          foreman_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          foreman_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_foreman_id_fkey"
            columns: ["foreman_id"]
            isOneToOne: false
            referencedRelation: "foremen"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_entity: {
        Args: { entity_type: string; user_id: string }
        Returns: boolean
      }
      can_manage_reminders: { Args: { user_id: string }; Returns: boolean }
      get_user_info_safe: {
        Args: { user_uuid: string }
        Returns: {
          user_active: boolean
          user_role: string
        }[]
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_user_role_safe: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "leader" | "manager" | "foreman"
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
      app_role: ["admin", "leader", "manager", "foreman"],
    },
  },
} as const
