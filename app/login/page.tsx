import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Mail } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-primary">
      <Link href="/" className="absolute top-8 left-8 text-xl font-semibold text-white tracking-tight">
        Folio
      </Link>
      
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-secondary">Log in to your Folio account</p>
        </div>
        
        <Card className="p-8 border-border-subtle bg-surface/50 shadow-none">
          <Button className="w-full mb-4 flex items-center justify-center gap-2 h-11 text-[15px]" size="lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </Button>
          
          <div className="relative flex items-center py-4 mb-4">
            <div className="flex-grow border-t border-border-subtle"></div>
            <span className="flex-shrink-0 mx-4 text-tertiary text-xs uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-border-subtle"></div>
          </div>
          
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-secondary">
                Email address
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required
                className="bg-page h-11"
              />
            </div>
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2 h-11">
              <Mail className="w-4 h-4" />
              Continue with Email
            </Button>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-tertiary">
          By clicking continue, you agree to our <br />
          <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Terms of Service</Link> and <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
