-- MTG Deck Builder Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create decks table
CREATE TABLE decks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    format VARCHAR(50) NOT NULL DEFAULT 'Standard',
    colors TEXT[] DEFAULT '{}',
    commander_id VARCHAR(255), -- Scryfall card ID for commander
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID, -- For future user authentication
    total_cards INTEGER DEFAULT 0,
    estimated_price DECIMAL(10,2)
);

-- Create deck_cards table (junction table for deck-card relationships)
CREATE TABLE deck_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    card_id VARCHAR(255) NOT NULL, -- Scryfall card ID
    card_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    card_type VARCHAR(255),
    mana_cost VARCHAR(100),
    rarity VARCHAR(50),
    set_name VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_commander BOOLEAN DEFAULT false,
    price_usd DECIMAL(10,2),
    UNIQUE(deck_id, card_id) -- Prevent duplicate cards in same deck
);

-- Create indexes for better performance
CREATE INDEX idx_decks_format ON decks(format);
CREATE INDEX idx_decks_colors ON decks USING GIN(colors);
CREATE INDEX idx_decks_public ON decks(is_public);
CREATE INDEX idx_decks_created_at ON decks(created_at);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
CREATE INDEX idx_deck_cards_rarity ON deck_cards(rarity);
CREATE INDEX idx_deck_cards_is_commander ON deck_cards(is_commander);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for decks table
CREATE TRIGGER update_decks_updated_at 
    BEFORE UPDATE ON decks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update deck totals
CREATE OR REPLACE FUNCTION update_deck_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_cards and estimated_price for the affected deck
    UPDATE decks 
    SET 
        total_cards = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM deck_cards 
            WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
        ),
        estimated_price = (
            SELECT COALESCE(SUM(quantity * COALESCE(price_usd, 0)), 0) 
            FROM deck_cards 
            WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
        )
    WHERE id = COALESCE(NEW.deck_id, OLD.deck_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for deck_cards table
CREATE TRIGGER update_deck_totals_on_insert
    AFTER INSERT ON deck_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_totals();

CREATE TRIGGER update_deck_totals_on_update
    AFTER UPDATE ON deck_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_totals();

CREATE TRIGGER update_deck_totals_on_delete
    AFTER DELETE ON deck_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_totals();

-- Enable Row Level Security (RLS)
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
-- For now, allow all operations for development
CREATE POLICY "Allow all operations on decks" ON decks
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on deck_cards" ON deck_cards
    FOR ALL USING (true);

-- Insert sample data
INSERT INTO decks (name, description, format, colors, is_public) VALUES
('Aggro Red Burn', 'Fast aggressive red deck focused on dealing damage quickly', 'Standard', ARRAY['R'], true),
('Blue Control', 'Control deck with counterspells and card draw', 'Standard', ARRAY['U'], true),
('Simic Ramp', 'Green-blue ramp deck with big creatures', 'Standard', ARRAY['G', 'U'], true);

-- Get the deck IDs for sample cards
-- Note: You'll need to update these with actual Scryfall card IDs
-- This is just to show the structure
