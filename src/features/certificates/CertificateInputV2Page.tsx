import { useState, useCallback, useEffect } from "react";
import { Plus, Loader2, AlertTriangle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedDropzone } from "./components/UnifiedDropzone";
import {
  CertificateEntryCardV2,
  type CertificateEntryV2,
} from "./components/CertificateEntryCardV2";
import { certificateService } from "@/services/certificateService";
import { defaultFormValues, type CertificateFormValues } from "./schema";
import type { CertificateTypeItem } from "@/types/certificate";

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parse Indonesian date format to ISO format (YYYY-MM-DD)
 */
const parseToISODate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const indonesianMonths: Record<string, string> = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };

  const parts = dateStr.toLowerCase().trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const monthName = parts[1];
    const year = parts[2];

    const month = indonesianMonths[monthName];
    if (month && /^\d{4}$/.test(year)) {
      return `${year}-${month}-${day}`;
    }
  }

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // Ignore parse errors
  }

  console.warn(`Could not parse date: "${dateStr}"`);
  return dateStr;
};

export default function CertificateInputV2Page() {
  const [entries, setEntries] = useState<CertificateEntryV2[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<CertificateTypeItem[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const { toast } = useToast();

  // Load certificate types on mount
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const response = await certificateService.getTypes();
        setCertificateTypes(response.data.types || []);
      } catch (error) {
        console.error("Failed to load certificate types:", error);
        toast({
          title: "Error",
          description: "Gagal memuat tipe sertifikat. Silakan refresh halaman.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTypes(false);
      }
    };
    loadTypes();
  }, [toast]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      entries.forEach((entry) => {
        URL.revokeObjectURL(entry.blobUrl);
      });
    };
  }, []);

  const handleDrop = useCallback(
    (rawFiles: File[]) => {
      const MAX_SIZE = 1024 * 1024; // 1MB
      const files: File[] = [];
      const invalidFiles: File[] = [];

      rawFiles.forEach((file) => {
        if (file.size <= MAX_SIZE) {
          files.push(file);
        } else {
          invalidFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast({
          title: "File Terlalu Besar",
          description: `${invalidFiles.length} file melebihi batas 1MB dan tidak diproses.`,
          variant: "destructive",
        });
      }

      if (files.length === 0) return;

      // Create entries with local blob URLs
      const newEntries: CertificateEntryV2[] = files.map((file) => ({
        id: generateId(),
        file,
        blobUrl: URL.createObjectURL(file),
        status: "pending" as const,
      }));

      setEntries((prev) => [...newEntries, ...prev]);
    },
    [toast]
  );

  const handleExtract = async (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Set status to extracting
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: "extracting" as const } : e))
    );

    try {
      const response = await certificateService.extractOnly([entry.file]);

      if (response.data.results.length > 0) {
        const result = response.data.results[0];

        if (result.success) {
          const extracted = result.extracted;
          const formData: CertificateFormValues = {
            training_name: extracted.training_name || "",
            institution: extracted.institution || "",
            certificate_number: extracted.certificate_number || "",
            year: extracted.year || new Date().getFullYear(),
            start_date: parseToISODate(extracted.start_date),
            end_date: parseToISODate(extracted.end_date),
            jpl_hours: extracted.jpl_hours || 0,
            type: extracted.type || "",
            sub_type: extracted.sub_type || "",
          };

          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? {
                    ...e,
                    status: "ready" as const,
                    data: formData,
                    isExtracted: true,
                  }
                : e
            )
          );

          toast({
            title: "Ekstraksi Berhasil",
            description: `Data berhasil diekstrak dari ${result.file_name}`,
          });
        } else {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? {
                    ...e,
                    status: "error" as const,
                    error: result.error || "Gagal mengekstrak data",
                  }
                : e
            )
          );

          toast({
            title: "Ekstraksi Gagal",
            description: result.error || "Gagal mengekstrak data dari file",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Extraction failed:", error);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                status: "error" as const,
                error: "Gagal mengekstrak data dari file",
              }
            : e
        )
      );

      toast({
        title: "Ekstraksi Gagal",
        description: "Terjadi kesalahan saat mengekstrak data. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleAddManual = () => {
    // Create a file input to select a file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 1024 * 1024) {
          toast({
            title: "File Terlalu Besar",
            description: "File melebihi batas 1MB.",
            variant: "destructive",
          });
          return;
        }

        const newEntry: CertificateEntryV2 = {
          id: generateId(),
          file,
          blobUrl: URL.createObjectURL(file),
          status: "ready",
          data: { ...defaultFormValues },
        };
        setEntries((prev) => [newEntry, ...prev]);
      }
    };
    input.click();
  };

  const handleRemoveEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      URL.revokeObjectURL(entry.blobUrl);
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveEntry = async (id: string, data: CertificateFormValues) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    // If entry is pending, just set it to ready with the form data
    if (entry.status === "pending") {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "ready" as const, data } : e
        )
      );
      return;
    }

    // Mark as saving
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "saving" as const } : e))
    );

    try {
      // Upload file and save form data
      await certificateService.create({
        file: entry.file,
        training_name: data.training_name,
        institution: data.institution,
        certificate_number: data.certificate_number,
        year: data.year,
        start_date: data.start_date,
        end_date: data.end_date,
        jpl_hours: data.jpl_hours,
        type: data.type,
        sub_type: data.sub_type,
      });

      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "saved" as const, data } : e
        )
      );

      toast({
        title: "Tersimpan",
        description: `Sertifikat "${data.training_name}" berhasil disimpan.`,
      });
    } catch (error) {
      console.error("Save failed:", error);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "ready" as const } : e))
      );
      toast({
        title: "Gagal Menyimpan",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan sertifikat. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleExtractAll = async () => {
    const pendingEntries = entries.filter((e) => e.status === "pending");
    if (pendingEntries.length === 0) return;

    // Process each pending entry
    for (const entry of pendingEntries) {
      await handleExtract(entry.id);
    }
  };

  const handleSaveAll = async () => {
    const readyEntries = entries.filter((e) => e.status === "ready" && e.data);
    if (readyEntries.length === 0) {
      toast({
        title: "Tidak Ada Entri untuk Disimpan",
        description: "Semua entri sudah disimpan atau belum siap.",
      });
      return;
    }

    setIsSavingAll(true);

    try {
      for (const entry of readyEntries) {
        if (!entry.data) continue;
        await handleSaveEntry(entry.id, entry.data);
      }

      toast({
        title: "Semua Entri Disimpan",
        description: `Berhasil menyimpan ${readyEntries.length} sertifikat.`,
      });
    } catch (error) {
      console.error("Save all failed:", error);
      toast({
        title: "Gagal Menyimpan",
        description: "Beberapa sertifikat gagal disimpan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const readyCount = entries.filter((e) => e.status === "ready").length;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Input Sertifikat (Flow Baru)
          </h2>
          <p className="text-muted-foreground">
            Unggah file sertifikat, lalu ekstrak data atau isi manual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddManual}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah File
          </Button>
          {readyCount > 0 && (
            <Button onClick={handleSaveAll} disabled={isSavingAll}>
              {isSavingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                `Simpan Semua (${readyCount})`
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2 text-amber-800 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <p>
          File disimpan sementara di browser. Klik "Ekstrak Data" untuk
          ekstraksi otomatis atau isi form secara manual.
        </p>
      </div>

      <UnifiedDropzone onDrop={handleDrop} />

      {pendingCount > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleExtractAll} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Ekstrak Semua ({pendingCount} File)
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {entries.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-lg font-semibold">Entries ({entries.length})</h2>
          </div>
        )}

        {isLoadingTypes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Memuat tipe sertifikat...
            </span>
          </div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry) => (
              <CertificateEntryCardV2
                key={entry.id}
                entry={entry}
                certificateTypes={certificateTypes}
                onRemove={handleRemoveEntry}
                onSave={handleSaveEntry}
                onExtract={handleExtract}
              />
            ))}

            {entries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border">
                <p>
                  Belum ada file. Unggah file atau klik "Tambah File" untuk
                  memulai.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
