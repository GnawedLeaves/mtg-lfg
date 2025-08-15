import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  message,
  Spin,
  Empty,
  Input,
  Select,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  GlobalOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { DeckService } from "../services/deckService";
import { Deck } from "../lib/supabase";
import ManaCostDisplay from "../components/ManaCostDisplay";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const DecksContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const DeckCard = styled(Card)`
  width: 300px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .ant-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ant-card-actions {
    padding: 4px 8px;
  }

  .ant-card-actions > li {
    margin: 0 2px;
  }

  .ant-card-actions .ant-btn {
    font-size: 11px;
    padding: 2px 6px;
    height: auto;
  }
`;

const DeckHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const DeckTitle = styled(Title)`
  margin: 0 !important;
  font-size: 18px !important;
  line-height: 1.3 !important;
`;

const DeckStats = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const FilterContainer = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
`;

const ColorTags = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  margin: 8px 0;
`;

const DeckList: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    filterDecks();
  }, [decks, searchTerm, formatFilter, colorFilter, visibilityFilter]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const data = await DeckService.getAllDecks();
      setDecks(data);
    } catch (error) {
      console.error("Error loading decks:", error);
      message.error("Failed to load decks");
    } finally {
      setLoading(false);
    }
  };

  const filterDecks = () => {
    let filtered = decks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (deck) =>
          deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deck.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Format filter
    if (formatFilter !== "all") {
      filtered = filtered.filter((deck) => deck.format === formatFilter);
    }

    // Color filter
    if (colorFilter !== "all") {
      filtered = filtered.filter((deck) => deck.colors.includes(colorFilter));
    }

    // Visibility filter
    if (visibilityFilter !== "all") {
      const isPublic = visibilityFilter === "public";
      filtered = filtered.filter((deck) => deck.is_public === isPublic);
    }

    setFilteredDecks(filtered);
  };

  const handleDeleteDeck = async (deck: Deck) => {
    Modal.confirm({
      title: `Delete "${deck.name}"?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await DeckService.deleteDeck(deck.id);
          message.success("Deck deleted successfully");
          loadDecks();
        } catch (error) {
          console.error("Error deleting deck:", error);
          message.error("Failed to delete deck");
        }
      },
    });
  };

  const handleDuplicateDeck = async (deck: Deck) => {
    try {
      const newName = `${deck.name} (Copy)`;
      await DeckService.duplicateDeck(deck.id, newName);
      message.success("Deck duplicated successfully");
      loadDecks();
    } catch (error) {
      console.error("Error duplicating deck:", error);
      message.error("Failed to duplicate deck");
    }
  };

  const formatOptions = DeckService.getFormatOptions();
  const colorOptions = DeckService.getColorOptions();

  const getUniqueFormats = () => {
    const formatSet = new Set(decks.map((deck) => deck.format));
    const formats = Array.from(formatSet);
    return formats.sort();
  };

  const renderColorTags = (colors: string[]) => {
    if (!colors || colors.length === 0) {
      return <Tag>Colorless</Tag>;
    }

    return (
      <ColorTags>
        {colors.map((color) => (
          <ManaCostDisplay key={color} manaCost={`{${color}}`} size="small" />
        ))}
      </ColorTags>
    );
  };

  if (loading) {
    return (
      <DecksContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </DecksContainer>
    );
  }

  return (
    <DecksContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>My Deck Collection</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/decks/create")}
          size="large"
        >
          Create New Deck
        </Button>
      </div>

      <FilterContainer>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by format"
              value={formatFilter}
              onChange={setFormatFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Formats</Option>
              {getUniqueFormats().map((format) => (
                <Option key={format} value={format}>
                  {format}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by color"
              value={colorFilter}
              onChange={setColorFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Colors</Option>
              {colorOptions.map((color) => (
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
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by visibility"
              value={visibilityFilter}
              onChange={setVisibilityFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Decks</Option>
              <Option value="public">Public Decks</Option>
              <Option value="private">Private Decks</Option>
            </Select>
          </Col>
        </Row>
      </FilterContainer>

      {filteredDecks.length === 0 ? (
        <Empty
          description={
            decks.length === 0
              ? "No decks found. Create your first deck!"
              : "No decks match your filters"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {decks.length === 0 && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/decks/create")}
            >
              Create Your First Deck
            </Button>
          )}
        </Empty>
      ) : (
        <Row gutter={[16, 16]} align={"middle"}>
          {filteredDecks.map((deck) => (
            <Col xs={24} sm={12} md={8} lg={6} key={deck.id}>
              <DeckCard
                actions={[
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/decks/${deck.id}`)}
                    size="small"
                  >
                    View
                  </Button>,
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/decks/${deck.id}/edit`)}
                    size="small"
                  >
                    Edit
                  </Button>,
                  <Button
                    key="copy"
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleDuplicateDeck(deck)}
                    size="small"
                  >
                    Copy
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteDeck(deck)}
                    size="small"
                  >
                    Delete
                  </Button>,
                ]}
              >
                <DeckHeader>
                  <DeckTitle level={4}>{deck.name}</DeckTitle>
                  <Space>
                    {deck.is_public ? (
                      <GlobalOutlined
                        style={{ color: "#52c41a" }}
                        title="Public Deck"
                      />
                    ) : (
                      <LockOutlined
                        style={{ color: "#faad14" }}
                        title="Private Deck"
                      />
                    )}
                  </Space>
                </DeckHeader>

                {deck.description && (
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false }}
                    style={{ color: "#666", marginBottom: 12 }}
                  >
                    {deck.description}
                  </Paragraph>
                )}

                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Tag color="blue">{deck.format}</Tag>
                  </div>

                  <div>
                    <Text strong>Colors: </Text>
                    {renderColorTags(deck.colors)}
                  </div>
                </Space>

                <DeckStats>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Cards</Text>
                      <br />
                      <Text strong>{deck.total_cards}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Est. Price</Text>
                      <br />
                      <Text strong>
                        {deck.estimated_price
                          ? `$${deck.estimated_price.toFixed(2)}`
                          : "-"}
                      </Text>
                    </Col>
                  </Row>
                  <Divider style={{ margin: "8px 0" }} />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Updated {new Date(deck.updated_at).toLocaleDateString()}
                  </Text>
                </DeckStats>
              </DeckCard>
            </Col>
          ))}
        </Row>
      )}
    </DecksContainer>
  );
};

export default DeckList;
