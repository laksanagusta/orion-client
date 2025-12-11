import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Award } from "lucide-react";
import type { EmployeePerformance, AtRiskEmployee } from "@/types/report";

interface EmployeeListsProps {
  performance: EmployeePerformance[];
  atRisk: AtRiskEmployee[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'achieved':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Tercapai</Badge>;
    case 'on_track':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">On Track</Badge>;
    case 'lagging':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Tertinggal</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function EmployeeLists({ performance, atRisk }: EmployeeListsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Performa (JPL)
          </CardTitle>
          <CardDescription>Peringkat pegawai berdasarkan total jam pelajaran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {performance && performance.length > 0 ? (
            performance.slice(0, 10).map((employee, index) => (
              <div key={employee.user_id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {employee.rank || index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{employee.full_name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{employee.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{employee.employee_id}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-primary">{employee.total_jpl || 0} JPL</div>
                  <div className="text-xs text-muted-foreground">{employee.progress?.toFixed(0) || 0}%</div>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(employee.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Award className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Belum ada data performa pegawai.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* At Risk Employees */}
      <Card className="border-red-100 bg-red-50/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Perlu Perhatian
          </CardTitle>
          <CardDescription>Pegawai berisiko tidak mencapai target tahunan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {atRisk && atRisk.length > 0 ? (
            atRisk.slice(0, 10).map((employee, index) => (
              <div key={employee.user_id || index} className="space-y-2 p-2 rounded-lg bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-red-100 text-red-700">{employee.full_name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium">{employee.full_name || 'Unknown'}</span>
                      <p className="text-xs text-muted-foreground">{employee.employee_id}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 shrink-0">
                    -{employee.shortage || 0} JPL
                  </Badge>
                </div>
                <Progress 
                  value={employee.target > 0 ? ((employee.current_jpl || 0) / employee.target) * 100 : 0} 
                  className="h-2 bg-red-100" 
                  indicatorClassName="bg-red-500" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{employee.current_jpl || 0} JPL tercapai</span>
                  <span className="font-medium text-red-600">{employee.days_remaining || 0} hari tersisa</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-green-600">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="font-medium">Semua Aman!</p>
              <p className="text-sm text-green-600/80">Tidak ada pegawai berisiko saat ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
