"use client";

import { useSession } from "next-auth/react";

export function UserDisplay() {
  const { data: session } = useSession();
  
  return (
    <span className="text-secondary text-sm mr-4">
      {session?.user?.name || 'ユーザー'}
    </span>
  );
}