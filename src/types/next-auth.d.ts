import type { DefaultSession } from "next-auth";

import type { UserRole, UserStatus } from "@/generated/prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      status: UserStatus;
      playerId: string | null;
      playerSlug: string | null;
    };
  }

  interface User {
    role?: UserRole;
    status?: UserStatus;
    playerId?: string | null;
    playerSlug?: string | null;
  }
}
