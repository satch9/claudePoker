import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Game, GameAction } from "../../types/game";
import { PlayerSeat } from "./PlayerSeat";
import { CommunityCards } from "./CommunityCards";
import { PotDisplay } from "./PotDisplay";

interface PokerTableProps {
  game: Game;
  players: Player[];
  currentUserId: string;
  onPlayerAction: (action: GameAction, amount?: number) => Promise<void>;
}

export const PokerTable: React.FC<PokerTableProps> = ({
  game,
  players,
  currentUserId,
  onPlayerAction,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 650 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (tableRef.current) {
        setDimensions({
          width: tableRef.current.offsetWidth,
          height: tableRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const seatSize = Math.max(
    100,
    Math.min(dimensions.width, dimensions.height) / 8
  );
  const radius = Math.min(dimensions.width, dimensions.height) / 2.2;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2 + seatSize / 10;

  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);
  const myPlayer = sortedPlayers.find((p) => p.userId === currentUserId);
  const myIndex = sortedPlayers.findIndex((p) => p.userId === currentUserId);
  const playerCount = sortedPlayers.length;

  // Décalage pour placer le joueur courant en bas
  const angleOffset = Math.PI / 2 - (2 * Math.PI * myIndex) / playerCount;

  return (
    <div
      ref={tableRef}
      className="relative w-full h-full min-h-[600px] rounded-xl bg-emerald-900/80 overflow-hidden"
    >
      {/* Lumière centrale */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-[10%] bg-emerald-800 rounded-full shadow-inner border-8 border-emerald-700/50"></div>
      </div>

      {/* Texture SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <pattern
          id="dots"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Cartes communautaires */}
      <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 z-20">
        <AnimatePresence>
          <CommunityCards
            cards={game.communityCards}
            round={game.currentRound}
          />
        </AnimatePresence>
      </div>

      {/* Pot principal */}
      <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 z-20">
        <motion.div
          className="bg-black/70 px-6 py-2 rounded-full text-white font-bold text-lg shadow"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PotDisplay pot={game.pot} sidePots={game.sidePots} />
        </motion.div>
      </div>

      {/* Sièges des joueurs */}
      {sortedPlayers.map((player, index) => {
        const angle = (2 * Math.PI * index) / playerCount + angleOffset;
        const x = centerX + radius * Math.cos(angle) - seatSize / 1.3;
        const y = centerY + radius * Math.sin(angle) - seatSize * 1.1;

        const isCurrentPlayer = game.currentPlayerIndex === player.position;
        const isDealer = game.dealerIndex === player.position;
        const isCurrentUser = player.userId === currentUserId;

        return (
          <motion.div
            key={player._id}
            className="absolute z-30"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${seatSize}px`,
              height: `${seatSize}px`,
              display: "flex",
              alignItems: "center",
              transform: `translate(-50%, -50%)`,
              transition: "all 0.5s ease-in-out",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <PlayerSeat
                player={player}
                isCurrentPlayer={isCurrentPlayer}
                isDealer={isDealer}
                isCurrentUser={isCurrentUser}
                canMakeAction={isCurrentPlayer && isCurrentUser}
                onPlayerAction={onPlayerAction}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
