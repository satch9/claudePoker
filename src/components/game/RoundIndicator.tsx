import React from "react";

interface RoundIndicatorProps {
  currentRound: string;
  smallBlind: number;
  bigBlind: number;
  timeLeft: number;
  status: string;
}

const RoundIndicator: React.FC<RoundIndicatorProps> = ({
  currentRound,
  smallBlind,
  bigBlind,
  timeLeft,
  status,
}) => {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 text-white shadow-lg border border-yellow-600/30 mb-4 w-fit mx-auto">
      <div className="text-base font-semibold tracking-wider">
        {currentRound.toUpperCase()}
      </div>
      <div className="text-xs text-yellow-200 mt-1 font-mono">
        Blinds :{" "}
        <span className="font-bold">
          {smallBlind}/{bigBlind}
        </span>
      </div>
      {timeLeft > 0 && status === "playing" && (
        <div className="text-xs text-yellow-100 mt-1 font-mono">
          Prochain niveau dans : {Math.floor(timeLeft / 60)}:
          {("0" + Math.floor(timeLeft % 60)).slice(-2)}
        </div>
      )}
    </div>
  );
};

export default RoundIndicator;
