import Link from "next/link";
import PricingCards from "~/components/PricingCards";

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
          
          <PricingCards />
        </div>
      </main>
    </div>
  );
}
