import { Menu, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-12 border-b border-primary/20 bg-primary px-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
             {/* Mobile Sidebar Content - slightly modified version of Sidebar */}
             <div className="h-full flex flex-col">
                <div className="p-6 flex items-center gap-2 border-b border-border">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <span className="font-bold text-xl text-foreground tracking-tight">Orion</span>
                </div>
                {/* Navigation links would go here, duplicating logic for now or refactoring Sidebar to be reusable */}
                {/* For simplicity in this step, I'll just render a placeholder or import the nav items if I exported them */}
             </div>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex items-center relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-primary-foreground/60" />
          <Input 
            placeholder="Cari..." 
            className="h-8 pl-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30 text-sm" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-primary-foreground">{user?.first_name} {user?.last_name}</span>
            <span className="text-xs text-primary-foreground/70">{user?.employee_id}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-auto gap-2 flex items-center rounded-full pl-2 pr-1 hover:bg-primary-foreground/10">
              <Avatar className="h-8 w-8 border-2 border-primary-foreground/30">
                <AvatarImage src={user?.avatar_url} alt={user?.username} />
                <AvatarFallback className="text-xs bg-primary-foreground/20 text-primary-foreground">{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-primary-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
