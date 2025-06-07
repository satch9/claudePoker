import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE
export async function createPlayerHandler(ctx: any, args: any) {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Utilisateur non trouvé");
    return await ctx.db.insert("players", {
        ...args,
        username: user.username,
        avatar: user.avatar,
    });
}
export const createPlayer = mutation({
    args: {
        gameId: v.id("games"),
        userId: v.id("users"),
        position: v.number(),
        chips: v.number(),
        holeCards: v.array(v.string()),
        currentBet: v.number(),
        totalBet: v.number(),
        totalBetInGame: v.number(),
        isActive: v.boolean(),
        hasActed: v.boolean(),
        action: v.optional(v.union(
            v.literal("fold"),
            v.literal("check"),
            v.literal("call"),
            v.literal("bet"),
            v.literal("raise"),
            v.literal("all-in")
        )),
        isAllIn: v.boolean(),
        isFolded: v.boolean(),
        joinedAt: v.number(),
    },
    handler: createPlayerHandler,
});

// READ (get by id)
export async function getPlayerHandler(ctx: any, args: any) {
    return await ctx.db.get(args.id);
}
export const getPlayer = query({
    args: { id: v.id("players") },
    handler: getPlayerHandler,
});

// READ (get all for a game)
export async function listPlayersByGameHandler(ctx: any, { gameId }: any) {
    return await ctx.db.query("players").withIndex("by_game", (q: any) => q.eq("gameId", gameId)).collect();
}
export const listPlayersByGame = query({
    args: { gameId: v.id("games") },
    handler: listPlayersByGameHandler,
});

// READ (get all for a user)
export async function listPlayersByUserHandler(ctx: any, { userId }: any) {
    return await ctx.db.query("players").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect();
}
export const listPlayersByUser = query({
    args: { userId: v.id("users") },
    handler: listPlayersByUserHandler,
});

// UPDATE
export async function updatePlayerHandler(ctx: any, { id, patch }: any) {
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
}
export const updatePlayer = mutation({
    args: {
        id: v.id("players"),
        patch: v.object({
            position: v.optional(v.number()),
            chips: v.optional(v.number()),
            holeCards: v.optional(v.array(v.string())),
            currentBet: v.optional(v.number()),
            totalBet: v.optional(v.number()),
            totalBetInGame: v.optional(v.number()),
            isActive: v.optional(v.boolean()),
            hasActed: v.optional(v.boolean()),
            action: v.optional(v.union(
                v.literal("fold"),
                v.literal("check"),
                v.literal("call"),
                v.literal("bet"),
                v.literal("raise"),
                v.literal("all-in")
            )),
            isAllIn: v.optional(v.boolean()),
            isFolded: v.optional(v.boolean()),
        }),
    },
    handler: updatePlayerHandler,
});

// DELETE
export async function deletePlayerHandler(ctx: any, { id }: any) {
    await ctx.db.delete(id);
}
export const deletePlayer = mutation({
    args: { id: v.id("players") },
    handler: deletePlayerHandler,
}); 