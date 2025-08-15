import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          format: string;
          colors: string[];
          commander_id: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          user_id: string | null;
          total_cards: number;
          estimated_price: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          format: string;
          colors?: string[];
          commander_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          total_cards?: number;
          estimated_price?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          format?: string;
          colors?: string[];
          commander_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          total_cards?: number;
          estimated_price?: number | null;
        };
      };
      deck_cards: {
        Row: {
          id: string;
          deck_id: string;
          card_id: string;
          card_name: string;
          quantity: number;
          card_type: string;
          mana_cost: string | null;
          rarity: string | null;
          set_name: string | null;
          image_url: string | null;
          created_at: string;
          is_commander: boolean;
          price_usd: number | null;
        };
        Insert: {
          id?: string;
          deck_id: string;
          card_id: string;
          card_name: string;
          quantity?: number;
          card_type: string;
          mana_cost?: string | null;
          rarity?: string | null;
          set_name?: string | null;
          image_url?: string | null;
          created_at?: string;
          is_commander?: boolean;
          price_usd?: number | null;
        };
        Update: {
          id?: string;
          deck_id?: string;
          card_id?: string;
          card_name?: string;
          quantity?: number;
          card_type?: string;
          mana_cost?: string | null;
          rarity?: string | null;
          set_name?: string | null;
          image_url?: string | null;
          created_at?: string;
          is_commander?: boolean;
          price_usd?: number | null;
        };
      };
    };
  };
}

export type Deck = Database["public"]["Tables"]["decks"]["Row"];
export type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"];
export type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"];

export type DeckCard = Database["public"]["Tables"]["deck_cards"]["Row"];
export type DeckCardInsert =
  Database["public"]["Tables"]["deck_cards"]["Insert"];
export type DeckCardUpdate =
  Database["public"]["Tables"]["deck_cards"]["Update"];
