import React from "react";

interface CommunityCardsProps {
  cards: string[]; // Ex: ['Ah', 'Ks', ...]
  round: string;
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

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  round,
}) => {
  const getVisibleCards = () => {
    switch (round) {
      case "preflop":
        return 0;
      case "flop":
        return 3;
      case "turn":
        return 4;
      case "river":
        return 5;
      default:
        return 0;
    }
  };

  const visibleCount = getVisibleCards();

  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex space-x-2">
        {Array.from({ length: 5 }).map((_, index) => {
          const isVisible = index < visibleCount;
          const code = cards[index];
          const rank = code ? getRank(code) : "";
          const suit = code ? getSuit(code) : "";
          return (
            <div
              key={index}
              className={`w-16 h-24 rounded-lg border-2 flex flex-col justify-between p-1 transition-all duration-500 bg-white shadow-lg ${
                isVisible && code
                  ? "scale-100"
                  : "bg-blue-800 border-blue-900 shadow-md"
              }`}
            >
              {isVisible && code ? (
                <>
                  {/* Coin supérieur gauche */}
                  <div
                    className={`text-xs font-bold self-start ${getSuitColor(suit)}`}
                  >
                    {rank}
                    <span className="ml-0.5">{getSuitSymbol(suit)}</span>
                  </div>
                  {/* Centre */}
                  <div className={`text-center text-2xl ${getSuitColor(suit)}`}>
                    {getSuitSymbol(suit)}
                  </div>
                  {/* Coin inférieur droit (inversé) */}
                  <div
                    className={`text-xs font-bold self-end ${getSuitColor(suit)} rotate-180`}
                  >
                    {rank}
                    <span className="ml-0.5">{getSuitSymbol(suit)}</span>
                  </div>
                </>
              ) : (
                /* Dos de carte */
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
