import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Target, TrendingUp, Clock, Award } from "lucide-react";
import type { ReportSummary } from "@/types/report";

interface SummaryCardsProps {
  summary: ReportSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_employees || 0}</div>
          <p className="text-xs text-muted-foreground">Aktif dalam organisasi</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sertifikat</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_certificates || 0}</div>
          <p className="text-xs text-muted-foreground">Disubmit tahun ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total JPL</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_jpl_hours || 0} jam</div>
          <p className="text-xs text-muted-foreground">Akumulasi seluruh pegawai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rata-rata JPL</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(summary.average_jpl_per_employee || 0).toFixed(1)} jam</div>
          <p className="text-xs text-muted-foreground">Per pegawai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Tahunan</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.yearly_target || 0} jam</div>
          <p className="text-xs text-muted-foreground">Kuartalan: {summary.quarterly_target || 0} jam</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pencapaian</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.target_achievement_rate || 0}%</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(((summary.target_achievement_rate || 0) / 100) * (summary.total_employees || 0))} dari {summary.total_employees || 0} pegawai
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
