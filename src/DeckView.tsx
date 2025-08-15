import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Divider,
  Image,
  Spin,
  Modal,
  Statistic,
  message,
  Tabs,
} from "antd";
import {
  EditOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { DeckService } from "./services/deckService";
import { Deck, DeckCard as DeckCardType } from "./lib/supabase";
import ManaCostDisplay from "./components/ManaCostDisplay";
import DeckCardComponent from "./components/DeckCard";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DeckViewContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const StatCard = styled(Card)`
  text-align: center;
  .ant-card-body {
    padding: 16px;
  }
`;

const DeckCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const DeckView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckCards, setDeckCards] = useState<DeckCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DeckCardType | null>(null);

  const loadDeck = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const deckData = await DeckService.getDeckWithCards(id);
      if (deckData) {
        setDeck(deckData.deck);
        setDeckCards(deckData.cards);
      }
    } catch (error) {
      console.error("Error loading deck:", error);
      message.error("Failed to load deck");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDeck();
    }
  }, [id, loadDeck]);

  const handleDuplicateDeck = async () => {
    if (!deck) return;

    try {
      const newDeck = await DeckService.duplicateDeck(
        deck.id,
        `${deck.name} (Copy)`
      );
      message.success("Deck duplicated successfully");
      navigate(`/decks/${newDeck.id}`);
    } catch (error) {
      console.error("Error duplicating deck:", error);
      message.error("Failed to duplicate deck");
    }
  };

  const handleCardClick = (card: DeckCardType) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const calculateStats = () => {
    const totalCards = deckCards.reduce((sum, card) => sum + card.quantity, 0);
    const totalPrice = deckCards.reduce(
      (sum, card) => sum + card.quantity * (card.price_usd || 0),
      0
    );

    // Mana curve analysis
    const manaCurve = deckCards.reduce((acc, card) => {
      if (card.mana_cost) {
        const numbers = card.mana_cost.match(/\d+/g);
        const numericCost = numbers
          ? numbers.reduce(
              (sum: number, num: string) => sum + parseInt(num, 10),
              0
            )
          : 0;
        const symbolCost = (card.mana_cost.match(/\{[WUBRGC]\}/g) || []).length;
        const cmc = numericCost + symbolCost;
        acc[cmc] = (acc[cmc] || 0) + card.quantity;
      }
      return acc;
    }, {} as Record<number, number>);

    // Card type distribution
    const typeDistribution = deckCards.reduce((acc, card) => {
      const mainType = card.card_type.split(" ")[0];
      acc[mainType] = (acc[mainType] || 0) + card.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Color distribution
    const colorDistribution = deckCards.reduce((acc, card) => {
      if (card.mana_cost) {
        const colors = card.mana_cost.match(/\{[WUBRGC]\}/g) || [];
        colors.forEach((color: string) => {
          const c = color.slice(1, -1);
          acc[c] = (acc[c] || 0) + card.quantity;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Rarity distribution
    const rarityDistribution = deckCards.reduce((acc, card) => {
      if (card.rarity) {
        acc[card.rarity] = (acc[card.rarity] || 0) + card.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCards,
      totalPrice,
      manaCurve,
      typeDistribution,
      colorDistribution,
      rarityDistribution,
    };
  };

  const groupCardsByType = () => {
    const groups = deckCards.reduce((acc, card) => {
      const mainType = card.card_type.split(" ")[0];
      if (!acc[mainType]) {
        acc[mainType] = [];
      }
      acc[mainType].push(card);
      return acc;
    }, {} as Record<string, DeckCardType[]>);

    // Sort each group by name
    Object.keys(groups).forEach((type) => {
      groups[type].sort((a: DeckCardType, b: DeckCardType) =>
        a.card_name.localeCompare(b.card_name)
      );
    });

    return groups;
  };

  if (loading) {
    return (
      <DeckViewContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </DeckViewContainer>
    );
  }

  if (!deck) {
    return (
      <DeckViewContainer>
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Title level={3}>Deck not found</Title>
          <Button onClick={() => navigate("/decks")}>Back to Decks</Button>
        </div>
      </DeckViewContainer>
    );
  }

  const stats = calculateStats();
  const cardGroups = groupCardsByType();

  return (
    <DeckViewContainer>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/decks")}
          style={{ marginBottom: 16 }}
        >
          Back to Decks
        </Button>

        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {deck.name}
              {deck.is_public && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  Public
                </Tag>
              )}
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/decks/${deck.id}/edit`)}
              >
                Edit
              </Button>
              <Button icon={<CopyOutlined />} onClick={handleDuplicateDeck}>
                Duplicate
              </Button>
              <Button icon={<ShareAltOutlined />}>Share</Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Deck Info & Stats */}
        <Col xs={24} lg={8}>
          {/* Deck Information */}
          <Card title="Deck Information" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Format: </Text>
                <Tag color="blue">{deck.format}</Tag>
              </div>

              <div>
                <Text strong>Colors: </Text>
                {deck.colors.length > 0 ? (
                  <Space>
                    {deck.colors.map((color) => (
                      <ManaCostDisplay
                        key={color}
                        manaCost={`{${color}}`}
                        size="small"
                      />
                    ))}
                  </Space>
                ) : (
                  <Tag>Colorless</Tag>
                )}
              </div>

              {deck.description && (
                <div>
                  <Text strong>Description:</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    {deck.description}
                  </Paragraph>
                </div>
              )}

              <Divider />

              <div>
                <Text type="secondary">
                  Created: {new Date(deck.created_at).toLocaleDateString()}
                </Text>
                <br />
                <Text type="secondary">
                  Last Updated: {new Date(deck.updated_at).toLocaleDateString()}
                </Text>
              </div>
            </Space>
          </Card>

          {/* Quick Stats */}
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <StatCard>
                <Statistic
                  title="Total Cards"
                  value={stats.totalCards}
                  valueStyle={{ fontSize: "18px" }}
                />
              </StatCard>
            </Col>
            <Col span={12}>
              <StatCard>
                <Statistic
                  title="Est. Value"
                  value={stats.totalPrice}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontSize: "18px" }}
                />
              </StatCard>
            </Col>
          </Row>

          {/* Detailed Stats */}
          <Card title="Statistics" size="small">
            <Tabs size="small">
              <TabPane tab="Types" key="types">
                {Object.entries(stats.typeDistribution).map(([type, count]) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text>{type}</Text>
                    <Text strong>{count as number}</Text>
                  </div>
                ))}
              </TabPane>

              <TabPane tab="Mana Curve" key="curve">
                {Object.entries(stats.manaCurve).map(([cmc, count]) => (
                  <div
                    key={cmc}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text>CMC {cmc}</Text>
                    <Text strong>{count as number}</Text>
                  </div>
                ))}
              </TabPane>

              <TabPane tab="Colors" key="colors">
                {Object.entries(stats.colorDistribution).map(
                  ([color, count]) => (
                    <div
                      key={color}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Space>
                        <ManaCostDisplay manaCost={`{${color}}`} size="small" />
                        <Text>
                          {color === "W"
                            ? "White"
                            : color === "U"
                            ? "Blue"
                            : color === "B"
                            ? "Black"
                            : color === "R"
                            ? "Red"
                            : color === "G"
                            ? "Green"
                            : "Colorless"}
                        </Text>
                      </Space>
                      <Text strong>{count as number}</Text>
                    </div>
                  )
                )}
              </TabPane>

              <TabPane tab="Rarity" key="rarity">
                {Object.entries(stats.rarityDistribution).map(
                  ([rarity, count]) => (
                    <div
                      key={rarity}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ textTransform: "capitalize" }}>
                        {rarity}
                      </Text>
                      <Text strong>{count as number}</Text>
                    </div>
                  )
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Right Column - Card List */}
        <Col xs={24} lg={16}>
          <Card
            title={`Deck Cards (${deckCards.length} unique, ${stats.totalCards} total)`}
          >
            {Object.entries(cardGroups).map(([type, cards]) => (
              <div key={type} style={{ marginBottom: 24 }}>
                <Title level={4}>
                  {type} (
                  {(cards as DeckCardType[]).reduce(
                    (sum: number, card: DeckCardType) => sum + card.quantity,
                    0
                  )}
                  )
                </Title>
                <DeckCardGrid>
                  {(cards as DeckCardType[]).map((card) => (
                    <DeckCardComponent
                      key={card.id}
                      card={card}
                      variant="grid"
                      onClick={handleCardClick}
                    />
                  ))}
                </DeckCardGrid>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Card Detail Modal */}
      <Modal
        title={selectedCard?.card_name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedCard && (
          <Row gutter={16}>
            <Col span={12}>
              {selectedCard.image_url && (
                <Image
                  src={selectedCard.image_url}
                  alt={selectedCard.card_name}
                  width="100%"
                />
              )}
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Type: </Text>
                  <Text>{selectedCard.card_type}</Text>
                </div>
                {selectedCard.mana_cost && (
                  <div>
                    <Text strong>Mana Cost: </Text>
                    <ManaCostDisplay manaCost={selectedCard.mana_cost} />
                  </div>
                )}
                {selectedCard.rarity && (
                  <div>
                    <Text strong>Rarity: </Text>
                    <Tag style={{ textTransform: "capitalize" }}>
                      {selectedCard.rarity}
                    </Tag>
                  </div>
                )}
                {selectedCard.set_name && (
                  <div>
                    <Text strong>Set: </Text>
                    <Text>{selectedCard.set_name}</Text>
                  </div>
                )}
                <div>
                  <Text strong>Quantity in Deck: </Text>
                  <Text>{selectedCard.quantity}</Text>
                </div>
                {selectedCard.price_usd && (
                  <div>
                    <Text strong>Price: </Text>
                    <Text>${selectedCard.price_usd.toFixed(2)} each</Text>
                  </div>
                )}
              </Space>
            </Col>
          </Row>
        )}
      </Modal>
    </DeckViewContainer>
  );
};

export default DeckView;
