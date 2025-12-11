import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { certificateSchema, defaultFormValues, type CertificateFormValues } from "../schema";
import type { CertificateTypeItem } from "@/types/certificate";

export type CertificateEntryV2Status = 
  | 'pending'      // File dropped, waiting for action
  | 'extracting'   // Extracting data via AI
  | 'ready'        // Ready to save (manual or extracted)
  | 'saving'       // Saving in progress
  | 'saved'        // Successfully saved
  | 'error';       // Error occurred

export interface CertificateEntryV2 {
  id: string;
  file: File;
  blobUrl: string;           // Local blob URL for preview
  status: CertificateEntryV2Status;
  data?: CertificateFormValues;
  error?: string;
  isExtracted?: boolean;     // Whether data was extracted via AI
}

interface CertificateEntryCardV2Props {
  entry: CertificateEntryV2;
  certificateTypes: CertificateTypeItem[];
  onRemove: (id: string) => void;
  onSave: (id: string, data: CertificateFormValues) => void;
  onExtract: (id: string) => void;
  onUpdate?: (id: string, data: Partial<CertificateEntryV2>) => void;
}

export function CertificateEntryCardV2({
  entry,
  certificateTypes,
  onRemove,
  onSave,
  onExtract,
}: CertificateEntryCardV2Props) {
  const [formKey, setFormKey] = useState(0);

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema) as any,
    defaultValues: entry.data || defaultFormValues,
  });

  // Flag to prevent resetting sub_type during programmatic form updates
  const isPopulatingForm = useRef(false);
  const previousType = useRef<string>("");
  const lastProcessedData = useRef<string>("");

  // Get subtypes for selected type
  const selectedType = form.watch("type");
  const subtypes = certificateTypes.find((t) => t.type === selectedType)?.sub_types || [];

  // Update form values when entry data changes (e.g. after AI extraction)
  const entryDataJson = JSON.stringify(entry.data);
  useEffect(() => {
    if (entryDataJson === lastProcessedData.current) {
      return;
    }

    if (entry.data) {
      isPopulatingForm.current = true;
      previousType.current = entry.data.type || "";
      lastProcessedData.current = entryDataJson;

      form.reset(entry.data, {
        keepDefaultValues: false,
      });

      setFormKey((prev) => prev + 1);

      setTimeout(() => {
        isPopulatingForm.current = false;
      }, 200);
    }
  }, [entryDataJson, entry.data, form]);

  const onSubmit = (data: CertificateFormValues) => {
    onSave(entry.id, data);
  };

  const isExtracting = entry.status === 'extracting';
  const isSaving = entry.status === 'saving';
  const isSaved = entry.status === 'saved';
  const isPending = entry.status === 'pending';
  const isReady = entry.status === 'ready';

  const isImage = entry.file.type.startsWith('image/');

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isSaved && "border-green-500/50 bg-green-50/10"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden",
              isImage ? "bg-secondary" : "bg-primary/10 text-primary"
            )}
          >
            {isImage ? (
              <img
                src={entry.blobUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-medium truncate max-w-[300px]">
              {entry.file.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              {isPending && (
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Menunggu ekstraksi atau input manual
                </span>
              )}
              {isExtracting && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Mengekstrak data...
                </span>
              )}
              {isReady && (
                <span className="flex items-center gap-1 text-primary">
                  <AlertCircle className="w-3 h-3" />
                  {entry.isExtracted ? "Data terekstrak, mohon review" : "Siap diisi"}
                </span>
              )}
              {isSaving && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Menyimpan...
                </span>
              )}
              {isSaved && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Tersimpan
                </span>
              )}
              {entry.status === 'error' && (
                <span className="text-destructive">{entry.error || "Gagal memproses file"}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(entry.id)}
          disabled={isSaving}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {isExtracting ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
            </div>
            <div className="h-10 bg-secondary rounded w-1/2"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* File Preview Section */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <FormLabel>Dokumen Sertifikat</FormLabel>
                <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/20 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {isImage ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-background border flex-shrink-0">
                        <img
                          src={entry.blobUrl}
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
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {entry.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => window.open(entry.blobUrl, '_blank')}
                      title="Lihat Dokumen"
                    >
                      {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Extract Data Button - only show when pending */}
              {isPending && (
                <div className="flex justify-center py-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onExtract(entry.id)}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ekstrak Data (AI)
                  </Button>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="training_name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Nama Pelatihan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="cth. Manajemen Proyek Lanjutan"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institusi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="cth. LAN"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Sertifikat</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="cth. CERT/2025/001"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select
                        key={`type-${formKey}`}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (!isPopulatingForm.current && previousType.current !== value) {
                            form.setValue("sub_type", "");
                          }
                          previousType.current = value;
                        }}
                        value={field.value || ""}
                        disabled={isSaved || isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {certificateTypes.map((type) => (
                            <SelectItem key={type.type} value={type.type}>
                              {type.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="sub_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtipe</FormLabel>
                      <Select
                        key={`subtype-${formKey}-${selectedType}`}
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!selectedType || isSaved || isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih subtipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subtypes.map((subtype) => (
                            <SelectItem key={subtype} value={subtype}>
                              {subtype}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2025"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jpl_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam JPL</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="40"
                          {...field}
                          disabled={isSaved || isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                {/* Skip extraction and enable form */}
                {isPending && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Trigger parent to set status to 'ready' without extraction
                      onSave(entry.id, form.getValues());
                    }}
                    className="gap-2"
                  >
                    Isi Manual
                  </Button>
                )}

                {(isReady || isPending) && (
                  <Button
                    type="submit"
                    disabled={isSaved || isSaving || isPending}
                    className="gap-2 ml-auto"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaved ? (
                      "Tersimpan"
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
