import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useBlindStructure(structureId: string | null) {
    const structure = useQuery(api.structures.getStructure, structureId ? { id: structureId as Id<"structures"> } : "skip");
    return structure ?? null;
}