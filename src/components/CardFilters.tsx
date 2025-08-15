import React from "react";
import {
  Input,
  Select,
  Pagination,
  Button,
  Checkbox,
  Radio,
  Row,
  Col,
} from "antd";
import styled from "styled-components";

const { Search } = Input;
const { Option } = Select;
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;

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

export interface FilterState {
  searchTerm: string;
  sortOption: string;
  colorFilters: string[];
  rarityFilter: string;
  currentPage: number;
  pageSize: number;
}

interface CardFiltersProps {
  filters: FilterState;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onColorFilterChange: (values: string[]) => void;
  onRarityFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (current: number, size: number) => void;
  onResetFilters: () => void;
  totalCards: number;
  showTopPagination?: boolean;
  sortOptions?: Array<{ value: string; label: string }>;
  searchPlaceholder?: string;
}

const CardFilters: React.FC<CardFiltersProps> = ({
  filters,
  onSearchChange,
  onSortChange,
  onColorFilterChange,
  onRarityFilterChange,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  totalCards,
  showTopPagination = true,
  sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "date-desc", label: "Release Date (Newest First)" },
    { value: "date-asc", label: "Release Date (Oldest First)" },
    { value: "rarity", label: "Rarity (Common to Mythic)" },
    { value: "rarity-desc", label: "Rarity (Mythic to Common)" },
    { value: "price-high", label: "Price (High to Low)" },
    { value: "price-low", label: "Price (Low to High)" },
    { value: "type", label: "Type" },
  ],
  searchPlaceholder = "Search cards...",
}) => {
  const colorOptions = [
    { label: "⚪ White", value: "W" },
    { label: "🔵 Blue", value: "U" },
    { label: "⚫ Black", value: "B" },
    { label: "🔴 Red", value: "R" },
    { label: "🟢 Green", value: "G" },
    { label: "◇ Colorless", value: "C" },
  ];

  const rarityOptions = [
    { label: "All Rarities", value: "all" },
    { label: "Common", value: "common" },
    { label: "Uncommon", value: "uncommon" },
    { label: "Rare", value: "rare" },
    { label: "Mythic", value: "mythic" },
  ];

  const startIndex = (filters.currentPage - 1) * filters.pageSize + 1;
  const endIndex = Math.min(filters.currentPage * filters.pageSize, totalCards);

  return (
    <ControlsContainer>
      {/* First Row: Search, Sort, and optional Top Pagination */}
      <Row gutter={[16, 8]} align="middle" style={{ marginBottom: 12 }}>
        <Col xs={24} sm={24} md={showTopPagination ? 8 : 12}>
          <Search
            placeholder={searchPlaceholder}
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="middle"
          />
        </Col>
        <Col xs={24} sm={12} md={showTopPagination ? 8 : 12}>
          <Select
            placeholder="Sort by"
            value={filters.sortOption}
            onChange={onSortChange}
            style={{ width: "100%" }}
            size="middle"
          >
            {sortOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        {showTopPagination && (
          <Col xs={24} sm={12} md={8}>
            <Pagination
              current={filters.currentPage}
              total={totalCards}
              pageSize={filters.pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} cards`
              }
              size="small"
              showSizeChanger={true}
              pageSizeOptions={["10", "20", "50", "100"]}
              responsive={true}
              showQuickJumper={false}
            />
          </Col>
        )}
      </Row>

      {/* Second Row: Color Filters */}
      <Row gutter={[16, 8]} align="middle" style={{ marginBottom: 12 }}>
        <Col xs={24} sm={18} md={18}>
          <div style={{ marginBottom: 8 }}>
            <strong>Filter by Colors (must contain ALL selected):</strong>
          </div>
          <CheckboxGroup
            options={colorOptions}
            value={filters.colorFilters}
            onChange={onColorFilterChange}
          />
        </Col>
        <Col xs={24} sm={6} md={6}>
          <Button
            type="default"
            onClick={onResetFilters}
            style={{ width: "100%" }}
            size="middle"
          >
            Reset All Filters
          </Button>
        </Col>
      </Row>

      {/* Third Row: Rarity Filter */}
      <Row gutter={[16, 8]} align="middle">
        <Col xs={24}>
          <div style={{ marginBottom: 8 }}>
            <strong>Filter by Rarity:</strong>
          </div>
          <RadioGroup
            options={rarityOptions}
            value={filters.rarityFilter}
            onChange={(e) => onRarityFilterChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </Col>
      </Row>
    </ControlsContainer>
  );
};

export default CardFilters;
