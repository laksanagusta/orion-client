import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

import { authService } from "@/services/authService";
import { organizationService } from "@/services/organizationService";
import type { Organization } from "@/types/organization";

// Default role ID as specified
const DEFAULT_ROLE_ID = "023719df-7fd8-4409-8e99-22110a9db389";

const registerSchema = z.object({
  nip: z.string().min(1, "NIP harus diisi").regex(/^[0-9]+$/, "NIP hanya boleh angka"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  first_name: z.string().min(1, "Nama depan harus diisi"),
  last_name: z.string().min(1, "Nama belakang harus diisi"),
  phone_number: z.string().min(10, "Nomor telepon minimal 10 digit").regex(/^[0-9]+$/, "Nomor telepon hanya boleh angka"),
  organization_id: z.string().min(1, "Organisasi harus dipilih"),
});

// Helper function to allow only numeric input
const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  input.value = input.value.replace(/[^0-9]/g, '');
};

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const selectedOrgId = watch("organization_id");

  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await organizationService.getOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error("Failed to load organizations:", error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar organisasi. Silakan refresh halaman.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    loadOrganizations();
  }, [toast]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await authService.register({
        username: data.nip, // NIP digunakan sebagai username
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        employee_id: data.nip, // NIP juga digunakan sebagai employee_id
        phone_number: data.phone_number,
        role_ids: [DEFAULT_ROLE_ID],
        organization_id: data.organization_id,
      });

      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda berhasil dibuat. Silakan login.",
        variant: "success",
      });

      navigate("/login");
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      
      // Extract error message from API response
      let errorMessage = "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
      
      if (error && typeof error === 'object') {
        // Handle field-specific errors
        if ('errors' in error && typeof (error as { errors: unknown }).errors === 'object') {
          const fieldErrors = (error as { errors: Record<string, string[]> }).errors;
          
          // Map API fields to form fields
          // API keys: username, employee_id, password, first_name, last_name, phone_number, organization_id
          // Form keys: nip, password, first_name, last_name, phone_number, organization_id
          
          Object.entries(fieldErrors).forEach(([key, messages]) => {
            let formField: keyof RegisterFormData | null = null;
            
            // Map keys
            if (key === 'username' || key === 'employee_id') {
              formField = 'nip';
            } else if (key === 'password' || key === 'first_name' || key === 'last_name' || key === 'phone_number' || key === 'organization_id') {
              formField = key as keyof RegisterFormData;
            }
            
            if (formField && messages.length > 0) {
              setError(formField, {
                type: 'server',
                message: messages[0] // Show the first error message
              });
            }
          });
        }

        if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
          errorMessage = (error as { message: string }).message;
        }
      }
      
      toast({
        title: "Registrasi Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[500px] space-y-8">
        <div className="text-center space-y-2">
          <Logo size="xl" showText={false} className="justify-center mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi formulir di bawah untuk membuat akun
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* NIP - digunakan sebagai username dan employee_id */}
            <div className="space-y-2">
              <Label htmlFor="nip">NIP (Nomor Induk Pegawai)</Label>
              <Input
                id="nip"
                placeholder="e.g. 197606252011012003"
                {...register("nip")}
                disabled={isLoading}
                className={cn("h-11", errors.nip && "border-destructive focus-visible:ring-destructive")}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={handleNumericInput}
              />
              <p className="text-xs text-muted-foreground">NIP akan digunakan sebagai username untuk login</p>
              {errors.nip && (
                <p className="text-sm text-destructive">{errors.nip.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                {...register("password")}
                disabled={isLoading}
                className={cn("h-11", errors.password && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nama Depan</Label>
                <Input
                  id="first_name"
                  placeholder="e.g. John"
                  {...register("first_name")}
                  disabled={isLoading}
                  className={cn("h-11", errors.first_name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nama Belakang</Label>
                <Input
                  id="last_name"
                  placeholder="e.g. Doe"
                  {...register("last_name")}
                  disabled={isLoading}
                  className={cn("h-11", errors.last_name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor Telepon</Label>
              <Input
                id="phone_number"
                placeholder="e.g. 081234567890"
                {...register("phone_number")}
                disabled={isLoading}
                className={cn("h-11", errors.phone_number && "border-destructive focus-visible:ring-destructive")}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={handleNumericInput}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization_id">Organisasi</Label>
              {isLoadingOrgs ? (
                <div className="h-11 border rounded-md flex items-center justify-center bg-secondary">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Memuat organisasi...</span>
                </div>
              ) : (
                <Select
                  value={selectedOrgId}
                  onValueChange={(value) => setValue("organization_id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn("h-11", errors.organization_id && "border-destructive focus-visible:ring-destructive")}>
                    <SelectValue placeholder="Pilih organisasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.organization_id && (
                <p className="text-sm text-destructive">{errors.organization_id.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={isLoading || isLoadingOrgs}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Login di sini
            </Link>
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
