import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveAvatar = mutation({
    args: {
        userId: v.id("users"),
        fileId: v.id("_storage"),
    },
    handler: async (ctx, { userId, fileId }) => {
        // On stocke l'id du fichier dans le champ avatar du user
        await ctx.db.patch(userId, { avatar: fileId });
        return fileId;
    },
});

export const getAvatarUrl = query({
    args: { fileId: v.optional(v.id("_storage")) },
    handler: async (ctx, { fileId }) => {
        if (!fileId) return null;
        return await ctx.storage.getUrl(fileId);
    },
});
