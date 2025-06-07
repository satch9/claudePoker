import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Id } from "../../../convex/_generated/dataModel";
import { Structure } from "../../types/game";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const structures = useQuery(api.structures.listStructures) || [];
  const createGame = useMutation(api.games.create);

  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [structureId, setStructureId] = useState<Id<"structures"> | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !structureId) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("poker-user") || "{}");
      const gameId = await createGame({
        name,
        maxPlayers,
        structureId: structureId as Id<"structures">,
        userId: user._id,
      });
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError("Erreur lors de la création de la partie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 bg-gray-900 border border-gray-700 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          Créer une nouvelle partie
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1">Nom de la table</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">
              Nombre maximum de joueurs
            </label>
            <input
              type="number"
              min={2}
              max={9}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">
              Structure de blindes
            </label>
            <select
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
              value={structureId}
              onChange={(e) =>
                setStructureId(e.target.value as Id<"structures">)
              }
              required
            >
              <option value="">Sélectionner une structure</option>
              {structures.map((structure: Structure) => (
                <option key={structure._id} value={structure._id}>
                  {structure.name} (durée: {structure.blindDuration} min,
                  niveaux: {structure.blindLevels.length})
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création..." : "Créer la partie"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateGamePage;
