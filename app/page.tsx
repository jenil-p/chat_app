"use client";

import { useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.users.mutations.createUser);

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

    if (!user) return <div>No user found. If you are one then identify your self here <Link className="underline text-blue-600" href="/sign-in">
      Sign In
    </Link> </div>;

  return (
    <div>
      <h1>Welcome {user.fullName}</h1>
      <img src={user.imageUrl} width={50} />
      
      {/* Logout + Profile */}
      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  );
}


