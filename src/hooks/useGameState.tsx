import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Game, Player, GameAction } from "../types/game";
import { useAuth } from "./useAuth";
import { Id } from "../../convex/_generated/dataModel";
import { useBlindStructure } from "./useBlindStructure";

export const useGameState = (gameId: string | null) => {
  const { user } = useAuth();
  const [localGameState, setLocalGameState] = useState<Game | null>(null);

  const game = useQuery(
    api.games.get,
    gameId ? { gameId: gameId as Id<"games"> } : "skip"
  );
  const structure = useBlindStructure(game?.structureId ?? null);
  const blindLevelIndex = game?.blindLevelIndex ?? 0;
  const bigBlind = structure?.blindLevels?.[blindLevelIndex]?.bigBlind ?? 0;
  const players = useQuery(
    api.players.listPlayersByGame,
    gameId ? { gameId: gameId as Id<"games"> } : "skip"
  );

  const joinGame = useMutation(api.games.joinGame);
  const leaveGame = useMutation(api.games.leaveGame);
  const makeAction = useMutation(api.games.makeAction);
  const startGame = useMutation(api.games.startGame);

  const currentPlayer = players?.find((p) => p.userId === user?._id);
  const isCurrentPlayerTurn =
    game?.currentPlayerIndex === currentPlayer?.position;
  const canMakeAction = isCurrentPlayerTurn && game?.status === "playing";

  const handleJoinGame = async () => {
    if (!gameId || !user) return;

    try {
      await joinGame({ gameId: gameId as Id<"games">, userId: user._id });
    } catch (error) {
      console.error("Erreur lors de la connexion à la partie:", error);
    }
  };

  const handleLeaveGame = async () => {
    if (!gameId || !user) return;

    try {
      await leaveGame({ gameId: gameId as Id<"games">, userId: user._id });
    } catch (error) {
      console.error("Erreur lors de la déconnexion de la partie:", error);
    }
  };

  const handlePlayerAction = async (action: GameAction, amount?: number) => {
    if (!gameId || !user || !canMakeAction) return;

    try {
      await makeAction({
        gameId: gameId as Id<"games">,
        userId: user._id,
        action,
        amount: amount || 0,
      });
    } catch (error) {
      console.error("Erreur lors de l'action:", error);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;

    try {
      await startGame({ gameId: gameId as Id<"games"> });
    } catch (error) {
      console.error("Erreur lors du démarrage de la partie:", error);
    }
  };

  const getMinBet = () => {
    if (!game) return 0;

    const highestBet = Math.max(...(players?.map((p) => p.currentBet) || [0]));
    return Math.max(highestBet, bigBlind);
  };

  const getMinRaise = () => {
    if (!game) return 0;

    const minBet = getMinBet();
    const currentPlayerBet = currentPlayer?.currentBet || 0;
    return minBet - currentPlayerBet + bigBlind;
  };

  const getMaxRaise = () => {
    if (!currentPlayer) return 0;
    return currentPlayer.chips;
  };

  const canCheck = () => {
    if (!currentPlayer || !players) return false;

    const highestBet = Math.max(...players.map((p) => p.currentBet));
    return currentPlayer.currentBet === highestBet;
  };

  const canCall = () => {
    if (!currentPlayer || !players) return false;

    const highestBet = Math.max(...players.map((p) => p.currentBet));
    return currentPlayer.currentBet < highestBet && currentPlayer.chips > 0;
  };

  const canRaise = () => {
    if (!currentPlayer) return false;

    const minRaise = getMinRaise();
    return currentPlayer.chips >= minRaise;
  };

  const getCallAmount = () => {
    if (!currentPlayer || !players) return 0;

    const highestBet = Math.max(...players.map((p) => p.currentBet));
    return Math.min(highestBet - currentPlayer.currentBet, currentPlayer.chips);
  };

  const canFold = () => {
    if (!currentPlayer || !players) return false;

    const highestBet = Math.max(...players.map((p) => p.currentBet));
    return currentPlayer.currentBet < highestBet;
  };

  const canAllIn = () => {
    if (!currentPlayer) return false;
    return currentPlayer.chips > 0;
  };

  return {
    game,
    players,
    currentPlayer,
    isCurrentPlayerTurn,
    canMakeAction,
    handleJoinGame,
    handleLeaveGame,
    handlePlayerAction,
    handleStartGame,
    getMinBet,
    getMinRaise,
    getMaxRaise,
    canCheck,
    canCall,
    canRaise,
    getCallAmount,
    canFold,
    canAllIn,
  };
};
