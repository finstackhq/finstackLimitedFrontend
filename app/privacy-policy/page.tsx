import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4 mt-16">Privacy Policy</h1>
        <p className="max-w-2xl text-center text-muted-foreground mb-8">
          This is a dummy Privacy Policy page. Will replace this text with your
          actual privacy policy. <br />
          We are committed to protecting your privacy and personal information
          on this platform.
        </p>
      </div>
      <Footer />
    </main>
  );
}
