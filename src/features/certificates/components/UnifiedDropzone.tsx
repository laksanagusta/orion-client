import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedDropzoneProps {
  onDrop: (files: File[]) => void;
  isSubmitting?: boolean;
}

export function UnifiedDropzone({ onDrop, isSubmitting = false }: UnifiedDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    disabled: isSubmitting,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ease-in-out",
        isDragActive
          ? "border-purple-500 bg-purple-50/50"
          : "border-border hover:border-purple-500/50 hover:bg-secondary/50",
        isSubmitting && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isDragActive ? "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-600" : "bg-secondary text-muted-foreground"
        )}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {isDragActive ? "Lepaskan file di sini" : "Unggah Sertifikat"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Tarik dan lepas file PDF atau Gambar Anda di sini, atau klik untuk menelusuri.
            Kami akan mengekstrak detailnya secara otomatis untuk Anda.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> PDF
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> JPG
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> PNG
          </span>
        </div>
      </div>
    </div>
  );
}
