import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE
export const createStructure = mutation({
    args: {
        name: v.string(),
        blindDuration: v.number(),
        blindLevels: v.array(
            v.object({
                level: v.number(),
                smallBlind: v.number(),
                bigBlind: v.number(),
                ante: v.optional(v.number()),
            })
        ),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("structures", args);
    },
});

// READ (get by id)
export const getStructure = query({
    args: { id: v.id("structures") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// LIST (all)
export const listStructures = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("structures").order("desc").collect();
    },
});

// UPDATE
export const updateStructure = mutation({
    args: {
        id: v.id("structures"),
        patch: v.object({
            name: v.optional(v.string()),
            blindDuration: v.optional(v.number()),
            blindLevels: v.optional(
                v.array(
                    v.object({
                        level: v.number(),
                        smallBlind: v.number(),
                        bigBlind: v.number(),
                        ante: v.optional(v.number()),
                    })
                )
            ),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

// DELETE
export const deleteStructure = mutation({
    args: { id: v.id("structures") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});

export const createDefaultStructures = mutation(async (ctx) => {
    const defaultStructures = [
        {
            name: "normal",
            blindDuration: 12, // minutes
            blindLevels: [
                { level: 1, smallBlind: 25, bigBlind: 50 },
                { level: 2, smallBlind: 50, bigBlind: 100 },
                { level: 3, smallBlind: 75, bigBlind: 150 },
                { level: 4, smallBlind: 100, bigBlind: 200 },
                { level: 5, smallBlind: 150, bigBlind: 300 },
                { level: 6, smallBlind: 200, bigBlind: 400, ante: 50 },
                { level: 7, smallBlind: 300, bigBlind: 600, ante: 75 },
                { level: 8, smallBlind: 400, bigBlind: 800, ante: 100 },
                { level: 9, smallBlind: 500, bigBlind: 1000, ante: 125 },
                { level: 10, smallBlind: 600, bigBlind: 1200, ante: 150 },
                { level: 11, smallBlind: 800, bigBlind: 1600, ante: 200 },
                { level: 12, smallBlind: 1000, bigBlind: 2000, ante: 250 },
                { level: 13, smallBlind: 1200, bigBlind: 2400, ante: 300 },
                { level: 14, smallBlind: 1500, bigBlind: 3000, ante: 400 },
                { level: 15, smallBlind: 2000, bigBlind: 4000, ante: 500 },
            ],
        },
        {
            name: "turbo",
            blindDuration: 7, // minutes
            blindLevels: [
                { level: 1, smallBlind: 50, bigBlind: 100 },
                { level: 2, smallBlind: 75, bigBlind: 150 },
                { level: 3, smallBlind: 100, bigBlind: 200 },
                { level: 4, smallBlind: 150, bigBlind: 300 },
                { level: 5, smallBlind: 200, bigBlind: 400, ante: 50 },
                { level: 6, smallBlind: 300, bigBlind: 600, ante: 75 },
                { level: 7, smallBlind: 400, bigBlind: 800, ante: 100 },
                { level: 8, smallBlind: 500, bigBlind: 1000, ante: 125 },
                { level: 9, smallBlind: 600, bigBlind: 1200, ante: 150 },
                { level: 10, smallBlind: 800, bigBlind: 1600, ante: 200 },
                { level: 11, smallBlind: 1000, bigBlind: 2000, ante: 250 },
                { level: 12, smallBlind: 1200, bigBlind: 2400, ante: 300 },
                { level: 13, smallBlind: 1500, bigBlind: 3000, ante: 400 },
                { level: 14, smallBlind: 2000, bigBlind: 4000, ante: 500 },
            ],
        },
        {
            name: "hyper",
            blindDuration: 4, // minutes
            blindLevels: [
                { level: 1, smallBlind: 100, bigBlind: 200 },
                { level: 2, smallBlind: 150, bigBlind: 300 },
                { level: 3, smallBlind: 200, bigBlind: 400 },
                { level: 4, smallBlind: 300, bigBlind: 600, ante: 75 },
                { level: 5, smallBlind: 400, bigBlind: 800, ante: 100 },
                { level: 6, smallBlind: 500, bigBlind: 1000, ante: 125 },
                { level: 7, smallBlind: 600, bigBlind: 1200, ante: 150 },
                { level: 8, smallBlind: 800, bigBlind: 1600, ante: 200 },
                { level: 9, smallBlind: 1000, bigBlind: 2000, ante: 250 },
                { level: 10, smallBlind: 1200, bigBlind: 2400, ante: 300 },
                { level: 11, smallBlind: 1500, bigBlind: 3000, ante: 400 },
                { level: 12, smallBlind: 2000, bigBlind: 4000, ante: 500 },
            ],
        },
    ];

    for (const structure of defaultStructures) {
        await ctx.db.insert("structures", {
            ...structure,
            createdAt: Date.now(),
        });
    }
});