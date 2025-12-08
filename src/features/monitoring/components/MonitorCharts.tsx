import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, LabelList
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TrendData, DistributionData, VerificationStatus } from "@/types/report";
import { AlertCircle } from "lucide-react";

interface MonitorChartsProps {
  monthlyTrend: TrendData[];
  quarterlyTrend: TrendData[];
  distribution: DistributionData[];
  verification: VerificationStatus;
  topInstitutions: DistributionData[];
  topTrainings: DistributionData[];
}

const VERIFY_COLORS = ['#22c55e', '#f59e0b'];
const QUARTER_COLORS = ['#3B82F6', '#22c55e', '#f59e0b', '#ef4444'];

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {value > 0 ? value : ''}
    </text>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
    <AlertCircle className="w-4 h-4 mr-2" />
    {message}
  </div>
);

export function MonitorCharts({ monthlyTrend, quarterlyTrend, distribution, verification, topInstitutions, topTrainings }: MonitorChartsProps) {
  
  const verificationData = [
    { name: 'Terverifikasi', value: verification?.verified || 0 },
    { name: 'Menunggu', value: verification?.pending_verification || 0 },
  ];

  // Normalize monthly trend data - handle various field name formats from API
  const normalizedMonthlyTrend = (monthlyTrend || []).map((item: any) => ({
    period: item.period || item.month || item.name || item.label || '',
    jpl: item.jpl || item.total_jpl || item.jpl_hours || item.total_jpl_hours || item.value || 0,
    certificates: item.certificates || item.total_certificates || item.count || 0,
  }));

  // Normalize quarterly trend data
  const normalizedQuarterlyTrend = (quarterlyTrend || []).map((item: any) => ({
    period: item.period || item.quarter || item.name || item.label || '',
    jpl: item.jpl || item.total_jpl || item.jpl_hours || item.total_jpl_hours || item.value || 0,
    certificates: item.certificates || item.total_certificates || item.count || 0,
  }));

  // Normalize distribution data
  const normalizedDistribution = (distribution || []).map((item: any) => ({
    name: item.name || item.type || item.label || item.category || '',
    value: item.value || item.count || item.total || 0,
  }));

  const hasMonthlyData = normalizedMonthlyTrend.length > 0 && normalizedMonthlyTrend.some((d: any) => d.jpl > 0 || d.period);
  const hasQuarterlyData = normalizedQuarterlyTrend.length > 0 && normalizedQuarterlyTrend.some((d: any) => d.jpl > 0 || d.period);
  const hasDistributionData = normalizedDistribution.length > 0 && normalizedDistribution.some((d: any) => d.value > 0);
  const hasInstitutionData = topInstitutions && topInstitutions.length > 0;
  const hasTrainingData = topTrainings && topTrainings.length > 0;

  // Debug log
  console.log('Monthly Trend Data:', monthlyTrend);
  console.log('Normalized Monthly:', normalizedMonthlyTrend);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Monthly Trend Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Tren JPL Bulanan</CardTitle>
          <CardDescription>Akumulasi jam pelajaran per bulan ({normalizedMonthlyTrend.length} data points)</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={normalizedMonthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJpl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}j`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Area type="monotone" dataKey="jpl" name="JPL" stroke="#2563EB" fillOpacity={1} fill="url(#colorJpl)">
                  <LabelList dataKey="jpl" position="top" offset={10} style={{ fontSize: '10px', fill: '#6B7280' }} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Belum ada data tren bulanan" />
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Status Verifikasi</CardTitle>
          <CardDescription>Total: {verification?.total_certificates || 0} sertifikat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {verificationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={VERIFY_COLORS[index % VERIFY_COLORS.length]} />
                  ))}
                  <LabelList dataKey="value" position="inside" content={renderCustomizedLabel} />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-6 text-center bg-secondary/10 p-3 rounded-lg">
             <div>
                <div className="text-lg font-bold text-green-600">{verification?.verified || 0}</div>
                <div className="text-xs text-muted-foreground">Terverifikasi</div>
             </div>
             <div>
                <div className="text-lg font-bold text-amber-600">{verification?.pending_verification || 0}</div>
                <div className="text-xs text-muted-foreground">Menunggu</div>
             </div>
             <div>
                <div className="text-lg font-bold text-primary">{verification?.verification_rate || 0}%</div>
                <div className="text-xs text-muted-foreground">Rate</div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Trend */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Tren Kuartalan</CardTitle>
          <CardDescription>Performa JPL per kuartal ({normalizedQuarterlyTrend.length} data points)</CardDescription>
        </CardHeader>
        <CardContent>
          {hasQuarterlyData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={normalizedQuarterlyTrend} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="jpl" name="JPL" radius={[4, 4, 0, 0]} barSize={40}>
                  {normalizedQuarterlyTrend.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={QUARTER_COLORS[index % QUARTER_COLORS.length]} />
                  ))}
                  <LabelList dataKey="jpl" position="top" style={{ fill: '#374151', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Belum ada data kuartalan" />
          )}
        </CardContent>
      </Card>
      
      {/* Training Distribution */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Distribusi Jenis Pelatihan</CardTitle>
          <CardDescription>Sebaran sertifikat berdasarkan tipe ({normalizedDistribution.length} tipe)</CardDescription>
        </CardHeader>
        <CardContent>
          {hasDistributionData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={normalizedDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="value" name="Jumlah" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="value" position="right" style={{ fill: '#374151', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Belum ada data distribusi pelatihan" />
          )}
        </CardContent>
      </Card>

      {/* Top Institutions */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top Institusi</CardTitle>
          <CardDescription>Penyelenggara pelatihan terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          {hasInstitutionData ? (
            <div className="space-y-3">
              {topInstitutions.slice(0, 5).map((inst, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="truncate max-w-[180px]" title={inst.name}>{inst.name}</span>
                  </div>
                  <span className="font-bold bg-secondary px-2 py-0.5 rounded text-xs">{inst.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada data institusi" />
          )}
        </CardContent>
      </Card>

      {/* Top Trainings */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Top Pelatihan</CardTitle>
          <CardDescription>Nama pelatihan yang paling banyak diikuti</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrainingData ? (
            <div className="space-y-3">
              {topTrainings.slice(0, 5).map((tr, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="truncate max-w-[250px]" title={tr.name}>{tr.name}</span>
                  </div>
                  <span className="font-bold bg-secondary px-2 py-0.5 rounded text-xs">{tr.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada data pelatihan" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
