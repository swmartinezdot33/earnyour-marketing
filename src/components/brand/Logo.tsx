import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="bg-primary text-white font-bold p-1 rounded-sm">EY</div>
      <span className="font-heading font-bold text-xl tracking-tight text-brand-navy group-hover:text-primary transition-colors">
        EarnYour
      </span>
    </Link>
  );
}

