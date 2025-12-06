import { MetricsCards } from "./components/MetricsCards";
import { OrionCharts } from "./components/OrionCharts";
import { RecentActivities } from "./components/RecentActivities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Component, type ErrorInfo, type ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
          <h3 className="font-semibold mb-2">Something went wrong loading the dashboard</h3>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Ringkasan jam pelatihan dan status kepatuhan Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="shadow-sm">
              <Link to="/certificates/input">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Sertifikat Baru
              </Link>
            </Button>
          </div>
        </div>

        <MetricsCards />
        
        <OrionCharts />

        <div className="grid gap-4 md:grid-cols-1">
          <RecentActivities />
        </div>
      </div>
    </ErrorBoundary>
  );
}
