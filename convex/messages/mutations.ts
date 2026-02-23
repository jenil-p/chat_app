import { mutation } from "../_generated/server";
import { v } from "convex/values";

// send the message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// delegte the essage
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) return;

    // only sender can delete
    if (message.senderId !== args.userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "",
    });
  },
});