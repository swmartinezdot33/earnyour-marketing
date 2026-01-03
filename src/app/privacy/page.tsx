import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Privacy Policy | EarnYour Marketing",
  description: "EarnYour Marketing's privacy policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            Privacy Policy
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
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                EarnYour Marketing ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Information We Collect</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, business name, mailing address, and other contact information you provide to us.</li>
                  <li><strong>Business Information:</strong> Industry, business location, website URL, and marketing goals.</li>
                  <li><strong>Payment Information:</strong> Billing address, payment card information, and transaction history.</li>
                  <li><strong>Usage Data:</strong> Information about how you access and use our website and services.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, and other technical identifiers.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">How We Use Your Information</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your requests and transactions</li>
                  <li>Send you marketing communications, including email and SMS/text messages (with your consent)</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Analyze usage patterns and improve our website and services</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6 bg-muted/50 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">SMS/Text Messaging Communications (A2P Compliance)</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  <strong>Collection and Use:</strong> When you provide your phone number and opt in to receive SMS/text messages, we collect your phone number for the purpose of sending you SMS notifications related to our services, including marketing messages, service updates, appointment reminders, and other communications you have requested.
                </p>
                
                <p>
                  <strong>Non-Sharing:</strong> Your mobile information, including your phone number, will not be shared, sold, rented, or disclosed to third parties for their marketing or promotional purposes. We may share your information only with service providers who assist us in operating our business and delivering SMS messages, and only to the extent necessary for them to perform these services. These service providers are contractually obligated to maintain the confidentiality of your information.
                </p>

                <p>
                  <strong>Opt-Out:</strong> You can opt out of receiving SMS/text messages from us at any time by replying "STOP" to any SMS message you receive from us. After you send "STOP" to us, we will send you one final message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, you can sign up as you did the first time, and we will start sending SMS messages to you again.
                </p>

                <p>
                  <strong>Help:</strong> If you need assistance, you can reply "HELP" to any SMS message you receive from us, or contact us at <a href="mailto:hello@earnyour.com" className="text-primary underline">hello@earnyour.com</a>.
                </p>

                <p>
                  <strong>Message and Data Rates:</strong> Message and data rates may apply. Message frequency varies based on your interactions with us and the services you have requested. You are responsible for any message and data charges that may be applied by your mobile carrier.
                </p>

                <p>
                  <strong>Carrier Liability:</strong> Supported carriers include, but are not limited to: AT&T, T-Mobile, Verizon, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Information Sharing and Disclosure</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as payment processing, email delivery, SMS messaging, and data analytics. These service providers are contractually obligated to protect your information.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                  <li><strong>With Your Consent:</strong> We may share your information with your explicit consent or at your direction.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Your Rights</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to object to or restrict processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent (where processing is based on consent)</li>
                </ul>
                <p>To exercise these rights, please contact us at <a href="mailto:hello@earnyour.com" className="text-primary underline">hello@earnyour.com</a>.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-brand-navy">Contact Us</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <p>
                  <strong>EarnYour Marketing</strong><br />
                  Email: <a href="mailto:hello@earnyour.com" className="text-primary underline">hello@earnyour.com</a><br />
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

