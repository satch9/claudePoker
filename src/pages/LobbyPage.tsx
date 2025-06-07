import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

const LobbyPage: React.FC = () => {
  const games = useQuery(api.games.listGames) || [];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Lobby</h1>
          <Button onClick={() => navigate("/create-game")}>
            Nouvelle partie
          </Button>
        </div>
        {games.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">
            Aucune partie disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game: any) => (
              <Card
                key={game._id}
                className="flex flex-col p-6 bg-gray-900 border border-gray-700 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-white truncate">
                    {game.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${game.status === "waiting" ? "bg-emerald-600 text-white" : game.status === "playing" ? "bg-yellow-500 text-black" : "bg-gray-600 text-white"}`}
                  >
                    {game.status === "waiting"
                      ? "En attente"
                      : game.status === "playing"
                        ? "En cours"
                        : "Terminée"}
                  </span>
                </div>
                <div className="flex items-center text-gray-300 mb-2 gap-4">
                  <span>
                    👥 {game.players?.length || 0}/{game.maxPlayers} joueurs
                  </span>
                  <span>
                    Blinds : {game.smallBlind}/{game.bigBlind}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  Créée le {new Date(game.createdAt).toLocaleString()}
                </div>
                <Button
                  className="w-full mt-auto"
                  onClick={() => navigate(`/game/${game._id}`)}
                  disabled={game.status === "finished"}
                >
                  {game.status === "waiting"
                    ? "Rejoindre"
                    : game.status === "playing"
                      ? "Spectater"
                      : "Terminée"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
