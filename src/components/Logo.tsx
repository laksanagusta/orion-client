import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, textClassName, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size]
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" /> {/* Emerald-400 */}
              <stop offset="1" stopColor="#059669" /> {/* Emerald-600 */}
            </linearGradient>
          </defs>
          {/* Hexagon Shape */}
          <path 
            d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" 
            fill="url(#logoGradient)" 
            stroke="none"
          />
          {/* Letter O */}
          <text 
            x="12" 
            y="17" 
            fontFamily="sans-serif" 
            fontWeight="bold" 
            fontSize="14" 
            fill="white" 
            textAnchor="middle"
          >O</text>
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          textClassName || "text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-xl",
          size === "xl" && "text-2xl"
        )}>
          Orion
        </span>
      )}
    </div>
  );
}
