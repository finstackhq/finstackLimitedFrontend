import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        <p className="max-w-2xl text-center text-muted-foreground mb-8">
          This is a dummy Terms of Use page. Replace this text with your actual terms and conditions. <br />
          By using this platform, you agree to abide by all rules and policies set forth by the company.
        </p>
      </div>
      <Footer />
    </main>
  );
}
