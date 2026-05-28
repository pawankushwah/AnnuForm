import Link from "next/link";
import { ArrowRight, LayoutTemplate, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-8 h-20 flex items-center border-b justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between w-full max-w-6xl">
          <Link className="flex items-center justify-center group" href="/">
            <img src="/logo.png" alt="AnnuForm Logo" className="h-8 w-8 group-hover:scale-110 transition-transform" />
            <span className="ml-3 font-bold text-2xl tracking-tight text-primary">AnnuForm</span>
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8">
            <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors" href="/explore">
              Explore
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-4 py-2 rounded-full transition-colors" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-48 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-950">
          <div className="relative container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-6 max-w-4xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Build Dynamic Forms in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Seconds</span>
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl lg:text-2xl leading-relaxed dark:text-gray-400">
                  Create, publish, and analyze beautifully designed forms. Share public templates, build unlisted private forms, and track every response with ease.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-10 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 hover:scale-105 focus-visible:outline-none"
                  href="/login"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-10 text-base font-semibold transition-all hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none"
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
