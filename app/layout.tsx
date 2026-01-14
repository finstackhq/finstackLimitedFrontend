import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { PageTransition } from "@/components/page-transition"
import { LoadingScreen } from "@/components/loading-screen"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Finstack - Move value with confidence",
  description:
    "Finstack is the secure web platform where you buy, sell, and exchange currencies and gift cards—fast, transparent, and built for growth.",
  generator: "prince",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${manrope.variable} overflow-x-hidden`}>
        <Suspense fallback={<LoadingScreen />}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </body>
    </html>
  )
}
