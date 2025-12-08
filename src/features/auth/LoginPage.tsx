import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Login to get token
      const response = await authService.login({ username, password });
      
      // 2. Temporarily set token for the next request
      localStorage.setItem('token', response.token);
      
      // 3. Fetch current user details
      const user = await authService.getCurrentUser();
      
      // 4. Update store
      login(response.token, user);
      
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token'); // Cleanup if failed
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <svg className="w-8 h-8 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Selamat Datang di Orion
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan kredensial untuk mengakses sistem
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="font-normal text-muted-foreground">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="text-foreground font-medium">5000+</span> government employees
          </p>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
            <p>Enter your Identity Service credentials</p>
        </div>
      </div>
    </div>
  );
}
