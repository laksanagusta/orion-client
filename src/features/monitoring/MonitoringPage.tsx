import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import { reportService } from "@/services/reportService";
import type { ManagerReportData } from "@/types/report";

import { SummaryCards } from "./components/SummaryCards";
import { MonitorCharts } from "./components/MonitorCharts";
import { EmployeeLists } from "./components/EmployeeLists";

export default function MonitoringPage() {
  const [data, setData] = useState<ManagerReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getManagerReport({
        year: new Date().getFullYear(),
      });
      setData(response.data);
    } catch (error) {
      console.error("Failed to load monitoring data:", error);
      toast({
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil data laporan terbaru.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat analitik...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-muted-foreground">Data tidak tersedia.</p>
        <Button onClick={loadData}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Monitoring & Evaluasi</h2>
          <p className="text-muted-foreground">
            {data.report_metadata?.report_period || `Tahun ${data.summary.year}`}
            {data.summary.quarter && ` - Q${data.summary.quarter}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground hidden md:block">
            Data per: {data.report_metadata?.data_as_of ? new Date(data.report_metadata.data_as_of).toLocaleString('id-ID') : '-'}
          </p>
          <Button variant="outline" size="icon" onClick={loadData} title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <SummaryCards summary={data.summary} />

      <MonitorCharts 
        monthlyTrend={data.monthly_trend || []} 
        quarterlyTrend={data.quarterly_trend || []}
        distribution={data.training_distribution || []}
        verification={data.verification_status || { total_certificates: 0, verified: 0, pending_verification: 0, verification_rate: 0 }}
        topInstitutions={data.top_institutions || []}
        topTrainings={data.top_trainings || []}
      />

      <EmployeeLists 
        performance={data.employee_performance || []} 
        atRisk={data.at_risk_employees || []} 
      />
    </div>
  );
}
