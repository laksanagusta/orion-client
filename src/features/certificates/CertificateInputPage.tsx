import { useState, useCallback, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedDropzone } from "./components/UnifiedDropzone";
import { CertificateEntryCard, type CertificateEntry } from "./components/CertificateEntryCard";
import { certificateService } from "@/services/certificateService";
import { defaultFormValues, type CertificateFormValues } from "./schema";
import type { CertificateTypeItem, ExtractedCertificate, BatchSaveCertificateItem } from "@/types/certificate";

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parse Indonesian date format to ISO format (YYYY-MM-DD)
 * Supports formats like: "5 Agustus 2025", "19 Juni 2025", etc.
 * Also handles ISO format (passes through) and other common formats.
 */
const parseToISODate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "";
  
  // If already in ISO format (YYYY-MM-DD), return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Indonesian month names to month numbers
  const indonesianMonths: Record<string, string> = {
    'januari': '01',
    'februari': '02',
    'maret': '03',
    'april': '04',
    'mei': '05',
    'juni': '06',
    'juli': '07',
    'agustus': '08',
    'september': '09',
    'oktober': '10',
    'november': '11',
    'desember': '12',
  };
  
  // Try to parse Indonesian format: "5 Agustus 2025" or "19 Juni 2025"
  const parts = dateStr.toLowerCase().trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthName = parts[1];
    const year = parts[2];
    
    const month = indonesianMonths[monthName];
    if (month && /^\d{4}$/.test(year)) {
      return `${year}-${month}-${day}`;
    }
  }
  
  // Try to parse with Date object as fallback
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parse errors
  }
  
  // Return original string if we can't parse it
  console.warn(`Could not parse date: "${dateStr}"`);
  return dateStr;
};

