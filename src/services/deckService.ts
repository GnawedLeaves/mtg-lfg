import {
  supabase,
  Deck,
  DeckInsert,
  DeckUpdate,
  DeckCard,
  DeckCardInsert,
  DeckCardUpdate,
} from "../lib/supabase";

export class DeckService {
  // Deck CRUD operations
  static async getAllDecks(isPublicOnly: boolean = false): Promise<Deck[]> {
    let query = supabase
      .from("decks")
      .select("*")
      .order("updated_at", { ascending: false });

    if (isPublicOnly) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching decks:", error);
      throw error;
    }

    return data || [];
  }

  static async getDeckById(id: string): Promise<Deck | null> {
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching deck:", error);
      throw error;
    }

    return data;
  }

  static async createDeck(deck: DeckInsert): Promise<Deck> {
    const { data, error } = await supabase
      .from("decks")
      .insert(deck)
      .select()
      .single();

    if (error) {
      console.error("Error creating deck:", error);
      throw error;
    }

    return data;
  }

  static async updateDeck(id: string, updates: DeckUpdate): Promise<Deck> {
    const { data, error } = await supabase
      .from("decks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating deck:", error);
      throw error;
    }

    return data;
  }

  static async deleteDeck(id: string): Promise<void> {
    const { error } = await supabase.from("decks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting deck:", error);
      throw error;
    }
  }

  // Deck Cards CRUD operations
  static async getDeckCards(deckId: string): Promise<DeckCard[]> {
    const { data, error } = await supabase
      .from("deck_cards")
      .select("*")
      .eq("deck_id", deckId)
      .order("card_name");

    if (error) {
      console.error("Error fetching deck cards:", error);
      throw error;
    }

    return data || [];
  }

  static async addCardToDeck(deckCard: DeckCardInsert): Promise<DeckCard> {
    const { data, error } = await supabase
      .from("deck_cards")
      .insert(deckCard)
      .select()
      .single();

    if (error) {
      console.error("Error adding card to deck:", error);
      throw error;
    }

    return data;
  }

  static async updateDeckCard(
    id: string,
    updates: DeckCardUpdate
  ): Promise<DeckCard> {
    const { data, error } = await supabase
      .from("deck_cards")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating deck card:", error);
      throw error;
    }

    return data;
  }

  static async removeCardFromDeck(id: string): Promise<void> {
    const { error } = await supabase.from("deck_cards").delete().eq("id", id);

    if (error) {
      console.error("Error removing card from deck:", error);
      throw error;
    }
  }

  static async updateCardQuantity(
    id: string,
    quantity: number
  ): Promise<DeckCard> {
    const { data, error } = await supabase
      .from("deck_cards")
      .update({ quantity })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating card quantity:", error);
      throw error;
    }

    return data;
  }

  // Utility methods
  static async getDeckWithCards(
    deckId: string
  ): Promise<{ deck: Deck; cards: DeckCard[] } | null> {
    const deck = await this.getDeckById(deckId);
    if (!deck) return null;

    const cards = await this.getDeckCards(deckId);
    return { deck, cards };
  }

  static async duplicateDeck(deckId: string, newName: string): Promise<Deck> {
    const original = await this.getDeckWithCards(deckId);
    if (!original) throw new Error("Deck not found");

    // Create new deck
    const newDeck = await this.createDeck({
      name: newName,
      description: `Copy of ${original.deck.name}`,
      format: original.deck.format,
      colors: original.deck.colors,
      commander_id: original.deck.commander_id,
      is_public: false,
    });

    // Copy all cards
    if (original.cards.length > 0) {
      const cardInserts = original.cards.map((card) => ({
        deck_id: newDeck.id,
        card_id: card.card_id,
        card_name: card.card_name,
        quantity: card.quantity,
        card_type: card.card_type,
        mana_cost: card.mana_cost,
        rarity: card.rarity,
        set_name: card.set_name,
        image_url: card.image_url,
        is_commander: card.is_commander,
        price_usd: card.price_usd,
      }));

      const { error } = await supabase.from("deck_cards").insert(cardInserts);

      if (error) {
        console.error("Error copying deck cards:", error);
        throw error;
      }
    }

    return newDeck;
  }

  static getFormatOptions(): string[] {
    return [
      "Standard",
      "Pioneer",
      "Modern",
      "Legacy",
      "Vintage",
      "Commander",
      "Pauper",
      "Historic",
      "Alchemy",
      "Brawl",
      "Limited",
      "Casual",
    ];
  }

  static getColorOptions(): Array<{
    label: string;
    value: string;
    description: string;
  }> {
    return [
      { label: "White", value: "W", description: "Order, peace, law" },
      {
        label: "Blue",
        value: "U",
        description: "Knowledge, logic, technology",
      },
      { label: "Black", value: "B", description: "Power, ambition, death" },
      { label: "Red", value: "R", description: "Freedom, emotion, action" },
      { label: "Green", value: "G", description: "Nature, life, growth" },
      { label: "Colorless", value: "C", description: "Artifacts and Eldrazi" },
    ];
  }
}
