import React from "react";
import { useHandHistory } from "../../hooks/useHandHistory";

const HandHistory: React.FC<{ gameId: string }> = ({ gameId }) => {
  const hands = useHandHistory(gameId as any);

  return (
    <div className="h-full bg-black/80 rounded-b-xl p-2 text-xs overflow-y-auto">
      {hands.length === 0 ? (
        <div className="text-gray-400">Aucune main jouée pour l’instant.</div>
      ) : (
        <ul className="space-y-1">
          {hands.map((hand: any) => (
            <li key={hand._id} className="border-b border-gray-700 pb-1">
              <div className="font-semibold text-gray-200">
                Main #{hand.handNumber} - Pot: {hand.potAmount}
              </div>
              <div className="text-xs text-gray-400">
                {hand.communityCards.join(" ")}
              </div>
              <div className="text-xs text-gray-300">
                Gagnant(s): {hand.winners.map((w: any) => w.userId).join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HandHistory;
