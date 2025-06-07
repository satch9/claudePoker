"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword } from "./utils/userUtils.node";
import { api } from "../convex/_generated/api";


// Action pour l'inscription
export const register = action({
    args: {
        username: v.string(),
        email: v.string(),
        password: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ id: string }> => {
        // Vérifier unicité email/username
        const emailExists = await ctx.runQuery(api.auth.checkEmailExists, { email: args.email });
        if (emailExists) throw new Error("Email déjà enregistré");
        const usernameExists = await ctx.runQuery(api.auth.checkUsernameExists, { username: args.username });
        if (usernameExists) throw new Error("Nom d'utilisateur déjà pris");
        // Hash du mot de passe
        const passwordHash = await hashPassword(args.password);

        // Construction de l'URL publique de l'avatar si storageId fourni
        let avatarUrl: string | undefined = undefined;
        if (args.avatar) {
            avatarUrl = `${process.env.VITE_CONVEX_URL || ""}/storage/${args.avatar}`;
        }

        // Création utilisateur
        const userId = await ctx.runMutation(api.auth.createUser, {
            username: args.username,
            email: args.email,
            password: passwordHash,
            avatar: args.avatar || "/assets/default-avatar.png",
            chips: 5000,
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
        });
        return { id: userId };
    }
});

// Action pour la connexion
export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args): Promise<{ id: string }> => {
        // Récupérer l'utilisateur par email
        const user = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });
        if (!user) throw new Error("Email ou mot de passe incorrect");
        // Vérifier le mot de passe
        const isValid = await verifyPassword(args.password, user.password);
        if (!isValid) throw new Error("Email ou mot de passe incorrect");
        // Mettre à jour la date de connexion
        await ctx.runMutation(api.auth.updateLastLogin, { userId: user._id });
        // Retourner l'utilisateur sans le hash
        const { password, ...userWithoutPassword } = user;
        return { id: userWithoutPassword._id.toString() };
    }
});

// Action pour changer le mot de passe
export const changePassword = action({
    args: {
        userId: v.id("users"),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        // Récupérer l'utilisateur
        const user = await ctx.runQuery(api.users.getUserWithPassword, { id: args.userId });
        if (!user) throw new Error("Utilisateur non trouvé");
        // Vérifier l'ancien mot de passe
        const isValid = await verifyPassword(args.currentPassword, user.password);
        if (!isValid) throw new Error("Mot de passe actuel incorrect");
        // Hash du nouveau mot de passe
        const newHash = await hashPassword(args.newPassword);
        await ctx.runMutation(api.auth.updatePassword, { userId: args.userId, password: newHash, updatedAt: Date.now() });
        return { success: true };
    }
});

// ... autres actions (resetPassword, generateResetToken) à adapter sur le même modèle ... 