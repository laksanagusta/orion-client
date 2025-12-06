import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreHorizontal, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { certificateService } from "@/services/certificateService";
import type { Certificate } from "@/types/certificate";
import { format } from "date-fns";

export function RecentActivities() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await certificateService.list({ page: 1, limit: 5 });
        if (Array.isArray(response.data)) {
          setCertificates(response.data);
        } else {
          console.warn("RecentActivities: API returned non-array data:", response);
          setCertificates([]);
        }
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const getStatusBadge = (cert: Certificate) => {
    if (cert.is_verified) {
      return <Badge variant="success">Terverifikasi</Badge>;
    }
    return <Badge variant="warning">Menunggu</Badge>;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sertifikat Terbaru</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
          <Link to="/certificates/list">Lihat Semua</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada sertifikat.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/certificates/input">Tambah sertifikat pertama Anda</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-start justify-between group">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-secondary rounded-md">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{cert.training_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{cert.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(cert.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(cert)}
                  <div className="text-sm font-medium w-8 text-right">{cert.jpl_hours}j</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
