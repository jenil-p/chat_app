"use client";

import { useState, useEffect, useRef } from "react";
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

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const currentUser = useQuery(
        api.users.queries.getCurrentUser,
        user ? { clerkId: user.id } : "skip"
    );

    const updateTyping = useMutation(
        api.typing.mutations.updateTyping
    );

    const isUserNearBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return true;

        const threshold = 100; // this is says that till 100 px is counted as near bottom...

        return (
            container.scrollHeight - container.scrollTop - container.clientHeight <
            threshold
        );
    };

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

    const markAsRead = useMutation(
        api.conversationReads.mutations.markAsRead
    );

    const deleteMessage = useMutation(
        api.messages.mutations.deleteMessage
    );

    useEffect(() => {
        if (!messages || !selectedConversation || !currentUser) return;

        const container = messagesContainerRef.current;
        if (!container) return;

        if (isUserNearBottom()) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowScrollButton(false);

            // Mark as read
            markAsRead({
                conversationId: selectedConversation,
                userId: currentUser._id,
            });

        } else {
            setShowScrollButton(true);
        }

    }, [messages?.length]);


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

    // if new message arrives and we are near bottom auto matic scrll
    useEffect(() => {
        if (!messages) return;

        const container = messagesContainerRef.current;
        if (!container) return;

        if (isUserNearBottom()) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowScrollButton(false);
        } else {
            setShowScrollButton(true);
        }

    }, [messages?.length]);

    // scroll manually if we are far from bottom
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (
                isUserNearBottom() &&
                selectedConversation &&
                currentUser
            ) {
                setShowScrollButton(false);

                markAsRead({
                    conversationId: selectedConversation,
                    userId: currentUser._id,
                });
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);

    }, [selectedConversation, currentUser]);

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
                                {c.unreadCount > 0 && (
                                    <span style={{
                                        backgroundColor: "red",
                                        color: "white",
                                        borderRadius: "50%",
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        marginLeft: "8px",
                                    }}>
                                        {c.unreadCount}
                                    </span>
                                )}
                            </div>

                            <p>
                                {c.lastMessage ? c.lastMessage.content : "No messages yet"}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "20px", position: "relative" }}>
                {!selectedConversation && (
                    <div style={{ textAlign: "center", marginTop: "100px", color: "gray" }}>
                        <h3>Welcome to Chat 💬</h3>
                        <p>Select a conversation from the left</p>
                        <p>or start a new one from the Users page.</p>
                    </div>
                )}

                {selectedConversation && (
                    <>
                        <div
                            ref={messagesContainerRef}
                            style={{ height: "70vh", overflowY: "auto" }}
                        >
                            {messages && messages.length === 0 && (
                                <div style={{ textAlign: "center", marginTop: "50px", color: "gray" }}>
                                    <h4>No messages yet 📨</h4>
                                    <p>Say hello and start the conversation!</p>
                                </div>
                            )}

                            {messages?.map(m => (
                                <div key={m._id}>
                                    <b>
                                        {m.senderId === currentUser._id ? "You" : "Them"}:
                                    </b>{" "}

                                    {m.isDeleted ? (
                                        <i style={{ color: "gray" }}>
                                            This message was deleted
                                        </i>
                                    ) : (
                                        m.content
                                    )}

                                    {m.senderId === currentUser._id && !m.isDeleted && (
                                        <button
                                            onClick={() =>
                                                deleteMessage({
                                                    messageId: m._id,
                                                    userId: currentUser._id,
                                                })
                                            }
                                            style={{
                                                marginLeft: "10px",
                                                fontSize: "10px",
                                                color: "red",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}

                                    <div style={{ fontSize: "12px", color: "gray" }}>
                                        {formatTimestamp(m.createdAt)}
                                    </div>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {showScrollButton && (
                            <button
                                onClick={() => {
                                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                                    setShowScrollButton(false);
                                }}
                                style={{
                                    position: "absolute",
                                    bottom: "100px",
                                    right: "40px",
                                    padding: "8px 12px",
                                    backgroundColor: "black",
                                    color: "white",
                                    borderRadius: "20px",
                                }}
                            >
                                ↓ New messages
                            </button>
                        )}

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
        </div>
    );
}