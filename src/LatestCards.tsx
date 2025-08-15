import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Spin,
  Button,
  message,
  Modal,
  List,
  Pagination,
} from "antd";
import styled from "styled-components";
import CardFilters, { FilterState } from "./components/CardFilters";

const { Title } = Typography;

const LatestContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px;
  }
`;

const CardImage = styled.img`
  max-width: 150px;
  width: 100%;
  height: auto;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  @media (max-width: 768px) {
    max-width: 180px;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    max-width: 200px;
    margin-bottom: 6px;
  }

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
    padding: 16px;

    @media (max-width: 768px) {
      padding: 12px;
    }

    @media (max-width: 480px) {
      padding: 8px;
    }
  }

  .ant-card-head {
    @media (max-width: 480px) {
      padding: 8px 12px;
      min-height: 40px;
    }
  }

  .ant-card-head-title {
    @media (max-width: 480px) {
      font-size: 14px;
      line-height: 1.2;
    }
  }
`;

const CardText = styled.div`
  margin-top: auto;

  p {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.4;

    @media (max-width: 768px) {
      margin-bottom: 6px;
      font-size: 13px;
      line-height: 1.3;
    }

    @media (max-width: 480px) {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.2;
    }
  }

  strong {
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
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

const ControlsContainer = styled.div`
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
  released_at?: string;
}

const LatestCards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<MTGCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [totalCards, setTotalCards] = useState(0);

  const colorOptions = [
    { label: "⚪ White", value: "W" },
    { label: "🔵 Blue", value: "U" },
    { label: "⚫ Black", value: "B" },
    { label: "🔴 Red", value: "R" },
    { label: "🟢 Green", value: "G" },
    { label: "◇ Colorless", value: "C" },
  ];

  useEffect(() => {
    loadLatestCards();
  }, []);

  const loadLatestCards = async () => {
    setLoading(true);
    try {
      // Get cards from the last 6 months, sorted by release date
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateString = sixMonthsAgo.toISOString().split("T")[0];

      let allCards: MTGCard[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch multiple pages to get a good collection of recent cards
      while (hasMorePages && currentPage <= 10) {
        // Limit to 10 pages to avoid too many requests
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=date>=${dateString}&order=released&dir=desc&page=${currentPage}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch latest cards");
        }

        const data = await response.json();
        allCards = [...allCards, ...(data.data || [])];
        hasMorePages = data.has_more || false;
        currentPage++;

        // Add a small delay between requests
        if (hasMorePages && currentPage <= 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setCards(allCards);
      setTotalCards(allCards.length);
    } catch (error) {
      console.error("Error loading latest cards:", error);
    }
    setLoading(false);
  };

  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ url: src, name: alt });
    setModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleColorFilterChange = (checkedValues: string[]) => {
    setColorFilters(checkedValues);
    setCurrentPage(1); // Reset to first page when changing color filters
  };

  const handleRarityFilterChange = (value: string) => {
    setRarityFilter(value);
    setCurrentPage(1); // Reset to first page when changing rarity filter
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSortOption("date-desc");
    setColorFilters([]);
    setRarityFilter("all");
    setCurrentPage(1);
  };

  const getFilteredAndSortedCards = () => {
    let filteredCards = [...cards];

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
          // If colorless is selected and other colors too, card must be colorless AND have other colors (impossible)
          // If only colorless is selected, show colorless cards
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

    return filteredCards;
  };

  const filteredCards = getFilteredAndSortedCards();
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayCards = filteredCards.slice(startIndex, endIndex);

  if (loading) {
    return (
      <LatestContainer>
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", marginTop: 50 }}
        />
      </LatestContainer>
    );
  }

  return (
    <LatestContainer>
      <Title level={2}>Latest MTG Cards</Title>
      <p style={{ marginBottom: 24, color: "#666" }}>
        Discover the newest Magic: The Gathering cards released in the last 6
        months
      </p>

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
        totalCards={filteredCards.length}
        searchPlaceholder="Search latest cards..."
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
                  <strong>Set:</strong> {card.set_name}
                </p>
                <p>
                  <strong>Type:</strong> {card.type_line}
                </p>
                <p>
                  <strong>Mana Cost:</strong> {card.mana_cost}
                </p>
                <p>
                  <strong>Rarity:</strong> {card.rarity}
                </p>
                {card.released_at && (
                  <p>
                    <strong>Released:</strong>{" "}
                    {new Date(card.released_at).toLocaleDateString()}
                  </p>
                )}
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
        pageSize={pageSize}
        onChange={(page) => setCurrentPage(page)}
        onShowSizeChange={handlePageSizeChange}
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
    </LatestContainer>
  );
};

export default LatestCards;
