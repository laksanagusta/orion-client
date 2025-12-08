import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building, Phone, Mail, FileText, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">User data not found. Please log in again.</p>
      </div>
    );
  }

  // Determine user role labels
  const userRoles = user.roles ? user.roles.map(r => r.name).join(", ") : "User";
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl mx-auto">
                  <AvatarImage src={user.avatar_url} alt={user.username} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white" title="Active"></div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-muted-foreground font-medium">@{user.username}</p>
                <div className="pt-2">
                    <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                        {userRoles}
                    </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.organization?.name || "No Organization"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.organization_id || "ID not available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your personal details fetched from the Identity Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Employee ID (NIP)
                  </label>
                  <div className="p-3 bg-secondary/50 rounded-md font-mono text-sm">
                    {user.employee_id}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Full Name
                  </label>
                  <div className="p-3 bg-secondary/50 rounded-md text-sm">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number
                  </label>
                  <div className="p-3 bg-secondary/50 rounded-md text-sm font-mono">
                    {user.phone_number || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> User ID
                  </label>
                  <div className="p-3 bg-secondary/50 rounded-md text-sm font-mono text-muted-foreground break-all">
                    {user.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>
                Information about your account security and access levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/10">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">Access Role</p>
                  <p className="text-xs text-muted-foreground">
                    You have <span className="font-medium text-foreground">{userRoles}</span> access level on this platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
