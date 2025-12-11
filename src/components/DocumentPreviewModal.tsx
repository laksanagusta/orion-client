import { useState, useEffect, useCallback } from "react";
import { Loader2, X, Download, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { certificateService } from "@/services/certificateService";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  fileName?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  certificateId,
  fileName,
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!certificateId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await certificateService.getPreviewBlob(certificateId);
      setBlobUrl(result.blobUrl);
      setContentType(result.contentType);
    } catch (err) {
      console.error("Failed to load preview:", err);
      setError("Gagal memuat dokumen. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    if (isOpen && certificateId) {
      loadPreview();
    }

    return () => {
      // Cleanup blob URL when modal closes
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
  }, [isOpen, certificateId, loadPreview]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await certificateService.download(certificateId, fileName);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = contentType.startsWith("image/");
  const isPdf = contentType.includes("pdf");

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className={`flex flex-col p-0 gap-0 [&>button]:hidden ${
          isFullscreen
            ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
            : "max-w-4xl w-full h-[80vh] max-h-[80vh]"
        }`}
      >
        <DialogHeader className="px-4 py-2 border-b flex flex-row items-center justify-between space-y-0 bg-background flex-shrink-0">
          <DialogTitle className="text-base font-medium truncate max-w-[300px]">
            {fileName || "Preview Dokumen"}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Perkecil" : "Perbesar"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Unduh"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              title="Tutup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-secondary/30">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Memuat dokumen...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={loadPreview}>
                Coba Lagi
              </Button>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <>
              {isImage && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={blobUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {isPdf && (
                <iframe
                  src={blobUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              )}

              {!isImage && !isPdf && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p className="text-muted-foreground">
                    Preview tidak tersedia untuk tipe file ini
                  </p>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
