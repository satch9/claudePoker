import React from "react";

interface PlayerCardsProps {
  cards: string[]; // Ex: ['Ah', 'Ks']
  isCurrentUser: boolean;
  isFolded: boolean;
}

const getRank = (code: string) => code.slice(0, -1);
const getSuit = (code: string) => code.slice(-1);
const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case "h":
      return "♥";
    case "d":
      return "♦";
    case "c":
      return "♣";
    case "s":
      return "♠";
    default:
      return "?";
  }
};
const getSuitColor = (suit: string) =>
  suit === "h" || suit === "d" ? "text-red-500" : "text-black";

export const PlayerCards: React.FC<PlayerCardsProps> = ({
  cards,
  isCurrentUser,
  isFolded,
}) => {
  const showCards = isCurrentUser && cards.length > 0;

  return (
    <div className="flex space-x-1 justify-center">
      {[0, 1].map((index) => {
        const code = cards[index];
        const rank = code ? getRank(code) : "";
        const suit = code ? getSuit(code) : "";
        return (
          <div
            key={index}
            className={`relative w-14 h-16 mt-2 rounded border bg-white flex flex-col items-center justify-between p-1 shadow-md ${
              isFolded ? "opacity-30 grayscale" : ""
            }`}
          >
            {showCards && code ? (
              <>
                {/* Coin supérieur gauche */}
                <div
                  className={`text-xs font-bold self-start ${getSuitColor(suit)}`}
                >
                  {rank}
                  <span className="ml-0.5">{getSuitSymbol(suit)}</span>
                </div>
                {/* Centre */}
                <div className={`text-2xl font-bold ${getSuitColor(suit)}`}>
                  {getSuitSymbol(suit)}
                </div>
                {/* Coin inférieur droit */}
                <div
                  className={`text-xs font-bold self-end ${getSuitColor(suit)} rotate-180`}
                >
                  {rank}
                  <span className="ml-0.5">{getSuitSymbol(suit)}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-blue-900 border border-blue-700 rounded flex items-center justify-center">
                <div className="text-white text-xs transform rotate-45">♠</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
