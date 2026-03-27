// Database types matching our Supabase schema

export interface Database {
  public: {
    Tables: {
      purchases: {
        Row: {
          id: string;
          stripe_session_id: string;
          email: string | null;
          purchase_type: "single" | "three_pack";
          credits_remaining: number;
          amount_paid: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_session_id: string;
          email?: string | null;
          purchase_type: "single" | "three_pack";
          credits_remaining?: number;
          amount_paid: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      swms_documents: {
        Row: {
          id: string;
          purchase_id: string | null;
          job_description: string;
          business_name: string;
          state: string;
          generated_content: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id?: string | null;
          job_description: string;
          business_name: string;
          state: string;
          generated_content: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["swms_documents"]["Insert"]
        >;
      };
      generation_tokens: {
        Row: {
          id: string;
          token: string;
          purchase_id: string | null;
          document_id: string | null;
          used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token?: string;
          purchase_id?: string | null;
          document_id?: string | null;
          used?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["generation_tokens"]["Insert"]
        >;
      };
    };
  };
}
