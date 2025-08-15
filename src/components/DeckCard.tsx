import React from "react";
import { Image, Tag, Button, InputNumber, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { DeckCard as DeckCardType } from "../lib/supabase";
import ManaCostDisplay from "./ManaCostDisplay";

// Row variant for DeckBuilder (horizontal layout with controls)
const DeckCardRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fafafa;
    border-color: #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

// Grid variant for DeckView (vertical layout for card gallery)
const DeckCardItem = styled.div<{ clickable?: boolean }>`
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};

  &:hover {
    ${(props) =>
      props.clickable &&
      `
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      transform: translateY(-2px);
    `}
  }
`;

const CardImageContainer = styled.div<{ variant: "row" | "grid" }>`
  ${(props) =>
    props.variant === "row"
      ? `
    width: 100px;
    height: 140px;
    margin-right: 16px;
    flex-shrink: 0;
  `
      : `
    width: 100%;
    margin-bottom: 8px;
  `}
`;

const CardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const CardType = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const CardControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;

const PriceText = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
`;

interface DeckCardProps {
  card: DeckCardType;
  variant?: "row" | "grid";
  showQuantityControls?: boolean;
  showDeleteButton?: boolean;
  onClick?: (card: DeckCardType) => void;
  onQuantityChange?: (cardId: string, quantity: number) => void;
  onDelete?: (cardId: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  card,
  variant = "row",
  showQuantityControls = false,
  showDeleteButton = false,
  onClick,
  onQuantityChange,
  onDelete,
}) => {
  const handleQuantityChange = (value: number | null) => {
    if (onQuantityChange && value) {
      onQuantityChange(card.id, value);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(card.id);
    }
  };

  const cardContent = (
    <>
      <CardImageContainer variant={variant}>
        {card.image_url && (
          <Image
            src={card.image_url}
            alt={card.card_name}
            width="100%"
            height={variant === "row" ? 140 : "100%"}
            style={{
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #f0f0f0",
            }}
            preview={variant === "row"}
          />
        )}
      </CardImageContainer>

      <CardContent>
        <CardTitle>
          {variant === "grid" && card.quantity > 1 && `${card.quantity}x `}
          {card.card_name}
        </CardTitle>

        <CardType>{card.card_type}</CardType>

        {card.mana_cost && (
          <div style={{ marginBottom: 8 }}>
            <ManaCostDisplay manaCost={card.mana_cost} size="small" />
          </div>
        )}

        {card.rarity && (
          <Tag style={{ fontSize: "11px", marginBottom: 4 }}>{card.rarity}</Tag>
        )}

        {card.price_usd && (
          <PriceText>
            ${(card.price_usd * card.quantity).toFixed(2)}
            {card.quantity > 1 && ` (${card.price_usd.toFixed(2)} each)`}
          </PriceText>
        )}
      </CardContent>

      {variant === "row" && (showQuantityControls || showDeleteButton) && (
        <CardControls>
          {showQuantityControls && (
            <InputNumber
              min={1}
              max={99}
              value={card.quantity}
              onChange={handleQuantityChange}
              style={{ width: 70 }}
            />
          )}

          {showDeleteButton && (
            <Popconfirm
              title="Remove this card from deck?"
              onConfirm={handleDelete}
              okText="Remove"
              cancelText="Cancel"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          )}
        </CardControls>
      )}
    </>
  );

  if (variant === "grid") {
    return (
      <DeckCardItem clickable={!!onClick} onClick={() => onClick?.(card)}>
        {cardContent}
      </DeckCardItem>
    );
  }

  return <DeckCardRow>{cardContent}</DeckCardRow>;
};

export default DeckCard;
