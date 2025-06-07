import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Timer } from "lucide-react";
import { Player, GameAction } from "../../types/game";
import { PlayerCards } from "./PlayerCards";
import { formatChips } from "../../utils/gameUtils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  isDealer: boolean;
  isCurrentUser: boolean;
  canMakeAction: boolean;
  onPlayerAction: (action: GameAction, amount?: number) => Promise<void>;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentPlayer,
  isDealer,
  isCurrentUser,
}) => {
  const avatarUrl = useQuery(api.files.getAvatarUrl, {
    fileId: player.avatar as Id<"_storage"> | undefined,
  });

  const getActionColor = (action?: string) => {
    switch (action) {
      case "fold":
        return "text-red-400";
      case "call":
        return "text-blue-400";
      case "raise":
        return "text-green-400";
      case "check":
        return "text-yellow-400";
      case "all-in":
        return "text-purple-400";
      default:
        return "text-white/60";
    }
  };

  return (
    <div className="relative w-full max-w-xs min-w-0 flex flex-col items-center">
      {/* Ligne principale : avatar, bulle noire, cartes */}
      <div className="flex flex-row items-center w-full min-w-0">
        {/* Avatar + badges en overlay */}
        <div className="relative flex-shrink-0 z-30">
          <img
            src={avatarUrl || "/assets/default-avatar.png"}
            alt={player.username}
            className="w-18 h-18 md:w-20 md:h-20 rounded-full border-2 border-white/20 object-cover bg-black shadow"
          />
          {/* Badges */}
          <div className="absolute  flex flex-col space-y-1 z-30">
            {isDealer && (
              <span className="absolute -top-[90px] -left-[5px]  bg-red-600 rounded-full p-1 shadow">
                <Crown className="w-6 h-6 text-white" />
              </span>
            )}
            {isCurrentPlayer && (
              <span className="absolute -top-[30px] -left-[5px] bg-yellow-500 rounded-full p-1 shadow mt-1">
                <Timer className="w-6 h-6 text-black animate-pulse" />
              </span>
            )}
          </div>
          {!player.isActive && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">OUT</span>
            </div>
          )}
        </div>
        {/* Bulle noire pseudo + stack */}
        <div className="flex flex-col justify-center items-start ml-[-20px] pl-6 pr-6 py-2 bg-black/80 rounded-r-full z-20 min-w-[150px] max-w-[200px] shadow-lg shadow-black/40">
          <span className="text-white font-medium text-base truncate max-w-[100px]">
            {player.username}
          </span>
          <hr className="w-full border-white/60 my-0" />
          <span className="text-white text-lg font-bold">
            {formatChips(player.chips)}
          </span>
        </div>
        {/* Cartes du joueur */}
        <div className="absolute  mt-[-120px] left-[65px] ">
          <PlayerCards
            cards={player.holeCards}
            isCurrentUser={isCurrentUser}
            isFolded={player.action === "fold"}
          />
        </div>
      </div>
      {/* Overlays (all-in, action, mise) */}
      <AnimatePresence>
        {player.isAllIn && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-xl flex items-center justify-center z-40"
          >
            <span className="text-white font-bold text-lg">ALL IN</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {player.currentBet > 0 && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -10 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold z-50"
          >
            {formatChips(player.currentBet)}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {player.action && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -top-8 left-[200px] transform -translate-x-1/2 px-2 py-1 rounded text-md font-bold ${getActionColor(player.action)} bg-black/60 backdrop-blur-sm z-50`}
          >
            {player.action.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
