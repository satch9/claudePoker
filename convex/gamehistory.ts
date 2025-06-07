import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE
export async function createGameHistoryHandler(ctx: any, args: any) {
    return await ctx.db.insert("gameHistory", args);
}
export const createGameHistory = mutation({
    args: {
        gameId: v.id("games"),
        userId: v.id("users"),
        startingChips: v.number(),
        endingChips: v.number(),
        profit: v.number(),
        handsPlayed: v.number(),
        finalPosition: v.number(),
        buyInAmount: v.number(),
        result: v.union(v.literal("win"), v.literal("lose"), v.literal("draw")),
        playedAt: v.number(),
        gameDuration: v.number(),
    },
    handler: createGameHistoryHandler,
});

// READ (get by id)
export async function getGameHistoryHandler(ctx: any, args: any) {
    return await ctx.db.get(args.id);
}
export const getGameHistory = query({
    args: { id: v.id("gameHistory") },
    handler: getGameHistoryHandler,
});

// READ (get all for a game)
export async function listGameHistoryByGameHandler(ctx: any, args: any) {
    return await ctx.db
        .query("gameHistory")
        .filter((q: any) => q.eq(q.field("gameId"), args.gameId))
        .collect();
}
export const listGameHistoryByGame = query({
    args: { gameId: v.id("games") },
    handler: listGameHistoryByGameHandler,
});

// UPDATE
export async function updateGameHistoryHandler(ctx: any, { id, patch }: any) {
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
}
export const updateGameHistory = mutation({
    args: {
        id: v.id("gameHistory"),
        patch: v.object({
            startingChips: v.optional(v.number()),
            endingChips: v.optional(v.number()),
            profit: v.optional(v.number()),
            handsPlayed: v.optional(v.number()),
            finalPosition: v.optional(v.number()),
            buyInAmount: v.optional(v.number()),
            result: v.optional(v.union(v.literal("win"), v.literal("lose"), v.literal("draw"))),
            playedAt: v.optional(v.number()),
            gameDuration: v.optional(v.number()),
        }),
    },
    handler: updateGameHistoryHandler,
});

// DELETE
export async function deleteGameHistoryHandler(ctx: any, { id }: any) {
    await ctx.db.delete(id);
    return { success: true };
}
export const deleteGameHistory = mutation({
    args: { id: v.id("gameHistory") },
    handler: deleteGameHistoryHandler,
}); 