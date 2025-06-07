import React, { useState } from "react";
import GameChat from "../chat/GameChat";
import HandHistory from "./HandHistory";
import { Id } from "../../../convex/_generated/dataModel";
import { Player } from "../../types/game";

const BottomTabs: React.FC<{ gameId: Id<"games">; players: Player[] }> = ({
  gameId,
  players,
}) => {
  const [tab, setTab] = useState<"chat" | "history">("chat");

  return (
    <div className="w-full max-w-3xl bg-black/80 rounded-xl shadow-2xl p-0 flex flex-col h-full">
      {/* Barre d'onglets */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition ${
            tab === "chat"
              ? "bg-gray-900 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          onClick={() => setTab("chat")}
        >
          Chat
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition ${
            tab === "history"
              ? "bg-gray-900 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          onClick={() => setTab("history")}
        >
          Historique des mains
        </button>
      </div>
      {/* Contenu de l'onglet */}
      <div className=" p-2 overflow-y-auto min-h-[200px] h-[200px] max-h-[300px]">
        {tab === "chat" ? (
          <GameChat gameId={gameId} players={players} />
        ) : (
          <HandHistory gameId={gameId} />
        )}
      </div>
    </div>
  );
};

export default BottomTabs;
