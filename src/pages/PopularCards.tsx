import React, { useState, useEffect, useCallback } from "react";
import { List, Spin, Typography, Tabs, Modal } from "antd";
import styled from "styled-components";
import CardFilters, { FilterState } from "../components/CardFilters";
import CardDisplay, { MTGCard } from "../components/CardDisplay";

const { Title } = Typography;
const { TabPane } = Tabs;

const PopularContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px;
  }
`;

const PopularCards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [planeswalkers, setPlaneswalkers] = useState<MTGCard[]>([]);
  const [lotrCards, setLotrCards] = useState<MTGCard[]>([]);
  const [legendaryCreatures, setLegendaryCreatures] = useState<MTGCard[]>([]);
  const [activeTab, setActiveTab] = useState("planeswalkers");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Filter handlers
  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ url: src, name: alt });
    setModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleColorFilterChange = (checkedValues: string[]) => {
    setColorFilters(checkedValues);
    setCurrentPage(1);
  };

  const handleRarityFilterChange = (value: string) => {
    setRarityFilter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSortOption("name");
    setColorFilters([]);
    setRarityFilter("all");
    setCurrentPage(1);
  };

  const fetchCards = async (query: string): Promise<MTGCard[]> => {
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching cards for query: ${query}`, error);
      return [];
    }
  };

  const loadPopularCards = useCallback(async () => {
    setLoading(true);
    try {
      // Load popular planeswalkers (more cards for better filtering)
      const planeswalkerCards = await fetchCards("type:planeswalker");
      setPlaneswalkers(planeswalkerCards.slice(0, 50));

      // Load Lord of the Rings cards (LTR set)
      const lotrSet = await fetchCards("set:ltr");
      setLotrCards(lotrSet.slice(0, 100));

      // Load legendary creatures (more cards for better filtering)
      const legendary = await fetchCards("type:legendary type:creature");
      setLegendaryCreatures(legendary.slice(0, 50));
    } catch (error) {
      console.error("Error loading popular cards:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPopularCards();
  }, [loadPopularCards]);

  // Get current active cards based on selected tab
  const getCurrentCards = (): MTGCard[] => {
    switch (activeTab) {
      case "planeswalkers":
        return planeswalkers;
      case "lotr":
        return lotrCards;
      case "legendary":
        return legendaryCreatures;
      default:
        return planeswalkers;
    }
  };

  // Filter and sort current cards
  const getFilteredAndSortedCards = () => {
    let filteredCards = [...getCurrentCards()];

    // Filter by search term
    if (searchTerm) {
      filteredCards = filteredCards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.oracle_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.set_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by color
    if (colorFilters.length > 0) {
      filteredCards = filteredCards.filter((card) => {
        // Handle colorless cards
        if (
          colorFilters.includes("C") &&
          (!card.mana_cost || card.mana_cost === "")
        ) {
          return colorFilters.length === 1;
        }

        // For colored cards, check if ALL selected colors are in the mana cost (AND logic)
        if (card.mana_cost) {
          const nonColorlessFilters = colorFilters.filter(
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

    // Filter by rarity
    if (rarityFilter && rarityFilter !== "all") {
      filteredCards = filteredCards.filter(
        (card) => card.rarity?.toLowerCase() === rarityFilter.toLowerCase()
      );
    }

    // Sort cards
    filteredCards.sort((a, b) => {
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

    return filteredCards;
  };

  const renderCardList = (cards: MTGCard[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayCards = cards.slice(startIndex, endIndex);

    return (
      <>
        <CardFilters
          filters={{
            searchTerm,
            sortOption,
            colorFilters,
            rarityFilter,
            currentPage,
            pageSize,
          }}
          onSearchChange={handleSearch}
          onSortChange={handleSortChange}
          onColorFilterChange={handleColorFilterChange}
          onRarityFilterChange={handleRarityFilterChange}
          onPageChange={(page: number) => setCurrentPage(page)}
          onPageSizeChange={handlePageSizeChange}
          onResetFilters={handleResetFilters}
          totalCards={cards.length}
          searchPlaceholder={`Search ${activeTab}...`}
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
                showSet={true}
                showReleaseDate={false}
              />
            </List.Item>
          )}
        />
      </>
    );
  };

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

  const filteredCards = getFilteredAndSortedCards();

  return (
    <PopularContainer>
      <Title level={2}>Popular MTG Cards</Title>
      <Tabs
        defaultActiveKey="planeswalkers"
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1); // Reset page when switching tabs
          handleResetFilters(); // Reset filters when switching tabs
        }}
      >
        <TabPane tab="Planeswalkers" key="planeswalkers">
          <Title level={3}>
            Popular Planeswalkers ({planeswalkers.length} cards)
          </Title>
          {renderCardList(filteredCards)}
        </TabPane>

        <TabPane tab="Lord of the Rings" key="lotr">
          <Title level={3}>
            Lord of the Rings Cards ({lotrCards.length} cards)
          </Title>
          {renderCardList(filteredCards)}
        </TabPane>

        <TabPane tab="Legendary Creatures" key="legendary">
          <Title level={3}>
            Legendary Creatures ({legendaryCreatures.length} cards)
          </Title>
          {renderCardList(filteredCards)}
        </TabPane>
      </Tabs>

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
    </PopularContainer>
  );
};

export default PopularCards;
