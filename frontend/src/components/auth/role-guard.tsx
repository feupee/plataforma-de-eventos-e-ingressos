"use client";

import { type ReactNode, useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

import type { UserRole } from "@/lib/api/auth";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

function getHomeByRole(role: UserRole) {
  if (role === "ORGANIZER") {
    return "/organizador";
  }

  if (role === "GATE") {
    return "/portaria";
  }

  return "/cliente";
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();

  const { user, loading } = useAuth();

  const isAllowed = !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");

      return;
    }

    if (!isAllowed) {
      router.replace(getHomeByRole(user.role));
    }
  }, [loading, user, isAllowed, router]);

  if (loading || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }

  return children;
}
