import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24">
        <AuthForm />
      </div>
      <Footer />
    </main>
  )
}
