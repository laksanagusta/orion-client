import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
}

export function PermissionGuard({ children, resource, action }: PermissionGuardProps) {
  const { user, isLoading, token } = useAuthStore();

  // Show loading while fetching user profile
  if (isLoading || (!user && token)) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Checking permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = user.permissions?.some(
    (p) => p.resource === resource && p.action === action
  );

  if (!hasPermission) {
    // Using useEffect to show toast to avoid render side-effects
    // Wrapped in a component or simpler: just redirect.
    // Let's redirect to dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
