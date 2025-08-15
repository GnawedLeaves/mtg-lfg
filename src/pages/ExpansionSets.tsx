import React, { useState, useEffect } from "react";
import {
  List,
  Spin,
  Typography,
  Tabs,
  Button,
  Modal,
  Space,
  Input,
  Pagination,
} from "antd";
import styled from "styled-components";
import CardFilters, { FilterState } from "../components/CardFilters";
import CardDisplay, { MTGCard } from "../components/CardDisplay";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const ExpansionContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px;
  }
`;

const SetContainer = styled.div`
  margin-bottom: 16px;
`;

const SetControlsContainer = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #d9d9d9;

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    margin-bottom: 8px;
    padding: 6px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-content-holder {
    padding: 8px 0;
  }

  .ant-tabs-tabpane {
    padding: 0;
  }
`;

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
  const [rarityFilters, setRarityFilters] = useState<{
    [key: string]: string;
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

  const handleRarityFilterChange = (setCode: string, value: string) => {
    setRarityFilters((prev) => ({
      ...prev,
      [setCode]: value,
    }));
    // Reset to first page when changing rarity filter
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

    // Reset rarity filters
    setRarityFilters((prev) => ({
      ...prev,
      [setCode]: "all",
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
    const selectedRarity = rarityFilters[setCode] || "all";

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
          // If colorless is selected and other colors too, card must be colorless AND have other colors (impossible)
          // If only colorless is selected, show colorless cards
          return selectedColors.length === 1;
        }

        // For colored cards, check if ALL selected colors are in the mana cost (AND logic)
        if (card.mana_cost) {
          const nonColorlessFilters = selectedColors.filter(
            (color) => color !== "C"
          );
          if (nonColorlessFilters.length > 0) {
            return nonColorlessFilters.every((color) => {
              const manaSymbol = color === "U" ? "U" : color;
              return (
                card.mana_cost!.includes(`{${manaSymbol}}`) ||
                card.mana_cost!.includes(manaSymbol)
              );
            });
          }
        }

        return false;
      });
    }

    // Filter cards based on rarity selection
    if (selectedRarity && selectedRarity !== "all") {
      cards = cards.filter(
        (card) => card.rarity?.toLowerCase() === selectedRarity.toLowerCase()
      );
    }

    // Sort cards
    cards.sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-desc":
          return (b.released_at || "").localeCompare(a.released_at || "");
        case "date-asc":
          return (a.released_at || "").localeCompare(b.released_at || "");
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
        <CardFilters
          filters={{
            searchTerm: setSearchTerms[setCode] || "",
            sortOption: sortOptions[setCode] || "name",
            colorFilters: colorFilters[setCode] || [],
            rarityFilter: rarityFilters[setCode] || "all",
            currentPage: currentPage,
            pageSize: cardsPerPage,
          }}
          onSearchChange={(value) => handleSetSearch(setCode, value)}
          onSortChange={(value) => handleSortChange(setCode, value)}
          onColorFilterChange={(checkedValues) =>
            handleColorFilterChange(setCode, checkedValues)
          }
          onRarityFilterChange={(value) =>
            handleRarityFilterChange(setCode, value)
          }
          onPageChange={(page: number) =>
            setCurrentPages((prev) => ({
              ...prev,
              [setCode]: page,
            }))
          }
          onPageSizeChange={(current: number, size: number) =>
            handlePageSizeChange(setCode, current, size)
          }
          onResetFilters={() => handleResetFilters(setCode)}
          totalCards={filteredCards.length}
          searchPlaceholder="Search cards in this set..."
          sortOptions={[
            { value: "name", label: "Name (A-Z)" },
            { value: "name-desc", label: "Name (Z-A)" },
            { value: "date-desc", label: "Release Date (Newest First)" },
            { value: "date-asc", label: "Release Date (Oldest First)" },
            { value: "rarity", label: "Rarity (Common to Mythic)" },
            { value: "rarity-desc", label: "Rarity (Mythic to Common)" },
            { value: "price-high", label: "Price (High to Low)" },
            { value: "price-low", label: "Price (Low to High)" },
            { value: "type", label: "Type" },
          ]}
        />

        <List
          grid={{
            gutter: [8, 12],
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
              <CardDisplay
                card={card}
                onImageClick={handleImageClick}
                showSet={false}
                showReleaseDate={false}
              />
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
          responsive={true}
          showQuickJumper={false}
          style={{
            marginTop: 16,
            textAlign: "center",
            padding: "0 8px",
          }}
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
          style={{
            width: "100%",
            maxWidth: 300,
            marginBottom: 16,
          }}
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
