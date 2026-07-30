"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/metadata-context";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user) {
      setRolesLoading(true);
      if (!db) {
        setUserRoles(["contributor"]);
        setRolesLoading(false);
        return;
      }
      getDoc(doc(db, "users", user.uid))
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const roles = Array.isArray(data.roles) ? data.roles : ["contributor"];
            setUserRoles(roles);
          } else {
            setUserRoles(["contributor"]);
          }
        })
        .catch(() => setUserRoles(["contributor"]))
        .finally(() => setRolesLoading(false));
    }
  }, [user, loading, router]);

  if (loading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasRole = userRoles.some((r) => roles.includes(r) || r === "admin");

  if (!hasRole) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-white">Access Denied</p>
          <p className="mt-2 text-sm text-muted">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
