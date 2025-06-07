import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useHandHistory(gameId: Id<"games"> | null) {
    return useQuery(
        api.hands.listHandsByGame,
        gameId ? { gameId } : "skip"
    ) || [];
}