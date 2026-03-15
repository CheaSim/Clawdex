"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-secondary px-4 py-2 text-sm">
      退出
    </button>
  );
}
