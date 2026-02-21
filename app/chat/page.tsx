"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function ChatPage() {
    const { user } = useUser();
    const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
    const [message, setMessage] = useState("");

    const currentUser = useQuery(
        api.users.queries.getCurrentUser,
        user ? { clerkId: user.id } : "skip"
    );

    const conversations = useQuery(
        api.conversations.queries.getUserConversations,
        currentUser ? { userId: currentUser._id } : "skip"
    );

    const messages = useQuery(
        api.messages.queries.getMessages,
        selectedConversation ? { conversationId: selectedConversation } : "skip"
    );

    const sendMessage = useMutation(api.messages.mutations.sendMessage);

    if (!currentUser || !conversations) return <div>Loading...</div>;

    return (
        <div style={{ display: "flex", height: "100vh" }}>

            {/* all chats of this user */}
            <div style={{ width: "300px", borderRight: "1px solid gray" }}>
                <h3>Conversations</h3>

                {conversations.length === 0 && <p>No conversations yet</p>}

                {conversations.map(c => (
                    <div
                        key={c.conversationId}
                        onClick={() => setSelectedConversation(c.conversationId)}
                        style={{ cursor: "pointer", padding: "10px" }}
                    >
                        <strong>{c.otherUser?.name}</strong>
                        <p>
                            {c.lastMessage ? c.lastMessage.content : "No messages yet"}
                        </p>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "20px" }}>
                {!selectedConversation && <p>Select a conversation</p>}

                {selectedConversation && (
                    <>
                        <div style={{ height: "70vh", overflowY: "auto" }}>
                            {messages?.map(m => (
                                <div key={m._id}>
                                    <b>
                                        {m.senderId === currentUser._id ? "You" : "Them"}:
                                    </b>{" "}
                                    {m.content}
                                </div>
                            ))}
                        </div>

                        <input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Type message..."
                        />

                        <button
                            onClick={() => {
                                sendMessage({
                                    conversationId: selectedConversation,
                                    senderId: currentUser._id,
                                    content: message,
                                });
                                setMessage("");
                            }}
                        >
                            Send
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}