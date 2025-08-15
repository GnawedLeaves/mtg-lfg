import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Spin,
  Typography,
  Tabs,
  Button,
  Input,
  Pagination,
  Modal,
  Select,
  Row,
  Col,
  Space,
  Checkbox,
} from "antd";
import styled from "styled-components";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { Group: CheckboxGroup } = Checkbox;

const ExpansionContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 12px;
`;

const CardImage = styled.img`
  max-width: 150px;
  height: auto;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const StyledCard = styled(Card)`
  height: 100%;

  .ant-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const CardText = styled.div`
  margin-top: auto;
`;

const ExpandableText: React.FC<{ text: string; maxLength?: number }> = ({
  text,
  maxLength = 80,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : `${text.substring(0, maxLength)}...`}
      <Button
        type="link"
        size="small"
        onClick={() => setExpanded(!expanded)}
        style={{ padding: 0, marginLeft: 4 }}
      >
        {expanded ? "Show less" : "See more"}
      </Button>
    </span>
  );
};

const SetContainer = styled.div`
  margin-bottom: 16px;
`;

const SetControlsContainer = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-content-holder {
    padding: 8px 0;
  }

  .ant-tabs-tabpane {
    padding: 0;
  }
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

interface SetData {
  cards: MTGCard[];
  totalCards: number;
  hasMore: boolean;
  nextPage?: string;
}

const ExpansionSets: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    [key: string]: { loaded: number; total: number };
  }>({});
  const [sets, setSets] = useState<MTGSet[]>([]);
  const [selectedCards, setSelectedCards] = useState<{
    [key: string]: SetData;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPages, setCurrentPages] = useState<{
    [key: string]: number;
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [setSearchTerms, setSetSearchTerms] = useState<{
    [key: string]: string;
  }>({});
  const [sortOptions, setSortOptions] = useState<{
    [key: string]: string;
  }>({});
  const [pageSizes, setPageSizes] = useState<{
    [key: string]: number;
  }>({});
  const [colorFilters, setColorFilters] = useState<{
    [key: string]: string[];
  }>({});

  const colorOptions = [
    { label: "⚪ White", value: "W" },
    { label: "🔵 Blue", value: "U" },
    { label: "⚫ Black", value: "B" },
    { label: "🔴 Red", value: "R" },
    { label: "🟢 Green", value: "G" },
    { label: "◇ Colorless", value: "C" },
  ];

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
    // Auto-load the first set (Lord of the Rings)
    loadCardsFromSet("ltr", 1);
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

  const loadCardsFromSet = async (setCode: string, page: number = 1) => {
    setCardLoading(true);
    setLoadingProgress((prev) => ({
      ...prev,
      [setCode]: { loaded: 0, total: 0 },
    }));

    try {
      let allCards: MTGCard[] = [];
      let currentPage = page;
      let hasMorePages = true;
      let totalCards = 0;

      // Fetch all pages of cards for this set
      while (hasMorePages) {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=set:${setCode}&page=${currentPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }
        const data = await response.json();

        // Add cards from this page to our collection
        allCards = [...allCards, ...(data.data || [])];
        totalCards = data.total_cards || 0;
        hasMorePages = data.has_more || false;

        // Update loading progress
        setLoadingProgress((prev) => ({
          ...prev,
          [setCode]: { loaded: allCards.length, total: totalCards },
        }));

        currentPage++;

        // Add a small delay between requests to be respectful to the API
        if (hasMorePages) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const setData: SetData = {
        cards: allCards,
        totalCards: totalCards,
        hasMore: false, // We've loaded everything
        nextPage: undefined,
      };

      // Always replace data since we're loading all cards
      setSelectedCards((prev) => ({
        ...prev,
        [setCode]: setData,
      }));

      setCurrentPages((prev) => ({
        ...prev,
        [setCode]: 1, // Reset to first page for display
      }));
    } catch (error) {
      console.error(`Error loading cards from set ${setCode}:`, error);
    }
    setCardLoading(false);
  };

  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ url: src, name: alt });
    setModalVisible(true);
  };

  const handleSetSearch = (setCode: string, value: string) => {
    setSetSearchTerms((prev) => ({
      ...prev,
      [setCode]: value,
    }));
    // Reset to first page when searching
    setCurrentPages((prev) => ({
      ...prev,
      [setCode]: 1,
    }));
  };

  const handleSortChange = (setCode: string, value: string) => {
    setSortOptions((prev) => ({
      ...prev,
      [setCode]: value,
    }));
  };

  const handlePageSizeChange = (
    setCode: string,
    current: number,
    size: number
  ) => {
    setPageSizes((prev) => ({
      ...prev,
      [setCode]: size,
    }));
    // Reset to first page when changing page size
    setCurrentPages((prev) => ({
      ...prev,
      [setCode]: 1,
    }));
  };

  const handlePageChange = (setCode: string, page: number) => {
    // Since we load all cards upfront, we just need to update the current page
    setCurrentPages((prev) => ({
      ...prev,
      [setCode]: page,
    }));
  };

  const handleColorFilterChange = (
    setCode: string,
    checkedValues: string[]
  ) => {
    setColorFilters((prev) => ({
      ...prev,
      [setCode]: checkedValues,
    }));
    // Reset to first page when changing color filters
    setCurrentPages((prev) => ({
      ...prev,
      [setCode]: 1,
    }));
  };

  const handleResetFilters = (setCode: string) => {
    // Reset search term
    setSetSearchTerms((prev) => ({
      ...prev,
      [setCode]: "",
    }));

    // Reset sort option to default
    setSortOptions((prev) => ({
      ...prev,
      [setCode]: "name",
    }));

    // Reset color filters
    setColorFilters((prev) => ({
      ...prev,
      [setCode]: [],
    }));

    // Reset to first page
    setCurrentPages((prev) => ({
      ...prev,
      [setCode]: 1,
    }));
  };

  const getFilteredAndSortedCards = (setCode: string) => {
    const setData = selectedCards[setCode];
    if (!setData) return [];

    let cards = [...setData.cards];
    const searchTerm = setSearchTerms[setCode] || "";
    const sortOption = sortOptions[setCode] || "name";
    const selectedColors = colorFilters[setCode] || [];

    // Filter cards based on search term
    if (searchTerm) {
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.oracle_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter cards based on color selection
    if (selectedColors.length > 0) {
      cards = cards.filter((card) => {
        // Handle colorless cards
        if (
          selectedColors.includes("C") &&
          (!card.mana_cost || card.mana_cost === "")
        ) {
          return true;
        }

        // For colored cards, check if any selected color is in the mana cost
        if (card.mana_cost && selectedColors.some((color) => color !== "C")) {
          return selectedColors.some((color) => {
            if (color === "C") return false; // Skip colorless in this check
            // Convert U back to U for blue, keep others as is
            const manaSymbol = color === "U" ? "U" : color;
            return (
              card.mana_cost!.includes(`{${manaSymbol}}`) ||
              card.mana_cost!.includes(manaSymbol)
            );
          });
        }

        return false;
      });
    }

    // Sort cards
    cards.sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rarity":
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, mythic: 4 };
          return (
            (rarityOrder[a.rarity?.toLowerCase() as keyof typeof rarityOrder] ||
              0) -
            (rarityOrder[b.rarity?.toLowerCase() as keyof typeof rarityOrder] ||
              0)
          );
        case "rarity-desc":
          const rarityOrderDesc = {
            common: 1,
            uncommon: 2,
            rare: 3,
            mythic: 4,
          };
          return (
            (rarityOrderDesc[
              b.rarity?.toLowerCase() as keyof typeof rarityOrderDesc
            ] || 0) -
            (rarityOrderDesc[
              a.rarity?.toLowerCase() as keyof typeof rarityOrderDesc
            ] || 0)
          );
        case "price-high":
          const priceA = parseFloat(a.prices?.usd || "0");
          const priceB = parseFloat(b.prices?.usd || "0");
          return priceB - priceA;
        case "price-low":
          const priceA2 = parseFloat(a.prices?.usd || "0");
          const priceB2 = parseFloat(b.prices?.usd || "0");
          return priceA2 - priceB2;
        case "type":
          return (a.type_line || "").localeCompare(b.type_line || "");
        default:
          return 0;
      }
    });

    return cards;
  };

  const filteredSets = sets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCardList = (setCode: string) => {
    const setData = selectedCards[setCode];
    if (!setData) return null;

    const filteredCards = getFilteredAndSortedCards(setCode);
    const cardsPerPage = pageSizes[setCode] || 20; // Default to 20 instead of 100
    const currentPage = currentPages[setCode] || 1;
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const displayCards = filteredCards.slice(startIndex, endIndex);

    return (
      <>
        <SetControlsContainer>
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search cards in this set..."
                value={setSearchTerms[setCode] || ""}
                onChange={(e) => handleSetSearch(setCode, e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Sort by"
                value={sortOptions[setCode] || "name"}
                onChange={(value) => handleSortChange(setCode, value)}
                style={{ width: "100%" }}
              >
                <Option value="name">Name (A-Z)</Option>
                <Option value="name-desc">Name (Z-A)</Option>
                <Option value="rarity">Rarity (Common to Mythic)</Option>
                <Option value="rarity-desc">Rarity (Mythic to Common)</Option>
                <Option value="price-high">Price (High to Low)</Option>
                <Option value="price-low">Price (Low to High)</Option>
                <Option value="type">Type</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={10}>
              <Pagination
                current={currentPage}
                total={filteredCards.length}
                pageSize={cardsPerPage}
                onChange={(page) =>
                  setCurrentPages((prev) => ({
                    ...prev,
                    [setCode]: page,
                  }))
                }
                onShowSizeChange={(current, size) =>
                  handlePageSizeChange(setCode, current, size)
                }
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} cards`
                }
                size="small"
                showSizeChanger={true}
                pageSizeOptions={["10", "20", "50", "100"]}
              />
            </Col>
          </Row>
          <Row gutter={16} align="middle">
            <Col xs={24} md={18}>
              <div style={{ marginBottom: 8 }}>
                <strong>Filter by Colors:</strong>
              </div>
              <CheckboxGroup
                options={colorOptions}
                value={colorFilters[setCode] || []}
                onChange={(checkedValues) =>
                  handleColorFilterChange(setCode, checkedValues as string[])
                }
              />
            </Col>
            <Col xs={24} md={6}>
              <Button
                type="default"
                onClick={() => handleResetFilters(setCode)}
                style={{ width: "100%" }}
              >
                Reset All Filters
              </Button>
            </Col>
          </Row>
        </SetControlsContainer>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            xxl: 6,
          }}
          dataSource={displayCards}
          renderItem={(card) => (
            <List.Item>
              <StyledCard title={card.name} size="small">
                {card.image_uris?.normal && (
                  <CardImage
                    src={card.image_uris.normal}
                    alt={card.name}
                    onClick={() =>
                      handleImageClick(card.image_uris!.normal!, card.name)
                    }
                  />
                )}
                <CardText>
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
                      <strong>Text:</strong>{" "}
                      <ExpandableText text={card.oracle_text} maxLength={80} />
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
                </CardText>
              </StyledCard>
            </List.Item>
          )}
        />

        <Pagination
          current={currentPage}
          total={filteredCards.length}
          pageSize={cardsPerPage}
          onChange={(page) =>
            setCurrentPages((prev) => ({
              ...prev,
              [setCode]: page,
            }))
          }
          onShowSizeChange={(current, size) =>
            handlePageSizeChange(setCode, current, size)
          }
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} cards`
          }
          showSizeChanger={true}
          pageSizeOptions={["10", "20", "50", "100"]}
          style={{ marginTop: 24, textAlign: "center" }}
        />
      </>
    );
  };

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

      <StyledTabs
        defaultActiveKey="ltr"
        onChange={(key) => {
          if (!selectedCards[key]) {
            loadCardsFromSet(key, 1);
          }
        }}
      >
        {filteredSets.map((set) => (
          <TabPane tab={set.name} key={set.code}>
            <Title level={3}>
              {set.name} ({set.code.toUpperCase()})
            </Title>

            {!selectedCards[set.code] && (
              <Button
                type="primary"
                onClick={() => loadCardsFromSet(set.code, 1)}
                loading={cardLoading}
                style={{ marginBottom: 16 }}
              >
                Load Cards from {set.name}
              </Button>
            )}

            {cardLoading && !selectedCards[set.code] && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Spin size="large" />
                {loadingProgress[set.code] && (
                  <div style={{ marginTop: 8 }}>
                    Loading cards: {loadingProgress[set.code].loaded} /{" "}
                    {loadingProgress[set.code].total}
                  </div>
                )}
              </div>
            )}

            {selectedCards[set.code] && renderCardList(set.code)}
          </TabPane>
        ))}
      </StyledTabs>

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
    </ExpansionContainer>
  );
};

export default ExpansionSets;
