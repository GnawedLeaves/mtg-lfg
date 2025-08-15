import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Switch,
  message,
  Spin,
  Divider,
  Space,
  AutoComplete,
  Modal,
  Table,
  Image,
  Tag,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { DeckService } from "../services/deckService";
import {
  Deck,
  DeckCard as DeckCardType,
  DeckInsert,
  DeckCardInsert,
} from "../lib/supabase";
import ManaCostDisplay from "../components/ManaCostDisplay";
import DeckCard from "../components/DeckCard";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

const DeckBuilderContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const CardSearchModal = styled(Modal)`
  .ant-modal-body {
    max-height: 80vh;
    overflow-y: auto;
  }
`;

const DeckBuilder: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckCards, setDeckCards] = useState<DeckCardType[]>([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [cardSearchLoading, setCardSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      loadDeck();
    }
  }, [id, isEditing]);

  const loadDeck = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const deckData = await DeckService.getDeckWithCards(id);
      if (deckData) {
        setDeck(deckData.deck);
        setDeckCards(deckData.cards);
        form.setFieldsValue({
          name: deckData.deck.name,
          description: deckData.deck.description,
          format: deckData.deck.format,
          colors: deckData.deck.colors,
          is_public: deckData.deck.is_public,
        });
      }
    } catch (error) {
      console.error("Error loading deck:", error);
      message.error("Failed to load deck");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (isEditing && id) {
        await DeckService.updateDeck(id, values);
        message.success("Deck updated successfully");
      } else {
        const newDeck = await DeckService.createDeck(values as DeckInsert);
        message.success("Deck created successfully");
        navigate(`/decks/${newDeck.id}/edit`);
      }
    } catch (error) {
      console.error("Error saving deck:", error);
      message.error("Failed to save deck");
    } finally {
      setLoading(false);
    }
  };

  const searchCards = async (query: string) => {
    if (!query.trim()) return;

    try {
      setCardSearchLoading(true);
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=1`
      );

      if (!response.ok) {
        throw new Error("Failed to search cards");
      }

      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Error searching cards:", error);
      message.error("Failed to search cards");
      setSearchResults([]);
    } finally {
      setCardSearchLoading(false);
    }
  };

  const addCardToDeck = async (card: MTGCard) => {
    if (!id) {
      message.warning("Please save the deck first before adding cards");
      return;
    }

    try {
      const cardData: DeckCardInsert = {
        deck_id: id,
        card_id: card.id,
        card_name: card.name,
        quantity: 1,
        card_type: card.type_line || "",
        mana_cost: card.mana_cost || null,
        rarity: card.rarity || null,
        set_name: card.set_name || null,
        image_url: card.image_uris?.normal || null,
        is_commander: false,
        price_usd: card.prices?.usd ? parseFloat(card.prices.usd) : null,
      };

      const newCard = await DeckService.addCardToDeck(cardData);
      setDeckCards([...deckCards, newCard]);
      setSearchModalVisible(false);
      message.success(`Added ${card.name} to deck`);
    } catch (error) {
      console.error("Error adding card to deck:", error);
      message.error("Failed to add card to deck");
    }
  };

  const updateCardQuantity = async (cardId: string, quantity: number) => {
    try {
      const updatedCard = await DeckService.updateCardQuantity(
        cardId,
        quantity
      );
      setDeckCards(
        deckCards.map((card) => (card.id === cardId ? updatedCard : card))
      );
    } catch (error) {
      console.error("Error updating card quantity:", error);
      message.error("Failed to update card quantity");
    }
  };

  const removeCardFromDeck = async (cardId: string) => {
    try {
      await DeckService.removeCardFromDeck(cardId);
      setDeckCards(deckCards.filter((card) => card.id !== cardId));
      message.success("Card removed from deck");
    } catch (error) {
      console.error("Error removing card from deck:", error);
      message.error("Failed to remove card from deck");
    }
  };

  const formatOptions = DeckService.getFormatOptions();
  const colorOptions = DeckService.getColorOptions();

  const calculateDeckStats = () => {
    const totalCards = deckCards.reduce((sum, card) => sum + card.quantity, 0);
    const totalPrice = deckCards.reduce(
      (sum, card) => sum + card.quantity * (card.price_usd || 0),
      0
    );
    const cardsByType = deckCards.reduce((acc, card) => {
      const type = card.card_type.split(" ")[0]; // Get first word of type
      acc[type] = (acc[type] || 0) + card.quantity;
      return acc;
    }, {} as Record<string, number>);

    return { totalCards, totalPrice, cardsByType };
  };

  const stats = calculateDeckStats();

  if (loading && isEditing) {
    return (
      <DeckBuilderContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </DeckBuilderContainer>
    );
  }

  return (
    <DeckBuilderContainer>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/decks")}
          style={{ marginBottom: 16 }}
        >
          Back to Decks
        </Button>
        <Title level={2}>
          {isEditing ? `Edit: ${deck?.name}` : "Create New Deck"}
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Deck Info */}
        <Col xs={24} lg={8}>
          <Card title="Deck Information" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                format: "Standard",
                colors: [],
                is_public: false,
              }}
            >
              <Form.Item
                name="name"
                label="Deck Name"
                rules={[
                  { required: true, message: "Please enter a deck name" },
                ]}
              >
                <Input placeholder="Enter deck name" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea
                  rows={3}
                  placeholder="Describe your deck strategy..."
                />
              </Form.Item>

              <Form.Item
                name="format"
                label="Format"
                rules={[{ required: true, message: "Please select a format" }]}
              >
                <Select placeholder="Select format">
                  {formatOptions.map((format) => (
                    <Option key={format} value={format}>
                      {format}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="colors" label="Deck Colors">
                <Select
                  mode="multiple"
                  placeholder="Select deck colors"
                  allowClear
                >
                  {colorOptions.map((color: any) => (
                    <Option key={color.value} value={color.value}>
                      <Space>
                        <ManaCostDisplay
                          manaCost={`{${color.value}}`}
                          size="small"
                        />
                        {color.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="is_public"
                label="Make deck public"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  {isEditing ? "Update Deck" : "Create Deck"}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Deck Stats */}
          {isEditing && (
            <Card title="Deck Statistics">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Total Cards: </Text>
                  <Text>{stats.totalCards}</Text>
                </div>
                <div>
                  <Text strong>Estimated Value: </Text>
                  <Text>${stats.totalPrice.toFixed(2)}</Text>
                </div>
                <Divider />
                <div>
                  <Text strong>Card Types:</Text>
                  {Object.entries(stats.cardsByType).map(([type, count]) => (
                    <div key={type} style={{ marginLeft: 16 }}>
                      <Text>
                        {type}: {count as number}
                      </Text>
                    </div>
                  ))}
                </div>
              </Space>
            </Card>
          )}
        </Col>

        {/* Right Column - Deck Cards */}
        <Col xs={24} lg={16}>
          {isEditing ? (
            <Card
              title={`Deck Cards (${deckCards.length} unique, ${stats.totalCards} total)`}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setSearchModalVisible(true)}
                >
                  Add Cards
                </Button>
              }
            >
              {deckCards.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Text type="secondary">No cards in deck yet</Text>
                  <br />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setSearchModalVisible(true)}
                    style={{ marginTop: 16 }}
                  >
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                <div>
                  {deckCards.map((card) => (
                    <DeckCard
                      key={card.id}
                      card={card}
                      variant="row"
                      showQuantityControls={true}
                      showDeleteButton={true}
                      onQuantityChange={updateCardQuantity}
                      onDelete={removeCardFromDeck}
                    />
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: 40 }}>
                <Text type="secondary">
                  Save your deck first to start adding cards
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Card Search Modal */}
      <CardSearchModal
        title="Search Cards"
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Input.Search
          placeholder="Search for cards..."
          onSearch={searchCards}
          loading={cardSearchLoading}
          style={{ marginBottom: 16 }}
          size="large"
        />

        {cardSearchLoading ? (
          <Spin style={{ display: "block", textAlign: "center", margin: 20 }} />
        ) : (
          <Row gutter={[12, 12]} style={{ maxHeight: 600, overflowY: "auto" }}>
            {searchResults.map((card) => (
              <Col xs={24} sm={12} md={8} lg={6} key={card.id}>
                <Card
                  size="small"
                  cover={
                    card.image_uris?.small && (
                      <Image
                        src={card.image_uris.small}
                        alt={card.name}
                        style={{
                          height: 300,
                          width: "100%",
                          objectFit: "contain",
                          backgroundColor: "#f5f5f5",
                        }}
                        preview={{
                          src: card.image_uris.normal || card.image_uris.small,
                        }}
                      />
                    )
                  }
                  actions={[
                    <Button
                      key="add"
                      type="primary"
                      size="small"
                      onClick={() => addCardToDeck(card)}
                    >
                      Add to Deck
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={<div style={{ fontSize: "12px" }}>{card.name}</div>}
                    description={
                      <div style={{ fontSize: "10px" }}>
                        <div>{card.type_line}</div>
                        {card.mana_cost && (
                          <ManaCostDisplay
                            manaCost={card.mana_cost}
                            size="small"
                          />
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </CardSearchModal>
    </DeckBuilderContainer>
  );
};

export default DeckBuilder;
