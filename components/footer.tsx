import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BlurText from "@/components/ui/blur-text"

export function Footer() {
  return (
    <footer className="bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6 text-center">
              <BlurText
                text="Ready to move money smarter?"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-4xl lg:text-5xl font-bold leading-tight text-balance"
              />
              <p className="text-xl text-gray-300 leading-relaxed text-pretty text-center">
                Join thousands of users already sending and receiving money across the world with speed, security, and the best rates.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 text-lg font-semibold">
                <Link href="/login">
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - CTA Image */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60 z-10 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 z-10 rounded-2xl"></div>
              <Image 
                src="/cta-img.png" 
                alt="CTA illustration" 
                fill 
                className="object-contain rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Finstack logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-semibold text-white">Finstack</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">© 2025 Finstack. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
