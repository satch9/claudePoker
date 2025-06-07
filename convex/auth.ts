import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Mutation pour créer un utilisateur (le mot de passe est déjà hashé)
export const createUser = mutation({
    args: {
        username: v.string(),
        email: v.string(),
        password: v.string(),
        avatar: v.optional(v.string()),
        chips: v.number(),
        gamesPlayed: v.number(),
        gamesWon: v.number(),
        totalWinnings: v.number(),
        settings: v.object({
            hideLosingHand: v.boolean(),
            hideWinningHand: v.boolean(),
            hideFoldWhenLast: v.boolean(),
        }),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastLoginAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", args);
    },
});

// Mutation pour changer le mot de passe (le hash est déjà calculé)
export const updatePassword = mutation({
    args: {
        userId: v.id("users"),
        password: v.string(),
        updatedAt: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            password: args.password,
            updatedAt: args.updatedAt,
        });
        return { success: true };
    },
});

// Mutation pour mettre à jour la date de dernière connexion
export const updateLastLogin = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            lastLoginAt: Date.now(),
        });
        return { success: true };
    },
});

// Query pour vérifier si un email existe (pour l'inscription)
export const checkEmailExists = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        return !!user;
    },
});

// Query pour vérifier si un nom d'utilisateur existe
export const checkUsernameExists = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();
        return !!user;
    },
});

// Génération d'URL d'upload (utile pour l'avatar)
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Fonction utilitaire pour valider la force du mot de passe (optionnel, si utilisé côté frontend)
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (password.length < 8) {
        errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins une majuscule");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins une minuscule");
    }
    if (!/\d/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins un chiffre");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins un caractère spécial");
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
