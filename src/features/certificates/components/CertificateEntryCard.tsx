import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, FileText, Loader2, CheckCircle, AlertCircle, Save } from "lucide-react";

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

export type CertificateEntryStatus = 'idle' | 'uploading' | 'extracting' | 'ready' | 'saving' | 'saved' | 'error';

export interface CertificateEntry {
  id: string;
  file?: File;
  status: CertificateEntryStatus;
  progress: number;
  data?: CertificateFormValues;
  error?: string;
  temp_id?: string; // From AI extraction
  file_url?: string; // Preview URL from server
}

interface CertificateEntryCardProps {
  entry: CertificateEntry;
  certificateTypes: CertificateTypeItem[];
  onRemove: (id: string) => void;
  onSave: (id: string, data: CertificateFormValues) => void;
  onUpdate?: (id: string, data: Partial<CertificateEntry>) => void;
}

export function CertificateEntryCard({ 
  entry, 
  certificateTypes, 
  onRemove, 
  onSave,
  onUpdate 
}: CertificateEntryCardProps) {
  // Force re-render key when entry data changes
  const [formKey, setFormKey] = useState(0);
  
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema) as any,
    defaultValues: entry.data || defaultFormValues,
  });

  // Flag to prevent resetting sub_type during programmatic form updates
  const isPopulatingForm = useRef(false);
  // Track previous type to detect user-initiated type changes
  const previousType = useRef<string>("");
  // Track if we've already processed this entry data
  const lastProcessedData = useRef<string>("");

  // Get subtypes for selected type
  const selectedType = form.watch("type");
  const subtypes = certificateTypes.find((t) => t.type === selectedType)?.sub_types || [];

  // Update form values when entry data changes (e.g. after AI extraction)
  const entryDataJson = JSON.stringify(entry.data);
  useEffect(() => {
    // Skip if this is the same data we already processed
    if (entryDataJson === lastProcessedData.current) {
      return;
    }
    
    if (entry.data) {
      console.log("CertificateEntryCard: Updating form with entry data:", entry.data);
      console.log("CertificateEntryCard: Available types:", certificateTypes.map(t => t.type));
      
      // Set flag and track current values
      isPopulatingForm.current = true;
      previousType.current = entry.data.type || "";
      lastProcessedData.current = entryDataJson;
      
      // Reset form with all values
      form.reset(entry.data, {
        keepDefaultValues: false,
      });
      
      // Force Select components to update by incrementing formKey
      setFormKey(prev => prev + 1);
      
      console.log("CertificateEntryCard: Form values after reset:", form.getValues());
      
      // Clear the flag after a short delay
      setTimeout(() => {
        isPopulatingForm.current = false;
      }, 200);
    }
  }, [entryDataJson, entry.data, form, certificateTypes]);

  const onSubmit = (data: CertificateFormValues) => {
    onSave(entry.id, data);
  };

  const isLoading = entry.status === 'uploading' || entry.status === 'extracting';
  const isSaving = entry.status === 'saving';
  const isSaved = entry.status === 'saved';

  return (
    <Card className={cn(
      "transition-all duration-200",
      isSaved && "border-green-500/50 bg-green-50/10"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            entry.file ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-600"
          )}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              {entry.file ? entry.file.name : "Manual Entry"}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              {isLoading && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {entry.status === 'uploading' ? 'Uploading...' : 'Extracting info...'}
                </span>
              )}
              {entry.status === 'idle' && (
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu proses
                </span>
              )}
              {entry.status === 'ready' && (
                <span className="flex items-center gap-1 text-primary">
                  <AlertCircle className="w-3 h-3" />
                  Review required
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
                <span className="text-destructive">
                  {entry.error || "Gagal memproses file"}
                </span>
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
        {isLoading ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Preview Section */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <FormLabel>Certificate Document</FormLabel>
                  {entry.file ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/20 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {entry.file.type.startsWith('image/') ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-background border flex-shrink-0">
                            <img 
                              src={entry.file_url || URL.createObjectURL(entry.file)} 
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
                          <p className="text-sm font-medium truncate max-w-[200px]">{entry.file.name}</p>
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
                          onClick={() => {
                            const url = entry.file_url || URL.createObjectURL(entry.file!);
                            window.open(url, '_blank');
                          }}
                          title="View Document"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onUpdate && onUpdate(entry.id, { file: undefined })}
                          title="Remove File"
                          disabled={isSaved}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isSaved}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && onUpdate) onUpdate(entry.id, { file });
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Unggah Sertifikat</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG atau PNG</p>
                    </div>
                  )}
                </div>

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
                          disabled={isSaved}
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
                          disabled={isSaved}
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
                          disabled={isSaved}
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
                        disabled={isSaved}
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
                        disabled={!selectedType || isSaved}
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
                          disabled={isSaved}
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
                          disabled={isSaved}
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
                          disabled={isSaved}
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
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaved || isSaving}
                  className="gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaved ? 'Tersimpan' : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Entri
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
