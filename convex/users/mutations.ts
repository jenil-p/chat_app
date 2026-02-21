import { mutation } from "../_generated/server";
import { v } from "convex/values";

// make the user in database
export const createUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", args.clerkId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastSeen: Date.now(),
            });
            return;
        }

        await ctx.db.insert("users", {
            ...args,
            lastSeen: Date.now(),
        });
    },
});

export const updateLastSeen = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            lastSeen: Date.now(),
        });
    },
});