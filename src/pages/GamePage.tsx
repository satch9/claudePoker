import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import { useAuth } from "../hooks/useAuth";
import { PokerTable } from "../components/game/PokerTable";
import { Button } from "../components/ui/Button";
import { Id } from "../../convex/_generated/dataModel";
import RoundIndicator from "../components/game/RoundIndicator";
import { useBlindStructure } from "../hooks/useBlindStructure";
import BottomTabs from "../components/game/BottomsTabs";
import { ActionButtons } from "../components/game/ActionButtons";

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: Id<"games"> }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
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
  } = useGameState(gameId || null);

  const structure = useBlindStructure(game?.structureId || null);
  const blindLevelIndex = game?.blindLevelIndex || 0;
  const currentLevel = structure?.blindLevels?.[blindLevelIndex] || {
    smallBlind: 0,
    bigBlind: 0,
  };
  const blindDuration = structure?.blindDuration || 0;
  const updatedAt = game?.updatedAt || 0;
  const [timeLeft, setTimeLeft] = React.useState<number>(0);

  React.useEffect(() => {
    if (structure && updatedAt) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - updatedAt) / 1000;
        setTimeLeft(Math.max(0, blindDuration * 60 - elapsed));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [structure, updatedAt, blindDuration]);

  if (!game || !players) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl mb-4">
          Chargement de la partie...
        </div>
        <Button onClick={() => navigate("/lobby")}>Retour au lobby</Button>
      </div>
    );
  }

  const isCurrentUser = user?._id === currentPlayer?.userId;
  const isCurrentPlayer = currentPlayer?.userId === user?._id;

  const playerChips = currentPlayer ? currentPlayer.chips : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-black/60 shadow">
        <div className="text-2xl font-bold text-yellow-400">{game.name}</div>
        <div className="flex items-center gap-4">
          {players.map((player) => (
            <div className="text-white" key={player.userId}>
              {player.username}
            </div>
          ))}
          {isCurrentUser ? (
            <Button variant="danger" onClick={handleLeaveGame}>
              Quitter la table
            </Button>
          ) : (
            <Button onClick={handleJoinGame}>Rejoindre la table</Button>
          )}
          {game.maxPlayers === players.length &&
            game.createdBy === user?._id && (
              <Button
                onClick={handleStartGame}
                disabled={game.status !== "waiting"}
              >
                Démarrer la partie
              </Button>
            )}
        </div>
      </div>

      {/* Indicateur du tour actuel */}
      <RoundIndicator
        currentRound={game.currentRound}
        smallBlind={currentLevel.smallBlind}
        bigBlind={currentLevel.bigBlind}
        timeLeft={timeLeft}
        status={game.status}
      />

      {/* Partie centrale : table qui prend tout l'espace restant */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <PokerTable
            game={{
              ...game,
              currentPlayerIndex: game.currentPlayerIndex ?? -1,
              dealerIndex: game.dealerIndex ?? -1,
              communityCards: game.communityCards,
            }}
            players={players}
            currentUserId={user?._id || ""}
            onPlayerAction={handlePlayerAction}
          />
        </div>

        <div className="flex-1 flex items-center justify-around">
          <BottomTabs gameId={gameId!} players={players} />
          {canMakeAction && isCurrentUser && isCurrentPlayer && (
            <ActionButtons
              currentPlayer={isCurrentPlayer}
              canCheck={canCheck()}
              canCall={canCall()}
              canRaise={canRaise()}
              canFold={canFold()}
              canAllIn={canAllIn()}
              callAmount={getCallAmount()}
              minRaise={getMinRaise()}
              maxRaise={getMaxRaise()}
              playerChips={playerChips}
              onAction={handlePlayerAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