export default function CertificateInputPage() {
  const [entries, setEntries] = useState<CertificateEntry[]>([]);
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
          description: "Failed to load certificate types. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTypes(false);
      }
    };
    loadTypes();
  }, [toast]);

  const handleDrop = useCallback(async (files: File[]) => {
    // Create entries with uploading status
    const newEntries: CertificateEntry[] = files.map((file) => ({
      id: generateId(),
      file,
      status: 'uploading',
      progress: 0,
    }));

    setEntries((prev) => [...newEntries, ...prev]);

    // Upload files to API for AI extraction
    try {
      // Update status to extracting
      setEntries((prev) =>
        prev.map((e) =>
          newEntries.some((ne) => ne.id === e.id)
            ? { ...e, status: 'extracting', progress: 50 }
            : e
        )
      );

      const response = await certificateService.extract(files);

      // Log the full API response for debugging
      console.log("Full extract API response:", JSON.stringify(response, null, 2));

      // Map extracted data back to entries - build update map first to avoid race conditions
      const extractedDataMap = new Map<string, { formData: CertificateFormValues; temp_id: string; file_url: string }>();
      
      response.data.results.forEach((extracted: ExtractedCertificate, index: number) => {
        const entryId = newEntries[index]?.id;
        if (!entryId) return;

        // Log the raw extracted item for debugging
        console.log("Raw extracted item:", JSON.stringify(extracted, null, 2));
        
        // Extract the data - handle both snake_case and camelCase field names
        const extractedItem = extracted.extracted as Record<string, unknown>;
        
        const formData: CertificateFormValues = {
          training_name: (extractedItem.training_name || extractedItem.trainingName || "") as string,
          institution: (extractedItem.institution || "") as string,
          certificate_number: (extractedItem.certificate_number || extractedItem.certificateNumber || "") as string,
          year: (extractedItem.year || new Date().getFullYear()) as number,
          // Parse Indonesian date format to ISO format for HTML date inputs
          start_date: parseToISODate((extractedItem.start_date || extractedItem.startDate || "") as string),
          end_date: parseToISODate((extractedItem.end_date || extractedItem.endDate || "") as string),
          jpl_hours: (extractedItem.jpl_hours || extractedItem.jplHours || 0) as number,
          type: (extractedItem.type || "") as string,
          sub_type: (extractedItem.sub_type || extractedItem.subtype || extractedItem.subType || "") as string,
        };
        
        // Log extracted data for debugging
        console.log("Mapped formData for entry", entryId, ":", formData);

        extractedDataMap.set(entryId, {
          formData,
          temp_id: extracted.temp_id,
          file_url: extracted.file_url,
        });
      });

      // Batch update all entries at once to avoid race conditions
      setEntries((prev) =>
        prev.map((e) => {
          const extractedInfo = extractedDataMap.get(e.id);
          if (extractedInfo) {
            return {
              ...e,
              status: 'ready',
              progress: 100,
              data: extractedInfo.formData,
              temp_id: extractedInfo.temp_id,
              file_url: extractedInfo.file_url,
            };
          }
          return e;
        })
      );

      toast({
        title: "Extraction Complete",
        description: `Successfully extracted details from ${files.length} file(s).`,
      });
    } catch (error) {
      console.error("Extraction failed:", error);
      // Mark all new entries as error
      setEntries((prev) =>
        prev.map((e) =>
          newEntries.some((ne) => ne.id === e.id)
            ? { ...e, status: 'error', error: "Failed to extract data from file" }
            : e
        )
      );
      toast({
        title: "Extraction Failed",
        description: "Failed to extract certificate data. Please try again or add manually.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAddManual = () => {
    const newEntry: CertificateEntry = {
      id: generateId(),
      status: 'ready',
      progress: 100,
      data: { ...defaultFormValues },
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleRemoveEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    
    // If entry has temp_id, we should discard it on the server
    if (entry?.temp_id) {
      // We'll handle this during batch save, just remove from UI for now
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleUpdateEntry = (id: string, data: Partial<CertificateEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  };

  const handleSaveEntry = async (id: string, data: CertificateFormValues) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    // Mark as saving
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'saving' } : e))
    );

    try {
      if (entry.temp_id) {
        // Use batch save for extracted entries
        const saveItem: BatchSaveCertificateItem = {
          temp_id: entry.temp_id,
          file_name: entry.file?.name || "certificate.pdf",
          training_name: data.training_name,
          institution: data.institution,
          certificate_number: data.certificate_number,
          year: data.year,
          start_date: data.start_date,
          end_date: data.end_date,
          jpl_hours: data.jpl_hours,
          type: data.type,
          sub_type: data.sub_type,
        };

        await certificateService.batchSave({
          save: [saveItem],
          discard: [],
        });
      } else if (entry.file) {
        // Use manual create for entries with file but no temp_id
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
      } else {
        // Manual entry without file - we need to handle this
        // For now, show error as file is required
        throw new Error("Certificate file is required");
      }

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'saved', data } : e))
      );

      toast({
        title: "Entry Saved",
        description: `Certificate "${data.training_name}" saved successfully.`,
      });
    } catch (error) {
      console.error("Save failed:", error);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'ready' } : e))
      );
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAll = async () => {
    const readyEntries = entries.filter((e) => e.status === 'ready' && e.data);
    if (readyEntries.length === 0) {
      toast({
        title: "Tidak Ada Entri untuk Disimpan",
        description: "Semua entri sudah disimpan atau belum siap.",
      });
      return;
    }

    setIsSavingAll(true);

    // Separate entries with temp_id (batch save) and without (manual create)
    const batchEntries = readyEntries.filter((e) => e.temp_id);
    const manualEntries = readyEntries.filter((e) => !e.temp_id && e.file);

    try {
      // Batch save extracted entries
      if (batchEntries.length > 0) {
        const saveItems: BatchSaveCertificateItem[] = batchEntries.map((entry) => ({
          temp_id: entry.temp_id!,
          file_name: entry.file?.name || "certificate.pdf",
          training_name: entry.data!.training_name,
          institution: entry.data!.institution,
          certificate_number: entry.data!.certificate_number,
          year: entry.data!.year,
          start_date: entry.data!.start_date,
          end_date: entry.data!.end_date,
          jpl_hours: entry.data!.jpl_hours,
          type: entry.data!.type,
          sub_type: entry.data!.sub_type,
        }));

        await certificateService.batchSave({
          save: saveItems,
          discard: [],
        });

        // Mark batch entries as saved
        setEntries((prev) =>
          prev.map((e) =>
            batchEntries.some((be) => be.id === e.id)
              ? { ...e, status: 'saved' }
              : e
          )
        );
      }

      // Save manual entries one by one
      for (const entry of manualEntries) {
        if (!entry.file || !entry.data) continue;
        
        await certificateService.create({
          file: entry.file,
          ...entry.data,
        });

        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: 'saved' } : e))
        );
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

  const readyCount = entries.filter((e) => e.status === 'ready').length;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Input Sertifikat</h2>
          <p className="text-muted-foreground">
            Unggah dokumen sertifikat Anda untuk diekstrak secara otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddManual}>
            <Plus className="mr-2 h-4 w-4" />
            Input Manual
          </Button>
          {entries.some((e) => e.status === 'ready') && (
            <Button onClick={handleSaveAll} disabled={isSavingAll}>
              {isSavingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Semua"
              )}
            </Button>
          )}
        </div>
      </div>

      <UnifiedDropzone onDrop={handleDrop} />

      <div className="space-y-4">
        {entries.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-lg font-semibold">
              Entries ({entries.length})
            </h2>
          </div>
        )}
        
        {isLoadingTypes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading certificate types...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry) => (
              <CertificateEntryCard
                key={entry.id}
                entry={entry}
                certificateTypes={certificateTypes}
                onRemove={handleRemoveEntry}
                onSave={handleSaveEntry}
                onUpdate={handleUpdateEntry}
              />
            ))}
            
            {entries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border">
                <p>No entries yet. Upload a file or add a manual entry to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
