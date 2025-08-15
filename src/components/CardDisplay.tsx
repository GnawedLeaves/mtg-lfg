import React, { useState } from "react";
import { Card, Button } from "antd";
import styled from "styled-components";
import ManaCostDisplay from "./ManaCostDisplay";

const CardImage = styled.img`
  max-width: 300px;
  width: 100%;
  height: auto;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  @media (max-width: 768px) {
    max-width: 220px;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    max-width: 300px;
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
    align-items: center;
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
    margin-bottom: 4px;
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

export interface MTGCard {
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

interface CardDisplayProps {
  card: MTGCard;
  onImageClick: (src: string, alt: string) => void;
  showSet?: boolean;
  showReleaseDate?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onImageClick,
  showSet = true,
  showReleaseDate = false,
}) => {
  return (
    <StyledCard title={card.name} size="small">
      {card.image_uris?.normal && (
        <CardImage
          src={card.image_uris.normal}
          alt={card.name}
          onClick={() => onImageClick(card.image_uris!.normal!, card.name)}
        />
      )}
      <CardText>
        {showSet && card.set_name && (
          <p>
            <strong>Set:</strong> {card.set_name}
          </p>
        )}
        {/* <p>
          <strong>Type:</strong> {card.type_line}
        </p> */}
        {/* <p>
          <strong>Mana Cost:</strong>{" "}
          <ManaCostDisplay manaCost={card.mana_cost || ""} />
        </p> */}
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        {showReleaseDate && card.released_at && (
          <p>
            <strong>Released:</strong>{" "}
            {new Date(card.released_at).toLocaleDateString()}
          </p>
        )}
        {/* {card.oracle_text && (
          <p>
            <strong>Text:</strong>{" "}
            <ExpandableText text={card.oracle_text} maxLength={80} />
          </p>
        )} */}
        {card.prices && (card.prices.usd || card.prices.eur) && (
          <p>
            <strong>Price:</strong> {card.prices.usd && `$${card.prices.usd}`}
            {card.prices.usd && card.prices.eur && " / "}
            {card.prices.eur && `€${card.prices.eur}`}
          </p>
        )}
      </CardText>
    </StyledCard>
  );
};

export default CardDisplay;
