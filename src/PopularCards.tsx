import React, { useState, useEffect } from "react";
import { List, Card, Spin, Typography, Tabs } from "antd";
import styled from "styled-components";

const { Title } = Typography;
const { TabPane } = Tabs;

const PopularContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const CardImage = styled.img`
  max-width: 150px;
  height: auto;
  margin-bottom: 12px;
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

const PopularCards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [planeswalkers, setPlaneswalkers] = useState<MTGCard[]>([]);
  const [lotrCards, setLotrCards] = useState<MTGCard[]>([]);
  const [legendaryCreatures, setLegendaryCreatures] = useState<MTGCard[]>([]);

  useEffect(() => {
    loadPopularCards();
  }, []);

  const fetchCards = async (query: string): Promise<MTGCard[]> => {
    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching cards for query: ${query}`, error);
      return [];
    }
  };

  const loadPopularCards = async () => {
    setLoading(true);
    try {
      // Load popular planeswalkers
      const planeswalkerCards = await fetchCards('type:planeswalker');
      setPlaneswalkers(planeswalkerCards.slice(0, 12));

      // Load Lord of the Rings cards (LTR set)
      const lotrSet = await fetchCards('set:ltr');
      setLotrCards(lotrSet.slice(0, 20));

      // Load legendary creatures
      const legendary = await fetchCards('type:legendary type:creature');
      setLegendaryCreatures(legendary.slice(0, 12));
    } catch (error) {
      console.error("Error loading popular cards:", error);
    }
    setLoading(false);
  };

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
              <strong>Set:</strong> {card.set_name}
            </p>
            <p>
              <strong>Mana Cost:</strong> {card.mana_cost}
            </p>
            <p>
              <strong>Rarity:</strong> {card.rarity}
            </p>
            {card.oracle_text && (
              <p>
                <strong>Text:</strong> {card.oracle_text.substring(0, 100)}...
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
      <PopularContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </PopularContainer>
    );
  }

  return (
    <PopularContainer>
      <Title level={2}>Popular MTG Cards</Title>
      <Tabs defaultActiveKey="planeswalkers">
        <TabPane tab="Planeswalkers" key="planeswalkers">
          <Title level={3}>Popular Planeswalkers</Title>
          {renderCardList(planeswalkers)}
        </TabPane>

        <TabPane tab="Lord of the Rings" key="lotr">
          <Title level={3}>Lord of the Rings Cards</Title>
          {renderCardList(lotrCards)}
        </TabPane>

        <TabPane tab="Legendary Creatures" key="legendary">
          <Title level={3}>Legendary Creatures</Title>
          {renderCardList(legendaryCreatures)}
        </TabPane>
      </Tabs>
    </PopularContainer>
  );
};

export default PopularCards;
