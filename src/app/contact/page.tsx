import { Metadata } from "next";
import { AuditForm } from "@/components/forms/AuditForm";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | EarnYour Marketing",
  description: "Get in touch with the EarnYour team. We are ready to help you grow.",
};

export default function ContactPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            Let's Talk Growth
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to scale? Fill out the form below or reach out to us directly.
          </p>
        </Container>
      </Section>

      <Section className="pb-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold font-heading text-brand-navy mb-4">Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <a href="mailto:hello@earnyour.com" className="text-lg hover:text-primary transition-colors">hello@earnyour.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <a href="tel:+15125550123" className="text-lg hover:text-primary transition-colors">(512) 555-0123</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg">2304 Jackson Ave W<br/>Oxford, MS 38655</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary text-white p-6 rounded-xl">
                <h3 className="font-bold mb-2">Office Hours</h3>
                <p className="opacity-80">Mon-Fri: 9am - 5pm CST</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <AuditForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

