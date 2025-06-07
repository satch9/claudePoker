
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE
export const createMessage = mutation({
    args: {
        gameId: v.id("games"),
        userId: v.id("users"),
        username: v.string(),
        message: v.string(),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Utilisateur non trouvé");
        return await ctx.db.insert("chat", {
            ...args,
            username: user.username,
        });
    },
});

// READ (get by id)
export const getMessage = query({
    args: { id: v.id("chat") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// READ (get all for a game)
export const listMessagesByGame = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, { gameId }) => {
        return await ctx.db.query("chat").withIndex("by_game", (q: any) => q.eq("gameId", gameId)).collect();
    },
});

// UPDATE
export const updateMessage = mutation({
    args: {
        id: v.id("chat"),
        patch: v.object({
            message: v.optional(v.string()),
            timestamp: v.optional(v.number()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

// DELETE
export const deleteMessage = mutation({
    args: { id: v.id("chat") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
    },
}); 