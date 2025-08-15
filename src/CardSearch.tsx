import React, { useState } from "react";
import { Input, Button, List, Card, Spin, Typography } from "antd";
import styled from "styled-components";

const { Title } = Typography;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
`;

const CardImage = styled.img`
  max-width: 200px;
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
    usd_foil?: string;
    eur?: string;
  };
}

const CardSearch: React.FC = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MTGCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(search)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }
      const data = await response.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError("Error fetching cards. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <SearchContainer>
      <Title level={2}>MTG Card Search</Title>
      <Input.Group compact>
        <Input
          style={{ width: "70%" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter card name"
          onPressEnter={handleSearch}
        />
        <Button type="primary" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Input.Group>
      {loading && <Spin style={{ marginTop: 24 }} />}
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      <List
        style={{ marginTop: 24 }}
        grid={{ gutter: 16, column: 1 }}
        dataSource={results}
        renderItem={(card) => (
          <List.Item>
            <Card title={card.name}>
              {card.image_uris?.normal && (
                <CardImage src={card.image_uris.normal} alt={card.name} />
              )}
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
              <p>
                <strong>Text:</strong> {card.oracle_text}
              </p>
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
    </SearchContainer>
  );
};

export default CardSearch;
