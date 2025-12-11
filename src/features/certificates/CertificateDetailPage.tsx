import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertTriangle,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { certificateService } from "@/services/certificateService";
import { getApiUrl } from "@/lib/config";
import type { Certificate } from "@/types/certificate";

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) {
        setError("ID sertifikat tidak valid");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await certificateService.getById(id);
        setCertificate(response.data);
      } catch (err) {
        console.error("Failed to fetch certificate:", err);
        setError("Gagal memuat detail sertifikat. Silakan coba lagi.");
        toast({
          title: "Error",
          description: "Gagal memuat detail sertifikat.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [id, toast]);

  const getFileUrl = (filePath: string) => {
    const apiUrl = getApiUrl();
    return `${apiUrl}/api/v1/files/${filePath}`;
  };

  const handleViewDocument = () => {
    if (certificate?.file_path) {
      window.open(getFileUrl(certificate.file_path), "_blank");
    }
  };

  const handleDownload = () => {
    if (certificate?.file_path) {
      const link = document.createElement("a");
      link.href = getFileUrl(certificate.file_path);
      link.download = certificate.file_name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = certificate?.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat detail sertifikat...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "Sertifikat tidak ditemukan"}
            </p>
            <Button onClick={() => navigate("/certificates/list")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/certificates/list")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detail Sertifikat</h2>
            <p className="text-muted-foreground">
              Informasi lengkap sertifikat pelatihan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleViewDocument} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Lihat Dokumen</span>
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span>
          </Button>
        </div>
      </div>

      {/* Main Card - Similar to CertificateEntryCardV2 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-primary/10 text-primary">
              {isImage ? (
                <img
                  src={getFileUrl(certificate.file_path)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-medium truncate max-w-[300px]">
                {certificate.training_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                {certificate.is_verified ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Terverifikasi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <XCircle className="w-3 h-3" />
                    Menunggu Verifikasi
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant={certificate.is_verified ? "success" : "warning"}>
            {certificate.jpl_hours} JPL
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Document Preview Section */}
          <div className="space-y-2">
            <Label>Dokumen Sertifikat</Label>
            <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/20 group">
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage ? (
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-background border flex-shrink-0">
                    <img
                      src={getFileUrl(certificate.file_path)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-medium truncate max-w-[300px]">
                    {certificate.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Klik untuk melihat dokumen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleViewDocument}
                  title="Lihat Dokumen"
                >
                  {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Form Fields - Read Only */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label>Nama Pelatihan</Label>
              <Input value={certificate.training_name} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Institusi</Label>
              <Input value={certificate.institution} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Nomor Sertifikat</Label>
              <Input value={certificate.certificate_number} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Tipe</Label>
              <Input value={certificate.type} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Subtipe</Label>
              <Input value={certificate.sub_type} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input value={certificate.start_date} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input value={certificate.end_date} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Tahun</Label>
              <Input value={certificate.year.toString()} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Jam JPL</Label>
              <Input value={certificate.jpl_hours.toString()} disabled readOnly />
            </div>
          </div>

          {/* Verification Notes */}
          {certificate.verification_notes && (
            <div className="space-y-2">
              <Label>Catatan Verifikasi</Label>
              <Input value={certificate.verification_notes} disabled readOnly />
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Dibuat pada:</span>{" "}
                {new Date(certificate.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="font-medium">Diperbarui pada:</span>{" "}
                {new Date(certificate.updated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" asChild>
              <Link to="/certificates/list">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Edit2 className="w-4 h-4" />
              Edit (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
