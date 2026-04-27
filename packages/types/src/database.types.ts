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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      usagelogs: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usagelogs_workspaceid_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      usagelogs_2026_04: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_05: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_06: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_07: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_08: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_09: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_10: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_11: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_2026_12: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      usagelogs_default: {
        Row: {
          agent_id: string | null
          budget_id: string | null
          cache_hit: boolean | null
          cache_key: string | null
          call_id: string
          cost_cents: number
          created_at: string
          environment: string | null
          feature: string
          id: string
          input_tokens: number
          ip_region: string | null
          is_error: boolean
          is_shadow_call: boolean
          latency_ms: number
          latency_sensitive: boolean | null
          metadata: Json | null
          model: string
          output_tokens: number
          parent_call_id: string | null
          pipeline_step: number | null
          plan_tier: string | null
          provider: string
          quality_score: number | null
          routing_strategy: string | null
          sdk_version: string | null
          session_id: string | null
          shadow_mode: boolean
          shadow_savings_cents: number | null
          status_code: number
          task_type: string
          timestamp_ms: number
          total_tokens: number
          trace_id: string | null
          user_id: string | null
          workflow_run_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type: string
          timestamp_ms: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_id?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          call_id?: string
          cost_cents?: number
          created_at?: string
          environment?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          ip_region?: string | null
          is_error?: boolean
          is_shadow_call?: boolean
          latency_ms?: number
          latency_sensitive?: boolean | null
          metadata?: Json | null
          model?: string
          output_tokens?: number
          parent_call_id?: string | null
          pipeline_step?: number | null
          plan_tier?: string | null
          provider?: string
          quality_score?: number | null
          routing_strategy?: string | null
          sdk_version?: string | null
          session_id?: string | null
          shadow_mode?: boolean
          shadow_savings_cents?: number | null
          status_code?: number
          task_type?: string
          timestamp_ms?: number
          total_tokens?: number
          trace_id?: string | null
          user_id?: string | null
          workflow_run_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      workspace_api_keys: {
        Row: {
          created_at: string
          environment: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          environment?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_api_keys_workspaceid_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          owner_id: string
          plan_tier: string
          settings: Json
          slug: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          owner_id: string
          plan_tier?: string
          settings?: Json
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan_tier?: string
          settings?: Json
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_uuid_v7: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
