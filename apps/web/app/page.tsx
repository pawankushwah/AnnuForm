import Link from "next/link";
import { ArrowRight, LayoutTemplate, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b justify-center">
        <div className="container mx-auto flex items-center justify-between w-full">
          <Link className="flex items-center justify-center" href="/">
            <img src="/logo.png" alt="AnnuForm Logo" className="h-6 w-6" />
            <span className="ml-2 font-bold text-xl tracking-tight text-primary">AnnuForm</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/explore">
              Explore
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
              Pricing
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Build Dynamic Forms in <span className="text-primary text-blue-600">Seconds</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create, publish, and analyze beautifully designed forms. Share public templates, build unlisted private forms, and track every response with ease.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/login"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/explore"
                >
                  Explore Templates
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl max-w-[700px] mx-auto">
                Powerful features designed to help you create, collect, and analyze form submissions effectively.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Lightning Fast</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                    Built with Next.js and tRPC for incredibly fast form rendering and real-time response collection without the wait.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <LayoutTemplate className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Beautiful Themes</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                    Choose from gorgeous curated themes (Anime, Minimalist, Tech) that automatically adapt to light and dark modes.
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/40 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Shield className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold">Secure by Default</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                    Flexible visibility options (Public, Unlisted, Private) with built-in API rate limiting to prevent spam and abuse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 AnnuForm SaaS. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/docs">
            API Documentation
          </Link>
        </nav>
      </footer>
    </div>
  );
}
