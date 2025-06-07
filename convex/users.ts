
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./utils/userUtils.node";

// CREATE
export const createUser = mutation({
    args: {
        username: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
        password: v.string(),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        // Vérifier que l'utilisateur n'existe pas déjà
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("Un utilisateur avec cet email existe déjà");
        }

        // Vérifier que le nom d'utilisateur n'est pas pris
        const existingUsername = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (existingUsername) {
            throw new Error("Ce nom d'utilisateur est déjà pris");
        }

        // Hacher le mot de passe
        const hashedPassword = await hashPassword(args.password);

        const userId = await ctx.db.insert("users", {
            email: args.email,
            username: args.username,
            password: hashedPassword,
            avatar: args.avatar || "/assets/default-avatar.png",
            chips: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            totalWinnings: 0,
            settings: {
                hideLosingHand: false,
                hideWinningHand: false,
                hideFoldWhenLast: false,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastLoginAt: Date.now(),
        })

        // Retourner l'utilisateur sans le hash du mot de passe
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("Erreur lors de la création de l'utilisateur");

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
});

// READ (get by id)
export const getUserById = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
});

// READ (get all)
export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map(({ password, ...u }) => u);
    },
});

// UPDATE
export const updateUser = mutation({
    args: {
        id: v.id("users"),
        patch: v.object({
            username: v.optional(v.string()),
            avatar: v.optional(v.string()),
            chips: v.optional(v.number()),
            gamesPlayed: v.optional(v.number()),
            gamesWon: v.optional(v.number()),
            totalWinnings: v.optional(v.number()),
            settings: v.optional(
                v.object({
                    hideLosingHand: v.boolean(),
                    hideWinningHand: v.boolean(),
                    hideFoldWhenLast: v.boolean(),
                })
            ),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        const user = await ctx.db.get(id);
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
});

// DELETE
export const deleteUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
    },
});

// Query pour récupérer un utilisateur par email (avec le hash du mot de passe)
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Query pour récupérer un utilisateur par id (avec le hash du mot de passe)
export const getUserWithPassword = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Mutation pour mettre à jour la date de dernière connexion
export const updateLastLogin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { lastLoginAt: Date.now() });
        return { success: true };
    },
}); 