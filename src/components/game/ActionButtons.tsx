import React, { useState } from "react";

interface ActionButtonsProps {
  currentPlayer: boolean;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  canFold: boolean;
  canAllIn: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
  onAction: (
    action: "fold" | "check" | "call" | "raise" | "all-in",
    amount?: number
  ) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentPlayer,
  canCheck,
  canCall,
  canRaise,
  canFold,
  canAllIn,
  callAmount,
  minRaise,
  maxRaise,
  playerChips,
  onAction,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  if (!currentPlayer) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="text-gray-500 text-sm">En attente de votre tour...</div>
      </div>
    );
  }

  const handleRaiseClick = () => {
    if (showRaiseSlider) {
      onAction("raise", raiseAmount);
      setShowRaiseSlider(false);
    } else {
      setShowRaiseSlider(true);
    }
  };

  const formatChips = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      {/* Slider de relance */}
      {showRaiseSlider && canRaise && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="text-white text-sm mb-2">
            Montant de la relance:{" "}
            <span className="font-bold text-green-400">
              {formatChips(raiseAmount)}
            </span>
          </div>
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Min: {formatChips(minRaise)}</span>
            <span>Max: {formatChips(maxRaise)}</span>
          </div>

          {/* Boutons de montants prédéfinis */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setRaiseAmount(minRaise)}
              className="flex-1 py-1 px-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
            >
              Min
            </button>
            <button
              onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.5))}
              className="flex-1 py-1 px-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
            >
              1/2 Pot
            </button>
            <button
              onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.75))}
              className="flex-1 py-1 px-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
            >
              3/4 Pot
            </button>
            <button
              onClick={() => setRaiseAmount(maxRaise)}
              className="flex-1 py-1 px-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      )}

      {/* Boutons d'action principaux */}
      <div className="flex space-x-2">
        {/* Fold */}
        {canFold && (
          <button
            onClick={() => onAction("fold")}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Se Coucher
          </button>
        )}

        {/* Check */}
        {canCheck && (
          <button
            onClick={() => onAction("check")}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Checker
          </button>
        )}

        {/* Call */}
        {canCall && (
          <button
            onClick={() => onAction("call")}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Suivre ({formatChips(callAmount)})
          </button>
        )}

        {/* Raise */}
        {canRaise && (
          <button
            onClick={handleRaiseClick}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105 ${
              showRaiseSlider
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {showRaiseSlider
              ? `Relancer (${formatChips(raiseAmount)})`
              : "Relancer"}
          </button>
        )}

        {/* All-in */}
        {canAllIn && (
          <button
            onClick={() => onAction("all-in")}
            className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105 border-2 border-purple-400"
          >
            ALL-IN ({formatChips(playerChips)})
          </button>
        )}
      </div>

      {/* Bouton d'annulation pour le slider */}
      {showRaiseSlider && (
        <button
          onClick={() => setShowRaiseSlider(false)}
          className="w-full mt-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
        >
          Annuler
        </button>
      )}
    </div>
  );
};
