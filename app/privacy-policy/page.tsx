import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4 mt-16">Privacy Policy</h1>
        <div
          className="max-w-2xl w-full bg-white/80 rounded-lg shadow p-6 text-muted-foreground"
          style={{
            fontSize: "1rem",
            lineHeight: "2",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Scope &amp; Controller
            </h2>
            <p>
              This Policy explains what personal data we collect, why, how we
              share it, and your rights. The Company is the data controller for
              the Services. <br />
              Contact:{" "}
              <a href="mailto:hello@usefinstack.co" className="underline">
                hello@usefinstack.co
              </a>
              .
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Data We Collect (Categories)
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <b>Identity &amp; onboarding:</b> name, date of birth,
                government ID, BVN.
              </li>
              <li>
                <b>Contact:</b> email, phone, postal address.
              </li>
              <li>
                <b>Financial &amp; transactional:</b> bank details, payment
                records, transaction history.
              </li>
              <li>
                <b>Technical &amp; usage:</b> IP, device, browser, logs,
                cookies, analytics.
              </li>
              <li>
                <b>Support &amp; communications:</b> messages, dispute
                information.
              </li>
              <li>
                <b>Optional profiling data:</b> risk scores, fraud flags,
                preferences (where you consent).
              </li>
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">How We Collect</h2>
            <p>
              Directly from you (forms, uploads, KYC screens), from partners
              (payment/KYC providers, banks), and automatically (cookies, logs).
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Why We Process (Purposes &amp; Lawful Bases)
            </h2>
            <ul className="list-disc pl-6">
              <li>
                Provide the Services, manage accounts and process transactions —{" "}
                <b>contractual necessity</b>.
              </li>
              <li>
                Verify identity and comply with KYC/AML —{" "}
                <b>legal obligation</b>.
              </li>
              <li>
                Detect and prevent fraud, secure the platform —{" "}
                <b>legitimate interests</b>.
              </li>
              <li>
                Marketing (news, offers) — <b>consent</b>; you may opt out
                anytime.
              </li>
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">KYC / BVN Specifics</h2>
            <p>
              We collect BVN and identity documents only when needed for
              financial onboarding. We retain KYC records as required by law and
              to meet regulatory requests.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Sharing &amp; Subprocessors
            </h2>
            <p>
              We share data with service providers (payment processors, cloud
              hosts, KYC vendors), banks, and when required by law. We require
              subprocessors to meet our security and confidentiality standards.
              A current list of major subprocessors is available on request via{" "}
              <a href="mailto:hello@usefinstack.co" className="underline">
                hello@usefinstack.co
              </a>
              .
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              International Transfers
            </h2>
            <p>
              Data may be processed outside the country where you live. We use
              contractual safeguards and technical protections to keep data
              secure during transfers.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Data Retention (Practical Buckets)
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <b>KYC &amp; transaction records:</b> retained for regulatory
                period (recommendation: 7 years from account closure) or as
                required by law.
              </li>
              <li>
                <b>Account &amp; transactional data:</b> retained while account
                is active + reasonable period for disputes/compliance.
              </li>
              <li>
                <b>Marketing data:</b> retained until you opt out.
              </li>
            </ul>
            <p className="mt-2 text-xs italic">
              (These are operational rules — confirm exact retention periods
              with counsel; we’ll apply the minimum required by law.)
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Automated Decisions &amp; Profiling
            </h2>
            <p>
              We may use automated models for fraud detection and risk scoring.
              Those decisions help secure accounts and reduce abuse. If a
              decision materially affects you and you request review, we’ll
              provide human review where required by law.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Your Rights &amp; How to Exercise Them
            </h2>
            <p>
              You may request access, correction, deletion, restriction, or
              portability of your data, and withdraw consent. To make a request
              email{" "}
              <a href="mailto:hello@usefinstack.co" className="underline">
                hello@usefinstack.co
              </a>
              . We will verify identity before fulfilling requests. We aim to
              respond to verifiable requests within 30 days; complex requests
              may require additional time and lawful limits may apply.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Security &amp; Breach Handling
            </h2>
            <p>
              We apply administrative, technical and physical safeguards. If a
              breach triggers notification obligations under applicable law, we
              will notify affected users and relevant authorities without undue
              delay.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Cookies &amp; Tracking
            </h2>
            <p>
              We use essential cookies for platform function and optional
              cookies for analytics and marketing. Marketing cookies require
              your consent; you may change cookie settings in the app or your
              browser.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">Children</h2>
            <p>
              We do not knowingly process personal data of children under 13. If
              we become aware we will remove it.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Changes to this Policy
            </h2>
            <p>
              We may update this Policy. Material changes will be communicated
              via email or in-product. Continued use after notice means you
              accept the updated Policy.
            </p>
            <div className="mt-2 text-xs">
              Effective / Updated: 18 January 2026
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              Contact &amp; Data-Protection Requests
            </h2>
            <p>
              Email:{" "}
              <a href="mailto:hello@usefinstack.co" className="underline">
                hello@usefinstack.co
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
