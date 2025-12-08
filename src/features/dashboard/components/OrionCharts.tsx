import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardStats } from "@/types/dashboard";

export function OrionCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const year = new Date().getFullYear();
        const response = await dashboardService.getStats({ year });
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Default data for loading/error state
  const monthlyData = stats?.monthly_progress.map(item => ({
    month: item.month,
    jpl: item.total_jpl
  })) || [
    { month: "Jan", jpl: 0 },
    { month: "Feb", jpl: 0 },
    { month: "Mar", jpl: 0 },
    { month: "Apr", jpl: 0 },
    { month: "May", jpl: 0 },
    { month: "Jun", jpl: 0 },
    { month: "Jul", jpl: 0 },
    { month: "Aug", jpl: 0 },
    { month: "Sep", jpl: 0 },
    { month: "Oct", jpl: 0 },
    { month: "Nov", jpl: 0 },
    { month: "Dec", jpl: 0 },
  ];

  const typeData = stats?.by_type.map(item => ({
    type: item.type,
    jpl: item.total_jpl
  })) || [
    { type: "Klasikal", jpl: 0 },
    { type: "Non-Klasikal", jpl: 0 },
    { type: "Pendidikan", jpl: 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className={`col-span-4 shadow-sm ${isLoading ? 'animate-pulse' : ''}`}>
        <CardHeader>
          <CardTitle>Progres JPL (Tahunan)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}j`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#111827' }}
              />
              <Line
                type="monotone"
                dataKey="jpl"
                name="Jam"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className={`col-span-3 shadow-sm ${isLoading ? 'animate-pulse' : ''}`}>
        <CardHeader>
          <CardTitle>JPL Berdasarkan Tipe</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="type" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}j`} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="jpl" name="Jam" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
