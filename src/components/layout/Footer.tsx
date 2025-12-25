import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  services: [
    { title: "Local SEO", href: "/services/local-seo" },
    { title: "Websites", href: "/services/websites" },
    { title: "Google Ads", href: "/services/google-ads" },
    { title: "Facebook Ads", href: "/services/facebook-ads" },
    { title: "CRM & Automations", href: "/services/crm-automations" },
    { title: "Custom Software", href: "/services/custom-software" },
  ],
  company: [
    { title: "About Us", href: "/about" },
    { title: "Process", href: "/process" },
    { title: "Case Studies", href: "/case-studies" },
    { title: "Blog", href: "/blog" },
    { title: "Careers", href: "/careers" },
  ],
  locations: [
    { title: "Southaven, MS", href: "/locations/southaven" },
    { title: "Olive Branch, MS", href: "/locations/olive-branch" },
    { title: "Tupelo, MS", href: "/locations/tupelo" },
    { title: "Oxford, MS", href: "/locations/oxford" },
    { title: "Hernando, MS", href: "/locations/hernando" },
    { title: "Starkville, MS", href: "/locations/starkville" },
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-secondary-foreground/10">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Logo className="text-white" />
            <p className="text-secondary-foreground/80 text-sm leading-relaxed max-w-xs">
              Performance first local growth partner. We help North Mississippi businesses dominate their market through data-driven SEO, Ads, and Automation.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Service Areas</h3>
             <ul className="space-y-2">
              {footerLinks.locations.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              <li>
                  <Link href="/locations" className="text-sm font-bold text-primary hover:text-white transition-colors">
                    View All Locations
                  </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2 text-sm text-secondary-foreground/80">
                  <h4 className="font-bold text-white mb-2">Contact Us</h4>
                  <p>2304 Jackson Ave W</p>
                  <p>Oxford, MS 38655</p>
                  <p>
                    <a href="mailto:hello@earnyour.com" className="hover:text-primary">
                      hello@earnyour.com
                    </a>
                  </p>
                  <p>
                    <a href="tel:+16625550123" className="hover:text-primary">
                      (662) 555-0123
                    </a>
                  </p>
              </div>
               <div className="flex gap-2 items-start">
                  <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">Google</div>
                  <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">Meta</div>
                  <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">HubSpot</div>
               </div>
           </div>
           
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-secondary-foreground/60">
                &copy; 2026 EarnYour Marketing. All rights reserved.
              </p>
              <div className="flex gap-6">
                {footerLinks.legal.map((link) => (
                  <Link key={link.href} href={link.href} className="text-xs text-secondary-foreground/60 hover:text-primary transition-colors">
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </Container>
    </footer>
  );
}
