"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/formatTimestamp";

export default function ChatPage() {
    const { user } = useUser();
    const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
    const [message, setMessage] = useState("");

    const [now, setNow] = useState(Date.now());

    const currentUser = useQuery(
        api.users.queries.getCurrentUser,
        user ? { clerkId: user.id } : "skip"
    );

    const updateTyping = useMutation(
        api.typing.mutations.updateTyping
    );

    const handleTyping = () => {
        if (!selectedConversation || !currentUser) return;

        updateTyping({
            conversationId: selectedConversation,
            userId: currentUser._id,
        });
    };

    const typingUsers = useQuery(
        api.typing.queries.getTypingUsers,
        selectedConversation
            ? { conversationId: selectedConversation }
            : "skip"
    );

    const activeTypers =
        typingUsers?.filter(t =>
            t.userId !== currentUser?._id &&
            now - t.lastTypedAt < 2000
        ) || [];

    const conversations = useQuery(
        api.conversations.queries.getUserConversations,
        currentUser ? { userId: currentUser._id } : "skip"
    );

    const messages = useQuery(
        api.messages.queries.getMessages,
        selectedConversation ? { conversationId: selectedConversation } : "skip"
    );

    const updateLastSeen = useMutation(
        api.users.mutations.updateLastSeen
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        // Update immediately
        updateLastSeen({ userId: currentUser._id });

        // Update every 20 seconds
        const interval = setInterval(() => {
            updateLastSeen({ userId: currentUser._id });
        }, 20000);

        return () => clearInterval(interval);
    }, [currentUser?._id]);

    const sendMessage = useMutation(api.messages.mutations.sendMessage);

    if (!currentUser || !conversations) return <div>Loading...</div>;

    return (
        <div style={{ display: "flex", height: "100vh" }}>

            {/* all chats of this user */}
            <div style={{ width: "300px", borderRight: "1px solid gray" }}>
                <h3>Conversations</h3>

                {conversations.length === 0 && (
                    <div style={{ padding: "20px", color: "gray" }}>
                        <h4>No conversations yet 👋</h4>
                        <p>
                            Start by searching for a user and sending your first message.
                        </p>
                    </div>
                )}

                {conversations.map(c => {
                    const isOnline =
                        c.otherUser?.lastSeen &&
                        now - c.otherUser.lastSeen < 5000

                    return (
                        <div
                            key={c.conversationId}
                            onClick={() => setSelectedConversation(c.conversationId)}
                            style={{ cursor: "pointer", padding: "10px" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: isOnline ? "green" : "gray",
                                    }}
                                />
                                <strong>{c.otherUser?.name}</strong>
                            </div>

                            <p>
                                {c.lastMessage ? c.lastMessage.content : "No messages yet"}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "20px" }}>
                {!selectedConversation && (
                    <div style={{ textAlign: "center", marginTop: "100px", color: "gray" }}>
                        <h3>Welcome to Chat 💬</h3>
                        <p>Select a conversation from the left</p>
                        <p>or start a new one from the Users page.</p>
                    </div>
                )}

                {selectedConversation && (
                    <>
                        <div style={{ height: "70vh", overflowY: "auto" }}>
                            {messages && messages.length === 0 && (
                                <div style={{ textAlign: "center", marginTop: "50px", color: "gray" }}>
                                    <h4>No messages yet 📨</h4>
                                    <p>Say hello and start the conversation!</p>
                                </div>
                            )}
                            {messages?.map(m => (
                                <div key={m._id}>
                                    <div>
                                        <b>
                                            {m.senderId === currentUser._id ? "You" : "Them"}:
                                        </b>{" "}
                                        {m.content}
                                        <div className="text-gray-600 mb-5" style={{ fontSize: "12px", color: "gray" }}>
                                            {formatTimestamp(m.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <input
                            value={message}
                            onChange={e => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
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
            {activeTypers.length > 0 && (
                <div style={{ fontStyle: "italic", color: "gray" }}>
                    {activeTypers.length === 1
                        ? "Typing..."
                        : "Multiple people typing..."}
                </div>
            )}
        </div>
    );
}