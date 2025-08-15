import React, { useState } from "react";
import { Input, Button, List, Spin, Typography, Modal, Row, Col } from "antd";
import styled from "styled-components";
import CardDisplay from "../components/CardDisplay";

const { Title } = Typography;

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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
  released_at?: string;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleImageClick = (imageUrl: string, cardName: string) => {
    setSelectedImage({ url: imageUrl, name: cardName });
    setModalVisible(true);
  };

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

      {results.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {results.map((card) => (
            <Col xs={24} sm={12} md={8} lg={6} key={card.id}>
              <CardDisplay
                card={card}
                onImageClick={handleImageClick}
                showSet={true}
                showReleaseDate={false}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={selectedImage?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="auto"
        centered
        styles={{
          body: {
            padding: 0,
            display: "flex",
            justifyContent: "center",
          },
        }}
      >
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={selectedImage.name}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        )}
      </Modal>
    </SearchContainer>
  );
};

export default CardSearch;
