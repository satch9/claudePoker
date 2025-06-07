import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE
export const createHand = mutation({
    args: {
        gameId: v.id("games"),
        handNumber: v.number(),
        communityCards: v.array(v.string()),
        potAmount: v.number(),
        sidePots: v.array(
            v.object({
                amount: v.number(),
                eligiblePlayers: v.array(v.id("users")),
                winner: v.id("users"),
            })
        ),
        winners: v.array(
            v.object({
                userId: v.id("users"),
                amount: v.number(),
                handRank: v.string(),
            })
        ),
        playerActions: v.array(
            v.object({
                userId: v.id("users"),
                action: v.string(),
                amount: v.number(),
                round: v.string(),
            })
        ),
        completedAt: v.optional(v.number()),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("hands", args);
    },
});

// READ (get by id)
export const getHand = query({
    args: { id: v.id("hands") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// READ (get all for a game)
export const listHandsByGame = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("hands")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .collect();
    },
});

// UPDATE
export const updateHand = mutation({
    args: {
        id: v.id("hands"),
        patch: v.object({
            handNumber: v.optional(v.number()),
            communityCards: v.optional(v.array(v.string())),
            potAmount: v.optional(v.number()),
            sidePots: v.optional(
                v.array(
                    v.object({
                        amount: v.number(),
                        eligiblePlayers: v.array(v.id("users")),
                        winner: v.id("users"),
                    })
                )
            ),
            winners: v.optional(
                v.array(
                    v.object({
                        userId: v.id("users"),
                        amount: v.number(),
                        handRank: v.string(),
                    })
                )
            ),
            playerActions: v.optional(
                v.array(
                    v.object({
                        userId: v.id("users"),
                        action: v.string(),
                        amount: v.number(),
                        round: v.string(),
                    })
                )
            ),
            completedAt: v.optional(v.number()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

// DELETE
export const deleteHand = mutation({
    args: { id: v.id("hands") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
}); 