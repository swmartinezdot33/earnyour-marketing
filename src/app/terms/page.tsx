import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Terms of Service | EarnYour Marketing",
  description: "EarnYour Marketing's terms of service. Read our terms and conditions for using our services.",
};

export default function TermsPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </Container>
      </Section>

      <Section className="pb-24">
        <Container className="max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("you" or "your") and EarnYour Marketing ("we," "our," or "us") regarding your use of our website, services, and any related applications (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Services Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                EarnYour Marketing provides digital marketing services, including but not limited to search engine optimization (SEO), pay-per-click (PPC) advertising, website design and development, customer relationship management (CRM) services, automation services, and related consulting services for local businesses.
              </p>
            </div>

            <div className="space-y-6 bg-muted/50 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">SMS/Text Messaging Program (A2P Compliance)</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  <strong>Program Description:</strong> By providing your phone number and opting in to receive SMS/text messages, you consent to receive automated marketing and transactional text messages from EarnYour Marketing. These messages may include promotional offers, service updates, appointment reminders, marketing communications, and other information related to our services.
                </p>

                <p>
                  <strong>Opt-In Consent:</strong> By checking the SMS consent checkbox on our forms and providing your phone number, you expressly consent to receive SMS/text messages from EarnYour Marketing at the phone number you provide. You understand that consent is not a condition of purchase, and you may opt out at any time.
                </p>

                <p>
                  <strong>Opt-Out Instructions:</strong> You can cancel the SMS service at any time by texting "STOP" to the phone number from which you received messages. After you send "STOP" to us, we will send you one final message to confirm that you have been unsubscribed. After this confirmation message, you will no longer receive SMS messages from us. If you want to rejoin, you can sign up again using the same process you used initially.
                </p>

                <p>
                  <strong>Help Instructions:</strong> For assistance with our SMS program, you can text "HELP" to the phone number from which you received messages, or contact us at <a href="mailto:hello@earnyour.com" className="text-primary underline">hello@earnyour.com</a> or call us at (662) 555-0123.
                </p>

                <p>
                  <strong>Message and Data Rates:</strong> Message and data rates may apply. Message frequency varies based on your interactions with us and the services you have requested. You are solely responsible for any message and data charges that may be applied by your mobile carrier.
                </p>

                <p>
                  <strong>Supported Carriers:</strong> Our SMS program is available on supported carriers, including but not limited to: AT&T, T-Mobile, Verizon, Sprint, US Cellular, Boost Mobile, and other major carriers. Message and data rates may vary by carrier.
                </p>

                <p>
                  <strong>Carrier Liability:</strong> Carriers are not liable for delayed or undelivered messages. We are not responsible for messages that are delayed, lost, or not received due to carrier issues, network problems, or other factors beyond our control.
                </p>

                <p>
                  <strong>Program Changes:</strong> We reserve the right to modify or discontinue the SMS program at any time without prior notice. We will attempt to notify you of significant changes when possible.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">User Accounts</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                </ul>
                <p>We reserve the right to suspend or terminate your account if you provide false or misleading information or violate these Terms.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Payment Terms</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  <strong>Fees:</strong> Our services are provided in accordance with the pricing and payment terms agreed upon in your service agreement. All fees are due as specified in your agreement.
                </p>
                <p>
                  <strong>Refunds:</strong> Refund policies are specified in your individual service agreement. Generally, fees paid for completed services are non-refundable, unless otherwise specified in your agreement or required by law.
                </p>
                <p>
                  <strong>Late Payments:</strong> Late payments may result in service suspension or termination. We reserve the right to charge late fees as specified in your service agreement.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of our Services, including but not limited to text, graphics, logos, images, and software, are the exclusive property of EarnYour Marketing or its licensors and are protected by United States and international copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, EARNYOUR MARKETING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICES.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless EarnYour Marketing, its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of the Services or your violation of these Terms.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will cease immediately.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Mississippi, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Tupelo, Mississippi.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Services after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Contact Information</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <p>
                  <strong>EarnYour Marketing</strong><br />
                  Email: <a href="mailto:hello@earnyour.com" className="text-primary underline">hello@earnyour.com</a><br />
                  Phone: (662) 555-0123<br />
                  Address: Tupelo, MS 38801
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

