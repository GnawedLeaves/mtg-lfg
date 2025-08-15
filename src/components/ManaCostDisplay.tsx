import React from "react";
import styled from "styled-components";

const ManaSymbol = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  text-align: center;
  line-height: 16px;
  font-size: 11px;
  font-weight: bold;
  margin: 0 1px;
  color: white;

  &.generic {
    background-color: #ccc;
    color: black;
  }

  &.white {
    background-color: #fffbd5;
    color: black;
    border: 1px solid #ddd;
  }

  &.blue {
    background-color: #0e68ab;
  }

  &.black {
    background-color: #150b00;
  }

  &.red {
    background-color: #d3202a;
  }

  &.green {
    background-color: #00733e;
  }

  &.colorless {
    background-color: #ccc;
    color: black;
  }
`;

interface ManaCostDisplayProps {
  manaCost: string;
  size?: "small" | "medium" | "large";
}

const ManaCostDisplay: React.FC<ManaCostDisplayProps> = ({
  manaCost,
  size = "medium",
}) => {
  if (!manaCost) return <span>-</span>;

  // Parse mana symbols from the mana cost string
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];

  // Adjust sizes based on the size prop
  const getSymbolStyle = () => {
    switch (size) {
      case "small":
        return {
          width: "14px",
          height: "14px",
          lineHeight: "14px",
          fontSize: "10px",
        };
      case "large":
        return {
          width: "20px",
          height: "20px",
          lineHeight: "20px",
          fontSize: "12px",
        };
      default: // medium
        return {
          width: "16px",
          height: "16px",
          lineHeight: "16px",
          fontSize: "11px",
        };
    }
  };

  const symbolStyle = getSymbolStyle();

  return (
    <span>
      {symbols.map((symbol, index) => {
        const content = symbol.slice(1, -1); // Remove { and }
        let className = "generic";
        let displayText = content;

        // Determine the symbol type and styling
        if (content === "W") {
          className = "white";
          displayText = "W";
        } else if (content === "U") {
          className = "blue";
          displayText = "U";
        } else if (content === "B") {
          className = "black";
          displayText = "B";
        } else if (content === "R") {
          className = "red";
          displayText = "R";
        } else if (content === "G") {
          className = "green";
          displayText = "G";
        } else if (content === "C") {
          className = "colorless";
          displayText = "C";
        } else if (/^\d+$/.test(content)) {
          className = "generic";
          displayText = content;
        } else {
          // Handle hybrid mana, X costs, etc.
          className = "generic";
          displayText = content;
        }

        return (
          <ManaSymbol key={index} className={className} style={symbolStyle}>
            {displayText}
          </ManaSymbol>
        );
      })}
      {symbols.length === 0 && <span>-</span>}
    </span>
  );
};

export default ManaCostDisplay;
