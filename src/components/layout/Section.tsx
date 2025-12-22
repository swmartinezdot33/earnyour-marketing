import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "sand" | "navy" | "charcoal";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground",
      sand: "bg-accent text-accent-foreground",
      navy: "bg-secondary text-secondary-foreground",
      charcoal: "bg-foreground text-background",
    };

    return (
      <section
        ref={ref}
        className={cn("py-12 md:py-16 lg:py-24", variants[variant], className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

export { Section };

