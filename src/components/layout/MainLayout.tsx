import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

export function MainLayout() {
  const { user, token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!user && token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session:", error);
          logout();
        }
      }
    };

    initAuth();
  }, [user, token, setUser, logout]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-64">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
