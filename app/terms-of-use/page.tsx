import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4 mt-16">Terms of Use</h1>

        <div
          className="max-w-2xl text-left text-muted-foreground mb-8"
          style={{ fontSize: "1rem", lineHeight: "2.2" }}
        >
          {[
            {
              header: "1. Who we are & acceptance",
              body: "These Terms govern your use of the services, websites, apps, APIs and other products provided by the Company. By creating an account or using the Services you accept these Terms. If you don’t agree, stop using the Services.",
            },
            {
              header: "2. Eligibility",
              body: "You must be at least 13. Minors who are not of majority age must use the Services with a parent or legal guardian who accepts these Terms on their behalf.",
            },
            {
              header: "3. Account responsibility",
              body: "You must provide truthful information, keep credentials confidential, and notify us immediately of unauthorized access. You are responsible for activity on your account.",
            },
            {
              header: "4. KYC, identity and BVN",
              body: "To onboard and operate financial features we will collect identity information (including government IDs and BVN when applicable). That data is used to verify identity, meet KYC/AML obligations, and to allow banking/payment partners to process transactions.",
            },
            {
              header: "5. Payments, fees & refunds",
              body: "Paid features require payment according to the pricing and billing terms presented in the product. Refunds are rare and handled per the payment terms; statutory rights remain.",
            },
            {
              header: "6. Acceptable use",
              body: "Do not use the Services to break the law, commit fraud, evade sanctions, abuse the platform, or interfere with other users. Automated scraping or unauthorised access is prohibited.",
            },
            {
              header: "7. Intellectual property",
              body: "All Company content, software, designs and trademarks are owned or licensed by the Company. You keep ownership of user content you upload but grant the Company a worldwide, royalty-free license to use that content to operate the Services.",
            },
            {
              header: "8. Suspension & termination",
              body: "We may suspend or terminate accounts for violations, security risks, law enforcement requests, or business reasons. Key provisions (IP, liability limits, indemnity, data retention) survive termination.",
            },
            {
              header: "9. Disclaimers & warranty",
              body: "Services are provided “as is” and “as available.” Except where law requires otherwise, we disclaim all express or implied warranties.",
            },
            {
              header: "10. Liability cap",
              body: "To the maximum extent permitted by law, our aggregate liability for direct damages is limited to the greater of (a) the fees you paid in the preceding 12 months, or (b) USD 100. We are not liable for indirect, special or consequential losses.",
            },
            {
              header: "11. Indemnity",
              body: "You agree to indemnify and defend the Company against third-party claims arising from your breach of these Terms or your misuse of the Services.",
            },
            {
              header: "12. Changes to Terms",
              body: "We may update these Terms. For material changes we’ll notify via email or in-product. Continued use after notice constitutes acceptance.",
            },
            {
              header: "13. Governing law & dispute resolution",
              body: "These Terms are governed by the laws of Nigeria. Disputes fall within the courts located in FCT Abuja, unless parties agree otherwise.",
            },
            {
              header: "14. Contact for legal notices",
              body: "hello@usefinstack.co",
            },
          ].map((section, idx) => (
            <div key={idx} style={{ marginBottom: "1.5em" }}>
              <span style={{ fontWeight: "bold" }}>{section.header}</span>
              <div>{section.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6 text-center text-sm text-muted-foreground">
        <div>Effective / Updated: 18 January 2026</div>
        <div>Contact: hello@usefinstack.co</div>
      </div>
      <Footer />
    </main>
  );
}
