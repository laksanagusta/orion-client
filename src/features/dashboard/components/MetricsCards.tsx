import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardStats } from "@/types/dashboard";

interface Metric {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  description: string;
  status?: "success" | "warning" | "danger" | "neutral";
}

export function MetricsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const year = new Date().getFullYear();
        const response = await dashboardService.getStats({ year });
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-secondary rounded w-24"></div>
              <div className="h-4 w-4 bg-secondary rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-secondary rounded w-16 mb-2"></div>
              <div className="h-3 bg-secondary rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">{error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  // Constants
  const TARGET_JPL = 20;

  // Calculate derived metrics
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentQuarterData = stats.by_quarter.find(q => q.quarter === currentQuarter);
  const currentQuarterJpl = currentQuarterData?.total_jpl || 0;
  const quarterTarget = TARGET_JPL / 4;
  
  const remainingJpl = Math.max(0, TARGET_JPL - stats.total_jpl);
  
  // Determine compliance status
  let complianceStatus: 'success' | 'warning' | 'danger' = 'success';
  let complianceText = 'Sesuai Target';
  let complianceDesc = 'Memenuhi semua persyaratan';
  
  const expectedProgress = (new Date().getMonth() + 1) / 12 * TARGET_JPL;
  
  if (stats.total_jpl >= TARGET_JPL) {
    complianceStatus = 'success';
    complianceText = 'Selesai';
    complianceDesc = 'Target tahunan tercapai';
  } else if (stats.total_jpl >= expectedProgress) {
    complianceStatus = 'success';
    complianceText = 'Sesuai Target';
    complianceDesc = 'Memenuhi target bulanan';
  } else if (stats.total_jpl >= expectedProgress * 0.7) {
    complianceStatus = 'warning';
    complianceText = 'Berisiko';
    complianceDesc = 'Sedikit tertinggal dari jadwal';
  } else {
    complianceStatus = 'danger';
    complianceText = 'Tertinggal';
    complianceDesc = 'Perlu tindakan segera';
  }

  const metrics: Metric[] = [
    {
      title: `Total JPL (${stats.year})`,
      value: stats.total_jpl,
      change: `Target: ${TARGET_JPL} JPL`,
      trend: stats.total_jpl >= TARGET_JPL ? "up" : "neutral",
      icon: Clock,
      description: "Total jam pelatihan terakumulasi",
      status: "neutral",
    },
    {
      title: `JPL Kuartal Ini (Q${currentQuarter})`,
      value: currentQuarterJpl,
      change: `Target: ${Math.round(quarterTarget)} JPL`,
      trend: currentQuarterJpl >= quarterTarget ? "up" : "neutral",
      icon: Target,
      description: "Progres kuartal saat ini",
      status: currentQuarterJpl >= quarterTarget ? "success" : "warning",
    },
    {
      title: "Status Kepatuhan",
      value: complianceText,
      icon: CheckCircle,
      description: complianceDesc,
      status: complianceStatus,
    },
    {
      title: "Sisa Kebutuhan",
      value: remainingJpl,
      change: "Batas waktu 31 Des",
      trend: remainingJpl > 0 ? "down" : "up",
      icon: AlertTriangle,
      description: "Untuk memenuhi target tahunan",
      status: remainingJpl > 10 ? "danger" : 
              remainingJpl > 0 ? "warning" : "success",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 text-muted-foreground ${
                metric.status === 'success' ? 'text-green-500' :
                metric.status === 'warning' ? 'text-amber-500' :
                metric.status === 'danger' ? 'text-red-500' : ''
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {metric.trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
              {metric.trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
              {metric.change && <span>{metric.change}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-2 opacity-70">
                {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
