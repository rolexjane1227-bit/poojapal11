import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10 text-primary", className)} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M8 38a18 18 0 1 1 32 0" />
      <path d="M17 12h14c0 7-2.5 12-7 12s-7-5-7-12Z" />
      <path d="M18 17h12c-.5 4-2.6 6.5-6 6.5s-5.5-2.5-6-6.5Z" fill="currentColor" stroke="none" />
      <path d="M24 24v12M18 37h12" />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="leading-none">
      <div className={cn("font-serif tracking-wide text-foreground", size === "lg" ? "text-4xl" : "text-base")}>POOJA PALACE</div>
      <div className={cn("mt-1 flex items-center gap-2 text-primary", size === "lg" ? "text-sm tracking-[0.4em]" : "text-[9px] tracking-[0.3em]")}>
        <span className="h-px flex-1 bg-primary/60" />BAR SHOP<span className="h-px flex-1 bg-primary/60" />
      </div>
    </div>
  );
}
