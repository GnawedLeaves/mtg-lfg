import React, { useState, useEffect } from "react";
import { List, Card, Spin, Typography, Tabs, Button, Input } from "antd";
import styled from "styled-components";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const ExpansionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const CardImage = styled.img`
  max-width: 150px;
  height: auto;
  margin-bottom: 12px;
`;

const SetContainer = styled.div`
  margin-bottom: 24px;
`;

interface MTGCard {
  id: string;
  name: string;
  image_uris?: {
    normal?: string;
    small?: string;
  };
  type_line?: string;
  set_name?: string;
  mana_cost?: string;
  rarity?: string;
  oracle_text?: string;
  prices?: {
    usd?: string;
    eur?: string;
  };
}

interface MTGSet {
  code: string;
  name: string;
  type?: string;
  releaseDate?: string;
}

const ExpansionSets: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [sets, setSets] = useState<MTGSet[]>([]);
  const [selectedCards, setSelectedCards] = useState<{
    [key: string]: MTGCard[];
  }>({});
  const [searchTerm, setSearchTerm] = useState("");

  const popularSets = [
    { code: "ltr", name: "The Lord of the Rings: Tales of Middle-earth" },
    { code: "bro", name: "The Brothers' War" },
    { code: "dmu", name: "Dominaria United" },
    { code: "snc", name: "Streets of New Capenna" },
    { code: "neo", name: "Kamigawa: Neon Dynasty" },
    { code: "vow", name: "Innistrad: Crimson Vow" },
    { code: "mid", name: "Innistrad: Midnight Hunt" },
    { code: "afr", name: "Adventures in the Forgotten Realms" },
    { code: "stx", name: "Strixhaven: School of Mages" },
    { code: "khm", name: "Kaldheim" },
    { code: "znr", name: "Zendikar Rising" },
    { code: "m21", name: "Core Set 2021" },
  ];

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    setLoading(true);
    try {
      setSets(popularSets);
    } catch (error) {
      console.error("Error loading sets:", error);
    }
    setLoading(false);
  };

  const loadCardsFromSet = async (setCode: string) => {
    if (selectedCards[setCode]) return; // Already loaded

    setCardLoading(true);
    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=set:${setCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setSelectedCards((prev) => ({
        ...prev,
        [setCode]: (data.data || []).slice(0, 20),
      }));
    } catch (error) {
      console.error(`Error loading cards from set ${setCode}:`, error);
    }
    setCardLoading(false);
  };

  const filteredSets = sets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCardList = (cards: MTGCard[]) => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
      dataSource={cards}
      renderItem={(card) => (
        <List.Item>
          <Card title={card.name} size="small" style={{ height: "100%" }}>
            {card.image_uris?.normal && <CardImage src={card.image_uris.normal} alt={card.name} />}
            <p>
              <strong>Type:</strong> {card.type_line}
            </p>
            <p>
              <strong>Mana Cost:</strong> {card.mana_cost}
            </p>
            <p>
              <strong>Rarity:</strong> {card.rarity}
            </p>
            {card.oracle_text && (
              <p>
                <strong>Text:</strong> {card.oracle_text.substring(0, 80)}...
              </p>
            )}
            {card.prices && (card.prices.usd || card.prices.eur) && (
              <p>
                <strong>Price:</strong>{" "}
                {card.prices.usd && `$${card.prices.usd}`}
                {card.prices.usd && card.prices.eur && " / "}
                {card.prices.eur && `€${card.prices.eur}`}
              </p>
            )}
          </Card>
        </List.Item>
      )}
    />
  );

  if (loading) {
    return (
      <ExpansionContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </ExpansionContainer>
    );
  }

  return (
    <ExpansionContainer>
      <Title level={2}>MTG Expansion Sets</Title>

      <SetContainer>
        <Search
          placeholder="Search for a set..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300, marginBottom: 16 }}
        />
      </SetContainer>

      <Tabs defaultActiveKey="ltr" onChange={(key) => loadCardsFromSet(key)}>
        {filteredSets.map((set) => (
          <TabPane tab={set.name} key={set.code}>
            <Title level={3}>
              {set.name} ({set.code.toUpperCase()})
            </Title>

            {!selectedCards[set.code] && (
              <Button
                type="primary"
                onClick={() => loadCardsFromSet(set.code)}
                loading={cardLoading}
                style={{ marginBottom: 16 }}
              >
                Load Cards from {set.name}
              </Button>
            )}

            {cardLoading && !selectedCards[set.code] && (
              <Spin
                style={{
                  display: "block",
                  textAlign: "center",
                  margin: "20px 0",
                }}
              />
            )}

            {selectedCards[set.code] && renderCardList(selectedCards[set.code])}
          </TabPane>
        ))}
      </Tabs>
    </ExpansionContainer>
  );
};

export default ExpansionSets;
