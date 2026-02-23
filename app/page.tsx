"use client";

import { useState, useEffect } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import Sidebar from "@/app/components/Sidebar";
import ChatArea from "@/app/components/ChatArea";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const { user, isLoaded } = useUser();
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);

  const createUser = useMutation(api.users.mutations.createUser);
  const updateLastSeen = useMutation(api.users.mutations.updateLastSeen);

  const currentUser = useQuery(api.users.queries.getCurrentUser, user ? { clerkId: user.id } : "skip");

  // Sync user info to Convex
  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        name: user.fullName || "No Name",
        email: user.primaryEmailAddress?.emailAddress || "",
        image: user.imageUrl,
      });
    }
  }, [user, createUser]);

  // Handle global online presence
  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = () => {
      if (document.visibilityState === "visible") {
        updateLastSeen({ userId: currentUser._id });
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 4000);
    document.addEventListener("visibilitychange", updatePresence);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", updatePresence);
    };
  }, [currentUser?._id, updateLastSeen]);

  if (!isLoaded) {
    return <LoadingScreen message="Connecting..." />;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  if (!currentUser) {
    return <LoadingScreen message="Loading your chats..." />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        currentUser={currentUser}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />
      <ChatArea
        currentUser={currentUser}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />
    </div>
  );
}