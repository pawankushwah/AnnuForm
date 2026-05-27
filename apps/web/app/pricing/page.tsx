import Link from "next/link";
import { Check, LayoutTemplate } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 dark:bg-gray-950/50 backdrop-blur-md justify-center">
        <div className="container mx-auto flex items-center justify-between w-full">
          <Link className="flex items-center justify-center" href="/">
            <img src="/logo.png" alt="AnnuForm Logo" className="h-6 w-6" />
            <span className="ml-2 font-bold text-xl tracking-tight text-blue-600">AnnuForm</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/explore">
              Explore
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Simple, transparent pricing</h1>
            <p className="mt-4 text-xl text-gray-500">Everything you need to build powerful forms.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h3 className="text-2xl font-bold">Hobby</h3>
              <div className="mt-4 text-4xl font-bold">$0<span className="text-xl text-gray-500 font-normal">/mo</span></div>
              <p className="mt-4 text-gray-500 text-sm">Perfect for individuals and small projects.</p>
              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Up to 3 forms</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> 100 responses/month</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Standard themes</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Community support</li>
              </ul>
              <Link href="/login" className="mt-8 block w-full rounded-md border border-gray-300 py-2.5 text-center font-medium hover:bg-gray-50 transition-colors">
                Get Started
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="flex flex-col rounded-2xl border-2 border-blue-600 bg-white dark:bg-gray-900 p-8 shadow-lg relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold">Pro</h3>
              <div className="mt-4 text-4xl font-bold">$19<span className="text-xl text-gray-500 font-normal">/mo</span></div>
              <p className="mt-4 text-gray-500 text-sm">For professionals needing more power.</p>
              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Unlimited forms</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> 10,000 responses/month</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Premium themes</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Priority support</li>
                <li className="flex items-center"><Check className="text-green-500 h-5 w-5 mr-3" /> Custom branding</li>
              </ul>
              <Link href="/login" className="mt-8 block w-full rounded-md bg-blue-600 text-white py-2.5 text-center font-medium hover:bg-blue-700 transition-colors">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
