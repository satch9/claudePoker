import React from "react";
import { formatChips } from "../../utils/gameUtils";
import { SidePot } from "../../types/game";

interface PotDisplayProps {
  pot: number;
  sidePots: SidePot[];
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pot, sidePots }) => {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-full shadow-lg text-lg">
        Pot principal : {formatChips(pot)}
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex flex-col items-center space-y-1 mt-1">
          {sidePots.map((sidePot, idx) => (
            <div
              key={idx}
              className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm shadow"
            >
              Side pot {idx + 1} : {formatChips(sidePot.amount)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
