# MTG Deck Builder Setup Guide

## Database Setup (Supabase)

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Set up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database-schema.sql` from the project root
3. Run the SQL script to create all tables, indexes, and triggers

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase project URL and anon key from your project settings

```bash
cp .env.example .env
```

## Features

### Deck Management

- **Create Decks**: Build new decks with format, colors, and description
- **Edit Decks**: Modify deck information and card lists
- **View Decks**: Beautiful deck overview with statistics
- **Duplicate Decks**: Copy existing decks for experimentation
- **Public/Private**: Control deck visibility

### Card Management

- **Search Integration**: Add cards directly from Scryfall API
- **Quantity Control**: Manage card quantities in decks
- **Visual Display**: See card images and mana costs
- **Statistics**: Mana curve, type distribution, and price tracking

### Advanced Features

- **Filtering**: Filter decks by format, colors, and visibility
- **Statistics**: Comprehensive deck analysis
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Database triggers update totals automatically

## Database Schema

### Tables

#### `decks`

- Primary deck information (name, description, format, colors)
- Calculated fields (total_cards, estimated_price)
- Visibility controls (is_public)

#### `deck_cards`

- Junction table linking decks to cards
- Stores card metadata and quantities
- Includes pricing and image information

### Key Features

- **Auto-updating totals**: Triggers automatically calculate deck totals
- **Unique constraints**: Prevents duplicate cards in same deck
- **Cascading deletes**: Removing a deck removes all its cards
- **Indexing**: Optimized for common query patterns

## Usage

### Creating Your First Deck

1. Navigate to "My Decks" in the menu
2. Click "Create New Deck"
3. Fill in deck information (name, format, colors)
4. Save the deck
5. Start adding cards using the search feature

### Adding Cards

1. In deck edit mode, click "Add Cards"
2. Search for cards using the Scryfall integration
3. Click "Add to Deck" on desired cards
4. Adjust quantities as needed

### Viewing Statistics

- Each deck shows comprehensive statistics
- Mana curve analysis
- Card type distribution
- Color requirements
- Estimated total value

## Development Notes

### Architecture

- **Frontend**: React with TypeScript and Ant Design
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks
- **Styling**: Styled Components + Ant Design
- **API Integration**: Scryfall API for card data

### Key Components

- `DeckList`: Browse and manage all decks
- `DeckBuilder`: Create and edit decks
- `DeckView`: Detailed deck viewing with statistics
- `DeckService`: API layer for database operations

### Future Enhancements

- User authentication
- Deck sharing and comments
- Tournament tracking
- Playtesting tools
- Collection management
- Price alerts
