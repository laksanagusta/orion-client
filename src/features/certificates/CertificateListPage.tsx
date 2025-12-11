import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Plus, 
  FileText, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { certificateService } from "@/services/certificateService";
import type { Certificate, CertificateListParams, CertificateTypeItem } from "@/types/certificate";

export default function CertificateListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<CertificateTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [filters, setFilters] = useState<CertificateListParams>({
    page: 1,
    limit: 10,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; certificate: Certificate | null }>({
    open: false,
    certificate: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Load certificate types
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const response = await certificateService.getTypes();
        setCertificateTypes(response.data.types || []);
      } catch (error) {
        console.error("Failed to load certificate types:", error);
      }
    };
    loadTypes();
  }, []);

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await certificateService.list(filters);
      setCertificates(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleFilterChange = (key: keyof CertificateListParams, value: number | string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1),
    }));
  };

  const handleDelete = async () => {
    if (!deleteDialog.certificate) return;
    
    setIsDeleting(true);
    try {
      await certificateService.delete(deleteDialog.certificate.id);
      toast({
        title: "Certificate Deleted",
        description: `"${deleteDialog.certificate.training_name}" has been deleted.`,
      });
      setDeleteDialog({ open: false, certificate: null });
      fetchCertificates();
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerify = async (cert: Certificate, isVerified: boolean) => {
    try {
      await certificateService.verify(cert.id, {
        is_verified: isVerified,
        verification_notes: isVerified ? "Verified" : "Rejected",
      });
      toast({
        title: isVerified ? "Certificate Verified" : "Certificate Rejected",
        description: `"${cert.training_name}" has been ${isVerified ? 'verified' : 'rejected'}.`,
      });
      fetchCertificates();
    } catch (error) {
      console.error("Failed to verify certificate:", error);
      toast({
        title: "Action Failed",
        description: "Failed to update certificate status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your training certificates.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/certificates/input">
            <Plus className="w-4 h-4" />
            Add Certificate
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.year?.toString() || "all"}
              onValueChange={(value) => handleFilterChange('year', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.quarter?.toString() || "all"}
              onValueChange={(value) => handleFilterChange('quarter', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {certificateTypes.map((type) => (
                  <SelectItem key={type.type} value={type.type}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.limit?.toString() || "10"}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificate List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading certificates...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No certificates found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new certificate.</p>
              <Button asChild className="mt-4">
                <Link to="/certificates/input">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certificate
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Training Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Institution</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">JPL</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="border-b hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <Link 
                                to={`/certificates/${cert.id}`} 
                                className="font-medium truncate max-w-[200px] block hover:text-primary hover:underline transition-colors"
                              >
                                {cert.training_name}
                              </Link>
                              <p className="text-xs text-muted-foreground">{cert.certificate_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm">{cert.type}</p>
                            <p className="text-xs text-muted-foreground">{cert.sub_type}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{cert.institution}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold">{cert.jpl_hours}h</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {cert.is_verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(cert.start_date)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/certificates/${cert.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                                </Link>
                              </DropdownMenuItem>
                              {cert.file_url && (
                                <DropdownMenuItem onClick={() => window.open(cert.file_url, '_blank')}>
                                  <FileText className="mr-2 h-4 w-4" /> View Document
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {!cert.is_verified && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleVerify(cert, true)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Verify
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleVerify(cert, false)}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteDialog({ open: true, certificate: cert })}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} certificates
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm px-2">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open, certificate: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.certificate?.training_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
